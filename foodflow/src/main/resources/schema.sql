-------------------------------- PRVI ZADATAK SBP TRIGER --------------------------------

CREATE OR REPLACE FUNCTION set_ticket_closing_time()
    RETURNS TRIGGER AS '
    BEGIN
        IF NEW.status <> OLD.status AND (NEW.status = ''RESOLVED'' OR NEW.status = ''CLOSED'') AND OLD.closing_time IS NULL THEN
            NEW.closing_time := NOW();
        END IF;
        RETURN NEW;
    END;
' LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS before_ticket_status_update ON support_ticket;
CREATE TRIGGER before_ticket_status_update
    BEFORE UPDATE ON support_ticket
    FOR EACH ROW
    EXECUTE FUNCTION set_ticket_closing_time();

-------------------------------- KRAJ PRVOG ZADATKA --------------------------------


-------------------------------- DRUGI ZADATAK SBP FUNKCIJA --------------------------------

CREATE OR REPLACE FUNCTION calculate_ticket_priority_score(p_ticket_id BIGINT)
    RETURNS INTEGER AS '
DECLARE
    score INTEGER := 0;
    creation_time_ticket TIMESTAMP;
    problem_category_id_ticket BIGINT;
    customer_id_ticket BIGINT;
    minutes_waiting INT;
    total_orders_customer INT;
BEGIN
    -- 1. Dohvatamo potrebne podatke za tiket
    SELECT
        st.creation_time,
        st.problem_category_id,
        o.customer_id
    INTO
        creation_time_ticket,
        problem_category_id_ticket,
        customer_id_ticket
    FROM
        support_ticket st
            JOIN
        orders o ON st.order_id = o.id
    WHERE
        st.id = p_ticket_id;

    -- Ako tiket ne postoji, vrati 0
    IF NOT FOUND THEN
        RETURN 0;
    END IF;

    -- 2. Faktor 1: Vreme čekanja (najuticajniji)
    -- Svaki minut čekanja dodaje 2 poena
    minutes_waiting := EXTRACT(EPOCH FROM (NOW() - creation_time_ticket)) / 60;
    score := score + (minutes_waiting * 2);

    -- 3. Faktor 2: Kritičnost kategorije problema
    -- Koristimo CASE za dodelu poena na osnovu ID-ja kategorije iz data.sql
    score := score + CASE
                         WHEN problem_category_id_ticket = 12 THEN 100 -- Order not delivered (NAJKRITIČNIJE)
                         WHEN problem_category_id_ticket = 8 THEN 70  -- Cold/spoiled food
                         WHEN problem_category_id_ticket = 7 THEN 60  -- Damaged food
                         WHEN problem_category_id_ticket = 11 THEN 50 -- Delivery delay
                         WHEN problem_category_id_ticket = 6 THEN 40  -- Wrong order
                         WHEN problem_category_id_ticket = 5 THEN 30  -- Incomplete order
                         ELSE 10 -- Sve ostale kategorije
        END;

    RETURN score;
END;
' LANGUAGE plpgsql;

-------------------------------- KRAJ DRUGOG ZADATKA --------------------------------


-------------------------------- CETVRTI ZADATAK SBP IZVESTAJ --------------------------------
-- za izvestaje o kategorijama ovo je jedan red
CREATE TYPE category_performance_row AS (
                                            category_name TEXT,
                                            ticket_count BIGINT,
                                            avg_rating NUMERIC
                                        );

-- vraca izvestaj kao jsonb, zbog pdf generisanja
CREATE OR REPLACE FUNCTION get_operator_performance_report(p_operator_id BIGINT)
    RETURNS JSONB AS '
DECLARE

    operator_info RECORD;
    overall_metrics RECORD;
    category_details category_performance_row[]; -- Niz našeg složenog tipa


    category_cursor CURSOR FOR
        -- WITH klauzula za izolovanje relevantnih tiketa
        WITH OperatorResolvedTickets AS (
            SELECT
                st.id,
                st.problem_category_id
            FROM
                support_ticket st
            WHERE
                st.operator_id = p_operator_id
              AND st.status IN (''RESOLVED'', ''CLOSED'')
        )
        -- Složeni upit sa JOIN-om preko 3 tabele, GROUP BY, HAVING, agregacijama
        SELECT
            pc_parent.name AS category_name,
            COUNT(ort.id) AS ticket_count,
            COALESCE(AVG(opr.rating), 0.0) AS avg_rating
        FROM
            OperatorResolvedTickets ort
                LEFT JOIN
            operator_rating opr ON ort.id = opr.id
                JOIN
            problem_category pc_sub ON ort.problem_category_id = pc_sub.id
                JOIN
            problem_category pc_parent ON pc_sub.parent_category_id = pc_parent.id
        GROUP BY
            pc_parent.name
        HAVING
            COUNT(ort.id) > 0
        ORDER BY
            ticket_count DESC;

BEGIN
    -- 1. Dohvatanje osnovnih informacija o operateru
    SELECT id, first_name, last_name, email INTO operator_info
    FROM operator WHERE id = p_operator_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(''error'', ''Operator not found'');
    END IF;

    -- 2. Izračunavanje ukupnih metrika
    SELECT
        COUNT(*) AS total_resolved_tickets,
        COALESCE(AVG(opr.rating), 0.0) AS overall_avg_rating,
        COALESCE(AVG(EXTRACT(EPOCH FROM (st.closing_time - st.creation_time))), 0) AS avg_resolution_seconds
    INTO
        overall_metrics
    FROM support_ticket st
             LEFT JOIN operator_rating opr ON st.id = opr.id
    WHERE st.operator_id = p_operator_id AND st.status IN (''RESOLVED'', ''CLOSED'');

    -- 3. Prikupljanje podataka po kategorijama koristeći kursor
    category_details := array(
            SELECT ROW(rec.category_name, rec.ticket_count, rec.avg_rating)::category_performance_row
            FROM (OPEN category_cursor) AS rec
                        );

    -- 4. Sklapanje finalnog JSON objekta koji vraćamo Javi
    RETURN jsonb_build_object(
            ''operatorInfo'', jsonb_build_object(
                    ''id'', operator_info.id,
                    ''firstName'', operator_info.first_name,
                    ''lastName'', operator_info.last_name,
                    ''email'', operator_info.email
                            ),
            ''overallMetrics'', jsonb_build_object(
                    ''totalResolvedTickets'', overall_metrics.total_resolved_tickets,
                    ''overallAverageRating'', overall_metrics.overall_avg_rating,
                    ''averageResolutionSeconds'', overall_metrics.avg_resolution_seconds
                              ),
            ''performanceByCategory'', (SELECT jsonb_agg(jsonb_build_object(''categoryName'', r.category_name, ''ticketCount'', r.ticket_count, ''avgRating'', r.avg_rating)) FROM unnest(category_details) as r)
           );
END;
' LANGUAGE plpgsql;


-------------------------------- KRAJ CETVRTOG ZADATKA --------------------------------