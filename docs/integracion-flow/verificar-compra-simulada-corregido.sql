-- =====================================================
-- VERIFICAR COMPRA SIMULADA - SCRIPT CORREGIDO
-- RUT: 762686856, Período: 202412
-- =====================================================

-- 1. Verificar si existe el corredor
SELECT 
    'CORREDOR' as tipo_registro,
    rut,
    nombre,
    COALESCE(activo, true) as activo,
    COALESCE(fecha_creacion, 'No disponible'::text) as fecha_creacion
FROM corredores 
WHERE rut = '762686856';

-- 2. Verificar pagos relacionados
SELECT 
    'PAGO' as tipo_registro,
    id,
    orden_comercio,
    amount,
    estado,
    COALESCE(metodo_pago, 'No especificado') as metodo_pago,
    fecha_creacion
FROM pagos 
WHERE orden_comercio LIKE 'ORD_762686856_202412_%' 
ORDER BY fecha_creacion DESC;

-- 3. Verificar accesos de usuario (tabla corregida)
SELECT 
    'ACCESO' as tipo_registro,
    id,
    user_id,
    modulo,
    activo,
    fecha_inicio,
    fecha_fin,
    fecha_creacion
FROM accesos_usuarios 
WHERE user_id = 'user_demo_762686856' 
AND modulo = 'reportes_individuales' 
ORDER BY fecha_creacion DESC;

-- 4. Verificar reportes individuales (tabla corregida)
SELECT 
    'REPORTE' as tipo_registro,
    id,
    rut,
    periodo,
    activo,
    fecha_generacion,
    fecha_expiracion,
    CASE 
        WHEN datos_reporte IS NOT NULL THEN 'Datos disponibles'
        ELSE 'Sin datos'
    END as estado_datos
FROM reportes_individuales 
WHERE rut = '762686856' 
AND periodo = '202412' 
ORDER BY fecha_generacion DESC;

-- 5. Verificar productos disponibles
SELECT 
    'PRODUCTO' as tipo_registro,
    codigo,
    nombre,
    precio_bruto,
    COALESCE(activo, true) as activo
FROM productos 
WHERE codigo = 'rp_001';

-- 6. Resumen completo de la compra (si existe)
SELECT 
    'RESUMEN_COMPRA' as tipo_registro,
    p.orden_comercio,
    p.amount as monto_pagado,
    p.estado as estado_pago,
    p.fecha_creacion as fecha_pago,
    COALESCE(a.modulo, 'Sin acceso') as modulo,
    COALESCE(a.activo, false) as acceso_activo,
    a.fecha_inicio as acceso_desde,
    a.fecha_fin as acceso_hasta,
    COALESCE(r.rut, 'Sin reporte') as rut_reporte,
    COALESCE(r.periodo, 'Sin período') as periodo_reporte,
    COALESCE(r.activo, false) as reporte_activo,
    r.fecha_generacion,
    r.fecha_expiracion
FROM pagos p 
LEFT JOIN accesos_usuarios a ON a.user_id = 'user_demo_762686856' 
    AND a.modulo = 'reportes_individuales' 
    AND DATE(a.fecha_creacion) = DATE(p.fecha_creacion) 
LEFT JOIN reportes_individuales r ON r.rut = '762686856' 
    AND r.periodo = '202412' 
    AND DATE(r.fecha_generacion) = DATE(p.fecha_creacion) 
WHERE p.orden_comercio LIKE 'ORD_762686856_202412_%' 
ORDER BY p.fecha_creacion DESC 
LIMIT 5;

-- 7. Verificar si hay reportes para cualquier período del RUT
SELECT 
    'TODOS_REPORTES_RUT' as tipo_registro,
    rut,
    periodo,
    activo,
    fecha_generacion,
    fecha_expiracion,
    CASE 
        WHEN fecha_expiracion > CURRENT_TIMESTAMP THEN 'Vigente'
        ELSE 'Expirado'
    END as estado_vigencia
FROM reportes_individuales 
WHERE rut = '762686856' 
ORDER BY fecha_generacion DESC;

-- 8. Verificar accesos para el usuario
SELECT 
    'TODOS_ACCESOS_USER' as tipo_registro,
    user_id,
    modulo,
    activo,
    fecha_inicio,
    fecha_fin,
    fecha_creacion,
    CASE 
        WHEN fecha_fin > CURRENT_TIMESTAMP THEN 'Vigente'
        ELSE 'Expirado'
    END as estado_vigencia
FROM accesos_usuarios 
WHERE user_id = 'user_demo_762686856' 
ORDER BY fecha_creacion DESC;

-- 9. Verificar estructura de tablas (diagnóstico)
SELECT 
    'DIAGNOSTICO_TABLAS' as tipo_registro,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('corredores', 'pagos', 'accesos_usuarios', 'reportes_individuales', 'productos')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 10. Verificar existencia de tablas
SELECT 
    'TABLAS_EXISTENTES' as tipo_registro,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('corredores', 'pagos', 'accesos_usuarios', 'reportes_individuales', 'productos')
ORDER BY table_name;

-- 11. Conteo general de registros
SELECT 
    'CONTEO_GENERAL' as tipo_registro,
    'corredores' as tabla,
    COUNT(*) as total_registros
FROM corredores
WHERE rut = '762686856'

UNION ALL

SELECT 
    'CONTEO_GENERAL' as tipo_registro,
    'pagos' as tabla,
    COUNT(*) as total_registros
FROM pagos
WHERE orden_comercio LIKE 'ORD_762686856_%'

UNION ALL

SELECT 
    'CONTEO_GENERAL' as tipo_registro,
    'productos' as tabla,
    COUNT(*) as total_registros
FROM productos
WHERE codigo = 'rp_001';

-- 12. Verificar si las tablas necesarias existen
SELECT 
    'VERIFICACION_ESQUEMA' as tipo_registro,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'accesos_usuarios' AND table_schema = 'public') 
        THEN 'accesos_usuarios: EXISTE'
        ELSE 'accesos_usuarios: NO EXISTE - CREAR CON ESQUEMA'
    END as estado_accesos_usuarios,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reportes_individuales' AND table_schema = 'public') 
        THEN 'reportes_individuales: EXISTE'
        ELSE 'reportes_individuales: NO EXISTE - CREAR CON ESQUEMA'
    END as estado_reportes_individuales,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'corredores' AND column_name = 'activo' AND table_schema = 'public') 
        THEN 'corredores.activo: EXISTE'
        ELSE 'corredores.activo: NO EXISTE - AGREGAR CAMPO'
    END as estado_campo_activo_corredores,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'productos' AND column_name = 'activo' AND table_schema = 'public') 
        THEN 'productos.activo: EXISTE'
        ELSE 'productos.activo: NO EXISTE - AGREGAR CAMPO'
    END as estado_campo_activo_productos;

-- =====================================================
-- INSTRUCCIONES DE USO:
-- =====================================================
-- 1. Ejecutar este script en Supabase SQL Editor
-- 2. Si aparecen errores de tablas no existentes:
--    - Ejecutar primero: esquema-completo-bd.sql
-- 3. Revisar los resultados de VERIFICACION_ESQUEMA
-- 4. Si las tablas no existen, crear el esquema completo
-- 5. Volver a ejecutar este script de verificación
-- =====================================================