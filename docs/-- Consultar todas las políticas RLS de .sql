-- Consultar todas las políticas RLS de todas las tablas
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

-- También verificar qué tablas tienen RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
ORDER BY tablename;

-- Verificar políticas específicas para las tablas críticas
SELECT 
    t.tablename,
    t.rowsecurity as rls_enabled,
    p.policyname,
    p.cmd as command,
    p.roles,
    p.qual as using_expression,
    p.with_check as check_expression
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename
WHERE t.schemaname = 'public' 
AND t.tablename IN ('accesos_usuarios', 'reportes_individuales', 'productos', 'pagos', 'corredores')
ORDER BY t.tablename, p.policyname;


| tablename             | rls_enabled | policyname                                    | command | roles           | using_expression                                                             | check_expression |
| --------------------- | ----------- | --------------------------------------------- | ------- | --------------- | ---------------------------------------------------------------------------- | ---------------- |
| accesos_usuarios      | false       | Service role bypass accesos                   | ALL     | {public}        | (current_setting('role'::text) = 'service_role'::text)                       | null             |
| accesos_usuarios      | false       | Usuario ve solo sus accesos                   | ALL     | {public}        | ((auth.uid())::text = user_id)                                               | null             |
| accesos_usuarios      | false       | Usuarios ven solo sus accesos                 | ALL     | {public}        | (((auth.uid())::text = user_id) OR ((auth.jwt() ->> 'sub'::text) = user_id)) | null             |
| corredores            | true        | Permitir lectura de corredores                | SELECT  | {public}        | true                                                                         | null             |
| corredores            | true        | Usuarios autenticados pueden leer corredores  | SELECT  | {public}        | (auth.role() = 'authenticated'::text)                                        | null             |
| pagos                 | true        | Service role bypass pagos                     | ALL     | {public}        | (current_setting('role'::text) = 'service_role'::text)                       | null             |
| pagos                 | true        | Usuario ve solo sus pagos                     | ALL     | {public}        | ((auth.uid())::text = user_id)                                               | null             |
| pagos                 | true        | Usuarios ven solo sus pagos                   | ALL     | {public}        | (((auth.uid())::text = user_id) OR ((auth.jwt() ->> 'sub'::text) = user_id)) | null             |
| productos             | true        | Allow authenticated users to select productos | SELECT  | {authenticated} | (activo = true)                                                              | null             |
| productos             | true        | Allow service role to select productos        | SELECT  | {service_role}  | true                                                                         | null             |
| productos             | true        | Productos visibles para usuarios autenticados | SELECT  | {public}        | ((auth.uid() IS NOT NULL) AND (activo = true))                               | null             |
| productos             | true        | Service role bypass productos                 | ALL     | {public}        | (current_setting('role'::text) = 'service_role'::text)                       | null             |
| productos             | true        | authenticated_select_productos                | SELECT  | {authenticated} | (activo = true)                                                              | null             |
| productos             | true        | service_role_select_productos                 | SELECT  | {service_role}  | true                                                                         | null             |
| reportes_individuales | true        | Service role bypass reportes                  | ALL     | {public}        | (current_setting('role'::text) = 'service_role'::text)                       | null             |
| reportes_individuales | true        | Usuario ve solo sus reportes                  | ALL     | {public}        | ((auth.uid())::text = user_id)                                               | null             |
| reportes_individuales | true        | Usuarios ven solo sus reportes                | ALL     | {public}        | (((auth.uid())::text = user_id) OR ((auth.jwt() ->> 'sub'::text) = user_id)) | null             |