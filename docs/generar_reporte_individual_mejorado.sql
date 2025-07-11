CREATE OR REPLACE FUNCTION generar_reporte_individual_mejorado(
    p_rut VARCHAR,
    p_periodo VARCHAR DEFAULT '202412'
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    corredor_info RECORD;
    reporte_json JSONB;
    periodo_anterior VARCHAR;
    total_mercado_clp NUMERIC;
    total_mercado_uf NUMERIC;
    ranking_corredor INTEGER;
BEGIN
    -- Calcular período anterior
    periodo_anterior := CASE 
        WHEN SUBSTRING(p_periodo, 5, 2) = '01' THEN 
            (CAST(SUBSTRING(p_periodo, 1, 4) AS INTEGER) - 1)::TEXT || '12'
        ELSE 
            SUBSTRING(p_periodo, 1, 4) || LPAD((CAST(SUBSTRING(p_periodo, 5, 2) AS INTEGER) - 1)::TEXT, 2, '0')
    END;
    
    -- Obtener información del corredor
    SELECT nombre, rut, ciudad, region, telefono
    INTO corredor_info
    FROM corredores
    WHERE rut = p_rut;
    
    -- Si no se encuentra el corredor, retornar null
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    
    -- Calcular totales del mercado para el período
    SELECT 
        COALESCE(SUM(primaclp), 0),
        COALESCE(SUM(primauf), 0)
    INTO total_mercado_clp, total_mercado_uf
    FROM intercia
    WHERE periodo = p_periodo;
    
    -- Calcular ranking del corredor
    WITH ranking_corredores AS (
        SELECT 
            rut,
            SUM(primaclp + primauf * 35000) as total_prima,
            ROW_NUMBER() OVER (ORDER BY SUM(primaclp + primauf * 35000) DESC) as ranking
        FROM intercia
        WHERE periodo = p_periodo
        GROUP BY rut
    )
    SELECT ranking INTO ranking_corredor
    FROM ranking_corredores
    WHERE rut = p_rut;
    
    -- Construir el JSON del reporte mejorado
    reporte_json := jsonb_build_object(
        'corredor', jsonb_build_object(
            'nombre', corredor_info.nombre,
            'rut', corredor_info.rut,
            'ciudad', corredor_info.ciudad,
            'region', corredor_info.region,
            'telefono', corredor_info.telefono
        ),
        'reportData', jsonb_build_object(
            'periodo', p_periodo,
            'produccion', jsonb_build_object(
                'total_prima_clp', COALESCE((
                    SELECT SUM(i.primaclp)
                    FROM intercia i
                    WHERE i.rut = p_rut AND i.periodo = p_periodo
                ), 0),
                'total_prima_uf', COALESCE((
                    SELECT SUM(i.primauf)
                    FROM intercia i
                    WHERE i.rut = p_rut AND i.periodo = p_periodo
                ), 0),
                'ranking_general', COALESCE(ranking_corredor, 999),
                'crecimiento_periodo_anterior', COALESCE((
                    WITH produccion_actual AS (
                        SELECT SUM(primaclp + primauf * 35000) as total_actual
                        FROM intercia
                        WHERE rut = p_rut AND periodo = p_periodo
                    ),
                    produccion_anterior AS (
                        SELECT SUM(primaclp + primauf * 35000) as total_anterior
                        FROM intercia
                        WHERE rut = p_rut AND periodo = periodo_anterior
                    )
                    SELECT 
                        CASE 
                            WHEN pa.total_anterior > 0 THEN 
                                ROUND(((pac.total_actual - pa.total_anterior) / pa.total_anterior * 100)::NUMERIC, 2)
                            ELSE 0
                        END
                    FROM produccion_actual pac, produccion_anterior pa
                ), 0)
            ),
            'rankings', jsonb_build_object(
                'por_compania', COALESCE((
                    WITH ranking_companias AS (
                        SELECT 
                            i.rutcia,
                            i.nombrecia,
                            SUM(i.primaclp + i.primauf * 35000) as total_prima,
                            ROW_NUMBER() OVER (ORDER BY SUM(i.primaclp + i.primauf * 35000) DESC) as ranking
                        FROM intercia i
                        WHERE i.rut = p_rut AND i.periodo = p_periodo
                        GROUP BY i.rutcia, i.nombrecia
                    )
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'rutcia', rutcia,
                            'nombrecia', nombrecia,
                            'ranking', ranking,
                            'total_prima', total_prima
                        ) ORDER BY ranking
                    )
                    FROM ranking_companias
                ), '[]'::jsonb),
                'por_ramo', COALESCE((
                    WITH ranking_ramos AS (
                        SELECT 
                            pr.cod,
                            r.ramo,
                            SUM(pr.primaclp + pr.primauf * 35000) as total_prima,
                            ROW_NUMBER() OVER (ORDER BY SUM(pr.primaclp + pr.primauf * 35000) DESC) as ranking
                        FROM prodramo pr
                        JOIN ramos r ON pr.cod = r.codigo
                        WHERE pr.rut = p_rut AND pr.periodo = p_periodo
                        GROUP BY pr.cod, r.ramo
                    )
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'codigo', cod,
                            'ramo', ramo,
                            'ranking', ranking,
                            'total_prima', total_prima
                        ) ORDER BY ranking
                    )
                    FROM ranking_ramos
                ), '[]'::jsonb)
            ),
            'companias', COALESCE((
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'rutcia', i.rutcia,
                        'nombrecia', i.nombrecia,
                        'grupo', i.grupo,
                        'prima_clp', i.primaclp,
                        'prima_uf', i.primauf,
                        'participacion', CASE 
                            WHEN total_mercado_clp > 0 THEN 
                                ROUND((i.primaclp / total_mercado_clp * 100)::NUMERIC, 2)
                            ELSE 0
                        END,
                        'ranking', (
                            SELECT COUNT(*) + 1
                            FROM intercia i2
                            WHERE i2.periodo = p_periodo 
                            AND i2.rutcia != i.rutcia
                            AND (i2.primaclp + i2.primauf * 35000) > (i.primaclp + i.primauf * 35000)
                        ),
                        'series_historicas', COALESCE((
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'periodo', ih.periodo,
                                    'prima_clp', ih.primaclp,
                                    'prima_uf', ih.primauf
                                ) ORDER BY ih.periodo DESC
                            )
                            FROM intercia ih
                            WHERE ih.rut = p_rut 
                            AND ih.rutcia = i.rutcia
                            AND ih.periodo >= (
                                SELECT periodo 
                                FROM (
                                    SELECT DISTINCT periodo 
                                    FROM intercia 
                                    WHERE periodo <= p_periodo 
                                    ORDER BY periodo DESC 
                                    LIMIT 12
                                ) sub 
                                ORDER BY periodo 
                                LIMIT 1
                            )
                        ), '[]'::jsonb)
                    )
                )
                FROM intercia i
                WHERE i.rut = p_rut AND i.periodo = p_periodo
            ), '[]'::jsonb),
            'ramos', COALESCE((
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'codigo', pr.cod,
                        'ramo', r.ramo,
                        'grupo', r.grupo,
                        'prima_clp', pr.primaclp,
                        'prima_uf', pr.primauf,
                        'participacion', CASE 
                            WHEN (
                                SELECT SUM(primaclp) 
                                FROM prodramo 
                                WHERE cod = pr.cod AND periodo = p_periodo
                            ) > 0 THEN 
                                ROUND((pr.primaclp / (
                                    SELECT SUM(primaclp) 
                                    FROM prodramo 
                                    WHERE cod = pr.cod AND periodo = p_periodo
                                ) * 100)::NUMERIC, 2)
                            ELSE 0
                        END,
                        'ranking', (
                            SELECT COUNT(*) + 1
                            FROM prodramo pr2
                            WHERE pr2.periodo = p_periodo 
                            AND pr2.cod = pr.cod
                            AND pr2.rut != pr.rut
                            AND (pr2.primaclp + pr2.primauf * 35000) > (pr.primaclp + pr.primauf * 35000)
                        ),
                        'series_historicas', COALESCE((
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'periodo', prh.periodo,
                                    'prima_clp', prh.primaclp,
                                    'prima_uf', prh.primauf
                                ) ORDER BY prh.periodo DESC
                            )
                            FROM prodramo prh
                            WHERE prh.rut = p_rut 
                            AND prh.cod = pr.cod
                            AND prh.periodo >= (
                                SELECT periodo 
                                FROM (
                                    SELECT DISTINCT periodo 
                                    FROM prodramo 
                                    WHERE periodo <= p_periodo 
                                    ORDER BY periodo DESC 
                                    LIMIT 12
                                ) sub 
                                ORDER BY periodo 
                                LIMIT 1
                            )
                        ), '[]'::jsonb)
                    )
                )
                FROM prodramo pr
                JOIN ramos r ON pr.cod = r.codigo
                WHERE pr.rut = p_rut AND pr.periodo = p_periodo
            ), '[]'::jsonb),
            'concentracion', jsonb_build_object(
                'hhi_companias', COALESCE((
                    WITH participaciones AS (
                        SELECT 
                            rutcia,
                            CASE 
                                WHEN SUM(primaclp) OVER() > 0 THEN 
                                    (primaclp / SUM(primaclp) OVER() * 100)
                                ELSE 0
                            END as participacion
                        FROM intercia
                        WHERE rut = p_rut AND periodo = p_periodo
                    )
                    SELECT ROUND(SUM(POWER(participacion, 2))::NUMERIC, 2)
                    FROM participaciones
                ), 0),
                'hhi_ramos', COALESCE((
                    WITH participaciones_ramos AS (
                        SELECT 
                            cod,
                            CASE 
                                WHEN SUM(primaclp) OVER() > 0 THEN 
                                    (primaclp / SUM(primaclp) OVER() * 100)
                                ELSE 0
                            END as participacion
                        FROM prodramo
                        WHERE rut = p_rut AND periodo = p_periodo
                    )
                    SELECT ROUND(SUM(POWER(participacion, 2))::NUMERIC, 2)
                    FROM participaciones_ramos
                ), 0),
                'top_3_companias_participacion', COALESCE((
                    WITH top_companias AS (
                        SELECT 
                            CASE 
                                WHEN SUM(primaclp) OVER() > 0 THEN 
                                    (primaclp / SUM(primaclp) OVER() * 100)
                                ELSE 0
                            END as participacion
                        FROM intercia
                        WHERE rut = p_rut AND periodo = p_periodo
                        ORDER BY primaclp DESC
                        LIMIT 3
                    )
                    SELECT ROUND(SUM(participacion)::NUMERIC, 2)
                    FROM top_companias
                ), 0),
                'top_5_ramos_participacion', COALESCE((
                    WITH top_ramos AS (
                        SELECT 
                            CASE 
                                WHEN SUM(primaclp) OVER() > 0 THEN 
                                    (primaclp / SUM(primaclp) OVER() * 100)
                                ELSE 0
                            END as participacion
                        FROM prodramo
                        WHERE rut = p_rut AND periodo = p_periodo
                        ORDER BY primaclp DESC
                        LIMIT 5
                    )
                    SELECT ROUND(SUM(participacion)::NUMERIC, 2)
                    FROM top_ramos
                ), 0)
            ),
            'top_performers', jsonb_build_object(
                'ramos_mayor_crecimiento', COALESCE((
                    WITH crecimiento_ramos AS (
                        SELECT 
                            pr.cod,
                            r.ramo,
                            pr.primaclp as actual,
                            COALESCE(pr_ant.primaclp, 0) as anterior,
                            CASE 
                                WHEN COALESCE(pr_ant.primaclp, 0) > 0 THEN 
                                    ((pr.primaclp - COALESCE(pr_ant.primaclp, 0)) / pr_ant.primaclp * 100)
                                ELSE 0
                            END as crecimiento
                        FROM prodramo pr
                        JOIN ramos r ON pr.cod = r.codigo
                        LEFT JOIN prodramo pr_ant ON pr_ant.rut = pr.rut 
                            AND pr_ant.cod = pr.cod 
                            AND pr_ant.periodo = periodo_anterior
                        WHERE pr.rut = p_rut AND pr.periodo = p_periodo
                        AND pr.primaclp > 0
                    )
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'codigo', cod,
                            'ramo', ramo,
                            'crecimiento', ROUND(crecimiento::NUMERIC, 2),
                            'prima_actual', actual,
                            'prima_anterior', anterior
                        ) ORDER BY crecimiento DESC
                    )
                    FROM (
                        SELECT * FROM crecimiento_ramos 
                        WHERE crecimiento > 0 
                        ORDER BY crecimiento DESC 
                        LIMIT 5
                    ) top_crecimiento
                ), '[]'::jsonb),
                'ramos_mayor_decrecimiento', COALESCE((
                    WITH crecimiento_ramos AS (
                        SELECT 
                            pr.cod,
                            r.ramo,
                            pr.primaclp as actual,
                            COALESCE(pr_ant.primaclp, 0) as anterior,
                            CASE 
                                WHEN COALESCE(pr_ant.primaclp, 0) > 0 THEN 
                                    ((pr.primaclp - COALESCE(pr_ant.primaclp, 0)) / pr_ant.primaclp * 100)
                                ELSE 0
                            END as crecimiento
                        FROM prodramo pr
                        JOIN ramos r ON pr.cod = r.codigo
                        LEFT JOIN prodramo pr_ant ON pr_ant.rut = pr.rut 
                            AND pr_ant.cod = pr.cod 
                            AND pr_ant.periodo = periodo_anterior
                        WHERE pr.rut = p_rut AND pr.periodo = p_periodo
                        AND COALESCE(pr_ant.primaclp, 0) > 0
                    )
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'codigo', cod,
                            'ramo', ramo,
                            'crecimiento', ROUND(crecimiento::NUMERIC, 2),
                            'prima_actual', actual,
                            'prima_anterior', anterior
                        ) ORDER BY crecimiento ASC
                    )
                    FROM (
                        SELECT * FROM crecimiento_ramos 
                        WHERE crecimiento < 0 
                        ORDER BY crecimiento ASC 
                        LIMIT 5
                    ) top_decrecimiento
                ), '[]'::jsonb),
                'companias_mayor_crecimiento', COALESCE((
                    WITH crecimiento_companias AS (
                        SELECT 
                            i.rutcia,
                            i.nombrecia,
                            i.primaclp as actual,
                            COALESCE(i_ant.primaclp, 0) as anterior,
                            CASE 
                                WHEN COALESCE(i_ant.primaclp, 0) > 0 THEN 
                                    ((i.primaclp - COALESCE(i_ant.primaclp, 0)) / i_ant.primaclp * 100)
                                ELSE 0
                            END as crecimiento
                        FROM intercia i
                        LEFT JOIN intercia i_ant ON i_ant.rut = i.rut 
                            AND i_ant.rutcia = i.rutcia 
                            AND i_ant.periodo = periodo_anterior
                        WHERE i.rut = p_rut AND i.periodo = p_periodo
                        AND i.primaclp > 0
                    )
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'rutcia', rutcia,
                            'nombrecia', nombrecia,
                            'crecimiento', ROUND(crecimiento::NUMERIC, 2),
                            'prima_actual', actual,
                            'prima_anterior', anterior
                        ) ORDER BY crecimiento DESC
                    )
                    FROM (
                        SELECT * FROM crecimiento_companias 
                        WHERE crecimiento > 0 
                        ORDER BY crecimiento DESC 
                        LIMIT 5
                    ) top_crecimiento
                ), '[]'::jsonb),
                'companias_mayor_decrecimiento', COALESCE((
                    WITH crecimiento_companias AS (
                        SELECT 
                            i.rutcia,
                            i.nombrecia,
                            i.primaclp as actual,
                            COALESCE(i_ant.primaclp, 0) as anterior,
                            CASE 
                                WHEN COALESCE(i_ant.primaclp, 0) > 0 THEN 
                                    ((i.primaclp - COALESCE(i_ant.primaclp, 0)) / i_ant.primaclp * 100)
                                ELSE 0
                            END as crecimiento
                        FROM intercia i
                        LEFT JOIN intercia i_ant ON i_ant.rut = i.rut 
                            AND i_ant.rutcia = i.rutcia 
                            AND i_ant.periodo = periodo_anterior
                        WHERE i.rut = p_rut AND i.periodo = p_periodo
                        AND COALESCE(i_ant.primaclp, 0) > 0
                    )
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'rutcia', rutcia,
                            'nombrecia', nombrecia,
                            'crecimiento', ROUND(crecimiento::NUMERIC, 2),
                            'prima_actual', actual,
                            'prima_anterior', anterior
                        ) ORDER BY crecimiento ASC
                    )
                    FROM (
                        SELECT * FROM crecimiento_companias 
                        WHERE crecimiento < 0 
                        ORDER BY crecimiento ASC 
                        LIMIT 5
                    ) top_decrecimiento
                ), '[]'::jsonb)
            )
        )
    );
    
    RETURN reporte_json;
END;
$$;