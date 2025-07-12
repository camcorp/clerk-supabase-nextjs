import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    const healthCheck = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      checks: {
        database_connection: false,
        tables_accessible: false,
        auth_working: false,
        response_time: 0
      },
      tables: {},
      errors: []
    };

    // Test 1: Conexión básica a la base de datos
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from('productos')
        .select('count', { count: 'exact', head: true });
      
      if (!error) {
        healthCheck.checks.database_connection = true;
      } else {
        healthCheck.errors.push(`Database connection error: ${error.message}`);
      }
    } catch (error) {
      healthCheck.errors.push(`Database connection failed: ${error}`);
    }

    // Test 2: Verificar acceso a tablas principales
    const tablesToCheck = [
      'productos', 'corredores', 'pagos', 'reportes_individuales',
      'registro_empresa', 'user_subscriptions'
    ];

    for (const table of tablesToCheck) {
      try {
        const { data, error, count } = await supabaseAdmin
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        healthCheck.tables[table] = {
          accessible: !error,
          record_count: count || 0,
          error: error?.message || null
        };
        
        if (!error) {
          healthCheck.checks.tables_accessible = true;
        }
      } catch (error) {
        healthCheck.tables[table] = {
          accessible: false,
          record_count: 0,
          error: `${error}`
        };
      }
    }

    // Test 3: Verificar autenticación (si hay usuario)
    try {
      const { data: { session } } = await supabaseAdmin.auth.getSession();
      healthCheck.checks.auth_working = true;
    } catch (error) {
      healthCheck.errors.push(`Auth check failed: ${error}`);
    }

    // Calcular tiempo de respuesta
    healthCheck.checks.response_time = Date.now() - startTime;

    // Determinar estado general
    const hasErrors = healthCheck.errors.length > 0;
    const allChecksPass = Object.values(healthCheck.checks).every(check => 
      typeof check === 'boolean' ? check : true
    );
    
    healthCheck.status = hasErrors || !allChecksPass ? 'degraded' : 'healthy';

    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;

    return NextResponse.json(healthCheck, { status: statusCode });

  } catch (error) {
    console.error('Error en health check:', error);
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'unhealthy',
      error: 'Health check failed',
      details: `${error}`
    }, { status: 503 });
  }
}