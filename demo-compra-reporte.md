// ... existing code ...
### 4. Creación de Acceso
```sql
INSERT INTO accesos_usuarios (  -- ✅ Corregido: era 'accesos'
  user_id,
  producto_id,
  modulo,
  fecha_inicio,
  fecha_fin,
  activo
) VALUES (
  'user_id_ejemplo',
  'producto_id_rp_001',
  'reporte_corredor_762686856',
  NOW(),
  NOW() + INTERVAL '1 month',
  true
);