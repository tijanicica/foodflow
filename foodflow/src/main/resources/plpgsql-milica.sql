-- =================================================================
-- PREDISPITNE OBAVEZE: PL/pgSQL KOMPONENTE
-- ZADATAK 1: Triger za bezbedno brisanje vozača
-- AUTOR: Milica Bosnjak
-- =================================================================

-- KORAK 1.1: Kreiranje tabele za arhivirane vozače
-- Ovu tabelu kreiramo da bismo imali gde da sačuvamo podatke.
-- Izvršiti samo jednom.
CREATE TABLE IF NOT EXISTS archived_drivers (
    driver_id BIGINT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    total_deliveries INT,
    final_average_rating NUMERIC(3, 2),
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

-- KORAK 1.2: Kreiranje triger funkcije
-- Ova funkcija sadrži svu logiku: proveru aktivnih porudžbina i arhiviranje.
CREATE OR REPLACE FUNCTION safe_delete_and_archive_driver()
RETURNS TRIGGER AS $$
DECLARE
v_active_order_count INT;
    v_total_deliveries INT;
BEGIN
    -- VALIDACIJA: Proveravamo da li vozač (predstavljen sa OLD zapisom koji se briše)
    -- ima aktivnih porudžbina koje su mu dodeljene.
SELECT COUNT(*)
INTO v_active_order_count
FROM orders
WHERE driver_id = OLD.id AND status IN ('CONFIRMED', 'READY_FOR_PICKUP', 'PICKED_UP');

-- Ako ima aktivnih porudžbina, bacamo grešku i prekidamo brisanje.
IF v_active_order_count > 0 THEN
        RAISE EXCEPTION 'Cannot delete driver: Driver has % active delivery/deliveries.', v_active_order_count;
END IF;

    -- ARHIVIRANJE: Ako provera prođe, arhiviramo podatke pre brisanja.
    -- Prvo, izračunamo ukupan broj završenih dostava za tog vozača.
SELECT COUNT(*)
INTO v_total_deliveries
FROM orders
WHERE driver_id = OLD.id AND status = 'DELIVERED';

-- Ubacujemo zapis u arhivu. Podatke uzimamo iz OLD zapisa.
INSERT INTO archived_drivers (driver_id, email, first_name, last_name, total_deliveries, final_average_rating, archived_at)
VALUES (OLD.id, OLD.email, OLD.first_name, OLD.last_name, v_total_deliveries, OLD.average_rating, NOW());

-- Ako je sve prošlo kako treba, dozvoljavamo originalnu DELETE operaciju.
RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- KORAK 1.3: Povezivanje funkcije sa tabelom 'driver'
-- Kreiramo triger koji će pozvati našu funkciju PRE svake DELETE operacije na tabeli 'driver'.
-- Ako triger već postoji, prvo ga brišemo da bismo izbegli grešku.
DROP TRIGGER IF EXISTS trg_before_driver_delete ON driver;
CREATE TRIGGER trg_before_driver_delete
    BEFORE DELETE ON driver
    FOR EACH ROW
    EXECUTE FUNCTION safe_delete_and_archive_driver();