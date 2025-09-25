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