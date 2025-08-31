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

---