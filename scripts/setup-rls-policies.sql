-- Script para habilitar RLS y crear políticas de seguridad
-- Ejecutar en Supabase SQL Editor o mediante CLI

-- =====================================================
-- HABILITAR ROW LEVEL SECURITY EN TODAS LAS TABLAS
-- =====================================================

-- Tablas de usuarios y perfiles
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS usuarios ENABLE ROW LEVEL SECURITY;

-- Tablas de empresas y compañías
ALTER TABLE IF EXISTS empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS companias ENABLE ROW LEVEL SECURITY;

-- Tablas de productos
ALTER TABLE IF EXISTS productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;

-- Tablas de corredores y reportes
ALTER TABLE IF EXISTS corredores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reportes_individuales ENABLE ROW LEVEL SECURITY;

-- Tablas de contenido
ALTER TABLE IF EXISTS comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS archivos ENABLE ROW LEVEL SECURITY;

-- Tablas de comercio
ALTER TABLE IF EXISTS pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS carrito ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transacciones_flow ENABLE ROW LEVEL SECURITY;

-- Tablas de acceso y suscripciones
ALTER TABLE IF EXISTS accesos_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_subscriptions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREAR POLÍTICAS RLS BÁSICAS
-- =====================================================

-- Políticas para la tabla profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid()::text = user_id OR auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid()::text = user_id OR auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id OR auth.uid()::text = id::text);

-- Políticas para la tabla users
DROP POLICY IF EXISTS "Users can view own user record" ON users;
DROP POLICY IF EXISTS "Users can update own user record" ON users;

CREATE POLICY "Users can view own user record" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own user record" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Políticas para la tabla usuarios
DROP POLICY IF EXISTS "Users can view own usuario record" ON usuarios;
DROP POLICY IF EXISTS "Users can update own usuario record" ON usuarios;

CREATE POLICY "Users can view own usuario record" ON usuarios
    FOR SELECT USING (auth.uid()::text = user_id::text OR auth.uid()::text = id::text);

CREATE POLICY "Users can update own usuario record" ON usuarios
    FOR UPDATE USING (auth.uid()::text = user_id::text OR auth.uid()::text = id::text);

-- Políticas para pagos (solo el usuario propietario)
DROP POLICY IF EXISTS "Users can view own payments" ON pagos;
DROP POLICY IF EXISTS "Users can insert own payments" ON pagos;

CREATE POLICY "Users can view own payments" ON pagos
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own payments" ON pagos
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Políticas para carrito (solo el usuario propietario)
DROP POLICY IF EXISTS "Users can manage own cart" ON carrito;

CREATE POLICY "Users can manage own cart" ON carrito
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Políticas para accesos_usuarios
DROP POLICY IF EXISTS "Users can view own access" ON accesos_usuarios;
DROP POLICY IF EXISTS "Users can insert own access" ON accesos_usuarios;

CREATE POLICY "Users can view own access" ON accesos_usuarios
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own access" ON accesos_usuarios
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Políticas para user_subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON user_subscriptions;

CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own subscriptions" ON user_subscriptions
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Políticas para transacciones_flow
DROP POLICY IF EXISTS "Users can view own transactions" ON transacciones_flow;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transacciones_flow;

CREATE POLICY "Users can view own transactions" ON transacciones_flow
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own transactions" ON transacciones_flow
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Políticas para reportes_individuales
DROP POLICY IF EXISTS "Users can view own reports" ON reportes_individuales;
DROP POLICY IF EXISTS "Users can manage own reports" ON reportes_individuales;

CREATE POLICY "Users can view own reports" ON reportes_individuales
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own reports" ON reportes_individuales
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Políticas para comentarios
DROP POLICY IF EXISTS "Users can view all comments" ON comentarios;
DROP POLICY IF EXISTS "Users can manage own comments" ON comentarios;

CREATE POLICY "Users can view all comments" ON comentarios
    FOR SELECT USING (true); -- Los comentarios pueden ser públicos

CREATE POLICY "Users can manage own comments" ON comentarios
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Políticas para archivos
DROP POLICY IF EXISTS "Users can view accessible files" ON archivos;
DROP POLICY IF EXISTS "Users can manage own files" ON archivos;

CREATE POLICY "Users can view accessible files" ON archivos
    FOR SELECT USING (is_public = true OR auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own files" ON archivos
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Políticas para datos públicos (solo lectura)
-- Estas tablas contienen datos de mercado que deben ser accesibles para análisis

-- Políticas para companias (lectura pública, escritura restringida)
DROP POLICY IF EXISTS "Public read access to companias" ON companias;
DROP POLICY IF EXISTS "Authenticated users can read companias" ON companias;

CREATE POLICY "Authenticated users can read companias" ON companias
    FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para companies (lectura pública, escritura restringida)
DROP POLICY IF EXISTS "Authenticated users can read companies" ON companies;

CREATE POLICY "Authenticated users can read companies" ON companies
    FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para empresas (lectura pública, escritura restringida)
DROP POLICY IF EXISTS "Authenticated users can read empresas" ON empresas;

CREATE POLICY "Authenticated users can read empresas" ON empresas
    FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para productos (lectura pública)
DROP POLICY IF EXISTS "Authenticated users can read productos" ON productos;
DROP POLICY IF EXISTS "Authenticated users can read products" ON products;

CREATE POLICY "Authenticated users can read productos" ON productos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read products" ON products
    FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para corredores (lectura pública)
DROP POLICY IF EXISTS "Authenticated users can read corredores" ON corredores;

CREATE POLICY "Authenticated users can read corredores" ON corredores
    FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para reportes (lectura pública)
DROP POLICY IF EXISTS "Authenticated users can read reportes" ON reportes;

CREATE POLICY "Authenticated users can read reportes" ON reportes
    FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- VERIFICACIÓN DE POLÍTICAS CREADAS
-- =====================================================

-- Consulta para verificar que las políticas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Consulta para verificar que RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
ORDER BY tablename;