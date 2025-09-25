-- =================================================================
-- ZADATAK: Triger za brisanje vozača na osnovu statusa ponuda i statusa porudbine
-- AUTOR: Milica Bošnjak
-- =================================================================
/*DELETE FROM archived_drivers;

CREATE OR REPLACE FUNCTION final_safe_delete_and_archive_driver()
RETURNS TRIGGER AS $$
DECLARE
v_active_delivery_count INT;
    v_total_deliveries INT;
BEGIN

-- === KORAK 1: VALIDACIJA ===
SELECT COUNT(*)
INTO v_active_delivery_count
FROM order_offer oo
         JOIN orders o ON oo.order_id = o.id
WHERE oo.driver_id = OLD.id
  AND oo.status = 'ACCEPTED'
  AND o.status = 'PICKED_UP';

IF v_active_delivery_count > 0 THEN
        RAISE EXCEPTION 'Cannot delete driver: They are currently handling % active delivery/deliveries.', v_active_delivery_count;
END IF;

-- === KORAK 2: ARHIVIRANJE PODATAKA ===
SELECT COUNT(*)
INTO v_total_deliveries
FROM orders
WHERE driver_id = OLD.id AND status = 'DELIVERED';


INSERT INTO archived_drivers (driver_id, email, first_name, last_name, total_deliveries, archived_at)
VALUES (OLD.id, OLD.email, OLD.first_name, OLD.last_name, v_total_deliveries, NOW());

-- === KORAK 3: ČIŠĆENJE SVIH VEZA ===
DELETE FROM order_offer WHERE driver_id = OLD.id;
UPDATE orders SET driver_id = NULL WHERE driver_id = OLD.id;

-- === KORAK 4: DOZVOLA ZA BRISANJE ===
RETURN OLD;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS trg_final_before_driver_delete ON driver;
--Kreiranje trigera
CREATE TRIGGER trg_final_before_driver_delete
    BEFORE DELETE ON driver
    FOR EACH ROW
    EXECUTE FUNCTION final_safe_delete_and_archive_driver();

 */
DELETE FROM archived_drivers;

CREATE OR REPLACE FUNCTION final_safe_delete_and_archive_driver()
RETURNS TRIGGER AS $$
DECLARE
v_active_delivery_count INT;
    v_total_deliveries INT;
BEGIN

    -- === KORAK 1: VALIDACIJA ===
    -- Proveravamo da li vozač ima 'ACCEPTED' ponudu za porudžbinu koja je
    -- ili 'PICKED_UP' ili 'READY_FOR_PICKUP'.
SELECT COUNT(*)
INTO v_active_delivery_count
FROM order_offer oo
         JOIN orders o ON oo.order_id = o.id
WHERE oo.driver_id = OLD.id
  AND oo.status = 'ACCEPTED'
  -- ==========================================================
  -- PROŠIREN USLOV: Sada proverava oba statusa
  -- ==========================================================
  AND o.status IN ('PICKED_UP', 'READY_FOR_PICKUP');

IF v_active_delivery_count > 0 THEN
        RAISE EXCEPTION 'Cannot delete driver: They are assigned to % active or ready-to-pickup delivery/deliveries.', v_active_delivery_count;
END IF;

    -- === KORAK 2: ARHIVIRANJE PODATAKA ===
SELECT COUNT(*)
INTO v_total_deliveries
FROM orders
WHERE driver_id = OLD.id AND status = 'DELIVERED';


INSERT INTO archived_drivers (driver_id, email, first_name, last_name, total_deliveries, archived_at)
VALUES (OLD.id, OLD.email, OLD.first_name, OLD.last_name, v_total_deliveries, NOW());

-- === KORAK 3: ČIŠĆENJE SVIH VEZA ===
DELETE FROM order_offer WHERE driver_id = OLD.id;
UPDATE orders SET driver_id = NULL WHERE driver_id = OLD.id;
DELETE FROM driver_rating WHERE driver_id = OLD.id;

-- === KORAK 4: DOZVOLA ZA BRISANJE ===
RETURN OLD;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS trg_final_before_driver_delete ON driver;
--Kreiranje trigera
CREATE TRIGGER trg_final_before_driver_delete
    BEFORE DELETE ON driver
    FOR EACH ROW
    EXECUTE FUNCTION final_safe_delete_and_archive_driver();






-- =================================================================
-- ZADATAK 2: PL/pgSQL Funkcija za proračun kompatibilnosti (ISPRAVLJENA)
-- AUTOR: Milica Bosnjak
-- =================================================================
CREATE OR REPLACE FUNCTION calculate_driver_restaurant_compatibility(p_driver_id BIGINT)
RETURNS BIGINT AS $$
DECLARE
w_delivery_count NUMERIC := 0.30;
    w_avg_rating     NUMERIC := 0.50;
    w_avg_speed      NUMERIC := 0.20;
    v_best_restaurant_id BIGINT;
BEGIN
WITH
    RawMetrics AS (
        SELECT
            r.id AS restaurant_id,
            COUNT(DISTINCT o.id) AS delivery_count,
            COALESCE(AVG((dr.professionalism_rating + dr.hygiene_rating_restaurant + dr.communication_rating) / 3.0), 3.0) AS avg_rating,
            COALESCE(AVG(EXTRACT(EPOCH FROM (o.delivered_at - o.start_delivery_time)) / 60), 25.0) AS avg_delivery_minutes
        FROM orders o
                 JOIN order_item oi ON o.id = oi.order_id
                 JOIN menu_item_version miv ON oi.menu_item_version_id = miv.id
                 JOIN menu_version mv ON miv.menu_version_id = mv.id
                 JOIN menu m ON mv.menu_id = m.id
                 JOIN restaurant r ON m.restaurant_id = r.id
                 LEFT JOIN driver_rating dr ON o.id = dr.order_id AND dr.manager_id IS NOT NULL
        WHERE o.driver_id = p_driver_id
          AND o.status = 'DELIVERED'
          AND o.start_delivery_time IS NOT NULL AND o.delivered_at IS NOT NULL
        GROUP BY r.id
        -- ==========================================================
        -- UKLONILI SMO 'HAVING' USLOV DA OMOGUĆIMO VIŠE KANDIDATA
        -- ==========================================================
    ),
    NormalizationBounds AS (
        SELECT
            MAX(delivery_count) AS max_count,
            MIN(delivery_count) AS min_count,
            MAX(avg_rating) AS max_rating,
            MIN(avg_rating) AS min_rating,
            MAX(avg_delivery_minutes) AS max_speed,
            MIN(avg_delivery_minutes) AS min_speed
        FROM RawMetrics
    ),
    CompatibilityScores AS (
        SELECT
            rm.restaurant_id,
            -- Ako je max=min, normalizovana vrednost je 0.5 (prosek)
            CASE WHEN (nb.max_count - nb.min_count) = 0 THEN 0.5 ELSE (rm.delivery_count - nb.min_count) / (nb.max_count - nb.min_count) END AS norm_count,
            (rm.avg_rating - 1.0) / (5.0 - 1.0) AS norm_rating,
            -- Ako je max=min, normalizovana vrednost je 0.5 (prosek)
            CASE WHEN (nb.max_speed - nb.min_speed) = 0 THEN 0.5 ELSE 1.0 - ((rm.avg_delivery_minutes - nb.min_speed) / (nb.max_speed - nb.min_speed)) END AS norm_speed
        FROM RawMetrics rm, NormalizationBounds nb
    )
SELECT
    cs.restaurant_id
INTO v_best_restaurant_id
FROM CompatibilityScores cs
ORDER BY
        (COALESCE(cs.norm_count, 0) * w_delivery_count) +
        (COALESCE(cs.norm_rating, 0) * w_avg_rating) +
        (COALESCE(cs.norm_speed, 0) * w_avg_speed)
        DESC
    LIMIT 1;

RETURN v_best_restaurant_id;
END;
$$ LANGUAGE plpgsql;