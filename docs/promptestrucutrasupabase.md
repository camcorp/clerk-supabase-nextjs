Este prompt está optimizado para que la IA genere:
	•	Esquemas de base de datos (schema)
	•	Seeds (datos de ejemplo)
	•	Políticas RLS activas
	•	Archivos de storage
	•	Variables de entorno necesarias
	•	Comparación de versiones/homologación estructural

⸻

📌 PROMPT: Generador de documentación de base de datos para Supabase + Next.js

Quiero generar una carpeta `/docs/db` dentro de mi proyecto Next.js con Supabase que contenga la documentación completa de la base de datos, incluyendo:

1. 🔧 **Schema completo**
   - Generar archivos `.sql` o `.md` por tabla con:
     - Nombre de la tabla
     - Estructura de columnas (tipo, restricciones, default)
     - Índices asociados
     - Relaciones (FK)
     - Comentarios si existen
     - RLS habilitado o no

2. 🌱 **Seeds**
   - Incluir archivo `seeds.sql` o `seeds.json` con al menos un ejemplo por tabla, respetando el tipo de dato.
   - Aclarar si el dato es ficticio.
   - Comentar el uso de los seeds para testing o desarrollo.

3. 🔐 **Políticas RLS**
   - Documentar las políticas por tabla en archivos separados (`rls/table_name.sql`).
   - Indicar el tipo de política (SELECT, INSERT, etc.)
   - Incluir el `expr` de cada política.
   - Registrar si la política está activa o no.
   - Ejemplo de una consulta permitida y una denegada según esa política.

4. 🗂️ **Storage Buckets**
   - Listar los buckets definidos con:
     - Nombre
     - Reglas de acceso
     - Ejemplo de archivo válido
     - Política RLS si existe

5. ⚙️ **Variables de entorno necesarias**
   - Documentar todas las claves necesarias para la conexión:
     ```
     SUPABASE_URL=
     SUPABASE_ANON_KEY=
     SUPABASE_SERVICE_ROLE_KEY=
     ```
   - Añadirlas al archivo `.env.local.example`.

6. 🧪 **Homologación de versiones**
   - Generar un archivo `docs/db/version-check.md` que incluya:
     - Un script o instrucción que compare la estructura actual con la de Supabase (`pg_dump`, `supabase db diff`, etc.)
     - Checklist para verificar si el esquema local está sincronizado con producción.
     - Instrucciones para correr el comando de comparación (`supabase db diff` o integración con scripts en `scripts/check-db-schema.sh`).

7. 📚 **Organización final del contenido generado:**

/docs/db/
├── schema/
│   ├── users.sql
│   ├── products.sql
│   └── …
├── seeds/
│   └── seeds.sql
├── rls/
│   ├── users.sql
│   └── orders.sql
├── storage/
│   └── buckets.md
├── env/
│   └── .env.local.example
├── version-check.md
└── README.md

8. 📘 **README.md** general debe explicar:
   - Cómo regenerar estos archivos
   - Cómo aplicar seeds y estructuras (`supabase db push`)
   - Cómo hacer la verificación de versión
   - Cómo agregar nuevas políticas o buckets

Usar únicamente la información de conexión almacenada en las variables de entorno `.env.local`. No incluir claves sensibles en los archivos generados.

💡 Incluir comandos CLI automatizables donde sea posible (por ejemplo, para regenerar schema: `supabase gen types typescript --local > types.ts` o para comparar: `supabase db diff`).


utiliza este script

// scripts/generate-db-docs.ts
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const DOCS_DIR = path.resolve(__dirname, '../docs/db')
const SCHEMA_DIR = path.join(DOCS_DIR, 'schema')
const SEEDS_DIR = path.join(DOCS_DIR, 'seeds')
const RLS_DIR = path.join(DOCS_DIR, 'rls')
const STORAGE_DIR = path.join(DOCS_DIR, 'storage')
const ENV_DIR = path.join(DOCS_DIR, 'env')

function ensureDirs() {
  ;[DOCS_DIR, SCHEMA_DIR, SEEDS_DIR, RLS_DIR, STORAGE_DIR, ENV_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  })
}

function generateSchemaDump() {
  const output = execSync('supabase db dump --schema-only', { encoding: 'utf-8' })
  fs.writeFileSync(path.join(SCHEMA_DIR, 'schema.sql'), output)
}

function generateRLSDump() {
  const rlsInfo = execSync('supabase gen policy --all', { encoding: 'utf-8' })
  fs.writeFileSync(path.join(RLS_DIR, 'rls.sql'), rlsInfo)
}

function generateEnvExample() {
  const content = `SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
`
  fs.writeFileSync(path.join(ENV_DIR, '.env.local.example'), content)
}

function generateVersionCheckScript() {
  const versionCheck = `# Version Check

## Compare local schema with remote Supabase

Run the following command to detect differences:

\`\`\`
supabase db diff
\`\`\`

If differences exist, review and optionally run:

\`\`\`
supabase db push
\`\`\`
`
  fs.writeFileSync(path.join(DOCS_DIR, 'version-check.md'), versionCheck)
}

function generateReadme() {
  const content = `# Supabase DB Documentation

## Estructura

- 