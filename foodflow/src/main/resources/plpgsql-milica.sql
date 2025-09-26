-- =================================================================
-- ZADATAK: Triger za brisanje vozača na osnovu statusa ponuda i statusa porudbine
-- AUTOR: Milica Bošnjak
-- =================================================================

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
-- ZADATAK 2: PL/pgSQL Funkcija za proračun kompatibilnosti
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
        HAVING COUNT(DISTINCT o.id) > 1

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




-- =================================================================
-- ZADATAK 3: SQL Indeksi za optimizaciju pretrage vozača
-- AUTOR: Milica Bosnjak
-- =================================================================

-- =================================================================
-- KORAK 1: PRIPREMA I ČIŠĆENJE
-- =================================================================
-- Ove komande pripremamo bazu za test.

-- Korak 1.1: Obrišite stare indekse ako postoje
DROP INDEX IF EXISTS idx_driver_last_first_name;
DROP INDEX IF EXISTS idx_driver_performance;

-- Korak 1.2: Obrišite sve prethodno generisane vozače
DELETE FROM driver WHERE first_name LIKE 'Mock Driver %';

SELECT setval('driver_id_seq', (SELECT COALESCE(MAX(id), 1) FROM driver));
-- =================================================================
-- KORAK 2: GNERISANJE TEST PODATAKA
-- =================================================================

-- Korak 2.1: Definicija procedure za generisanje 100,000 vozača
CREATE OR REPLACE PROCEDURE generate_mock_drivers()
LANGUAGE plpgsql
AS $$
DECLARE
i INT;
    last_names TEXT[] := ARRAY['Petrovic', 'Jovanovic', 'Nikolic', 'Markovic', 'Djordjevic'];
    v_last_name TEXT;
    v_vehicle_type TEXT;
    v_status TEXT;
BEGIN
    RAISE NOTICE 'Starting mock driver generation...';
FOR i IN 1..100000 LOOP
        v_last_name := last_names[floor(random() * 5 + 1)];
        v_vehicle_type := CASE WHEN i % 3 = 0 THEN 'CAR' WHEN i % 3 = 1 THEN 'MOTORCYCLE' ELSE 'BICYCLE' END;
        v_status := CASE WHEN i % 5 = 0 THEN 'OFFLINE' ELSE 'ONLINE' END;

INSERT INTO driver (email, password, first_name, last_name, phone, role, vehicle_type, status, rejection_count, latitude, longitude, "timestamp", average_rating)
VALUES (
               'mock.driver' || i || '@example.com',
               '$2a$10$0yI8ODQXmkWAMc2kUMPR6.XOKTg229VuYywIRgZW0bix5r5CoDfCi',
               'Mock Driver ' || i,
               v_last_name,
               '06' || (1000000 + i)::text,
               'DRIVER',
               v_vehicle_type,
               v_status,
               floor(random() * 50)::int,
               44.0 + random(),
               20.0 + random(),
               NOW() - (random() * 30 || ' days')::interval,
               round((random() * 4 + 1)::numeric, 1)
       );

IF i % 10000 = 0 THEN RAISE NOTICE 'Inserted % drivers...', i; END IF;
END LOOP;
    RAISE NOTICE 'Driver data generation finished.';
END;
$$;

CALL generate_mock_drivers();

ANALYZE driver;
-- =================================================================
-- KORAK 3: TEST PRETRAGE PO IMENU (last_name, first_name)
-- =================================================================

-- Korak 3.1: Merenje BEZ indeksa
EXPLAIN ANALYZE SELECT * FROM driver WHERE last_name = 'Petrovic' AND first_name LIKE 'Mock Driver 1%';

/*
-- STVARNI REZULTAT (BEZ INDEKSA):
-- Planer se odlučuje za "Seq Scan", što znači da mora da prođe kroz celu tabelu (svih 100,000+ redova).
-- Vreme izvršenja je relativno veliko zbog potrebe da se svaki red pročita i filtrira.
"Parallel Seq Scan on driver  (cost=0.00..5164.08 rows=1 width=198) (actual time=0.038..59.907 rows=1 loops=3)"
"  Filter: (((last_name)::text = 'Petrovic'::text) AND ((first_name)::text ~~ 'Mock Driver 1%'::text))"
"  Rows Removed by Filter: 33342"
"Planning Time: 0.141 ms"
"Execution Time: 59.957 ms"
*/

-- Korak 3.2: Kreiranje kompozitnog B-Tree indeksa
CREATE INDEX idx_driver_last_first_name ON driver (last_name, first_name);

-- Korak 3.3: Merenje SA indeksom
EXPLAIN ANALYZE SELECT * FROM driver WHERE last_name = 'Petrovic' AND first_name LIKE 'Mock Driver 1%';

/*
-- STVARNI REZULTAT (SA INDEKSOM):
-- Planer sada koristi "Index Scan" nad indeksom 'idx_driver_last_first_name'.
-- Ovo omogućava bazi da trenutno locira tražene podatke bez skeniranja cele tabele.
-- Vreme izvršenja je drastično smanjeno.
"Index Scan using idx_driver_last_first_name on driver  (cost=0.42..8.44 rows=1 width=198) (actual time=0.043..0.044 rows=1 loops=1)"
"  Index Cond: (((last_name)::text = 'Petrovic'::text) AND ((first_name)::text ~~ 'Mock Driver 1%'::text))"
"Planning Time: 0.201 ms"
"Execution Time: 0.061 ms"

-- ZAKLJUČAK I UBRZANJE:
-- Upit je ubrzan približno 982 puta (59.957 ms / 0.061 ms).
-- Kreiranje kompozitnog indeksa na kolonama koje se često zajedno pretražuju
-- (kao što su prezime i ime) je izuzetno efikasna tehnika optimizacije.
*/

-- =================================================================
-- KORAK 4: TEST FILTRIRANJE PO PERFORMANSAMA (average_rating, rejection_count)
-- =================================================================

-- Korak 4.1: Merenje BEZ indeksa
EXPLAIN ANALYZE SELECT * FROM driver WHERE average_rating < 2.0 AND rejection_count > 40;

/*
-- STVARNI REZULTAT (BEZ INDEKSA):
-- Kao i u prethodnom slučaju, bez indeksa se koristi "Seq Scan". Baza mora da proveri
-- svih 100,000+ vozača da bi pronašla one sa lošim performansama.
"Seq Scan on driver  (cost=0.00..4661.17 rows=4180 width=198) (actual time=0.027..59.739 rows=4292 loops=1)"
"  Filter: ((average_rating < '2'::double precision) AND (rejection_count > 40))"
"  Rows Removed by Filter: 95720"
"Planning Time: 0.176 ms"
"Execution Time: 61.166 ms"
*/
-- Korak 4.2: Kreiranje kompozitnog B-Tree indeksa
CREATE INDEX idx_driver_performance ON driver (average_rating, rejection_count);

-- Korak 4.3: Merenje SA indeksom
EXPLAIN ANALYZE SELECT * FROM driver WHERE average_rating < 2.0 AND rejection_count > 40;

/*
-- STVARNI REZULTAT (SA INDEKSOM):
-- Planer se sada odlučuje za "Bitmap Heap Scan", koji koristi "Bitmap Index Scan"
-- nad našim novim indeksom 'idx_driver_performance'.
-- Ovo omogućava bazi da prvo u memoriji napravi mapu svih redova koji zadovoljavaju uslov,
-- a zatim da efikasno pokupi samo te redove, što je mnogo brže od sekvencijalnog skeniranja.
"Bitmap Heap Scan on driver  (cost=610.90..3764.65 rows=4229 width=198) (actual time=1.876..3.619 rows=4292 loops=1)"
"  Recheck Cond: ((average_rating < '2'::double precision) AND (rejection_count > 40))"
"  Heap Blocks: exact=2290"
"  ->  Bitmap Index Scan on idx_driver_performance  (cost=0.00..609.85 rows=4229 width=0) (actual time=1.659..1.659 rows=4292 loops=1)"
"        Index Cond: ((average_rating < '2'::double precision) AND (rejection_count > 40))"
"Planning Time: 0.799 ms"
"Execution Time: 3.744 ms"

-- ZAKLJUČAK I UBRZANJE:
-- Upit je ubrzan približno 16.3 puta (61.166 ms / 3.744 ms).
-- Iako je ubrzanje manje nego kod pretrage po imenu (jer se vraća veći broj redova - 4292),
-- i dalje je izuzetno značajno i pokazuje efikasnost indeksa za filtriranje po opsegu vrednosti.
*/



-- =================================================================
-- ZADATAK 4: PL/pgSQL Izveštaj - Napredna Analiza Performansi Vozača
-- =================================================================

-- =================================================================
-- KORAK 1: Kreiranje složenih PL/SQL tipova
-- Definišemo strukture podataka koje će naš izveštaj koristiti.
-- =================================================================

-- Prvo brišemo stare tipove
DROP TYPE IF EXISTS driver_performance_report CASCADE;
DROP TYPE IF EXISTS restaurant_performance_summary CASCADE;
DROP TYPE IF EXISTS delayed_order_analysis CASCADE;

-- Tip za analizu kašnjenja ostaje isti
CREATE TYPE delayed_order_analysis AS (
    order_id BIGINT,
    restaurant_name TEXT,
    reported_delay_minutes INT,
    actual_delivery_minutes NUMERIC,
    was_on_time BOOLEAN,
    manager_rating_avg NUMERIC
    );

-- Tip koji sumira performanse za jedan restoran
CREATE TYPE restaurant_performance_summary AS (
    restaurant_name TEXT,
    total_deliveries BIGINT,
    on_time_deliveries BIGINT,
    on_time_rate NUMERIC,
    avg_delivery_time_minutes NUMERIC
    );

-- Glavni tip za ceo izveštaj
CREATE TYPE driver_performance_report AS (
    driver_full_name TEXT,
    analysis_period TEXT,
    overall_on_time_rate NUMERIC,
    total_rejected_offers BIGINT,
    performance_by_restaurant restaurant_performance_summary[],
    delayed_orders_details delayed_order_analysis[]
    );


-- =================================================================
-- KORAK 2: Kreiranje glavne PL/pgSQL funkcije
-- Ova funkcija prikuplja, agregira i analizira sve potrebne podatke.
-- =================================================================
CREATE OR REPLACE FUNCTION generate_driver_performance_report(
    p_driver_id BIGINT,
    p_start_date DATE,
    p_end_date DATE
)

RETURNS TABLE(
    driver_full_name TEXT,
    analysis_period TEXT,
    overall_on_time_rate NUMERIC,
    total_rejected_offers BIGINT,
    performance_by_restaurant restaurant_performance_summary[],
    delayed_orders_details delayed_order_analysis[]
) AS $$
DECLARE
v_has_deliveries BOOLEAN;
BEGIN
    -- Proveravamo da li vozač ima bilo kakve isporučene porudžbine u periodu
SELECT EXISTS (
    SELECT 1 FROM orders
    WHERE driver_id = p_driver_id
      AND status = 'DELIVERED'
      AND creation_date BETWEEN p_start_date AND p_end_date
) INTO v_has_deliveries;

-- Ako nema isporuka, vraćamo jedan red sa podrazumevanim vrednostima
IF NOT v_has_deliveries THEN
        RETURN QUERY
SELECT
        d.first_name || ' ' || d.last_name,
        to_char(p_start_date, 'DD.MM.YYYY') || ' - ' || to_char(p_end_date, 'DD.MM.YYYY'),
        0.00::NUMERIC,
        COALESCE((SELECT COUNT(*) FROM order_offer
                  WHERE driver_id = p_driver_id AND status = 'REJECTED'
                    AND created_at BETWEEN p_start_date AND p_end_date), 0)::BIGINT,
        '{}'::restaurant_performance_summary[],
        '{}'::delayed_order_analysis[]
FROM driver d
WHERE d.id = p_driver_id;
ELSE
        -- Ako ima isporuka, radimo punu agregaciju
        RETURN QUERY
        WITH
            DriverOrdersByRestaurant AS (
                SELECT
                    r.name AS restaurant_name,
                    (o.delivered_at <= o.eta) AS is_on_time,
                    EXTRACT(EPOCH FROM (o.delivered_at - o.start_delivery_time)) / 60 AS delivery_duration_minutes
                FROM orders o
                JOIN order_item oi ON o.id = oi.order_id
                JOIN menu_item_version miv ON oi.menu_item_version_id = miv.id
                JOIN menu_version mv ON miv.menu_version_id = mv.id
                JOIN menu m ON mv.menu_id = m.id
                JOIN restaurant r ON m.restaurant_id = r.id
                WHERE o.driver_id = p_driver_id
                  AND o.status = 'DELIVERED'
                  AND o.creation_date BETWEEN p_start_date AND p_end_date
                  AND o.start_delivery_time IS NOT NULL AND o.delivered_at IS NOT NULL
            ),
            RestaurantAggregates AS (
                SELECT
                    restaurant_name,
                    COUNT(*) AS total_deliveries,
                    COUNT(CASE WHEN is_on_time THEN 1 END) AS on_time_deliveries,
                    AVG(delivery_duration_minutes) AS avg_delivery_time_minutes
                FROM DriverOrdersByRestaurant
                GROUP BY restaurant_name
            ),
            DelayedOrders AS (
                SELECT array_agg(ROW(
                    o.id,
                    r.name,
                    o.driver_reported_delay,
                    ROUND(EXTRACT(EPOCH FROM (o.delivered_at - o.start_delivery_time)) / 60, 2),
                    (o.delivered_at <= o.eta),
                    COALESCE(ROUND(((dr.professionalism_rating + dr.hygiene_rating_restaurant + dr.communication_rating) / 3.0)::numeric, 2), 0)
                )::delayed_order_analysis) AS details
                FROM orders o
                JOIN order_item oi ON o.id = oi.order_id
                JOIN menu_item_version miv ON oi.menu_item_version_id = miv.id
                JOIN menu_version mv ON miv.menu_version_id = mv.id
                JOIN menu m ON mv.menu_id = m.id
                JOIN restaurant r ON m.restaurant_id = r.id
                LEFT JOIN driver_rating dr ON o.id = dr.order_id AND dr.manager_id IS NOT NULL
                WHERE o.driver_id = p_driver_id
                  AND o.status = 'DELIVERED'
                  AND o.creation_date BETWEEN p_start_date AND p_end_date
                  AND o.driver_reported_delay IS NOT NULL AND o.driver_reported_delay > 0
            )
SELECT
    (SELECT d.first_name || ' ' || d.last_name FROM driver d WHERE d.id = p_driver_id),
    to_char(p_start_date, 'DD.MM.YYYY') || ' - ' || to_char(p_end_date, 'DD.MM.YYYY'),
    ROUND(SUM(ra.on_time_deliveries)::NUMERIC / SUM(ra.total_deliveries), 2),
    (SELECT COUNT(*) FROM order_offer WHERE driver_id = p_driver_id AND status = 'REJECTED' AND created_at BETWEEN p_start_date AND p_end_date),
    array_agg(
            ROW(
                    ra.restaurant_name,
                    ra.total_deliveries,
                    ra.on_time_deliveries,
                    ROUND(ra.on_time_deliveries::NUMERIC / ra.total_deliveries, 2),
                    ROUND(ra.avg_delivery_time_minutes::NUMERIC, 2)
                )::restaurant_performance_summary
        ),
    (SELECT details FROM DelayedOrders)
FROM RestaurantAggregates ra;
END IF;
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- KORAK 3: Funkcija poziva
-- =================================================================
-- Pozivamo izveštaj za vozača sa ID=2 za period od početka 2025. godine do danas.
SELECT * FROM generate_driver_performance_report(2, '2025-01-01', CURRENT_DATE);

SELECT
    d.id AS driver_id,
    (report).*
FROM
    driver d
    CROSS JOIN LATERAL generate_driver_performance_report(d.id, '2025-01-01', CURRENT_DATE) AS report
WHERE
    d.status = 'ONLINE';