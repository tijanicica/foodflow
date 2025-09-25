-- =================================================================
-- ZADATAK: Triger za brisanje vozača na osnovu statusa ponuda
-- AUTOR: Milica Bosnjak (modifikovano)
-- =================================================================

-- =================================================================
-- ZADATAK: Finalni triger v3 (Arhivira, Čisti i Proverava Aktivne Dostave)
-- =================================================================

delete from archived_drivers;
CREATE OR REPLACE FUNCTION final_safe_delete_and_archive_driver()
RETURNS TRIGGER AS $$
DECLARE
v_active_delivery_count INT;
    v_total_deliveries INT;
BEGIN
    -- === KORAK 1: VALIDACIJA ===
    -- Proveravamo NAJPRECIZNIJI scenario: da li vozač ima ponudu koja je 'ACCEPTED'
    -- I ISTOVREMENO je status te porudžbine 'PICKED_UP'. Ovo je jedini
    -- scenario koji predstavlja aktivnu dostavu u toku.
SELECT COUNT(*)
INTO v_active_delivery_count
FROM order_offer oo
         JOIN orders o ON oo.order_id = o.id
WHERE oo.driver_id = OLD.id
  AND oo.status = 'ACCEPTED'
  AND o.status = 'PICKED_UP';

-- Ako postoji makar jedna takva kombinacija, bacamo grešku i prekidamo sve.
IF v_active_delivery_count > 0 THEN
        RAISE EXCEPTION 'Cannot delete driver: They are currently handling % active delivery/deliveries.', v_active_delivery_count;
END IF;

    -- === KORAK 2: ARHIVIRANJE PODATAKA ===
    -- Ako je validacija prošla, PRVO arhiviramo podatke.
SELECT COUNT(*)
INTO v_total_deliveries
FROM orders
WHERE driver_id = OLD.id AND status = 'DELIVERED';

-- Ubacujemo zapis u arhivu.
INSERT INTO archived_drivers (driver_id, email, first_name, last_name, total_deliveries, archived_at)
VALUES (OLD.id, OLD.email, OLD.first_name, OLD.last_name, v_total_deliveries, NOW());

-- === KORAK 3: ČIŠĆENJE SVIH VEZA ===
-- Pošto znamo da vozač nije na aktivnoj dostavi, bezbedno čistimo sve njegove veze.

-- 3a. Brišemo SVE njegove ponude (bilo da su ACCEPTED za porudžbine koje nisu PICKED_UP, SENT, REJECTED).
DELETE FROM order_offer WHERE driver_id = OLD.id;

-- 3b. Kidamo veze iz 'orders' tabele.
UPDATE orders SET driver_id = NULL WHERE driver_id = OLD.id;

-- (Ovde možete dodati i čišćenje drugih tabela ako je potrebno, npr. driver_rating)
-- DELETE FROM driver_rating WHERE driver_id = OLD.id;

-- === KORAK 4: DOZVOLA ZA BRISANJE ===
-- Sada kada je sve arhivirano i očišćeno, originalna DELETE komanda može da se izvrši.
RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Povezivanje FINALNE funkcije sa tabelom 'driver'
DROP TRIGGER IF EXISTS trg_final_before_driver_delete ON driver;
CREATE TRIGGER trg_final_before_driver_delete
    BEFORE DELETE ON driver
    FOR EACH ROW
    EXECUTE FUNCTION final_safe_delete_and_archive_driver();