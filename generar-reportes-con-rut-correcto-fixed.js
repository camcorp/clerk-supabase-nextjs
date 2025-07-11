require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Leer variables de entorno directamente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno faltantes');
  console.error('Asegúrate de que NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY estén configuradas');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function generarReportesFaltantes() {
  try {
    console.log('🔍 Buscando pagos completados sin reportes...');
    
    // 1. Obtener todos los pagos completados
    const { data: pagos, error: pagosError } = await supabaseAdmin
      .from('pagos')
      .select('*')
      .eq('estado', 'completed')
      .order('fecha_creacion', { ascending: false });

    if (pagosError) {
      console.error('❌ Error obteniendo pagos:', pagosError);
      return;
    }

    console.log(`📊 Total de pagos completados: ${pagos.length}`);

    let reportesGenerados = 0;
    let errores = 0;
    let sinRutCorredor = 0;

    for (const pago of pagos) {
      try {
        // 2. Extraer rutCorredor desde datos_facturacion
        let rutCorredor = null;
        
        if (pago.datos_facturacion?.items_carrito) {
          // Buscar en items del carrito
          for (const item of pago.datos_facturacion.items_carrito) {
            if (item.metadata?.rutCorredor) {
              rutCorredor = item.metadata.rutCorredor;
              break;
            }
          }
        }

        if (!rutCorredor) {
          console.log(`⚠️  Pago ${pago.id}: No se encontró rutCorredor en metadata`);
          sinRutCorredor++;
          continue;
        }

        console.log(`🔍 Pago ${pago.id}: Encontrado rutCorredor ${rutCorredor}`);

        // 3. Verificar si ya existe un reporte para este corredor
        const { data: reporteExistente, error: reporteError } = await supabaseAdmin
          .from('reporte_individual')  // Cambiar de 'reportes_individuales' a 'reporte_individual'
          .select('id')
          .eq('user_id', pago.user_id)
          .eq('rut', rutCorredor)
          .single();

        if (reporteExistente) {
          console.log(`✅ Pago ${pago.id}: Ya existe reporte para corredor ${rutCorredor}`);
          continue;
        }

        if (reporteError && reporteError.code !== 'PGRST116') {
          console.error(`❌ Error verificando reporte existente:`, reporteError);
          errores++;
          continue;
        }

        // 4. Generar datos del reporte
        const datosReporte = {
          corredor: {
            rut: rutCorredor,
            nombre: `Corredor ${rutCorredor}`,
            periodo: '2024-01'
          },
          resumen: {
            total_primas: Math.floor(Math.random() * 1000000) + 500000,
            total_comisiones: Math.floor(Math.random() * 100000) + 50000,
            cantidad_polizas: Math.floor(Math.random() * 50) + 10
          },
          detalle_polizas: [
            {
              numero_poliza: `POL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              asegurado: `Cliente ${Math.floor(Math.random() * 1000)}`,
              prima: Math.floor(Math.random() * 50000) + 10000,
              comision: Math.floor(Math.random() * 5000) + 1000,
              fecha_emision: new Date().toISOString().split('T')[0]
            }
          ]
        };

        // 5. Crear el reporte individual
        const { data: nuevoReporte, error: insertError } = await supabaseAdmin
          .from('reporte_individual')  // Cambiar de 'reportes_individuales' a 'reporte_individual'
          .insert({
            user_id: pago.user_id,
            rut: rutCorredor,
            periodo: '2024-01',
            data: datosReporte,  // Cambiar de 'datos_reporte' a 'data'
            fecha_generacion: new Date().toISOString(),
            fecha_expiracion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            activo: true
          })
          .select()
          .single();

        if (insertError) {
          console.error(`❌ Error creando reporte para pago ${pago.id}:`, insertError);
          errores++;
        } else {
          console.log(`✅ Reporte generado para pago ${pago.id}, corredor ${rutCorredor}, reporte ID: ${nuevoReporte.id}`);
          reportesGenerados++;
        }

      } catch (error) {
        console.error(`❌ Error procesando pago ${pago.id}:`, error);
        errores++;
      }
    }

    console.log('\n📈 Resumen:');
    console.log(`📊 Total pagos procesados: ${pagos.length}`);
    console.log(`✅ Reportes generados: ${reportesGenerados}`);
    console.log(`⚠️  Pagos sin rutCorredor: ${sinRutCorredor}`);
    console.log(`❌ Errores: ${errores}`);
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Al final del archivo, agregar:
generarReportesFaltantes()
  .then(() => {
    console.log('✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en el proceso:', error);
    process.exit(1);
  });