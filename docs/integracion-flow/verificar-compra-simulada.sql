-- Verificar Compra Simulada para RUT 762686856, Período 202412
-- Este script verifica si los registros de la compra simulada fueron creados correctamente

-- 1. Verificar si existe el corredor
SELECT 
    'CORREDOR' as tipo_registro,
    rut,
    nombre,
    activo,
    fecha_creacion
FROM corredores 
WHERE rut = '762686856';

-- 2. Verificar pagos relacionados
SELECT 
    'PAGO' as tipo_registro,
    id,
    orden_comercio,
    amount,
    estado,
    metodo_pago,
    fecha_creacion
FROM pagos 
WHERE orden_comercio LIKE 'ORD_762686856_202412_%'
ORDER BY fecha_creacion DESC;

-- 3. Verificar accesos de usuario
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

-- 4. Verificar reportes individuales
SELECT 
    'REPORTE' as tipo_registro,
    id,
    rut,
    periodo,
    activo,
    fecha_generacion,
    fecha_expiracion,
    datos_reporte
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
    activo
FROM productos 
WHERE codigo = 'rp_001';

-- 6. Resumen completo de la compra (si existe)
SELECT 
    p.orden_comercio,
    p.amount as monto_pagado,
    p.estado as estado_pago,
    p.fecha_creacion as fecha_pago,
    a.modulo,
    a.activo as acceso_activo,
    a.fecha_inicio as acceso_desde,
    a.fecha_fin as acceso_hasta,
    r.rut,
    r.periodo,
    r.activo as reporte_activo,
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
    fecha_expiracion
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
    fecha_creacion
FROM accesos_usuarios 
WHERE user_id = 'user_demo_762686856'
ORDER BY fecha_creacion DESC;