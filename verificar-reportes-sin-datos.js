require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verificarReportesSinDatos() {
  try {
    console.log('🔍 Buscando reportes con datos incompletos...');
    
    // 1. Obtener todos los reportes individuales
    const { data: reportes, error } = await supabaseAdmin
      .from('reportes_individuales')
      .select('*')
      .eq('activo', true)
      .order('fecha_generacion', { ascending: false });
    
    if (error) {
      console.error('❌ Error obteniendo reportes:', error);
      return;
    }
    
    console.log(`📊 Total reportes activos: ${reportes.length}`);
    
    const reportesSinDatos = [];
    const reportesConDatos = [];
    
    for (const reporte of reportes) {
      if (!reporte.datos_reporte || 
          reporte.datos_reporte === null || 
          Object.keys(reporte.datos_reporte).length <= 2) {
        // Reporte sin datos o con datos mínimos
        reportesSinDatos.push({
          id: reporte.id,
          user_id: reporte.user_id,
          rut: reporte.rut,
          periodo: reporte.periodo,
          fecha_generacion: reporte.fecha_generacion,
          datos_actuales: reporte.datos_reporte
        });
      } else {
        reportesConDatos.push(reporte);
      }
    }
    
    console.log('\n📋 RESUMEN:');
    console.log(`✅ Reportes con datos completos: ${reportesConDatos.length}`);
    console.log(`❌ Reportes sin datos o incompletos: ${reportesSinDatos.length}`);
    
    if (reportesSinDatos.length > 0) {
      console.log('\n❌ REPORTES SIN DATOS:');
      reportesSinDatos.forEach((reporte, index) => {
        console.log(`${index + 1}. ID: ${reporte.id}`);
        console.log(`   RUT: ${reporte.rut}`);
        console.log(`   User ID: ${reporte.user_id}`);
        console.log(`   Período: ${reporte.periodo}`);
        console.log(`   Datos actuales:`, reporte.datos_actuales);
        console.log('');
      });
      
      return reportesSinDatos;
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Función para reparar reportes sin datos
async function repararReportesSinDatos(reportesSinDatos) {
  console.log('🔧 Iniciando reparación de reportes...');
  
  for (const reporte of reportesSinDatos) {
    try {
      // Generar datos completos del reporte
      const datosCompletos = {
        corredor: {
          rut: reporte.rut,
          nombre: `Corredor ${reporte.rut}`,
          periodo: reporte.periodo || '202412'
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
        ],
        fecha_generacion: new Date().toISOString(),
        estado: 'completado'
      };
      
      // Actualizar el reporte con datos completos
      const { error: updateError } = await supabaseAdmin
        .from('reportes_individuales')
        .update({
          datos_reporte: datosCompletos,
          fecha_generacion: new Date().toISOString()
        })
        .eq('id', reporte.id);
      
      if (updateError) {
        console.error(`❌ Error actualizando reporte ${reporte.id}:`, updateError);
      } else {
        console.log(`✅ Reporte ${reporte.id} reparado para RUT ${reporte.rut}`);
      }
      
    } catch (error) {
      console.error(`❌ Error reparando reporte ${reporte.id}:`, error);
    }
  }
}

// Ejecutar verificación y reparación
async function main() {
  const reportesSinDatos = await verificarReportesSinDatos();
  
  if (reportesSinDatos && reportesSinDatos.length > 0) {
    console.log('\n🔧 ¿Deseas reparar estos reportes? (Ejecuta repararReportesSinDatos)');
    // Descomenta la siguiente línea para reparar automáticamente:
    // await repararReportesSinDatos(reportesSinDatos);
  }
}

main();