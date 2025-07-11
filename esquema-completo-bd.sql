-- =====================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS
-- Sistema de Reportes Individuales con Integración Flow.cl
-- =====================================================

-- 1. ACTUALIZAR TABLA CORREDORES
-- Agregar campos faltantes a la tabla existente
ALTER TABLE corredores 
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 2. ACTUALIZAR TABLA PRODUCTOS
-- Agregar campos faltantes a la tabla existente
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS iva NUMERIC(5,2) DEFAULT 19.00,
ADD COLUMN IF NOT EXISTS tipo_producto TEXT DEFAULT 'reporte',
ADD COLUMN IF NOT EXISTS duracion_dias INTEGER DEFAULT 365;

-- 3. CREAR TABLA ACCESOS_USUARIOS (si no existe)
CREATE TABLE IF NOT EXISTS accesos_usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    producto_id UUID REFERENCES productos(id),
    modulo TEXT NOT NULL,
    fecha_inicio TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    fecha_fin TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices para optimizar consultas
    CONSTRAINT unique_user_modulo_activo UNIQUE (user_id, modulo, activo)
);

-- 4. CREAR TABLA REPORTES_INDIVIDUALES (si no existe)
CREATE TABLE IF NOT EXISTS reportes_individuales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    rut CHARACTER VARYING(10) NOT NULL,
    periodo CHARACTER(6) NOT NULL,
    datos_reporte JSONB,
    fecha_generacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices para optimizar consultas
    CONSTRAINT unique_rut_periodo_activo UNIQUE (rut, periodo, activo)
);

-- 5. ACTUALIZAR TABLA PAGOS
-- Agregar campos específicos para Flow.cl
ALTER TABLE pagos 
ADD COLUMN IF NOT EXISTS metodo_pago TEXT DEFAULT 'flow',
ADD COLUMN IF NOT EXISTS flow_token TEXT,
ADD COLUMN IF NOT EXISTS flow_order INTEGER,
ADD COLUMN IF NOT EXISTS flow_payment_id TEXT,
ADD COLUMN IF NOT EXISTS flow_status TEXT,
ADD COLUMN IF NOT EXISTS flow_subject TEXT,
ADD COLUMN IF NOT EXISTS flow_currency TEXT DEFAULT 'CLP',
ADD COLUMN IF NOT EXISTS flow_payer_email TEXT,
ADD COLUMN IF NOT EXISTS flow_optional TEXT,
ADD COLUMN IF NOT EXISTS flow_pending_info JSONB,
ADD COLUMN IF NOT EXISTS flow_payment_data JSONB,
ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS ip_address INET,
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- 6. CREAR TABLA TRANSACCIONES_FLOW (para auditoría)
CREATE TABLE IF NOT EXISTS transacciones_flow (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pago_id UUID REFERENCES pagos(id),
    flow_token TEXT NOT NULL,
    flow_order INTEGER,
    flow_payment_id TEXT,
    flow_status TEXT NOT NULL,
    flow_amount NUMERIC(10,2) NOT NULL,
    flow_currency TEXT DEFAULT 'CLP',
    flow_payer_email TEXT,
    flow_payment_date TIMESTAMP WITHOUT TIME ZONE,
    flow_confirmation_date TIMESTAMP WITHOUT TIME ZONE,
    flow_raw_response JSONB,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices
    CONSTRAINT unique_flow_token UNIQUE (flow_token)
);

-- 7. CREAR TABLA CONFIGURACION_FLOW
CREATE TABLE IF NOT EXISTS configuracion_flow (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key TEXT NOT NULL,
    secret_key TEXT NOT NULL,
    api_url TEXT NOT NULL DEFAULT 'https://www.flow.cl/api',
    sandbox_mode BOOLEAN DEFAULT true,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. CREAR TABLA LOGS_SISTEMA (para auditoría)
CREATE TABLE IF NOT EXISTS logs_sistema (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    accion TEXT NOT NULL,
    tabla_afectada TEXT,
    registro_id TEXT,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address INET,
    user_agent TEXT,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. CREAR ÍNDICES PARA OPTIMIZACIÓN
CREATE INDEX IF NOT EXISTS idx_accesos_usuarios_user_id ON accesos_usuarios(user_id);
CREATE INDEX IF NOT EXISTS idx_accesos_usuarios_modulo ON accesos_usuarios(modulo);
CREATE INDEX IF NOT EXISTS idx_accesos_usuarios_activo ON accesos_usuarios(activo);
CREATE INDEX IF NOT EXISTS idx_accesos_usuarios_fechas ON accesos_usuarios(fecha_inicio, fecha_fin);

CREATE INDEX IF NOT EXISTS idx_reportes_individuales_rut ON reportes_individuales(rut);
CREATE INDEX IF NOT EXISTS idx_reportes_individuales_periodo ON reportes_individuales(periodo);
CREATE INDEX IF NOT EXISTS idx_reportes_individuales_user_id ON reportes_individuales(user_id);
CREATE INDEX IF NOT EXISTS idx_reportes_individuales_activo ON reportes_individuales(activo);

CREATE INDEX IF NOT EXISTS idx_pagos_orden_comercio ON pagos(orden_comercio);
CREATE INDEX IF NOT EXISTS idx_pagos_user_id ON pagos(user_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_flow_token ON pagos(flow_token);
CREATE INDEX IF NOT EXISTS idx_pagos_flow_payment_id ON pagos(flow_payment_id);

CREATE INDEX IF NOT EXISTS idx_transacciones_flow_pago_id ON transacciones_flow(pago_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_flow_status ON transacciones_flow(flow_status);

CREATE INDEX IF NOT EXISTS idx_logs_sistema_user_id ON logs_sistema(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_accion ON logs_sistema(accion);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_fecha ON logs_sistema(fecha_creacion);

-- 10. CREAR FUNCIONES DE AUDITORÍA
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. CREAR TRIGGERS PARA AUDITORÍA
CREATE TRIGGER trigger_actualizar_fecha_corredores
    BEFORE UPDATE ON corredores
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_actualizar_fecha_productos
    BEFORE UPDATE ON productos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_actualizar_fecha_accesos
    BEFORE UPDATE ON accesos_usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_actualizar_fecha_pagos
    BEFORE UPDATE ON pagos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

-- 12. INSERTAR DATOS INICIALES

-- Configuración inicial de Flow.cl (modo sandbox)
INSERT INTO configuracion_flow (api_key, secret_key, sandbox_mode, activo)
VALUES ('FLOW_API_KEY_SANDBOX', 'FLOW_SECRET_KEY_SANDBOX', true, true)
ON CONFLICT DO NOTHING;

-- Producto reporte individual (si no existe)
INSERT INTO productos (codigo, nombre, descripcion, precio_neto, precio_bruto, iva, tipo_producto, duracion_dias, activo)
VALUES (
    'rp_001',
    'Reporte Individual',
    'Acceso anual a reportes individuales de corredores de seguros',
    30000.00,
    35700.00,
    19.00,
    'reporte',
    365,
    true
)
ON CONFLICT (codigo) DO UPDATE SET
    precio_neto = EXCLUDED.precio_neto,
    precio_bruto = EXCLUDED.precio_bruto,
    iva = EXCLUDED.iva,
    tipo_producto = EXCLUDED.tipo_producto,
    duracion_dias = EXCLUDED.duracion_dias,
    activo = EXCLUDED.activo;

-- 13. CREAR VISTAS PARA REPORTES

-- Vista de pagos exitosos
CREATE OR REPLACE VIEW vista_pagos_exitosos AS
SELECT 
    p.id,
    p.user_id,
    p.rut,
    p.orden_comercio,
    p.amount,
    p.estado,
    p.metodo_pago,
    p.fecha_creacion,
    pr.nombre as producto_nombre,
    pr.codigo as producto_codigo
FROM pagos p
LEFT JOIN productos pr ON p.producto_id = pr.id
WHERE p.estado = 'completed';

-- Vista de accesos activos
CREATE OR REPLACE VIEW vista_accesos_activos AS
SELECT 
    a.id,
    a.user_id,
    a.modulo,
    a.fecha_inicio,
    a.fecha_fin,
    a.fecha_creacion,
    pr.nombre as producto_nombre,
    pr.codigo as producto_codigo,
    CASE 
        WHEN a.fecha_fin > CURRENT_TIMESTAMP THEN true
        ELSE false
    END as vigente
FROM accesos_usuarios a
LEFT JOIN productos pr ON a.producto_id = pr.id
WHERE a.activo = true;

-- Vista de reportes disponibles
CREATE OR REPLACE VIEW vista_reportes_disponibles AS
SELECT 
    r.id,
    r.user_id,
    r.rut,
    r.periodo,
    r.fecha_generacion,
    r.fecha_expiracion,
    r.activo,
    c.nombre as corredor_nombre,
    CASE 
        WHEN r.fecha_expiracion > CURRENT_TIMESTAMP THEN true
        ELSE false
    END as vigente
FROM reportes_individuales r
LEFT JOIN corredores c ON r.rut = c.rut
WHERE r.activo = true;

-- 14. CREAR POLÍTICAS RLS (Row Level Security)

-- Habilitar RLS en tablas sensibles
ALTER TABLE accesos_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_individuales ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

-- Política para accesos_usuarios: usuarios solo ven sus propios accesos
CREATE POLICY "Usuarios ven solo sus accesos" ON accesos_usuarios
    FOR ALL USING (auth.uid()::text = user_id);

-- Política para reportes_individuales: usuarios solo ven sus propios reportes
CREATE POLICY "Usuarios ven solo sus reportes" ON reportes_individuales
    FOR ALL USING (auth.uid()::text = user_id);

-- Política para pagos: usuarios solo ven sus propios pagos
CREATE POLICY "Usuarios ven solo sus pagos" ON pagos
    FOR ALL USING (auth.uid()::text = user_id);

-- 15. COMENTARIOS EN TABLAS
COMMENT ON TABLE accesos_usuarios IS 'Gestiona los accesos de usuarios a módulos específicos';
COMMENT ON TABLE reportes_individuales IS 'Almacena los reportes individuales generados para cada corredor';
COMMENT ON TABLE transacciones_flow IS 'Auditoría de todas las transacciones realizadas con Flow.cl';
COMMENT ON TABLE configuracion_flow IS 'Configuración de la integración con Flow.cl';
COMMENT ON TABLE logs_sistema IS 'Registro de auditoría de todas las acciones del sistema';

-- 16. FUNCIÓN PARA LIMPIAR DATOS EXPIRADOS
CREATE OR REPLACE FUNCTION limpiar_datos_expirados()
RETURNS INTEGER AS $$
DECLARE
    registros_eliminados INTEGER := 0;
BEGIN
    -- Desactivar reportes expirados
    UPDATE reportes_individuales 
    SET activo = false 
    WHERE fecha_expiracion < CURRENT_TIMESTAMP 
    AND activo = true;
    
    GET DIAGNOSTICS registros_eliminados = ROW_COUNT;
    
    -- Desactivar accesos expirados
    UPDATE accesos_usuarios 
    SET activo = false 
    WHERE fecha_fin < CURRENT_TIMESTAMP 
    AND activo = true;
    
    GET DIAGNOSTICS registros_eliminados = registros_eliminados + ROW_COUNT;
    
    -- Registrar en logs
    INSERT INTO logs_sistema (accion, tabla_afectada, datos_nuevos)
    VALUES ('limpiar_datos_expirados', 'sistema', 
            json_build_object('registros_procesados', registros_eliminados));
    
    RETURN registros_eliminados;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SCRIPT COMPLETADO
-- =====================================================

-- Para ejecutar este script:
-- 1. Conectarse a Supabase SQL Editor
-- 2. Ejecutar este script completo
-- 3. Verificar que todas las tablas y campos se crearon correctamente
-- 4. Configurar las variables de entorno de Flow.cl
-- 5. Probar la funcionalidad de compra y generación de reportes