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


-------------------------------- PRVI ZADATAK SBP TRIGER --------------------------------

CREATE OR REPLACE FUNCTION update_operator_average_rating()
    RETURNS TRIGGER AS '
DECLARE
    v_operator_id BIGINT;
    v_new_average_rating NUMERIC;
BEGIN
    IF (TG_OP = ''INSERT'' OR TG_OP = ''UPDATE'') THEN
        SELECT operator_id INTO v_operator_id
        FROM support_ticket WHERE id = NEW.id;
    END IF;

    IF v_operator_id IS NOT NULL THEN
        SELECT COALESCE(AVG(r.rating), 0.0) INTO v_new_average_rating
        FROM operator_rating r
                 JOIN support_ticket st ON r.id = st.id
        WHERE st.operator_id = v_operator_id;

        UPDATE operator
        SET average_rating = v_new_average_rating
        WHERE id = v_operator_id;
    END IF;

    RETURN NULL;
END;
' LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_rating_change_update_operator_avg ON operator_rating;

CREATE TRIGGER after_rating_change_update_operator_avg
    AFTER INSERT OR UPDATE ON operator_rating
    FOR EACH ROW
EXECUTE FUNCTION update_operator_average_rating();

-------------------------------- KRAJ PRVOG ZADATKA --------------------------------



-------------------------------- DRUGI ZADATAK SBP FUNKCIJA --------------------------------

CREATE OR REPLACE FUNCTION calculate_ticket_priority_score(p_ticket_id BIGINT)
    RETURNS INTEGER AS '
    DECLARE
        score INTEGER := 0;
        creation_time_ticket TIMESTAMP;
        customer_id_ticket BIGINT;
        seconds_waiting INT;
    BEGIN
        SELECT
            st.creation_time,
            o.customer_id
        INTO
            creation_time_ticket,
            customer_id_ticket
        FROM
            support_ticket st
                JOIN
            orders o ON st.order_id = o.id
        WHERE
            st.id = p_ticket_id;

        -- ako ne nadje ticket
        IF NOT FOUND THEN
            RETURN 0;
        END IF;

        -- za svakih 20 sekundi čekanja dobija 2 poena
        seconds_waiting := EXTRACT(EPOCH FROM (NOW() - creation_time_ticket));
        score := score + ((seconds_waiting / 20) * 2);

        RETURN score;
    END;
' LANGUAGE plpgsql;

-------------------------------- KRAJ DRUGOG ZADATKA --------------------------------


-------------------------------- CETVRTI ZADATAK SBP IZVESTAJ --------------------------------

-- za izvestaje o kategorijama ovo je jedan red
DROP TYPE IF EXISTS category_performance_row;
CREATE TYPE category_performance_row AS (
                                            category_name TEXT,
                                            ticket_count BIGINT,
                                            avg_rating NUMERIC,
                                            avg_resolution_seconds NUMERIC
                                        );

-- vraca izvestaj kao jsonb, zbog pdf generisanja
CREATE OR REPLACE FUNCTION get_operator_performance_report(
    p_operator_id BIGINT,
    p_start_date TIMESTAMP DEFAULT NULL,
    p_end_date TIMESTAMP DEFAULT NULL
)
    RETURNS JSONB AS '
    DECLARE
        operator_info RECORD;
        overall_metrics RECORD;
        category_row RECORD;
        category_details category_performance_row[] := ''{}'';

        category_cursor CURSOR FOR
            WITH OperatorResolvedTickets AS (
                SELECT
                    st.id,
                    st.problem_category_id,
                    EXTRACT(EPOCH FROM (st.closing_time - st.creation_time)) as resolution_seconds
                FROM
                    support_ticket st
                WHERE
                    st.operator_id = p_operator_id
                  AND st.status IN (''RESOLVED'', ''CLOSED'')
                  AND st.closing_time IS NOT NULL
                  AND (p_start_date IS NULL OR st.closing_time >= p_start_date)
                  AND (p_end_date IS NULL OR st.closing_time <= p_end_date)
            )
            SELECT
                pc_parent.name AS category_name,
                COUNT(ort.id) AS ticket_count,
                COALESCE(AVG(opr.rating), 0.0) AS avg_rating,
                COALESCE(AVG(ort.resolution_seconds), 0.0) as avg_resolution_seconds
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
        SELECT id, first_name, last_name, email INTO operator_info
        FROM operator WHERE id = p_operator_id;

        IF NOT FOUND THEN
            RETURN jsonb_build_object(''error'', ''Operator not found'');
        END IF;

        SELECT
            COUNT(*) AS total_resolved_tickets,
            COALESCE(AVG(opr.rating), 0.0) AS overall_avg_rating,
            COALESCE(AVG(EXTRACT(EPOCH FROM (st.closing_time - st.creation_time))), 0) AS avg_resolution_seconds
        INTO
            overall_metrics
        FROM support_ticket st
                 LEFT JOIN operator_rating opr ON st.id = opr.id
        WHERE st.operator_id = p_operator_id
          AND st.status IN (''RESOLVED'', ''CLOSED'')
          AND (p_start_date IS NULL OR st.closing_time >= p_start_date)
          AND (p_end_date IS NULL OR st.closing_time <= p_end_date);

        OPEN category_cursor;
        LOOP
            FETCH category_cursor INTO category_row;
            EXIT WHEN NOT FOUND;
            category_details := array_append(category_details, ROW(category_row.category_name, category_row.ticket_count, category_row.avg_rating, category_row.avg_resolution_seconds)::category_performance_row);
        END LOOP;
        CLOSE category_cursor;

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
                ''performanceByCategory'', (SELECT jsonb_agg(jsonb_build_object(''categoryName'', r.category_name, ''ticketCount'', r.ticket_count, ''avgRating'', r.avg_rating,
                                                                                ''avgResolutionSeconds'', r.avg_resolution_seconds )) FROM unnest(category_details) as r),
                ''dateRange'', jsonb_build_object(
                        ''startDate'', p_start_date,
                        ''endDate'', p_end_date
                               )
               );
    END;
' LANGUAGE plpgsql;


-------------------------------- KRAJ CETVRTOG ZADATKA --------------------------------