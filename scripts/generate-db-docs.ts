import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config({ path: '.env.local' })

const DOCS_DIR = path.resolve(__dirname, '../docs/db')
const SCHEMA_DIR = path.join(DOCS_DIR, 'schema')
const SEEDS_DIR = path.join(DOCS_DIR, 'seeds')
const RLS_DIR = path.join(DOCS_DIR, 'rls')
const STORAGE_DIR = path.join(DOCS_DIR, 'storage')
const ENV_DIR = path.join(DOCS_DIR, 'env')

// Cliente Supabase para consultas
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function ensureDirs() {
  ;[DOCS_DIR, SCHEMA_DIR, SEEDS_DIR, RLS_DIR, STORAGE_DIR, ENV_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  })
}

async function generateSchemaDump() {
  try {
    // Obtener información de todas las tablas
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .neq('table_name', 'schema_migrations')

    if (!tables) return

    for (const table of tables) {
      const tableName = table.table_name
      
      // Obtener estructura de columnas
      const { data: columns } = await supabase
        .from('information_schema.columns')
        .select('*')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .order('ordinal_position')

      // Obtener información de RLS
      const { data: rlsInfo } = await supabase
        .rpc('get_table_rls_status', { table_name: tableName })
        .single()

      // Generar archivo de documentación por tabla
      const tableDoc = generateTableDocumentation(tableName, columns, rlsInfo)
      fs.writeFileSync(path.join(SCHEMA_DIR, `${tableName}.md`), tableDoc)
    }

    // Generar schema SQL completo
    const fullSchema = execSync('supabase db dump --schema-only', { encoding: 'utf-8' })
    fs.writeFileSync(path.join(SCHEMA_DIR, 'full-schema.sql'), fullSchema)
    
  } catch (error) {
    console.error('Error generando schema:', error)
    // Fallback a dump directo
    const output = execSync('supabase db dump --schema-only', { encoding: 'utf-8' })
    fs.writeFileSync(path.join(SCHEMA_DIR, 'schema.sql'), output)
  }
}

function generateTableDocumentation(tableName: string, columns: any[], rlsInfo: any) {
  return `# Tabla: ${tableName}

## Estructura de Columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
${columns?.map(col => 
  `| ${col.column_name} | ${col.data_type} | ${col.is_nullable} | ${col.column_default || 'N/A'} | - |`
).join('\n') || ''}

## RLS (Row Level Security)

- **Estado**: ${rlsInfo?.rls_enabled ? 'Habilitado' : 'Deshabilitado'}
- **Políticas activas**: ${rlsInfo?.policy_count || 0}

## Índices

\`\`\`sql
-- Consultar índices específicos:
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = '${tableName}';
\`\`\`

## Relaciones

\`\`\`sql
-- Consultar foreign keys:
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = '${tableName}';
\`\`\`
`
}

async function generateRLSDump() {
  try {
    // Obtener todas las políticas RLS
    const { data: policies } = await supabase
      .from('pg_policies')
      .select('*')

    if (!policies) return

    // Agrupar por tabla
    const policiesByTable = policies.reduce((acc, policy) => {
      if (!acc[policy.tablename]) acc[policy.tablename] = []
      acc[policy.tablename].push(policy)
      return acc
    }, {} as Record<string, any[]>)

    // Generar archivo por tabla
    Object.entries(policiesByTable).forEach(([tableName, tablePolicies]) => {
      const rlsDoc = generateRLSDocumentation(tableName, tablePolicies as any[])
      fs.writeFileSync(path.join(RLS_DIR, `${tableName}.sql`), rlsDoc)
    })

  } catch (error) {
    console.error('Error generando RLS:', error)
    // Fallback
    const rlsInfo = execSync('supabase gen policy --all', { encoding: 'utf-8' })
    fs.writeFileSync(path.join(RLS_DIR, 'rls.sql'), rlsInfo)
  }
}

function generateRLSDocumentation(tableName: string, policies: any[]) {
  return `-- Políticas RLS para tabla: ${tableName}
-- Generado automáticamente

${policies.map(policy => `
-- Política: ${policy.policyname}
-- Comando: ${policy.cmd}
-- Roles: ${policy.roles?.join(', ') || 'public'}
-- Expresión: ${policy.qual || 'true'}
-- Check: ${policy.with_check || 'N/A'}

CREATE POLICY "${policy.policyname}"
    ON ${tableName}
    FOR ${policy.cmd}
    TO ${policy.roles?.join(', ') || 'public'}
    USING (${policy.qual || 'true'})${policy.with_check ? `\n    WITH CHECK (${policy.with_check})` : ''};

-- Ejemplo de consulta permitida:
-- SELECT * FROM ${tableName} WHERE [condición que cumple: ${policy.qual}]

-- Ejemplo de consulta denegada:
-- SELECT * FROM ${tableName} WHERE [condición que NO cumple: ${policy.qual}]
`).join('\n')}
`
}

async function generateStorageDocs() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets()
    
    const storageDoc = `# Storage Buckets

## Buckets Configurados

${buckets?.map(bucket => `
### ${bucket.name}

- **ID**: ${bucket.id}
- **Público**: ${bucket.public ? 'Sí' : 'No'}
- **Tamaño máximo**: ${bucket.file_size_limit || 'Sin límite'}
- **Tipos permitidos**: ${bucket.allowed_mime_types?.join(', ') || 'Todos'}

#### Ejemplo de uso:

\`\`\`javascript
// Subir archivo
const { data, error } = await supabase.storage
  .from('${bucket.name}')
  .upload('path/filename.ext', file)

// Obtener URL pública
const { data: publicURL } = supabase.storage
  .from('${bucket.name}')
  .getPublicUrl('path/filename.ext')
\`\`\`

#### Políticas RLS:

\`\`\`sql
-- Consultar políticas del bucket:
SELECT * FROM storage.policies WHERE bucket_id = '${bucket.name}';
\`\`\`
`).join('\n') || 'No hay buckets configurados.'}
`
    
    fs.writeFileSync(path.join(STORAGE_DIR, 'buckets.md'), storageDoc)
  } catch (error) {
    console.error('Error generando storage docs:', error)
  }
}

function generateSeeds() {
  const seedsContent = `-- Seeds para desarrollo y testing
-- DATOS FICTICIOS - NO USAR EN PRODUCCIÓN

-- Ejemplo de seeds por tabla
-- Descomenta y modifica según tus tablas:

/*
-- Usuarios de ejemplo
INSERT INTO users (id, email, name, created_at) VALUES
  ('user-1', 'admin@example.com', 'Admin User', NOW()),
  ('user-2', 'user@example.com', 'Regular User', NOW());

-- Productos de ejemplo  
INSERT INTO products (id, name, price, description) VALUES
  ('prod-1', 'Producto Demo', 99.99, 'Producto de demostración'),
  ('prod-2', 'Otro Producto', 149.99, 'Otro producto de ejemplo');
*/

-- Para aplicar seeds:
-- psql -h [host] -U [user] -d [database] -f seeds.sql
-- O usando Supabase CLI:
-- supabase db reset --with-seed
`

  fs.writeFileSync(path.join(SEEDS_DIR, 'seeds.sql'), seedsContent)
}

function generateEnvExample() {
  const content = `# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Next.js Public Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Clerk Authentication (si aplica)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key
CLERK_SECRET_KEY=your-clerk-secret
`
  fs.writeFileSync(path.join(ENV_DIR, '.env.local.example'), content)
}

function generateVersionCheckScript() {
  const versionCheck = `# Version Check

## Comparar esquema local con Supabase remoto

### Comandos disponibles:

\`\`\`bash
# Detectar diferencias
supabase db diff

# Ver estado actual
supabase status

# Aplicar cambios locales a remoto
supabase db push

# Traer cambios remotos a local
supabase db pull
\`\`\`

### Checklist de sincronización:

- [ ] Ejecutar \`supabase db diff\` sin errores
- [ ] Verificar que no hay migraciones pendientes
- [ ] Confirmar que las políticas RLS están sincronizadas
- [ ] Validar que los buckets de storage existen
- [ ] Probar conexión con variables de entorno

### Script de verificación automática:

\`\`\`bash
#!/bin/bash
# scripts/check-db-schema.sh

echo "🔍 Verificando sincronización de base de datos..."

# Verificar diferencias
if supabase db diff --quiet; then
  echo "✅ Base de datos sincronizada"
else
  echo "⚠️  Hay diferencias en el esquema"
  echo "Ejecuta: supabase db diff para ver detalles"
fi

# Verificar estado
supabase status
\`\`\`
`
  fs.writeFileSync(path.join(DOCS_DIR, 'version-check.md'), versionCheck)
}

function generateReadme() {
  const content = `# Supabase DB Documentation

Documentación automática de la base de datos del proyecto.

## 📁 Estructura

- **\`schema/\`**: Documentación de tablas y estructura
- **\`seeds/\`**: Datos de ejemplo para desarrollo
- **\`rls/\`**: Políticas de Row Level Security
- **\`storage/\`**: Configuración de buckets
- **\`env/\`**: Variables de entorno necesarias
- **\`version-check.md\`**: Verificación de sincronización

## 🔄 Regenerar documentación

\`\`\`bash
# Ejecutar el generador
npm run generate-db-docs

# O directamente:
ts-node scripts/generate-db-docs.ts
\`\`\`

## 🌱 Aplicar seeds

\`\`\`bash
# Usando Supabase CLI
supabase db reset --with-seed

# O manualmente
psql -h [host] -U [user] -d [database] -f docs/db/seeds/seeds.sql
\`\`\`

## 🔧 Aplicar esquema

\`\`\`bash
# Aplicar cambios locales
supabase db push

# Generar tipos TypeScript
supabase gen types typescript --local > types/supabase.ts
\`\`\`

## 🔐 Configurar políticas RLS

\`\`\`bash
# Aplicar políticas desde archivos
for file in docs/db/rls/*.sql; do
  supabase db exec --file "$file"
done
\`\`\`

## 📊 Verificar sincronización

\`\`\`bash
# Verificar diferencias
supabase db diff

# Ejecutar script de verificación
bash scripts/check-db-schema.sh
\`\`\`

## 🗂️ Configurar Storage

1. Revisar configuración en \`storage/buckets.md\`
2. Crear buckets desde el dashboard de Supabase
3. Aplicar políticas RLS correspondientes

## ⚙️ Variables de entorno

1. Copiar \`docs/db/env/.env.local.example\` a \`.env.local\`
2. Completar con tus credenciales de Supabase
3. Verificar conexión con \`npm run test-connection\`

---

*Documentación generada automáticamente el ${new Date().toISOString()}*
`
  fs.writeFileSync(path.join(DOCS_DIR, 'README.md'), content)
}

// Función principal
async function main() {
  console.log('🚀 Generando documentación de base de datos...')
  
  ensureDirs()
  
  await generateSchemaDump()
  console.log('✅ Schema generado')
  
  await generateRLSDump()
  console.log('✅ Políticas RLS generadas')
  
  await generateStorageDocs()
  console.log('✅ Documentación de Storage generada')
  
  generateSeeds()
  console.log('✅ Seeds generados')
  
  generateEnvExample()
  console.log('✅ Variables de entorno generadas')
  
  generateVersionCheckScript()
  console.log('✅ Script de verificación generado')
  
  generateReadme()
  console.log('✅ README generado')
  
  console.log('\n🎉 Documentación completa generada en /docs/db/')
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error)
}

export { main as generateDbDocs }