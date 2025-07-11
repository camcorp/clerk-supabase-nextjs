
-- POLÍTICAS RLS DINÁMICAS - GENERADAS AUTOMÁTICAMENTE
-- ====================================================
-- Generado el: 2025-06-22T20:34:40.482Z
-- Expresión Clerk: (SELECT raw_user_meta_data->>'sub' FROM auth.users WHERE id = auth.uid())
-- Tabla de usuarios: users
-- Tablas procesadas: 5
-- Tipo de API Key: Nueva Secret Key

-- Crear función auxiliar si no existe
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM users
    WHERE clerk_user_id = (SELECT raw_user_meta_data->>'sub' FROM auth.users WHERE id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Políticas para tabla: products
-- Columnas: 6, Registros: 2
-- =====================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política: Genérica (Política genérica)
-- NOTA: Esta tabla requiere revisión manual de políticas RLS
-- Estructura detectada: id, name, price, description, created_at, updated_at

-- Política temporal - REVISAR Y AJUSTAR
CREATE POLICY "products_temp_access" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.clerk_user_id = (SELECT raw_user_meta_data->>'sub' FROM auth.users WHERE id = auth.uid())
        -- TODO: Definir lógica de acceso específica
    )
  );


-- =====================================================
-- Políticas para tabla: companies
-- Columnas: 5, Registros: 2
-- =====================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Política: Genérica (Política genérica)
-- NOTA: Esta tabla requiere revisión manual de políticas RLS
-- Estructura detectada: id, name, rut, created_at, updated_at

-- Política temporal - REVISAR Y AJUSTAR
CREATE POLICY "companies_temp_access" ON companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.clerk_user_id = (SELECT raw_user_meta_data->>'sub' FROM auth.users WHERE id = auth.uid())
        -- TODO: Definir lógica de acceso específica
    )
  );


-- =====================================================
-- Políticas para tabla: corredores
-- Columnas: 11, Registros: 4080
-- =====================================================

ALTER TABLE corredores ENABLE ROW LEVEL SECURITY;

-- Política: Genérica (Política genérica)
-- NOTA: Esta tabla requiere revisión manual de políticas RLS
-- Estructura detectada: id, rut, nombre, telefono, domicilio, ciudad, region, tipo_persona, activo, fecha_creacion, fecha_actualizacion

-- Política temporal - REVISAR Y AJUSTAR
CREATE POLICY "corredores_temp_access" ON corredores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.clerk_user_id = (SELECT raw_user_meta_data->>'sub' FROM auth.users WHERE id = auth.uid())
        -- TODO: Definir lógica de acceso específica
    )
  );


-- =====================================================
-- Políticas para tabla: productos
-- Columnas: 11, Registros: 10
-- =====================================================

ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Política: Genérica (Política genérica)
-- NOTA: Esta tabla requiere revisión manual de políticas RLS
-- Estructura detectada: id, codigo, nombre, descripcion, precio_neto, precio_bruto, activo, fecha_creacion, iva, tipo_producto, duracion_dias

-- Política temporal - REVISAR Y AJUSTAR
CREATE POLICY "productos_temp_access" ON productos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.clerk_user_id = (SELECT raw_user_meta_data->>'sub' FROM auth.users WHERE id = auth.uid())
        -- TODO: Definir lógica de acceso específica
    )
  );


-- =====================================================
-- Políticas para tabla: pagos
-- Columnas: 29, Registros: 13
-- =====================================================

ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

-- Política: Acceso por usuario (Acceso por user_id)
CREATE POLICY "pagos_user_access" ON pagos
  FOR ALL USING (
    user_id = get_current_user_id()
  );


