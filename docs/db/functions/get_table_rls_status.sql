-- Función para obtener estado de RLS de una tabla
CREATE OR REPLACE FUNCTION get_table_rls_status(table_name text)
RETURNS TABLE(
  rls_enabled boolean,
  policy_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.relrowsecurity as rls_enabled,
    COUNT(p.policyname) as policy_count
  FROM pg_class c
  LEFT JOIN pg_policies p ON p.tablename = c.relname
  WHERE c.relname = table_name
    AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  GROUP BY c.relrowsecurity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;