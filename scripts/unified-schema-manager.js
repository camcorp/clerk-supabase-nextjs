#!/usr/bin/env node

/**
 * Script unificado para gestión de esquemas - VERSIÓN MEJORADA
 * Combina extracción dinámica, verificación y comparación
 * Compatible con nuevas API keys de Supabase
 * Detección automática de relaciones y políticas RLS inteligentes
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración mejorada para nuevas API keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 
  process.env.SUPABASE_SECRET_KEY ||                    // Nueva secret key (preferida)
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||   // Nueva publishable key
  process.env.SUPABASE_SERVICE_ROLE_KEY ||              // Legacy service_role
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;            // Legacy anon key

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  console.log('🔑 Nuevas keys: SUPABASE_SECRET_KEY, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  console.log('🔑 Legacy keys: SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('📖 Ver: https://github.com/orgs/supabase/discussions/29260');
  process.exit(1);
}

// Detectar tipo de key para logging
const keyType = supabaseKey.startsWith('sb_secret_') ? 'Nueva Secret Key' :
               supabaseKey.startsWith('sb_publishable_') ? 'Nueva Publishable Key' :
               supabaseKey.includes('service_role') ? 'Legacy Service Role' :
               'Legacy Anon Key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Colores y logging
const colors = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`),
  subtitle: (msg) => console.log(`${colors.magenta}${msg}${colors.reset}`)
};

// Mapeo de tipos PostgreSQL a Zod
const pgToZodTypeMap = {
  'uuid': 'z.string().uuid()',
  'text': 'z.string()',
  'varchar': 'z.string()',
  'character varying': 'z.string()',
  'integer': 'z.number().int()',
  'bigint': 'z.number().int()',
  'smallint': 'z.number().int()',
  'boolean': 'z.boolean()',
  'timestamp with time zone': 'z.string().datetime()',
  'timestamptz': 'z.string().datetime()',
  'timestamp without time zone': 'z.string().datetime()',
  'timestamp': 'z.string().datetime()',
  'date': 'z.string().date()',
  'time': 'z.string().time()',
  'jsonb': 'z.record(z.any())',
  'json': 'z.record(z.any())',
  'numeric': 'z.number()',
  'decimal': 'z.number()',
  'real': 'z.number()',
  'double precision': 'z.number()',
  'money': 'z.number()'
};

class UnifiedSchemaManager {
  constructor() {
    this.schema = {
      tables: new Map(),
      frontendSchemas: new Map(),
      mismatches: [],
      authInfo: null,
      relationships: new Map(),
      permissions: {
        canCreateRPC: false,
        canAccessInformationSchema: false,
        keyType: keyType
      }
    };
    this.config = {
      outputDir: path.join(process.cwd(), 'generated'),
      docsDir: path.join(process.cwd(), 'docs/supabase'),
      schemasDir: path.join(process.cwd(), 'src/schemas/generated')
    };
  }

  async run(options = {}) {
    const {
      extract = true,
      verify = true,
      compare = true,
      generate = false,
      fix = false
    } = options;

    log.title('🚀 GESTOR UNIFICADO DE ESQUEMAS - VERSIÓN MEJORADA');
    log.info(`🔑 Usando: ${keyType}`);
    
    try {
      // Validar permisos primero
      await this.validatePermissions();
      
      if (extract) await this.extractSchema();
      if (verify) await this.verifyTables();
      if (compare) await this.compareSchemas();
      
      // Detectar relaciones automáticamente
      await this.detectTableRelationships();
      
      if (generate) await this.generateSchemas();
      if (fix) await this.fixRLSPolicies();
      
      await this.generateReport();
      
    } catch (error) {
      log.error(`Error: ${error.message}`);
      throw error;
    }
  }

  async validatePermissions() {
    log.subtitle('🔐 Validando permisos...');
    
    try {
      // Verificar si podemos crear funciones RPC
      const { error: rpcError } = await supabase.rpc('exec_sql', {
        query: 'SELECT 1 as test'
      });
      
      this.schema.permissions.canCreateRPC = !rpcError;
      
      if (!rpcError) {
        log.success('✓ Función RPC exec_sql disponible');
      } else {
        log.warning('⚠ Función RPC exec_sql no disponible');
      }
    } catch (err) {
      log.warning('⚠ No se pudo verificar función RPC');
    }
    
    try {
      // Verificar acceso a information_schema
      const { error: schemaError } = await supabase.rpc('exec_sql', {
        query: 'SELECT table_name FROM information_schema.tables LIMIT 1'
      });
      
      this.schema.permissions.canAccessInformationSchema = !schemaError;
      
      if (!schemaError) {
        log.success('✓ Acceso a information_schema disponible');
      } else {
        log.warning('⚠ Acceso limitado a information_schema');
      }
    } catch (err) {
      log.warning('⚠ No se pudo verificar information_schema');
    }
  }

  async extractSchema() {
    log.subtitle('🔍 Extrayendo esquema dinámicamente...');
    
    // Descubrir tablas automáticamente
    const tableNames = await this.discoverTables();
    
    // Extraer estructura de cada tabla
    for (const tableName of tableNames) {
      await this.extractTableStructure(tableName);
    }
    
    // Verificar esquema de autenticación
    await this.checkAuthSchema();
    
    log.success(`Esquema extraído: ${this.schema.tables.size} tablas`);
  }

  async discoverTables() {
    const discoveredTables = new Set();
    
    // Método 1: Usar information_schema si está disponible
    if (this.schema.permissions.canAccessInformationSchema) {
      try {
        const { data: schemaData } = await supabase.rpc('exec_sql', {
          query: `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
          `
        });
        
        if (schemaData?.result) {
          schemaData.result.forEach(row => {
            if (row.table_name) {
              discoveredTables.add(row.table_name);
              log.success(`📋 Tabla encontrada (schema): ${row.table_name}`);
            }
          });
        }
      } catch (err) {
        log.warning('No se pudo acceder a information_schema');
      }
    }
    
    // Método 2: Fallback con lista común + detección inteligente
    if (discoveredTables.size === 0) {
      log.info('🔍 Usando método de detección por prueba...');
      
      const commonNames = [
        // Tablas comunes de autenticación
        'profiles', 'users', 'usuarios',
        // Tablas comunes de aplicación
        'posts', 'articles', 'products', 'items',
        'categories', 'tags', 'comments', 'reviews',
        'orders', 'payments', 'transactions',
        'settings', 'configurations', 'preferences',
        'notifications', 'messages', 'emails',
        'files', 'uploads', 'media', 'images',
        'logs', 'audit_logs', 'activity_logs',
        'sessions', 'tokens', 'permissions', 'roles',
        // Tablas específicas del proyecto
        'empresas', 'companies', 'organizations',
        'normas', 'standards', 'regulations',
        'procedimientos', 'procedures', 'processes',
        'matrices', 'matrix', 'frameworks',
        'matriz_items', 'matrix_items',
        'hallazgos', 'findings', 'discoveries',
        'comentarios', 'archivos', 'reportes', 'reports',
        'corredores', 'brokers', 'agents',
        'productos', 'servicios', 'services',
        'pagos', 'carrito', 'cart', 'shopping_cart'
      ];
      
      for (const tableName of commonNames) {
        try {
          const { error } = await supabase
            .from(tableName)
            .select('*', { head: true })
            .limit(1);
          
          if (!error) {
            discoveredTables.add(tableName);
            log.success(`📋 Tabla encontrada (prueba): ${tableName}`);
          }
        } catch (err) {
          // Continuar con la siguiente tabla
        }
      }
    }
    
    return Array.from(discoveredTables);
  }

  async extractTableStructure(tableName) {
    try {
      // Intentar obtener estructura desde datos existentes
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(5); // Obtener más registros para mejor inferencia

      let columns = [];
      let recordCount = count || 0;
      let sampleData = [];

      if (!error && data && data.length > 0) {
        // Extraer columnas del primer registro
        const firstRecord = data[0];
        columns = Object.keys(firstRecord).map(colName => {
          // Analizar múltiples registros para mejor inferencia de tipos
          const values = data.map(record => record[colName]).filter(v => v !== null);
          const inferredType = this.inferTypeFromValues(values);
          
          return {
            name: colName,
            type: inferredType,
            nullable: data.some(record => record[colName] === null),
            zodType: this.mapToZodType(inferredType, data.some(record => record[colName] === null)),
            isId: colName === 'id' || colName.endsWith('_id'),
            isForeignKey: colName.endsWith('_id') && colName !== 'id',
            isTimestamp: colName.includes('created') || colName.includes('updated') || colName.includes('timestamp')
          };
        });
        
        sampleData = data;
      } else {
        // Tabla vacía, intentar obtener estructura del frontend
        const frontendSchema = await this.findFrontendSchemaForTable(tableName);
        if (frontendSchema) {
          columns = frontendSchema.columns.map(col => ({
            name: col.name,
            type: col.type,
            nullable: true,
            zodType: this.mapToZodType(col.type, true),
            fromFrontend: true,
            isId: col.name === 'id' || col.name.endsWith('_id'),
            isForeignKey: col.name.endsWith('_id') && col.name !== 'id'
          }));
        }
      }

      this.schema.tables.set(tableName, {
        name: tableName,
        columns,
        recordCount,
        accessible: !error,
        error: error?.message,
        sampleData,
        relationships: {
          foreignKeys: columns.filter(col => col.isForeignKey),
          referencedBy: [] // Se llenará en detectTableRelationships
        }
      });

      if (columns.length > 0) {
        const fkCount = columns.filter(col => col.isForeignKey).length;
        log.info(`  └─ ${tableName}: ${columns.length} columnas, ${recordCount} registros, ${fkCount} FK`);
      }
    } catch (err) {
      log.warning(`Error extrayendo ${tableName}: ${err.message}`);
    }
  }

  inferTypeFromValues(values) {
    if (values.length === 0) return 'text';
    
    // Analizar el primer valor no nulo
    const firstValue = values[0];
    
    if (typeof firstValue === 'boolean') return 'boolean';
    if (typeof firstValue === 'number') {
      return Number.isInteger(firstValue) ? 'integer' : 'numeric';
    }
    if (typeof firstValue === 'string') {
      // Detectar UUIDs
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(firstValue)) {
        return 'uuid';
      }
      // Detectar timestamps
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(firstValue)) {
        return 'timestamp with time zone';
      }
      // Detectar fechas
      if (/^\d{4}-\d{2}-\d{2}$/.test(firstValue)) {
        return 'date';
      }
      return 'text';
    }
    if (typeof firstValue === 'object') return 'jsonb';
    return 'text';
  }

  async detectTableRelationships() {
    log.subtitle('🔗 Detectando relaciones entre tablas...');
    
    const relationships = new Map();
    
    for (const [tableName, table] of this.schema.tables) {
      if (!table.accessible) continue;
      
      const tableRelations = {
        foreignKeys: [],
        referencedBy: [],
        manyToMany: []
      };
      
      // Detectar foreign keys
      for (const column of table.columns) {
        if (column.isForeignKey) {
          const referencedTable = this.guessReferencedTable(column.name, tableName);
          if (referencedTable && this.schema.tables.has(referencedTable)) {
            tableRelations.foreignKeys.push({
              column: column.name,
              referencedTable,
              referencedColumn: 'id' // Asumir que referencia a 'id'
            });
            
            log.info(`  🔗 ${tableName}.${column.name} → ${referencedTable}.id`);
          }
        }
      }
      
      relationships.set(tableName, tableRelations);
    }
    
    // Detectar relaciones inversas
    for (const [tableName, relations] of relationships) {
      for (const fk of relations.foreignKeys) {
        const referencedTableRelations = relationships.get(fk.referencedTable);
        if (referencedTableRelations) {
          referencedTableRelations.referencedBy.push({
            table: tableName,
            column: fk.column,
            foreignColumn: fk.referencedColumn
          });
        }
      }
    }
    
    this.schema.relationships = relationships;
    log.success(`Relaciones detectadas: ${Array.from(relationships.values()).reduce((sum, rel) => sum + rel.foreignKeys.length, 0)} FK`);
  }

  guessReferencedTable(columnName, currentTable) {
    // Remover sufijo _id
    let baseName = columnName.replace(/_id$/, '');
    
    // Mapeos comunes
    const mappings = {
      'user': 'users',
      'usuario': 'usuarios',
      'empresa': 'empresas',
      'company': 'companies',
      'category': 'categories',
      'post': 'posts',
      'product': 'products',
      'order': 'orders',
      'payment': 'payments',
      'norma': 'normas',
      'procedimiento': 'procedimientos',
      'matriz': 'matrices',
      'hallazgo': 'hallazgos',
      'comentario': 'comentarios',
      'archivo': 'archivos',
      'reporte': 'reportes'
    };
    
    // Intentar mapeo directo
    if (mappings[baseName]) {
      return mappings[baseName];
    }
    
    // Intentar pluralización simple
    const pluralForms = [
      baseName + 's',
      baseName + 'es',
      baseName
    ];
    
    for (const form of pluralForms) {
      if (this.schema.tables.has(form) && form !== currentTable) {
        return form;
      }
    }
    
    return null;
  }

  mapToZodType(pgType, nullable = false) {
    let zodType = pgToZodTypeMap[pgType] || 'z.string()';
    return nullable ? `${zodType}.nullable()` : zodType;
  }

  async checkAuthSchema() {
    log.info('Verificando esquema de autenticación...');
    
    try {
      const authInfo = {
        hasAuthUid: false,
        hasAuthJwt: false,
        hasRawUserMetadata: true,
        hasUserMetadata: false,
        recommendedClerkExpression: "(SELECT raw_user_meta_data->>'sub' FROM auth.users WHERE id = auth.uid())",
        detectedUserTable: null
      };
      
      // Detectar tabla de usuarios
      const userTables = ['users', 'usuarios', 'profiles'];
      for (const tableName of userTables) {
        if (this.schema.tables.has(tableName)) {
          authInfo.detectedUserTable = tableName;
          break;
        }
      }
      
      this.schema.authInfo = authInfo;
      log.success(`Información de autenticación configurada (tabla usuarios: ${authInfo.detectedUserTable || 'no detectada'})`);
    } catch (err) {
      log.warning(`Error verificando auth: ${err.message}`);
    }
  }

  async verifyTables() {
    log.subtitle('✅ Verificando accesibilidad de tablas...');
    
    let accessibleCount = 0;
    let totalCount = 0;
    
    for (const [tableName, table] of this.schema.tables) {
      totalCount++;
      if (table.accessible) {
        accessibleCount++;
        const fkCount = table.relationships.foreignKeys.length;
        log.success(`${tableName}: Accesible (${table.recordCount} registros, ${fkCount} FK)`);
      } else {
        log.error(`${tableName}: ${table.error}`);
      }
    }
    
    log.info(`Tablas accesibles: ${accessibleCount}/${totalCount}`);
  }

  async compareSchemas() {
    log.subtitle('🔄 Comparando con esquemas del frontend...');
    
    await this.loadFrontendSchemas();
    
    for (const [tableName, backendTable] of this.schema.tables) {
      const frontendSchema = this.schema.frontendSchemas.get(tableName) ||
                           this.schema.frontendSchemas.get(tableName.replace('_', '-')) ||
                           this.schema.frontendSchemas.get(tableName.replace('-', '_'));
      
      if (frontendSchema) {
        const comparison = this.compareTableSchemas(tableName, backendTable, frontendSchema);
        if (comparison.mismatches.length > 0) {
          this.schema.mismatches.push(comparison);
        }
      }
    }
    
    log.info(`Inconsistencias encontradas: ${this.schema.mismatches.length}`);
  }

  async loadFrontendSchemas() {
    const schemaPaths = ['src/schemas', 'src/types', 'types', 'schemas'];
    
    for (const schemaPath of schemaPaths) {
      const fullPath = path.join(process.cwd(), schemaPath);
      if (fs.existsSync(fullPath)) {
        await this.loadSchemasFromDirectory(fullPath);
      }
    }
  }

  async loadSchemasFromDirectory(dirPath) {
    const files = fs.readdirSync(dirPath)
      .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
      .filter(file => !file.includes('.test.') && !file.includes('.spec.'));

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const tableName = path.basename(file, path.extname(file));
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const schema = this.parseSchemaFile(content, tableName);
        
        if (schema.columns.length > 0) {
          this.schema.frontendSchemas.set(tableName, schema);
        }
      } catch (err) {
        // Continuar con el siguiente archivo
      }
    }
  }

  parseSchemaFile(content, tableName) {
    const columns = [];
    
    const zodFieldRegex = /(\w+):\s*z\.(\w+)\(/g;
    let match;
    
    while ((match = zodFieldRegex.exec(content)) !== null) {
      columns.push({
        name: match[1],
        type: match[2],
        source: 'zod'
      });
    }
    
    return { tableName, columns, filePath: tableName };
  }

  compareTableSchemas(tableName, backendTable, frontendSchema) {
    const mismatches = [];
    const backendColumns = new Set(backendTable.columns.map(col => col.name));
    const frontendColumns = new Set(frontendSchema.columns.map(col => col.name));
    
    for (const frontendCol of frontendColumns) {
      if (!backendColumns.has(frontendCol)) {
        mismatches.push({
          type: 'missing_in_backend',
          column: frontendCol,
          table: tableName
        });
      }
    }
    
    for (const backendCol of backendColumns) {
      if (!frontendColumns.has(backendCol)) {
        mismatches.push({
          type: 'missing_in_frontend',
          column: backendCol,
          table: tableName
        });
      }
    }
    
    return { tableName, mismatches };
  }

  async findFrontendSchemaForTable(tableName) {
    if (!this.schema.frontendSchemas.size) {
      await this.loadFrontendSchemas();
    }
    
    return this.schema.frontendSchemas.get(tableName) ||
           this.schema.frontendSchemas.get(tableName.replace('_', '-')) ||
           this.schema.frontendSchemas.get(tableName.replace('-', '_'));
  }

  async generateSchemas() {
    log.subtitle('📝 Generando esquemas Zod...');
    
    if (!fs.existsSync(this.config.schemasDir)) {
      fs.mkdirSync(this.config.schemasDir, { recursive: true });
    }
    
    for (const [tableName, table] of this.schema.tables) {
      if (table.columns.length > 0 && table.accessible) {
        await this.generateZodSchema(tableName, table);
      }
    }
    
    log.success(`Esquemas Zod generados en: ${this.config.schemasDir}`);
  }

  async generateZodSchema(tableName, table) {
    const schemaName = this.toPascalCase(tableName);
    
    let zodSchema = `import { z } from 'zod';\n\n`;
    zodSchema += `// Esquema generado automáticamente para la tabla: ${tableName}\n`;
    zodSchema += `// Generado el: ${new Date().toISOString()}\n`;
    zodSchema += `// Registros en BD: ${table.recordCount}\n`;
    zodSchema += `// Relaciones FK: ${table.relationships.foreignKeys.length}\n\n`;
    
    zodSchema += `export const ${schemaName}Schema = z.object({\n`;
    
    table.columns.forEach(col => {
      let comment = '';
      if (col.isForeignKey) comment += ' // FK';
      if (col.isTimestamp) comment += ' // Timestamp';
      zodSchema += `  ${col.name}: ${col.zodType},${comment}\n`;
    });
    
    zodSchema += `});\n\n`;
    zodSchema += `export type ${schemaName} = z.infer<typeof ${schemaName}Schema>;\n`;
    
    // Agregar información de relaciones
    if (table.relationships.foreignKeys.length > 0) {
      zodSchema += `\n// Relaciones detectadas:\n`;
      table.relationships.foreignKeys.forEach(fk => {
        zodSchema += `// ${fk.column} → ${fk.referencedTable}.${fk.referencedColumn}\n`;
      });
    }
    
    const filePath = path.join(this.config.schemasDir, `${tableName}.ts`);
    fs.writeFileSync(filePath, zodSchema);
    
    log.success(`Generado: ${tableName}.ts`);
  }

  toPascalCase(str) {
    return str.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  async fixRLSPolicies() {
    log.subtitle('🔧 Generando políticas RLS dinámicas...');
    
    if (!this.schema.authInfo) {
      await this.checkAuthSchema();
    }
    
    const clerkExpression = this.schema.authInfo.recommendedClerkExpression;
    const userTable = this.schema.authInfo.detectedUserTable || 'usuarios';
    
    // Generar SQL dinámico para las políticas RLS
    const fixedSQL = this.generateDynamicRLSPolicies(clerkExpression, userTable);
    
    const outputPath = path.join(process.cwd(), 'dynamic-rls-policies.sql');
    fs.writeFileSync(outputPath, fixedSQL);
    
    log.success(`Políticas RLS dinámicas guardadas en: ${outputPath}`);
  }

  generateDynamicRLSPolicies(clerkExpression, userTable) {
    const accessibleTables = Array.from(this.schema.tables.entries())
      .filter(([_, table]) => table.accessible && table.columns.length > 0);
    
    let sql = `
-- POLÍTICAS RLS DINÁMICAS - GENERADAS AUTOMÁTICAMENTE
-- ====================================================
-- Generado el: ${new Date().toISOString()}
-- Expresión Clerk: ${clerkExpression}
-- Tabla de usuarios: ${userTable}
-- Tablas procesadas: ${accessibleTables.length}
-- Tipo de API Key: ${this.schema.permissions.keyType}

`;
    
    sql += `-- Crear función auxiliar si no existe
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM ${userTable}
    WHERE clerk_user_id = ${clerkExpression}
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

`;
    
    for (const [tableName, table] of accessibleTables) {
      sql += this.generateTableRLSPolicy(tableName, table, userTable, clerkExpression);
    }
    
    return sql;
  }

  generateTableRLSPolicy(tableName, table, userTable, clerkExpression) {
    let sql = `-- =====================================================
`;
    sql += `-- Políticas para tabla: ${tableName}
`;
    sql += `-- Columnas: ${table.columns.length}, Registros: ${table.recordCount}
`;
    sql += `-- =====================================================

`;
    
    // Habilitar RLS
    sql += `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;

`;
    
    // Detectar tipo de política basada en estructura
    const policyType = this.detectPolicyType(table, userTable);
    
    switch (policyType.type) {
      case 'user_owned':
        sql += this.generateUserOwnedPolicy(tableName, policyType, clerkExpression, userTable);
        break;
      case 'company_scoped':
        sql += this.generateCompanyScopedPolicy(tableName, policyType, clerkExpression, userTable);
        break;
      case 'related_access':
        sql += this.generateRelatedAccessPolicy(tableName, policyType, clerkExpression, userTable);
        break;
      case 'public_read':
        sql += this.generatePublicReadPolicy(tableName, policyType, clerkExpression, userTable);
        break;
      default:
        sql += this.generateGenericPolicy(tableName, policyType, clerkExpression, userTable);
    }
    
    sql += `
`;
    return sql;
  }

  detectPolicyType(table, userTable) {
    const columns = table.columns.map(col => col.name);
    
    // Detectar si es tabla de usuarios
    if (table.name === userTable || table.name === 'profiles') {
      return {
        type: 'user_owned',
        userColumn: 'id',
        description: 'Tabla de usuarios - acceso propio'
      };
    }
    
    // Detectar si tiene user_id directo
    const userIdColumn = columns.find(col => 
      col === 'user_id' || col === 'usuario_id' || col === 'created_by' || col === 'owner_id'
    );
    
    if (userIdColumn) {
      return {
        type: 'user_owned',
        userColumn: userIdColumn,
        description: `Acceso por ${userIdColumn}`
      };
    }
    
    // Detectar si tiene empresa_id/company_id
    const companyColumn = columns.find(col => 
      col === 'empresa_id' || col === 'company_id' || col === 'organization_id'
    );
    
    if (companyColumn) {
      return {
        type: 'company_scoped',
        companyColumn,
        description: `Acceso por ${companyColumn}`
      };
    }
    
    // Detectar acceso a través de relaciones
    const relationships = this.schema.relationships.get(table.name);
    if (relationships && relationships.foreignKeys.length > 0) {
      const relevantFK = relationships.foreignKeys.find(fk => 
        this.schema.tables.has(fk.referencedTable)
      );
      
      if (relevantFK) {
        return {
          type: 'related_access',
          foreignKey: relevantFK,
          description: `Acceso a través de ${relevantFK.referencedTable}`
        };
      }
    }
    
    // Detectar tablas de configuración/catálogo
    const catalogTables = ['categories', 'tags', 'settings', 'configurations', 'normas', 'standards'];
    if (catalogTables.some(cat => table.name.includes(cat))) {
      return {
        type: 'public_read',
        description: 'Tabla de catálogo - lectura pública'
      };
    }
    
    return {
      type: 'generic',
      description: 'Política genérica'
    };
  }

  generateUserOwnedPolicy(tableName, policyType, clerkExpression, userTable) {
    let sql = `-- Política: Acceso por usuario (${policyType.description})
`;
    
    if (tableName === userTable) {
      // Política para tabla de usuarios
      sql += `CREATE POLICY "${tableName}_own_record" ON ${tableName}
`;
      sql += `  FOR ALL USING (
`;
      sql += `    clerk_user_id = ${clerkExpression}
`;
      sql += `  );

`;
    } else {
      // Política para tablas con user_id
      sql += `CREATE POLICY "${tableName}_user_access" ON ${tableName}
`;
      sql += `  FOR ALL USING (
`;
      sql += `    ${policyType.userColumn} = get_current_user_id()
`;
      sql += `  );

`;
    }
    
    return sql;
  }

  generateCompanyScopedPolicy(tableName, policyType, clerkExpression, userTable) {
    let sql = `-- Política: Acceso por empresa (${policyType.description})
`;
    
    sql += `CREATE POLICY "${tableName}_company_access" ON ${tableName}
`;
    sql += `  FOR ALL USING (
`;
    sql += `    EXISTS (
`;
    sql += `      SELECT 1 FROM ${userTable} u
`;
    sql += `      WHERE u.empresa_id = ${tableName}.${policyType.companyColumn}
`;
    sql += `        AND u.clerk_user_id = ${clerkExpression}
`;
    sql += `    )
`;
    sql += `  );

`;
    
    return sql;
  }

  generateRelatedAccessPolicy(tableName, policyType, clerkExpression, userTable) {
    let sql = `-- Política: Acceso por relación (${policyType.description})
`;
    
    const fk = policyType.foreignKey;
    const referencedTable = this.schema.tables.get(fk.referencedTable);
    
    if (referencedTable) {
      const referencedPolicyType = this.detectPolicyType(referencedTable, userTable);
      
      sql += `CREATE POLICY "${tableName}_related_access" ON ${tableName}
`;
      sql += `  FOR ALL USING (
`;
      
      if (referencedPolicyType.type === 'company_scoped') {
        sql += `    EXISTS (
`;
        sql += `      SELECT 1 FROM ${fk.referencedTable} ref
`;
        sql += `      JOIN ${userTable} u ON u.empresa_id = ref.${referencedPolicyType.companyColumn}
`;
        sql += `      WHERE ref.id = ${tableName}.${fk.column}
`;
        sql += `        AND u.clerk_user_id = ${clerkExpression}
`;
        sql += `    )
`;
      } else {
        sql += `    EXISTS (
`;
        sql += `      SELECT 1 FROM ${fk.referencedTable} ref
`;
        sql += `      WHERE ref.id = ${tableName}.${fk.column}
`;
        sql += `        -- Agregar lógica específica según tabla referenciada
`;
        sql += `    )
`;
      }
      
      sql += `  );

`;
    }
    
    return sql;
  }

  generatePublicReadPolicy(tableName, policyType, clerkExpression, userTable) {
    let sql = `-- Política: Lectura pública (${policyType.description})
`;
    
    sql += `CREATE POLICY "${tableName}_public_read" ON ${tableName}
`;
    sql += `  FOR SELECT USING (true);

`;
    
    sql += `CREATE POLICY "${tableName}_admin_write" ON ${tableName}
`;
    sql += `  FOR INSERT, UPDATE, DELETE USING (
`;
    sql += `    EXISTS (
`;
    sql += `      SELECT 1 FROM ${userTable} u
`;
    sql += `      WHERE u.clerk_user_id = ${clerkExpression}
`;
    sql += `        AND u.role = 'admin' -- Ajustar según tu esquema de roles
`;
    sql += `    )
`;
    sql += `  );

`;
    
    return sql;
  }

  generateGenericPolicy(tableName, policyType, clerkExpression, userTable) {
    let sql = `-- Política: Genérica (${policyType.description})
`;
    sql += `-- NOTA: Esta tabla requiere revisión manual de políticas RLS
`;
    sql += `-- Estructura detectada: ${this.schema.tables.get(tableName).columns.map(col => col.name).join(', ')}

`;
    
    sql += `-- Política temporal - REVISAR Y AJUSTAR
`;
    sql += `CREATE POLICY "${tableName}_temp_access" ON ${tableName}
`;
    sql += `  FOR ALL USING (
`;
    sql += `    EXISTS (
`;
    sql += `      SELECT 1 FROM ${userTable} u
`;
    sql += `      WHERE u.clerk_user_id = ${clerkExpression}
`;
    sql += `        -- TODO: Definir lógica de acceso específica
`;
    sql += `    )
`;
    sql += `  );

`;
    
    return sql;
  }

  async generateReport() {
    log.title('📊 REPORTE FINAL MEJORADO');
    
    const report = {
      timestamp: new Date().toISOString(),
      apiKeyInfo: {
        type: this.schema.permissions.keyType,
        canCreateRPC: this.schema.permissions.canCreateRPC,
        canAccessInformationSchema: this.schema.permissions.canAccessInformationSchema
      },
      summary: {
        tablesFound: this.schema.tables.size,
        accessibleTables: Array.from(this.schema.tables.values()).filter(t => t.accessible).length,
        totalRelationships: Array.from(this.schema.relationships.values()).reduce((sum, rel) => sum + rel.foreignKeys.length, 0),
        frontendSchemas: this.schema.frontendSchemas.size,
        mismatches: this.schema.mismatches.length,
        authInfo: this.schema.authInfo
      },
      tables: Object.fromEntries(this.schema.tables),
      relationships: Object.fromEntries(this.schema.relationships),
      frontendSchemas: Object.fromEntries(this.schema.frontendSchemas),
      mismatches: this.schema.mismatches,
      permissions: this.schema.permissions
    };
    
    // Mostrar resumen mejorado
    log.info(`🔑 API Key: ${report.apiKeyInfo.type}`);
    log.info(`📋 Tablas encontradas: ${report.summary.tablesFound}`);
    log.info(`✅ Tablas accesibles: ${report.summary.accessibleTables}`);
    log.info(`🔗 Relaciones FK: ${report.summary.totalRelationships}`);
    log.info(`📝 Esquemas frontend: ${report.summary.frontendSchemas}`);
    log.info(`⚠️ Inconsistencias: ${report.summary.mismatches}`);
    
    if (this.schema.authInfo) {
      log.info(`👤 Tabla usuarios: ${this.schema.authInfo.detectedUserTable || 'no detectada'}`);
      log.info(`🔐 Expresión Clerk: ${this.schema.authInfo.recommendedClerkExpression}`);
    }
    
    // Guardar reporte
    const reportPath = path.join(process.cwd(), 'unified-schema-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    log.success(`Reporte completo guardado en: ${reportPath}`);
    
    // Mostrar relaciones detectadas
    if (report.summary.totalRelationships > 0) {
      log.subtitle('🔗 Relaciones detectadas:');
      for (const [tableName, relations] of this.schema.relationships) {
        if (relations.foreignKeys.length > 0) {
          log.info(`${tableName}:`);
          relations.foreignKeys.forEach(fk => {
            log.info(`  └─ ${fk.column} → ${fk.referencedTable}.${fk.referencedColumn}`);
          });
        }
      }
    }
    
    // Mostrar inconsistencias si las hay
    if (this.schema.mismatches.length > 0) {
      log.subtitle('⚠️ Inconsistencias encontradas:');
      this.schema.mismatches.forEach(mismatch => {
        log.warning(`Tabla ${mismatch.tableName}:`);
        mismatch.mismatches.forEach(issue => {
          if (issue.type === 'missing_in_backend') {
            log.error(`  └─ '${issue.column}' falta en backend`);
          } else {
            log.error(`  └─ '${issue.column}' falta en frontend`);
          }
        });
      });
    }
    
    // Recomendaciones
    log.subtitle('💡 Recomendaciones:');
    
    if (!this.schema.permissions.canCreateRPC) {
      log.warning('  • Crear función exec_sql para mejor análisis de esquema');
    }
    
    if (report.summary.accessibleTables < report.summary.tablesFound) {
      log.warning('  • Verificar permisos RLS en tablas inaccesibles');
    }
    
    if (report.summary.totalRelationships === 0) {
      log.warning('  • Revisar convenciones de nomenclatura para foreign keys');
    }
    
    if (!this.schema.authInfo.detectedUserTable) {
      log.warning('  • Crear tabla de usuarios para políticas RLS');
    }
  }
}

// CLI Interface mejorado
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    extract: !args.includes('--no-extract'),
    verify: !args.includes('--no-verify'),
    compare: !args.includes('--no-compare'),
    generate: args.includes('--generate'),
    fix: args.includes('--fix')
  };
  
  if (args.includes('--help')) {
    console.log(`
🚀 Gestor Unificado de Esquemas - Versión Mejorada

Opciones:
  --generate     Generar esquemas Zod dinámicos
  --fix          Generar políticas RLS inteligentes
  --no-extract   Saltar extracción de esquema
  --no-verify    Saltar verificación de tablas
  --no-compare   Saltar comparación con frontend
  --help         Mostrar esta ayuda

Ejemplos:
  node scripts/unified-schema-manager.js
  node scripts/unified-schema-manager.js --generate --fix
  node scripts/unified-schema-manager.js --fix

Características:
  ✅ Compatible con nuevas API keys de Supabase
  ✅ Detección automática de relaciones
  ✅ Políticas RLS inteligentes
  ✅ Validación de permisos
  ✅ Análisis de estructura dinámica
`);
    process.exit(0);
  }
  
  const manager = new UnifiedSchemaManager();
  manager.run(options)
    .then(() => {
      log.success('✨ Gestión de esquemas completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      log.error(`💥 Error: ${error.message}`);
      console.error(error.stack);
      process.exit(1);
    });
}

module.exports = { UnifiedSchemaManager };