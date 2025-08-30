-- =================================================================
-- ПРЕДИСПИТНЕ ОБАВЕЗЕ: PL/pgSQL КОМПОНЕНТЕ
-- Предмет: Системи база података
-- Аутор: Никола Стојичић
-- =================================================================

-- =================================================================
-- 1. PL/pgSQL Тригер: Спречавање измене адресе у активној поруџбини
-- =================================================================
-- Опис: Овај тригер спречава измену кључних поља (улица, број, град, итд.)
-- на адреси ако је та адреса повезана са поруџбином која је у току (нпр. статус
-- 'CONFIRMED', 'PICKED_UP', итд.). Дозвољава само промену не-критичних поља
-- као што је надимак, чиме се штити интегритет података током процеса доставе,
-- а истовремено пружа добро корисничко искуство.

-- Тригер функција
CREATE OR REPLACE FUNCTION prevent_critical_edit_of_active_address()
RETURNS TRIGGER AS $$
DECLARE
    v_active_order_count INT;
BEGIN
    -- Проверавамо да ли се мења неко од кључних поља за доставу.
    IF NEW.street IS DISTINCT FROM OLD.street OR
       NEW.street_number IS DISTINCT FROM OLD.street_number OR
       NEW.city IS DISTINCT FROM OLD.city OR
       NEW.postal_code IS DISTINCT FROM OLD.postal_code OR
       NEW.latitude IS DISTINCT FROM OLD.latitude OR
       NEW.longitude IS DISTINCT FROM OLD.longitude
    THEN
            -- Ако се мењају кључна поља, тек онда проверавамо активне поруџбине.
        SELECT COUNT(*) INTO v_active_order_count
        FROM orders
        WHERE address_id = OLD.id AND status IN ('CREATED', 'CONFIRMED', 'READY_FOR_PICKUP', 'PICKED_UP', 'SCHEDULED_PENDING');

        IF v_active_order_count > 0 THEN
                RAISE EXCEPTION 'Cannot edit address details because it is used in % active order(s). You can only change the nickname.', v_active_order_count;
        END IF;
    END IF;

        -- Ако је све у реду, дозволи измену.
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Тригер
CREATE TRIGGER trg_before_address_update
BEFORE UPDATE ON address
FOR EACH ROW
EXECUTE FUNCTION prevent_critical_edit_of_active_address();

-- =================================================================
-- 2. PL/pgSQL Функција: Паметна препорука најчешће наручиваних артикала
-- =================================================================
-- Опис: Ова функција анализира историју поруџбина датог корисника. Прво проналази
-- ресторан из којег је корисник најчешће наручивао, а затим проналази најпопуларније
-- артикле које је наручивао баш из тог ресторана. Ово осигурава да су сви
-- препоручени артикли доступни за једну поруџбину. Функција враћа низ
-- ID-јева верзија артикала (menu_item_version_id), који се затим користи у апликацији
-- за приказ "Your Usuals?" препоруке.

CREATE OR REPLACE FUNCTION suggest_most_frequent_items(p_customer_id BIGINT, p_item_count INT DEFAULT 3)
RETURNS BIGINT[] AS $$
DECLARE
    v_favorite_restaurant_id BIGINT;
    v_item_ids BIGINT[];
BEGIN
      -- Корак А: Пронађи најпопуларнији ресторан за овог корисника
    SELECT r.id INTO v_favorite_restaurant_id
    FROM orders o
    JOIN order_item oi ON o.id = oi.order_id
    JOIN menu_item_version miv ON oi.menu_item_version_id = miv.id
    JOIN menu_version mv ON miv.menu_version_id = mv.id
    JOIN menu m ON mv.menu_id = m.id
    JOIN restaurant r ON m.restaurant_id = r.id
    WHERE o.customer_id = p_customer_id AND o.status = 'DELIVERED'
    GROUP BY r.id
    ORDER BY COUNT(DISTINCT o.id) DESC
    LIMIT 1;

    -- Ако корисник уопште нема поруџбина, не можемо наћи омиљени ресторан.
    IF v_favorite_restaurant_id IS NULL THEN
        RETURN '{}'::BIGINT[];
    END IF;

    -- Корак Б: Пронађи најпопуларније артикле ИЗ ТОГ РЕСТОРАНА
    SELECT array_agg(top_items.menu_item_version_id) INTO v_item_ids
    FROM (
         SELECT oi.menu_item_version_id, SUM(oi.quantity) AS total_ordered
         FROM orders o
         JOIN order_item oi ON o.id = oi.order_id
         JOIN menu_item_version miv ON oi.menu_item_version_id = miv.id
         JOIN menu_version mv ON miv.menu_version_id = mv.id
         JOIN menu m ON mv.menu_id = m.id
         WHERE o.customer_id = p_customer_id
           AND o.status = 'DELIVERED'
           AND m.restaurant_id = v_favorite_restaurant_id
         GROUP BY oi.menu_item_version_id
         ORDER BY total_ordered DESC
         LIMIT p_item_count
     ) AS top_items;

    RETURN COALESCE(v_item_ids, '{}'::BIGINT[]);
END;
$$ LANGUAGE plpgsql;

-- Пример како се функција позива из Spring Data JPA репозиторијума:
-- @Query(value = "SELECT suggest_most_frequent_items(:customerId, :count)", nativeQuery = true)
-- List<Long> findRecommendedItemIdsForCustomer(@Param("customerId") Long customerId, @Param("count") int count);

-- =================================================================
-- 3. SQL Индекси: Оптимизација претраге ресторана
-- =================================================================
-- Опис: Да би се демонстрирао утицај индекса на перформансе, прво је покренута
-- PL/pgSQL процедура која генерише 100.000 ресторана. Након тога, мерене су
-- перформансе упита за претрагу по имену и филтрирање по цени, пре и после
-- креирања одговарајућих специјализованих индекса.

-- =================================================================
-- КОРАК 1: ПРИПРЕМА И ЧИШЋЕЊЕ
-- =================================================================
-- Ове команде се извршавају прве да би се окружење припремило за тест.
-- -----------------------------------------------------------------

-- Корак 1.1: Обришите старе индексе ако постоје од претходних тестова
DROP INDEX IF EXISTS idx_restaurant_name_gin;
DROP INDEX IF EXISTS idx_restaurant_price_range;

-- Корак 1.2: Обришите све претходно генерисане ресторане и адресе
DELETE FROM restaurant WHERE name LIKE 'Restaurant %';
DELETE FROM address WHERE street LIKE 'Street %';

-- Корак 1.3: Ресетујте секвенце за ID-јеве
SELECT setval('restaurant_id_seq', (SELECT COALESCE(MAX(id), 1) FROM restaurant));
SELECT setval('address_id_seq', (SELECT COALESCE(MAX(id), 1) FROM address));

-- =================================================================
-- КОРАК 2: ГЕНЕРИСАЊЕ ТЕСТ ПОДАТАКА
-- =================================================================
-- Ова процедура се дефинише и затим позива да напуни базу.
-- -----------------------------------------------------------------

-- Корак 2.1: Дефинисање процедуре за генерисање
CREATE OR REPLACE PROCEDURE generate_mock_restaurants()
LANGUAGE plpgsql
AS $$
DECLARE
image_urls TEXT[] := ARRAY[
        '/images/restaurants/Pasta_Paradise.jpg', '/images/restaurants/Green-Garden.jpg',
        '/images/restaurants/Burger-Queen.jpg', '/images/restaurants/Sushi-Heaven.jpg',
        '/images/restaurants/Meraklija-Grill.jpg', '/images/restaurants/The-Golden-Spoon.jpg',
        '/images/restaurants/Pizza.jpg', '/images/restaurants/Vegan-Oasis.jpg',
        '/images/restaurants/Steak-House.jpg', '/images/restaurants/Gluten-Free-Heaven.jpg',
        '/images/restaurants/Fish-Chips.jpeg', '/images/restaurants/Wok.jpg'
    ];
    i INT;
    v_name TEXT;
    v_price_range TEXT;
    v_manager_id BIGINT;
    v_address_id BIGINT;
    v_image_url TEXT;
BEGIN
    RAISE NOTICE 'Starting realistic data generation with unique addresses...';
FOR i IN 1..100000 LOOP
        v_name := 'Restaurant ' || i || ' ' || (ARRAY['Grill', 'Pizza', 'Pasta', 'Sushi', 'Wok'])[floor(random() * 5 + 1)];
        v_price_range := CASE WHEN i % 3 = 0 THEN CHR(36) WHEN i % 3 = 1 THEN CHR(36) || CHR(36) ELSE CHR(36) || CHR(36) || CHR(36) END;
        v_manager_id := (ARRAY[4, 7])[floor(random() * 2 + 1)];
        v_image_url := image_urls[floor(random() * array_length(image_urls, 1) + 1)];
INSERT INTO address (street, street_number, city, country, postal_code, latitude, longitude)
VALUES ('Street ' || i, i::text, 'City ' || (i%100), 'Serbia', (11000 + i%1000)::text, 44.0 + random(), 20.0 + random())
    RETURNING id INTO v_address_id;
INSERT INTO restaurant (name, price_range, manager_id, address_id, image_url, opening_time, closing_time, average_rating)
VALUES (v_name, v_price_range, v_manager_id, v_address_id, v_image_url, '08:00', '23:00', round((random() * 2 + 3)::numeric, 1));
IF i % 10000 = 0 THEN RAISE NOTICE 'Inserted % restaurants and addresses...', i; END IF;
END LOOP;
    RAISE NOTICE 'Data generation finished.';
END;
$$;

-- Корак 2.2: Покретање процедуре
CALL generate_mock_restaurants();

-- =================================================================
-- КОРАК 3: ТЕСТ ПРЕТРАГЕ ПО ИМЕНУ (LIKE '%...%')
-- =================================================================
-- -----------------------------------------------------------------

-- Корак 3.1: Мерење БЕЗ GIN индекса
EXPLAIN ANALYZE SELECT * FROM restaurant WHERE name ILIKE '%pasta%';

/*
-- РЕЗУЛТАТИ:
"Seq Scan on restaurant  (cost=0.00..2992.15 rows=15153 width=109) (actual time=0.019..304.342 rows=19793 loops=1)"
"  Filter: ((name)::text ~~* '%pasta%'::text)"
"  Rows Removed by Filter: 80219"
"Planning Time: 2.586 ms"
"Execution Time: 305.948 ms"
*/
-- Корак 3.2: Креирање GIN индекса
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_restaurant_name_gin ON restaurant USING gin (name gin_trgm_ops);

-- Корак 3.3: Мерење СА GIN индексом
EXPLAIN ANALYZE SELECT * FROM restaurant WHERE name ILIKE '%pasta%';
/*
-- РЕЗУЛТАТИ:
"Bitmap Heap Scan on restaurant  (cost=130.35..2061.76 rows=15153 width=109) (actual time=11.311..81.174 rows=19793 loops=1)"
"  Recheck Cond: ((name)::text ~~* '%pasta%'::text)"
"  Heap Blocks: exact=1742"
"  ->  Bitmap Index Scan on idx_restaurant_name_gin  (cost=0.00..126.56 rows=15153 width=0) (actual time=11.047..11.048 rows=19793 loops=1)"
"        Index Cond: ((name)::text ~~* '%pasta%'::text)"
"Planning Time: 1.896 ms"
"Execution Time: 82.197 ms"

-- УБРЗАЊЕ: 3.7 пута (305.948 / 82.197)
*/


-- =================================================================
-- КОРАК 4: ТЕСТ ФИЛТРИРАЊА ПО ЦЕНИ (=)
-- =================================================================
-- -----------------------------------------------------------------

-- Корак 4.1: Мерење БЕЗ B-Tree индекса
EXPLAIN ANALYZE SELECT * FROM restaurant WHERE price_range = '$$';
/*
-- РЕЗУЛТАТИ:
"Seq Scan on restaurant  (cost=0.00..2992.15 rows=33464 width=109) (actual time=0.015..12.791 rows=33340 loops=1)"
"  Filter: ((price_range)::text = '$$'::text)"
"  Rows Removed by Filter: 66672"
"Planning Time: 1.278 ms"
"Execution Time: 13.546 ms"
*/

-- Корак 4.2: Креирање B-Tree индекса
CREATE INDEX idx_restaurant_price_range ON restaurant (price_range);

-- Корак 4.3: Мерење СА B-Tree индексом
EXPLAIN ANALYZE SELECT * FROM restaurant WHERE price_range = '$$';
/*
-- РЕЗУЛТАТИ:
"Bitmap Heap Scan on restaurant  (cost=379.64..2539.94 rows=33464 width=109) (actual time=1.886..7.041 rows=33340 loops=1)"
"  Recheck Cond: ((price_range)::text = '$$'::text)"
"  Heap Blocks: exact=1742"
"  ->  Bitmap Index Scan on idx_restaurant_price_range  (cost=0.00..371.27 rows=33464 width=0) (actual time=1.424..1.433 rows=33340 loops=1)"
"        Index Cond: ((price_range)::text = '$$'::text)"
"Planning Time: 1.238 ms"
"Execution Time: 8.119 ms"

-- УБРЗАЊЕ: 1.7 пута (13.546 / 8.119)
*/


-- =================================================================
-- 4. PL/pgSQL Извештај: Финансијски отисак корисника
-- =================================================================
-- Опис: Овај извештај пружа детаљан преглед финансијских навика корисника
-- за дати временски период. Користи сложене типове, курсор, WITH клаузулу,
-- агрегационе функције, GROUP BY и HAVING како би се задовољили сви услови задатка.

-- Корак 4.1: Креирање сложених типова
DROP TYPE IF EXISTS customer_financial_report CASCADE;
DROP TYPE IF EXISTS time_of_day_spending CASCADE;
DROP TYPE IF EXISTS price_range_spending CASCADE;
DROP TYPE IF EXISTS most_expensive_order CASCADE;

CREATE TYPE time_of_day_spending AS (
    period_name TEXT,
    orders_in_period BIGINT,
    spent_in_period NUMERIC(10, 2)
    );
CREATE TYPE price_range_spending AS (
    price_range TEXT,
    orders_in_range BIGINT,
    spent_in_range NUMERIC(10, 2)
    );
CREATE TYPE most_expensive_order AS (
    order_id BIGINT,
    order_date DATE,
    total_price NUMERIC(10, 2),
    restaurant_name TEXT
    );
CREATE TYPE customer_financial_report AS (
    customer_full_name TEXT,
    analysis_period TEXT,
    total_spent NUMERIC(12, 2),
    total_coupon_savings NUMERIC(10, 2),
    total_paid_by_card NUMERIC(12, 2),
    total_paid_by_cash NUMERIC(12, 2),
    spending_by_time_of_day time_of_day_spending[],
    spending_by_price_range price_range_spending[],
    top_5_most_expensive_orders most_expensive_order[]
    );

-- Корак 4.2: Креирање главне функције
CREATE OR REPLACE FUNCTION generate_customer_financial_report(p_customer_id BIGINT, p_start_date DATE, p_end_date DATE)
RETURNS customer_financial_report AS $$
DECLARE
v_report customer_financial_report;
    v_expensive_order_record most_expensive_order;
    expensive_orders_cursor CURSOR FOR
SELECT o.id, o.creation_date::DATE, o.total_price, r.name
FROM orders o
         JOIN order_item oi ON o.id = oi.order_id
         JOIN menu_item_version miv ON oi.menu_item_version_id = miv.id
         JOIN menu_version mv ON miv.menu_version_id = mv.id
         JOIN menu m ON mv.menu_id = m.id
         JOIN restaurant r ON m.restaurant_id = r.id
WHERE o.customer_id = p_customer_id
  AND o.status = 'DELIVERED'
  AND o.creation_date BETWEEN p_start_date AND p_end_date
GROUP BY o.id, r.name
HAVING o.total_price > 2000.00
ORDER BY o.total_price DESC
    LIMIT 5;
BEGIN
WITH UserFinancialOrders AS (
    SELECT
        o.id, o.total_price, o.card_amount, o.cash_amount,
        CASE WHEN o.coupon_id IS NOT NULL THEN 150.00 ELSE 0 END AS coupon_saving,
        r.price_range,
        CASE
            WHEN EXTRACT(HOUR FROM o.creation_date) BETWEEN 6 AND 11 THEN 'Morning (06-12h)'
            WHEN EXTRACT(HOUR FROM o.creation_date) BETWEEN 12 AND 16 THEN 'Lunch (12-17h)'
            WHEN EXTRACT(HOUR FROM o.creation_date) BETWEEN 17 AND 21 THEN 'Evening (17-22h)'
            ELSE 'Night (22-06h)'
            END AS time_period
    FROM orders o
             JOIN order_item oi ON o.id = oi.order_id
             JOIN menu_item_version miv ON oi.menu_item_version_id = miv.id
             JOIN menu_version mv ON miv.menu_version_id = mv.id
             JOIN menu m ON mv.menu_id = m.id
             JOIN restaurant r ON m.restaurant_id = r.id
    WHERE o.customer_id = p_customer_id
      AND o.status = 'DELIVERED'
      AND o.creation_date BETWEEN p_start_date AND p_end_date
    GROUP BY o.id, r.price_range
)
SELECT
        c.first_name || ' ' || c.last_name,
        to_char(p_start_date, 'DD.MM.YYYY') || ' - ' || to_char(p_end_date, 'DD.MM.YYYY'),
        COALESCE(SUM(ufo.total_price), 0), COALESCE(SUM(ufo.coupon_saving), 0),
        COALESCE(SUM(ufo.card_amount), 0), COALESCE(SUM(ufo.cash_amount), 0),
        (SELECT array_agg(ROW(ufo_inner.time_period, COUNT(*), SUM(ufo_inner.total_price))::time_of_day_spending ORDER BY MIN(ufo_inner.id))
         FROM UserFinancialOrders ufo_inner GROUP BY ufo_inner.time_period),
        (SELECT array_agg(ROW(ufo_inner.price_range::text, COUNT(*), SUM(ufo_inner.total_price))::price_range_spending ORDER BY ufo_inner.price_range)
         FROM UserFinancialOrders ufo_inner GROUP BY ufo_inner.price_range)
INTO v_report
FROM customer c
         LEFT JOIN UserFinancialOrders ufo ON true
WHERE c.id = p_customer_id
GROUP BY c.first_name, c.last_name;

v_report.top_5_most_expensive_orders := '{}';
OPEN expensive_orders_cursor;
LOOP
FETCH expensive_orders_cursor INTO v_expensive_order_record;
        EXIT WHEN NOT FOUND;
        v_report.top_5_most_expensive_orders := array_append(v_report.top_5_most_expensive_orders, v_expensive_order_record);
END LOOP;
CLOSE expensive_orders_cursor;

RETURN v_report;
END;
$$ LANGUAGE plpgsql;