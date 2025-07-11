## 1. SQL para ver todas las tablas, columnas y relaciones existentes
sql

###-- Ver todas las tablas y sus columnas
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default,
    CASE 
        WHEN pk.column_name IS NOT NULL THEN 'PRIMARY KEY'
        WHEN fk.column_name IS NOT NULL THEN 'FOREIGN KEY -> ' || fk.foreign_table_name || '(' || fk.foreign_column_name || ')'
        ELSE ''
    END as key_type
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
LEFT JOIN (
    SELECT ku.table_name, ku.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY'
) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
LEFT JOIN (
    SELECT 
        ku.table_name,
        ku.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name
WHERE t.table_schema = 'public'
ORDER BY t.table_name, c.ordinal_position;


| table_name                     | column_name         | data_type                   | is_nullable | column_default                                | key_type                     |
| ------------------------------ | ------------------- | --------------------------- | ----------- | --------------------------------------------- | ---------------------------- |
| accesos                        | id                  | uuid                        | NO          | gen_random_uuid()                             | PRIMARY KEY                  |
| accesos                        | user_id             | text                        | NO          | null                                          |                              |
| accesos                        | producto_id         | uuid                        | NO          | null                                          | FOREIGN KEY -> productos(id) |
| accesos                        | modulo              | text                        | NO          | null                                          |                              |
| accesos                        | fecha_inicio        | timestamp without time zone | NO          | now()                                         |                              |
| accesos                        | fecha_fin           | timestamp without time zone | NO          | null                                          |                              |
| accesos                        | activo              | boolean                     | NO          | true                                          |                              |
| accesos_usuarios               | id                  | uuid                        | NO          | gen_random_uuid()                             | PRIMARY KEY                  |
| accesos_usuarios               | user_id             | text                        | NO          | null                                          |                              |
| accesos_usuarios               | producto_id         | uuid                        | YES         | null                                          | FOREIGN KEY -> productos(id) |
| accesos_usuarios               | modulo              | text                        | NO          | null                                          |                              |
| accesos_usuarios               | fecha_inicio        | timestamp without time zone | NO          | null                                          |                              |
| accesos_usuarios               | fecha_fin           | timestamp without time zone | NO          | null                                          |                              |
| accesos_usuarios               | activo              | boolean                     | YES         | true                                          |                              |
| accesos_usuarios               | fecha_creacion      | timestamp without time zone | YES         | CURRENT_TIMESTAMP                             |                              |
| accesos_usuarios               | fecha_actualizacion | timestamp without time zone | YES         | CURRENT_TIMESTAMP                             |                              |
| actores_salientes              | id                  | integer                     | NO          | nextval('actores_salientes_id_seq'::regclass) | PRIMARY KEY                  |
| actores_salientes              | rutcia              | character varying           | NO          | null                                          |                              |
| actores_salientes              | nombrecia           | character varying           | NO          | null                                          |                              |
| actores_salientes              | motivo              | text                        | YES         | null                                          |                              |
| actores_salientes              | fecha_salida        | date                        | YES         | null                                          |                              |
| companias                      | id                  | integer                     | NO          | nextval('companias_id_seq'::regclass)         | PRIMARY KEY                  |
| companias                      | rutcia              | character varying           | NO          | null                                          |                              |
| companias                      | nombrecia           | character varying           | NO          | null                                          |                              |
| companias                      | grupo               | character varying           | YES         | null                                          |                              |
| configuracion_flow             | id                  | uuid                        | NO          | gen_random_uuid()                             | PRIMARY KEY                  |
| configuracion_flow             | api_key             | text                        | NO          | null                                          |                              |
| configuracion_flow             | secret_key          | text                        | NO          | null                                          |                              |
| configuracion_flow             | api_url             | text                        | NO          | 'https://www.flow.cl/api'::text               |                              |
| configuracion_flow             | sandbox_mode        | boolean                     | YES         | true                                          |                              |
| configuracion_flow             | activo              | boolean                     | YES         | true                                          |                              |
| configuracion_flow             | fecha_creacion      | timestamp without time zone | YES         | CURRENT_TIMESTAMP                             |                              |
| configuracion_flow             | fecha_actualizacion | timestamp without time zone | YES         | CURRENT_TIMESTAMP                             |                              |
| corredores                     | id                  | integer                     | NO          | nextval('corredores_master_id_seq'::regclass) | PRIMARY KEY                  |
| corredores                     | rut                 | character varying           | NO          | null                                          |                              |
| corredores                     | nombre              | character varying           | NO          | null                                          |                              |
| corredores                     | telefono            | character varying           | YES         | null                                          |                              |
| corredores                     | domicilio           | character varying           | YES         | null                                          |                              |
| corredores                     | ciudad              | character varying           | YES         | null                                          |                              |
| corredores                     | region              | smallint                    | YES         | null                                          |                              |
| corredores                     | tipo_persona        | character                   | YES         | null                                          |                              |
| corredores                     | activo              | boolean                     | YES         | true                                          |                              |
| corredores                     | fecha_creacion      | timestamp without time zone | YES         | CURRENT_TIMESTAMP                             |                              |
| corredores                     | fecha_actualizacion | timestamp without time zone | YES         | CURRENT_TIMESTAMP                             |                              |
| fusiones                       | id                  | integer                     | NO          | nextval('fusiones_id_seq'::regclass)          | PRIMARY KEY                  |
| fusiones                       | rutcia_original     | character varying           | NO          | null                                          |                              |
| fusiones                       | rutcia_nueva        | character varying           | NO          | null                                          |                              |
| fusiones                       | fecha_fusion        | date                        | NO          | null                                          |                              |
| fusiones                       | motivo              | text                        | YES         | null                                          |                              |
| identifi                       | id                  | integer                     | NO          | nextval('corredores_id_seq'::regclass)        | PRIMARY KEY                  |
| identifi                       | rut                 | character varying           | NO          | null                                          |                              |
| identifi                       | nombre              | character varying           | NO          | null                                          |                              |
| identifi                       | telefono            | character varying           | YES         | null                                          |                              |
| identifi                       | domicilio           | character varying           | YES         | null                                          |                              |
| identifi                       | ciudad              | character varying           | YES         | null                                          |                              |
| identifi                       | region              | smallint                    | YES         | null                                          |                              |
| identifi                       | tipo_persona        | character                   | YES         | null                                          |                              |
| identifi                       | periodo             | character                   | YES         | null                                          |                              |
| indicadores_generales_corredor | rut                 | character varying           | YES         | null                                          |                              |
| indicadores_generales_corredor | periodo             | character                   | YES         | null                                          |                              |
| indicadores_generales_corredor | total_primaclp      | numeric                     | YES         | null                                          |                              |
| indicadores_generales_corredor | total_primauf       | numeric                     | YES         | null                                          |                              |
| indicadores_generales_corredor | crecimiento_clp     | numeric                     | YES         | null                                          |                              |
| indicadores_generales_corredor | crecimiento_uf      | numeric                     | YES         | null                                          |                              |
| indicadores_generales_corredor | hhi_ramos           | numeric                     | YES         | null                                          |                              |
| indicadores_generales_corredor | hhi_companias       | numeric                     | YES         | null                                          |                              |
| indicadores_generales_corredor | participacion_clp   | numeric                     | YES         | null                                          |                              |
| indicadores_generales_corredor | variacion_clp_pp    | numeric                     | YES         | null                                          |                              |
| indicadores_generales_corredor | num_companias       | bigint                      | YES         | null                                          |                              |
| indicadores_generales_corredor | num_ramos           | bigint                      | YES         | null                                          |                              |
| indicadores_generales_corredor | ranking_general     | bigint                      | YES         | null                                          |                              |
| intercia                       | id                  | integer                     | NO          | nextval('produccion_id_seq'::regclass)        | PRIMARY KEY                  |
| intercia                       | periodo             | character                   | NO          | null                                          |                              |
| intercia                       | rut                 | character varying           | NO          | null                                          |                              |
| intercia                       | rutcia              | character varying           | YES         | null                                          |                              |
| intercia                       | primaclp            | numeric                     | NO          | null                                          |                              |
| intercia                       | nombrecia           | character varying           | YES         | null                                          |                              |
| intercia                       | grupo               | character varying           | YES         | null                                          |                              |
| intercia                       | signo               | character varying           | YES         | null                                          |                              |
| intercia                       | primauf             | numeric                     | NO          | null                                          |                              |
| logs_sistema                   | id                  | uuid                        | NO          | gen_random_uuid()                             | PRIMARY KEY                  |
| logs_sistema                   | user_id             | text                        | YES         | null                                          |                              |
| logs_sistema                   | accion              | text                        | NO          | null                                          |                              |
| logs_sistema                   | tabla_afectada      | text                        | YES         | null                                          |                              |
| logs_sistema                   | registro_id         | text                        | YES         | null                                          |                              |
| logs_sistema                   | datos_anteriores    | jsonb                       | YES         | null                                          |                              |
| logs_sistema                   | datos_nuevos        | jsonb                       | YES         | null                                          |                              |
| logs_sistema                   | ip_address          | inet                        | YES         | null                                          |                              |
| logs_sistema                   | user_agent          | text                        | YES         | null                                          |                              |
| logs_sistema                   | fecha_creacion      | timestamp without time zone | YES         | CURRENT_TIMESTAMP                             |                              |
| memoria_anual_ramos            | codigo              | character varying           | YES         | null                                          |                              |
| memoria_anual_ramos            | ramo                | character varying           | YES         | null                                          |                              |
| memoria_anual_ramos            | total_clp           | numeric                     | YES         | null                                          |                              |
| memoria_anual_ramos            | total_uf            | numeric                     | YES         | null                                          |                              |
| pagos                          | id                  | uuid                        | NO          | gen_random_uuid()                             | PRIMARY KEY                  |
| pagos                          | user_id             | text                        | NO          | null                                          |                              |
| pagos                          | rut                 | character varying           | NO          | null                                          |                              |
| pagos                          | producto_id         | uuid                        | NO          | null                                          | FOREIGN KEY -> productos(id) |
| pagos                          | orden_comercio      | text                        | NO          | null                                          |                              |
| pagos                          | amount              | numeric                     | NO          | null                                          |                              |


### 2. SQL para ver todas las políticas RLS existentes

-- Ver todas las políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;


| schemaname | tablename             | policyname                                    | permissive | roles           | cmd    | qual                                                                                                                    | with_check |
| ---------- | --------------------- | --------------------------------------------- | ---------- | --------------- | ------ | ----------------------------------------------------------------------------------------------------------------------- | ---------- |
| public     | accesos_usuarios      | Service role bypass accesos                   | PERMISSIVE | {public}        | ALL    | (current_setting('role'::text) = 'service_role'::text)                                                                  | null       |
| public     | accesos_usuarios      | Usuario ve solo sus accesos                   | PERMISSIVE | {public}        | ALL    | ((auth.uid())::text = user_id)                                                                                          | null       |
| public     | accesos_usuarios      | Usuarios ven solo sus accesos                 | PERMISSIVE | {public}        | ALL    | ((auth.uid())::text = user_id)                                                                                          | null       |
| public     | corredores            | Permitir lectura de corredores                | PERMISSIVE | {public}        | SELECT | true                                                                                                                    | null       |
| public     | corredores            | Usuarios autenticados pueden leer corredores  | PERMISSIVE | {public}        | SELECT | (auth.role() = 'authenticated'::text)                                                                                   | null       |
| public     | pagos                 | Service role bypass pagos                     | PERMISSIVE | {public}        | ALL    | (current_setting('role'::text) = 'service_role'::text)                                                                  | null       |
| public     | pagos                 | Usuario ve solo sus pagos                     | PERMISSIVE | {public}        | ALL    | ((auth.uid())::text = user_id)                                                                                          | null       |
| public     | pagos                 | Usuarios ven solo sus pagos                   | PERMISSIVE | {public}        | ALL    | ((auth.uid())::text = user_id)                                                                                          | null       |
| public     | productos             | Allow authenticated users to select productos | PERMISSIVE | {authenticated} | SELECT | (activo = true)                                                                                                         | null       |
| public     | productos             | Allow service role to select productos        | PERMISSIVE | {service_role}  | SELECT | true                                                                                                                    | null       |
| public     | productos             | Productos visibles para usuarios autenticados | PERMISSIVE | {public}        | SELECT | ((auth.uid() IS NOT NULL) AND (activo = true))                                                                          | null       |
| public     | productos             | Service role bypass productos                 | PERMISSIVE | {public}        | ALL    | (current_setting('role'::text) = 'service_role'::text)                                                                  | null       |
| public     | productos             | authenticated_select_productos                | PERMISSIVE | {authenticated} | SELECT | (activo = true)                                                                                                         | null       |
| public     | productos             | service_role_select_productos                 | PERMISSIVE | {service_role}  | SELECT | true                                                                                                                    | null       |
| public     | reportes_individuales | Service role bypass reportes                  | PERMISSIVE | {public}        | ALL    | (current_setting('role'::text) = 'service_role'::text)                                                                  | null       |
| public     | reportes_individuales | Usuario ve solo sus reportes                  | PERMISSIVE | {public}        | ALL    | ((auth.uid())::text = user_id)                                                                                          | null       |
| public     | reportes_individuales | Usuarios ven solo sus reportes                | PERMISSIVE | {public}        | ALL    | ((auth.uid())::text = user_id)                                                                                          | null       |
| public     | transacciones_flow    | Service role bypass transacciones             | PERMISSIVE | {public}        | ALL    | (current_setting('role'::text) = 'service_role'::text)                                                                  | null       |
| public     | transacciones_flow    | Usuario ve solo sus transacciones flow        | PERMISSIVE | {public}        | ALL    | (EXISTS ( SELECT 1
   FROM pagos p
  WHERE ((p.id = transacciones_flow.pago_id) AND (p.user_id = (auth.uid())::text)))) | null       |
| public     | user_subscriptions    | Users can update own subscriptions            | PERMISSIVE | {public}        | ALL    | ((auth.uid())::text = user_id)                                                                                          | null       |
| public     | user_subscriptions    | Users can view own subscriptions              | PERMISSIVE | {public}        | SELECT | ((auth.uid())::text = user_id)                                                                                          | null       |


-- Ver qué tablas tienen RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename , policyname;


| schemaname | tablename                  | rls_enabled |
| ---------- | -------------------------- | ----------- |
| public     | accesos                    | false       |
| public     | accesos_usuarios           | true        |
| public     | actores_salientes          | false       |
| public     | companias                  | false       |
| public     | configuracion_flow         | false       |
| public     | corredores                 | true        |
| public     | fusiones                   | false       |
| public     | identifi                   | false       |
| public     | intercia                   | false       |
| public     | logs_sistema               | false       |
| public     | pagos                      | true        |
| public     | periodos                   | false       |
| public     | prodramo                   | false       |
| public     | productos                  | true        |
| public     | ramos                      | false       |
| public     | registro_empresa           | false       |
| public     | reporte_individual         | false       |
| public     | reportes_individuales      | true        |
| public     | temp_concentracion_mercado | false       |
| public     | transacciones_flow         | true        |
| public     | uf_values                  | false       |
| public     | user_subscriptions         | true        |


### 3. SQL específicas para que los reportes comprados sean visibles


-- PASO 1: Habilitar RLS en las tablas necesarias
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE accesos_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_individuales ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

-- PASO 2: Política para productos (catálogo público)
-- Los productos son un catálogo, todos pueden verlos
DROP POLICY IF EXISTS "Productos visibles para todos" ON productos;
CREATE POLICY "Productos visibles para todos" ON productos
    FOR SELECT USING (activo = true);

-- PASO 3: Política para accesos_usuarios 
-- Solo el usuario que compró puede ver sus accesos
DROP POLICY IF EXISTS "Usuario ve solo sus accesos" ON accesos_usuarios;
CREATE POLICY "Usuario ve solo sus accesos" ON accesos_usuarios
    FOR ALL USING (auth.uid()::text = user_id);

-- PASO 4: Política para reportes_individuales
-- Solo el usuario que compró puede ver sus reportes
DROP POLICY IF EXISTS "Usuario ve solo sus reportes" ON reportes_individuales;
CREATE POLICY "Usuario ve solo sus reportes" ON reportes_individuales
    FOR ALL USING (auth.uid()::text = user_id);

-- PASO 5: Política para pagos
-- Solo el usuario que hizo el pago puede verlo
DROP POLICY IF EXISTS "Usuario ve solo sus pagos" ON pagos;
CREATE POLICY "Usuario ve solo sus pagos" ON pagos
    FOR ALL USING (auth.uid()::text = user_id);

-- PASO 6: Política para service_role (bypass RLS)
-- El sistema puede hacer todo
CREATE POLICY "Service role bypass" ON productos
    FOR ALL TO service_role USING (true);
    
CREATE POLICY "Service role bypass accesos" ON accesos_usuarios
    FOR ALL TO service_role USING (true);
    
CREATE POLICY "Service role bypass reportes" ON reportes_individuales
    FOR ALL TO service_role USING (true);
    
CREATE POLICY "Service role bypass pagos" ON pagos
    FOR ALL TO service_role USING (true);




### 4. SQL para verificar que todo funciona


-- Verificar que un usuario puede ver sus reportes comprados
SELECT 
    r.id,
    r.rut,
    r.periodo,
    r.fecha_generacion,
    r.activo,
    'Reporte visible para usuario' as status
FROM reportes_individuales r
WHERE r.user_id = auth.uid()::text
AND r.activo = true;

-- Verificar que un usuario puede ver sus accesos
SELECT 
    a.id,
    a.modulo,
    a.fecha_inicio,
    a.fecha_fin,
    a.activo,
    'Acceso visible para usuario' as status
FROM accesos_usuarios a
WHERE a.user_id = auth.uid()::text
AND a.activo = true
AND a.fecha_fin > CURRENT_TIMESTAMP;



