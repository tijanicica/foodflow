-- =================================================================
-- ПРЕДИСПИТНЕ ОБАВЕЗЕ: PL/pgSQL КОМПОНЕНТЕ
-- Предмет: Системи база података
-- Аутор: Никола Стојичић
-- =================================================================

-- =================================================================
-- 1. PL/pgSQL Тригер: Спречавање измене адресе у активној поруџбини
-- =================================================================
-- Опис: Овај тригер спречава измену кључних поља (улица, број, град, итд.)
-- на адреси ако је та адреса повезана са поруџбином која је у току.
-- Дозвољава само промену не-критичних поља као што је надимак.

-- Тригер функција
C-- Функција
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
        -- Користимо тачно оне статусе које сте навели као активне.
SELECT COUNT(*) INTO v_active_order_count
FROM orders
WHERE address_id = OLD.id
  AND status IN ('CREATED', 'CONFIRMED', 'READY_FOR_PICKUP', 'PICKED_UP', 'SCHEDULED_PENDING');

IF v_active_order_count > 0 THEN
            -- Ово је порука коју ћемо касније приказати кориснику.
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
-- 2. PL/pgSQL Функција: Паметна препорука (верзија 2.0 - поштује правило једног ресторана)
-- =================================================================
-- Опис: Ова функција прво проналази ресторан из којег је корисник најчешће наручивао,
-- а затим проналази најпопуларније артикле које је наручивао баш из тог ресторана.
-- Ово осигурава да су сви препоручени артикли доступни за једну поруџбину.

CREATE OR REPLACE FUNCTION suggest_most_frequent_items(p_customer_id BIGINT, p_item_count INT DEFAULT 3)
RETURNS BIGINT[] AS $$
DECLARE
v_favorite_restaurant_id BIGINT;
    v_item_ids BIGINT[];
BEGIN
    -- === КОРАК А: Пронађи најпопуларнији ресторан за овог корисника ===
    -- Спајамо 6 табела да бисмо од корисника дошли до ресторана
SELECT
    r.id INTO v_favorite_restaurant_id
FROM orders o
         JOIN order_item oi ON o.id = oi.order_id
         JOIN menu_item_version miv ON oi.menu_item_version_id = miv.id
         JOIN menu_version mv ON miv.menu_version_id = mv.id
         JOIN menu m ON mv.menu_id = m.id
         JOIN restaurant r ON m.restaurant_id = r.id
WHERE o.customer_id = p_customer_id AND o.status = 'DELIVERED'
GROUP BY r.id
ORDER BY COUNT(DISTINCT o.id) DESC -- Бројимо јединствене поруџбине из сваког ресторана
    LIMIT 1;

-- Ако корисник уопште нема поруџбина, не можемо наћи омиљени ресторан.
IF v_favorite_restaurant_id IS NULL THEN
        RETURN '{}'::BIGINT[];
END IF;

    -- === КОРАК Б: Пронађи најпопуларније артикле ИЗ ТОГ РЕСТОРАНА ===
SELECT
    array_agg(top_items.menu_item_version_id) INTO v_item_ids
FROM (
         SELECT
             oi.menu_item_version_id,
             SUM(oi.quantity) AS total_ordered
         FROM orders o
                  JOIN order_item oi ON o.id = oi.order_id
             -- Придружијемо се поново да бисмо могли да филтрирамо по ресторану
                  JOIN menu_item_version miv ON oi.menu_item_version_id = miv.id
                  JOIN menu_version mv ON miv.menu_version_id = mv.id
                  JOIN menu m ON mv.menu_id = m.id
         WHERE
                 o.customer_id = p_customer_id
           AND o.status = 'DELIVERED'
           AND m.restaurant_id = v_favorite_restaurant_id -- КЉУЧНИ ФИЛТЕР!
         GROUP BY
             oi.menu_item_version_id
         ORDER BY
             total_ordered DESC
             LIMIT
            p_item_count
     ) AS top_items;

RETURN COALESCE(v_item_ids, '{}'::BIGINT[]);
END;
$$ LANGUAGE plpgsql;


    @Query(value = "SELECT suggest_most_frequent_items(:customerId, :count)", nativeQuery = true)
List<Long> findRecommendedItemIdsForCustomer(@Param("customerId") Long customerId, @Param("count") int count);

-- =================================================================
-- 3. SQL Индекс: [Назив вашег индекса]
-- =================================================================
-- Опис: [Кратак опис који упит убрзава и зашто]

-- ... (CREATE INDEX команда) ...


-- =================================================================
-- 4. PL/pgSQL Извештај: [Назив вашег извештаја]
-- =================================================================
-- Опис: [Кратак опис шта извештај генерише]

-- ... (CREATE TYPE и CREATE FUNCTION команде за извештај) ...