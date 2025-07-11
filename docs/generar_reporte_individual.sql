
DECLARE
    corredor_info RECORD;
    reporte_json JSONB;
BEGIN
    -- Obtener información del corredor
    SELECT nombre, rut, ciudad, region, telefono
    INTO corredor_info
    FROM corredores
    WHERE rut = p_rut;
    
    -- Si no se encuentra el corredor, retornar null
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    
    -- Construir el JSON del reporte
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
                'ranking_general', 1,
                'crecimiento_periodo_anterior', 0
            ),
            'rankings', jsonb_build_object(
                'por_compania', '[]'::jsonb,
                'por_ramo', '[]'::jsonb
            ),
            'companias', COALESCE((
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'rutcia', i.rutcia,
                        'nombrecia', i.nombrecia,
                        'grupo', i.grupo,
                        'prima_clp', i.primaclp,
                        'prima_uf', i.primauf,
                        'participacion', 0,
                        'ranking', 1
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
                        'participacion', 0,
                        'ranking', 1
                    )
                )
                FROM prodramo pr
                JOIN ramos r ON pr.cod = r.codigo
                WHERE pr.rut = p_rut AND pr.periodo = p_periodo
            ), '[]'::jsonb),
            'concentracion', jsonb_build_object(
                'hhi_companias', 0,
                'hhi_ramos', 0,
                'top_3_companias_participacion', 0,
                'top_5_ramos_participacion', 0
            ),
            'top_performers', jsonb_build_object(
                'ramos_mayor_crecimiento', '[]'::jsonb,
                'ramos_mayor_decrecimiento', '[]'::jsonb,
                'companias_mayor_crecimiento', '[]'::jsonb,
                'companias_mayor_decrecimiento', '[]'::jsonb
            )
        )
    );
    
    RETURN reporte_json;
END;

DECLARE
    corredor_info RECORD;
    reporte_json JSONB;
BEGIN
    -- Obtener información del corredor
    SELECT nombre, rut, ciudad, region, telefono
    INTO corredor_info
    FROM corredores
    WHERE rut = p_rut;
    
    -- Si no se encuentra el corredor, retornar null
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    
    -- Construir el JSON del reporte
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
                'ranking_general', 1,
                'crecimiento_periodo_anterior', 0
            ),
            'rankings', jsonb_build_object(
                'por_compania', '[]'::jsonb,
                'por_ramo', '[]'::jsonb
            ),
            'companias', COALESCE((
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'rutcia', i.rutcia,
                        'nombrecia', i.nombrecia,
                        'grupo', i.grupo,
                        'prima_clp', i.primaclp,
                        'prima_uf', i.primauf,
                        'participacion', 0,
                        'ranking', 1
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
                        'participacion', 0,
                        'ranking', 1
                    )
                )
                FROM prodramo pr
                JOIN ramos r ON pr.cod = r.codigo
                WHERE pr.rut = p_rut AND pr.periodo = p_periodo
            ), '[]'::jsonb),
            'concentracion', jsonb_build_object(
                'hhi_companias', 0,
                'hhi_ramos', 0,
                'top_3_companias_participacion', 0,
                'top_5_ramos_participacion', 0
            ),
            'top_performers', jsonb_build_object(
                'ramos_mayor_crecimiento', '[]'::jsonb,
                'ramos_mayor_decrecimiento', '[]'::jsonb,
                'companias_mayor_crecimiento', '[]'::jsonb,
                'companias_mayor_decrecimiento', '[]'::jsonb
            )
        )
    );
    
    RETURN reporte_json;
END;
