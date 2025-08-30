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