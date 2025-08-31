-- Корак 2а: Креирање функције тригера
-- Ова функција ће се покренути када се врши INSERT или UPDATE на табели menu_version,
-- под условом да се поље 'active' поставља на TRUE.
CREATE OR REPLACE FUNCTION set_single_active_menu_version()
RETURNS TRIGGER AS $$
DECLARE
v_restaurant_id BIGINT;
BEGIN
    -- Пронађи ID ресторана који је повезан са верзијом менија која се убацује/ажурира.
    -- (Претпостављамо да 'menu_id' у 'menu_version' увек има валидну вредност која показује на 'menu' табелу)
SELECT m.restaurant_id
INTO v_restaurant_id
FROM menu m
WHERE m.id = NEW.menu_id;

-- Деактивирај све друге активне верзије менија за пронађени ресторан.
-- Изузима се тренутни ред (NEW.id) који се убацује или ажурира,
-- како би се избегли проблеми са мутирајућим табелама и логичким грешкама.
UPDATE menu_version mv
SET active = FALSE
WHERE mv.menu_id IN (SELECT id FROM menu WHERE restaurant_id = v_restaurant_id)
  AND mv.active = TRUE
  AND mv.id != NEW.id; -- Искључује тренутни ред

-- За BEFORE тригер, увек морамо вратити NEW (ажурирани ред).
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Корак 2б: Креирање тригера
-- Овај тригер се покреће *пре* INSERT или UPDATE операције на колони 'active'
-- у табели 'menu_version'.
-- Покреће се само ако је нова вредност за 'active' постављена на TRUE.
CREATE TRIGGER trg_single_active_menu_version
    BEFORE INSERT OR UPDATE OF active ON menu_version
    FOR EACH ROW
    WHEN (NEW.active = TRUE) -- Услов: покреће се само ако се 'active' поставља на TRUE
    EXECUTE FUNCTION set_single_active_menu_version();


---fjaa


--orderrepo
@Query(value = "SELECT calculate_avg_fulfillment_time_minutes(:managerId, :startDate, :endDate, :restaurantId)", nativeQuery = true)
    Optional<Double> calculateAverageFulfillmentTimeMinutesUsingFunction(
            @Param("managerId") Long managerId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("restaurantId") Long restaurantId
    );

--managerAnalityServ
u getManagerAnalitys
  Double avgFulfillmentTime = orderRepository.calculateAverageFulfillmentTimeMinutesUsingFunction(
                manager.getId(),
                currentPeriodStart,
                now,
                restaurantId
        ).orElse(0.0);

--postreSQL

CREATE OR REPLACE FUNCTION calculate_avg_fulfillment_time_minutes(
    p_manager_id BIGINT,
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP,
    p_restaurant_id BIGINT DEFAULT NULL
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
avg_time_minutes NUMERIC;
BEGIN
SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (o.delivered_at - o.creation_date))) / 60, 0) -- Convert seconds to minutes
INTO avg_time_minutes
FROM orders o
         JOIN order_item oi ON o.id = oi.order_id
         JOIN menu_item_version miv ON oi.menu_item_version_id = miv.id
         JOIN menu_version mv ON miv.menu_version_id = mv.id
         JOIN menu m ON mv.menu_id = m.id
         JOIN restaurant r ON m.restaurant_id = r.id
WHERE r.manager_id = p_manager_id
  AND o.creation_date >= p_start_date
  AND o.creation_date < p_end_date
  AND (p_restaurant_id IS NULL OR r.id = p_restaurant_id)
  AND o.status = 'DELIVERED' -- Узимамо у обзир само испоручене поруџбине
  AND o.delivered_at IS NOT NULL; -- Проверавамо да је време испоруке заиста забележено

RETURN avg_time_minutes;
END;
$$;

------------------------------------------------------------indexi

--- SQL Индекси: Оптимизација проналажења ресторана по менаџеру (B-Tree индекс)
--Опис: Да би се демонстрирао утицај индекса на перформансе, фокусираћемо се на колону manager_id у табели restaurant.
--Ова претрага је кључна за менаџере који приступају својим ресторанима (нпр. на контролној табли или у аналитици).
--Прво ћемо измерити перформансе упита за проналажење свих ресторана којима управља одређени менаџер (на основу manager_id)
--без икаквог индекса на тој колони, очекујући Sequential Scan. Затим ћемо креирати
--B-Tree индекс на manager_id колони и поново измерити исти упит,
--показујући јасно и значајно убрзање путем Index Scan-а или Bitmap Heap Scan-а.

--КОРАК 1: ПРИПРЕМА И ЧИШЋЕЊЕ
--Ове команде припремају базу за тест. Обавезно их све покрените пре генерисања података!
-- Корак 1.1: Обришите стари индекс ако постоји од претходних тестова на manager_id у restaurant табели
DROP INDEX IF EXISTS idx_restaurant_manager_id;

-- Корак 1.2: Обришите све претходно генерисане ресторане и адресе
-- Користимо "Mock Restaurant %" да не обришемо праве ресторане
DELETE FROM restaurant WHERE name LIKE 'Mock Restaurant %';
DELETE FROM address WHERE street LIKE 'Mock Street %';

-- Корак 1.3: Обришите све претходно генерисане менаџере (да имамо чисте ID-јеве за везивање)
-- Користимо "mock.manager%@example.com" да не обришемо праве менаџере
DELETE FROM manager WHERE email LIKE 'mock.manager%@example.com';

-- Корак 1.4: Ресетујте секвенце за ID-јеве табела
-- Ово осигурава да ће нови ID-јеви почети одговарајуће
SELECT setval('restaurant_id_seq', (SELECT COALESCE(MAX(id), 1) FROM restaurant));
SELECT setval('address_id_seq', (SELECT COALESCE(MAX(id), 1) FROM address));
SELECT setval('manager_id_seq', (SELECT COALESCE(MAX(id), 1) FROM manager));

--КОРАК 2: ГЕНЕРИСАЊЕ ТЕСТ ПОДАТАКА (Менаџери и Ресторани)
--Прво ћемо креирати неколико фиктивних менаџера, а затим много ресторана,
--равномерно их расподељујући међу тим менаџерима.
--Ово ће створити реалистичан сценарио где један менаџер управља значајним бројем ресторана, али не свим.
-- Корак 2.1: Дефинисање процедуре за генерисање МЕНАЏЕРА И РЕСТОРАНА
CREATE OR REPLACE PROCEDURE generate_mock_managers_and_restaurants()
LANGUAGE plpgsql
AS $$
DECLARE
i INT;
    v_manager_id_target BIGINT; -- ID менаџера чије ћемо ресторане тражити
    v_manager_id_other1 BIGINT; -- ID другог менаџера
    v_manager_id_other2 BIGINT; -- ID трећег менаџера
    v_current_manager_id BIGINT;
    v_address_id BIGINT;
    v_restaurant_name TEXT;
    v_price_range_text TEXT; -- Променљива за price_range
    v_admin_id BIGINT;
BEGIN
    RAISE NOTICE 'Starting manager and restaurant data generation...';

    -- Пронађите ID постојећег администратора (ако постоји). Ако не постоји, admin_id ће бити NULL.
SELECT id INTO v_admin_id FROM administrator LIMIT 1;
IF v_admin_id IS NULL THEN
        RAISE NOTICE 'No administrator found, setting admin_id to NULL for generated managers.';
END IF;

    -- Генерисање 3 менаџера. ID првог менаџера ће бити наш "таргет" за претрагу.
INSERT INTO manager (email, password, first_name, last_name, phone, role, admin_id)
VALUES ('mock.manager_target@example.com', '$2a$10$UoWb6wE5g.i8lY01k.4yvO/k8g6m7p2q3r4s5t6u7v8w9x0y1z2', 'Target', 'Manager', '0601111111', 'MANAGER', v_admin_id)
    RETURNING id INTO v_manager_id_target;

INSERT INTO manager (email, password, first_name, last_name, phone, role, admin_id)
VALUES ('mock.manager_other1@example.com', '$2a$10$UoWb6wE5g.i8lY01k.4yvO/k8g6m7p2q3r4s5t6u7v8w9x0y1z2', 'Other', 'Manager1', '0602222222', 'MANAGER', v_admin_id)
    RETURNING id INTO v_manager_id_other1;

INSERT INTO manager (email, password, first_name, last_name, phone, role, admin_id)
VALUES ('mock.manager_other2@example.com', '$2a$10$UoWb6wE5g.i8lY01k.4yvO/k8g6m7p2q3r4s5t6u7v8w9x0y1z2', 'Other', 'Manager2', '0603333333', 'MANAGER', v_admin_id)
    RETURNING id INTO v_manager_id_other2;

RAISE NOTICE 'Generated managers. Target Manager ID: %s', v_manager_id_target;
    RAISE NOTICE 'Other Manager IDs: %s, %s', v_manager_id_other1, v_manager_id_other2;

    -- Генерисање 100.000 ресторана
FOR i IN 1..100000 LOOP
        v_restaurant_name := 'Mock Restaurant ' || i || ' ' || (ARRAY['Pizza', 'Pasta', 'Sushi', 'Grill', 'Cafe'])[floor(random() * 5 + 1)];

        -- Ротирање менаџера за ресторане, тако да сваки менаџер има око 33% ресторана
CASE (i % 3)
            WHEN 0 THEN v_current_manager_id := v_manager_id_target;
WHEN 1 THEN v_current_manager_id := v_manager_id_other1;
WHEN 2 THEN v_current_manager_id := v_manager_id_other2;
END CASE;

        -- Генерисање price_range са CHR(36)
CASE (i % 3)
            WHEN 0 THEN v_price_range_text := CHR(36);
WHEN 1 THEN v_price_range_text := CHR(36) || CHR(36);
ELSE v_price_range_text := CHR(36) || CHR(36) || CHR(36);
END CASE;

        -- Генерисање адресе
INSERT INTO address (street, street_number, city, country, postal_code, latitude, longitude)
VALUES ('Mock Street ' || i, i::text, 'MockCity ' || (i%10), 'Serbia', (11000 + i%1000)::text, 44.0 + random(), 20.0 + random())
    RETURNING id INTO v_address_id;

-- Уметање ресторана
INSERT INTO restaurant (name, price_range, manager_id, address_id, image_url, opening_time, closing_time, average_rating)
VALUES (v_restaurant_name, v_price_range_text, v_current_manager_id, v_address_id, '/images/placeholder.jpg', '08:00', '23:00', round((random() * 2 + 3)::numeric, 1));

IF i % 10000 = 0 THEN
            RAISE NOTICE 'Inserted % restaurants and addresses...', i;
END IF;
END LOOP;
    RAISE NOTICE 'Restaurant data generation finished.';
END;
$$;

-- Корак 2.2: Покретање процедуре за генерисање података
CALL generate_mock_managers_and_restaurants();

-- **ОБАВЕЗНО!** Ажурирајте статистику базе након генерисања нових података.
-- Ово је кључно да би оптимизатор имао свеже информације о табели.
ANALYZE restaurant;

--КОРАК 3: ТЕСТ ПРЕТРАГЕ РЕСТОРАНА ПО ID-ЈУ МЕНАЏЕРА - БЕЗ ИНДЕКСА (ОЧЕКУЈЕ СЕ Seq Scan И СПОРО ИЗВРШАВАЊЕ!)
--За ову демонстрацију, користићемо ID таргет менаџера (који је генерисан као v_manager_id_target).
--Након што извршите КОРАК 2, забележите ID који вам процедура испише за "Target Manager ID".
--Користите тај ID у упиту испод.

-- Корак 3.1: Мерење БЕЗ B-Tree индекса на 'manager_id' колони у restaurant табели
-- !!! ЗАМЕНИТЕ 123 СА СТВАРНИМ ID-јем ВАШЕГ ТАРГЕТ МЕНАЏЕРА (нпр. 1, 4, 7 итд.) !!!
EXPLAIN ANALYZE SELECT * FROM restaurant WHERE manager_id = 4;

--rez bez indexa
"Seq Scan on restaurant  (cost=0.00..1742.50 rows=41 width=1596) (actual time=0.021..13.258 rows=6 loops=1)"
"  Filter: (manager_id = 4)"
"  Rows Removed by Filter: 100006"
"Planning Time: 2.147 ms"
Execution Time: 15.980 ms

---------------------------------sa indexom

-- Корак 4.1: Креирање B-Tree индекса на колони 'manager_id' у restaurant табели
CREATE INDEX idx_restaurant_manager_id ON restaurant (manager_id);

-- **ОБАВЕЗНО!** Ажурирајте статистику базе након креирања индекса
-- Поново користимо ANALYZE.
ANALYZE restaurant;

-- Корак 4.2: Мерење СА B-Tree индексом на 'manager_id' колони
-- !!! ЗАМЕНИТЕ 123 СА СТВАРНИМ ID-јем ВАШЕГ ТАРГЕТ МЕНАЏЕРА !!!
EXPLAIN ANALYZE SELECT * FROM restaurant WHERE manager_id = 4;

--rez sa indexom
"Index Scan using idx_restaurant_manager_id on restaurant  (cost=0.29..29.79 rows=7 width=102) (actual time=0.139..0.142 rows=6 loops=1)"
"  Index Cond: (manager_id = 4)"
"Planning Time: 0.348 ms"
"Execution Time: 0.163 ms"
-- Убрзање ≈ 98 пута


-------------------------------------Izvestaj
--Извештај ће приказивати аналитику перформанси ресторана којима менаџер управља за дати временски период.
--Укључиће укупан приход, број поруџбина, топ 5 и најмање продаваних артикала,
--као и преглед појединачних ресторана.
--4. PL/pgSQL Извештај: Аналитика перформанси ресторана за менаџера
--Опис: Овај извештај пружа детаљан преглед перформанси ресторана којима одређени менаџер управља за дати временски период.
--Користи сложене типове, курсор, WITH клаузулу,
--агрегационе функције (SUM, COUNT, AVG), GROUP BY, HAVING и WHERE како би се задовољили сви услови задатка.

-- Обришите старе типове ако постоје, како бисмо избегли грешке при поновном креирању
DROP TYPE IF EXISTS menu_item_sales_summary_type CASCADE;
DROP TYPE IF EXISTS restaurant_summary_type CASCADE;
DROP TYPE IF EXISTS manager_performance_report_type CASCADE;

-- Тип за сумарни приказ продаје једног артиклa
CREATE TYPE menu_item_sales_summary_type AS (
    item_id BIGINT,
    item_name TEXT,
    item_type TEXT,
    total_quantity_sold BIGINT,
    total_revenue_from_item NUMERIC(12, 2)
    );

-- Тип за сумарни приказ перформанси једног ресторана
CREATE TYPE restaurant_summary_type AS (
    restaurant_id BIGINT,
    restaurant_name TEXT,
    total_revenue NUMERIC(12, 2),
    total_orders BIGINT,
    confirmed_orders BIGINT,
    canceled_orders BIGINT,
    avg_order_value NUMERIC(10, 2)
    );

-- Главни тип за цео извештај менаџера
CREATE TYPE manager_performance_report_type AS (
    manager_full_name TEXT,
    report_period TEXT,
    overall_total_revenue NUMERIC(12, 2),
    overall_total_orders BIGINT,
    overall_confirmed_orders BIGINT,
    overall_canceled_orders BIGINT,
    top_5_selling_items menu_item_sales_summary_type[],
    bottom_5_selling_items menu_item_sales_summary_type[],
    restaurant_performance_details restaurant_summary_type[]
    );

---------------------
--Корак 4.2: Креирање главне PL/pgSQL функције
--Сада ћемо дефинисати функцију generate_manager_analytics_report
--која ће сакупљати све податке и враћати их у дефинисаном сложеном типу.
CREATE OR REPLACE FUNCTION generate_manager_analytics_report(
    p_manager_id BIGINT,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS manager_performance_report_type AS $$
DECLARE
v_report manager_performance_report_type;
    v_item_summary_record menu_item_sales_summary_type;

    -- Курсор за топ 5 продаваних артикала
    top_5_items_cursor CURSOR FOR
SELECT
    mi.id AS item_id,
    mi.name AS item_name,
    mi.type::TEXT AS item_type,
    SUM(oi.quantity) AS total_quantity_sold,
    SUM(oi.quantity * miv.price) AS total_revenue_from_item
FROM
    orders o
        JOIN order_item oi ON o.id = oi.order_id
        JOIN menu_item_version miv ON oi.menu_item_version_id = miv.id
        JOIN menu_version mv ON miv.menu_version_id = mv.id
        JOIN menu m ON mv.menu_id = m.id
        JOIN restaurant r ON m.restaurant_id = r.id
        JOIN manager mg ON r.manager_id = mg.id
        JOIN menu_item mi ON miv.menu_item_id = mi.id
WHERE
    mg.id = p_manager_id
  AND o.creation_date BETWEEN p_start_date AND p_end_date + INTERVAL '23 hours 59 minutes 59 seconds' -- Укључује цео p_end_date
  AND o.status = 'DELIVERED' -- Само испоручене поруџбине за продају
GROUP BY
    mi.id, mi.name, mi.type
HAVING
    SUM(oi.quantity) > 0 -- Укључи само артикле који су продати
ORDER BY
    SUM(oi.quantity * miv.price) DESC, SUM(oi.quantity) DESC
    LIMIT 5;

BEGIN
    -- Коришћење WITH клаузуле за прикупљање основних података
WITH ManagerRestaurantOrders AS (
    SELECT
        o.id AS order_id,
        o.status AS order_status,
        o.total_price AS order_total_price,
        r.id AS restaurant_id,
        r.name AS restaurant_name,
        mi.id AS menu_item_id,
        mi.name AS menu_item_name,
        mi.type AS menu_item_type,
        oi.quantity AS quantity_sold,
        miv.price AS unit_price
    FROM
        orders o
            JOIN order_item oi ON o.id = oi.order_id
            JOIN menu_item_version miv ON oi.menu_item_version_id = miv.id
            JOIN menu_version mv ON miv.menu_version_id = mv.id
            JOIN menu m ON mv.menu_id = m.id
            JOIN restaurant r ON m.restaurant_id = r.id
            JOIN manager mg ON r.manager_id = mg.id -- Спајање на менаџера
            JOIN menu_item mi ON miv.menu_item_id = mi.id -- Детаљи о основном артиклу
    WHERE
        mg.id = p_manager_id
      AND o.creation_date BETWEEN p_start_date AND p_end_date + INTERVAL '23 hours 59 minutes 59 seconds'
    ),
-- Агрегација података по ресторану
    RestaurantAggregates AS (
SELECT
    mro.restaurant_id,
    mro.restaurant_name,
    COUNT(DISTINCT mro.order_id) AS total_orders,
    COALESCE(SUM(CASE WHEN mro.order_status = 'DELIVERED' THEN mro.order_total_price ELSE 0 END), 0) AS total_revenue,
    COUNT(DISTINCT CASE WHEN mro.order_status = 'DELIVERED' THEN mro.order_id END) AS confirmed_orders,
    COUNT(DISTINCT CASE WHEN mro.order_status IN ('CANCELED', 'REJECTED') THEN mro.order_id END) AS canceled_orders,
    COALESCE(AVG(CASE WHEN mro.order_status = 'DELIVERED' THEN mro.order_total_price END), 0) AS avg_order_value
FROM
    ManagerRestaurantOrders mro
GROUP BY
    mro.restaurant_id, mro.restaurant_name
    ),
    -- Агрегација података о продаји артикала (за најмање продаване)
    ItemSalesAggregates AS (
SELECT
    mro.menu_item_id,
    mro.menu_item_name,
    mro.menu_item_type,
    SUM(mro.quantity_sold) AS total_quantity_sold,
    SUM(mro.quantity_sold * mro.unit_price) AS total_revenue_from_item
FROM
    ManagerRestaurantOrders mro
WHERE
    mro.order_status = 'DELIVERED'
GROUP BY
    mro.menu_item_id, mro.menu_item_name, mro.menu_item_type
HAVING
    SUM(mro.quantity_sold) > 0 -- Укључи само артикле који су продати
    )
-- Главни SELECT који попуњава извештај
SELECT
    (SELECT mg.first_name || ' ' || mg.last_name FROM manager mg WHERE mg.id = p_manager_id) AS manager_full_name,
    to_char(p_start_date, 'DD.MM.YYYY') || ' - ' || to_char(p_end_date, 'DD.MM.YYYY') AS report_period,
    COALESCE(SUM(ra.total_revenue), 0) AS overall_total_revenue,
    COALESCE(SUM(ra.total_orders), 0) AS overall_total_orders,
    COALESCE(SUM(ra.confirmed_orders), 0) AS overall_confirmed_orders,
    COALESCE(SUM(ra.canceled_orders), 0) AS overall_canceled_orders,
    -- Најмање продавани артикли (користимо array_agg за ову листу)
    (SELECT array_agg(ROW(isa_bottom.menu_item_id, isa_bottom.menu_item_name, isa_bottom.menu_item_type::TEXT, isa_bottom.total_quantity_sold, isa_bottom.total_revenue_from_item)::menu_item_sales_summary_type ORDER BY isa_bottom.total_revenue_from_item ASC, isa_bottom.total_quantity_sold ASC)
     FROM ItemSalesAggregates isa_bottom LIMIT 5) AS bottom_5_selling_items,
        -- Детаљи перформанси по ресторану
        (SELECT array_agg(ROW(ra_det.restaurant_id, ra_det.restaurant_name, ra_det.total_revenue, ra_det.total_orders, ra_det.confirmed_orders, ra_det.canceled_orders, ra_det.avg_order_value)::restaurant_summary_type ORDER BY ra_det.restaurant_name)
         FROM RestaurantAggregates ra_det) AS restaurant_performance_details
INTO
    v_report.manager_full_name,
    v_report.report_period,
    v_report.overall_total_revenue,
    v_report.overall_total_orders,
    v_report.overall_confirmed_orders,
    v_report.overall_canceled_orders,
    v_report.bottom_5_selling_items,
    v_report.restaurant_performance_details
FROM
    RestaurantAggregates ra;

-- Иницијализација листе за топ 5 артикала
v_report.top_5_selling_items := '{}';

    -- Коришћење курсора за попуњавање топ 5 продаваних артикала
OPEN top_5_items_cursor;
LOOP
FETCH top_5_items_cursor INTO v_item_summary_record;
        EXIT WHEN NOT FOUND;
        v_report.top_5_selling_items := array_append(v_report.top_5_selling_items, v_item_summary_record);
END LOOP;
CLOSE top_5_items_cursor;

RETURN v_report;
END;
$$ LANGUAGE plpgsql;

--------------------------------------
--Корак 4.3: Пример позивања функције (и тестирање)
--Да бисте видели како извештај изгледа, морате имати генерисане поруџбине,
--ставке поруџбина, меније, ресторане и менаџере
-- Пример позивања функције за менаџера са ID=1 за период од 2024-01-01 до данас
SELECT * FROM generate_manager_analytics_report(
        4, -- !!! ЗАМЕНИТЕ ОВАЈ ID СА СТВАРНИМ ID-јем МЕНАЏЕРА !!!
        '2024-01-01'::DATE,
        CURRENT_DATE
              );