require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase con valores por defecto (igual que verificar-registros-bd.js)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ebfauwdaoxfkzymozmqr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZmF1d2Rhb3hma3p5bW96bXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMjE4MjMsImV4cCI6MjA2MTc5NzgyM30.CPZPwIYnspG9PnG09qf8AuLGN0Ek_WSyNBfXzdweZA0';

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// Función corregida para generar reporte individual
async function generarReporteIndividual(user_id, rut, periodo = '202412') {
  try {
    console.log(`🔄 Generando reporte para RUT: ${rut}, Usuario: ${user_id}`);
    
    // Verificar si ya existe un reporte
    const { data: existingReport } = await supabaseAdmin
      .from('reportes_individuales')
      .select('id')
      .eq('user_id', user_id)
      .eq('rut', rut)
      .eq('periodo', periodo)
      .single();
    
    if (existingReport) {
      console.log(`⚠️  Ya existe un reporte para RUT ${rut}`);
      return { success: false, message: 'Reporte ya existe' };
    }

    // Generar datos del reporte
    const datosReporte = {
      rut: rut,
      periodo: periodo,
      fecha_generacion: new Date().toISOString(),
      metricas: {
        total_operaciones: Math.floor(Math.random() * 100) + 50,
        volumen_promedio: Math.floor(Math.random() * 1000000) + 500000,
        rentabilidad: (Math.random() * 20 - 10).toFixed(2) + '%'
      }
    };

    const fechaGeneracion = new Date();
    const fechaExpiracion = new Date();
    fechaExpiracion.setMonth(fechaExpiracion.getMonth() + 3);

    const reporteData = {
      user_id,
      rut,
      periodo, // Formato correcto: '202412' (6 caracteres)
      datos_reporte: datosReporte,
      fecha_generacion: fechaGeneracion.toISOString(),
      fecha_expiracion: fechaExpiracion.toISOString(),
      activo: true
    };

    const { data, error } = await supabaseAdmin
      .from('reportes_individuales')
      .insert(reporteData)
      .select()
      .single();

    if (error) {
      console.error(`❌ Error al insertar reporte para RUT ${rut}:`, error);
      return { success: false, error };
    }

    console.log(`✅ Reporte generado exitosamente para RUT ${rut}`);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Error al generar reporte para RUT ${rut}:`, error);
    return { success: false, error };
  }
}

async function generarReportesFaltantes() {
  console.log('🚀 Iniciando generación de reportes faltantes...');
  console.log(`🔗 Conectando a: ${supabaseUrl}`);
  
  // Lista de pagos sin reporte (del output anterior)
  const pagosSinReporte = [
    { rut: '6666', user_id: 'user_2witt4wDGLn9Rxdc5rO5w7QdRNH', pago_id: '643fe1b7-9f6c-4207-9ccf-f7a6a352f725' },
    { rut: '1-7', user_id: 'user_2witt4wDGLn9Rxdc5rO5w7QdRNH', pago_id: 'fc85f30d-8bab-4861-a904-c9101760d8e4' },
    { rut: '222', user_id: 'user_2witt4wDGLn9Rxdc5rO5w7QdRNH', pago_id: 'a233e5cf-0cf7-4943-b4df-40cd7b5646b4' },
    { rut: '43242', user_id: 'user_2witt4wDGLn9Rxdc5rO5w7QdRNH', pago_id: '0979d27b-4f8e-4701-87bf-9294deed4bce' },
    { rut: '3232', user_id: 'user_2witt4wDGLn9Rxdc5rO5w7QdRNH', pago_id: '1cc10c33-3fd6-4605-afbf-4c93268d51fb' },
    { rut: '212', user_id: 'user_2witt4wDGLn9Rxdc5rO5w7QdRNH', pago_id: 'fa77a070-9e2e-45fc-bd24-8d444979fa28' },
    { rut: 'isa', user_id: 'user_2witt4wDGLn9Rxdc5rO5w7QdRNH', pago_id: '605505a3-2f97-4e3e-90c5-87f7eb9694d0' },
    { rut: 'wq', user_id: 'user_2witt4wDGLn9Rxdc5rO5w7QdRNH', pago_id: 'b1ef0dd9-cc0b-4a15-b505-0b73d22d3e6b' }
  ];

  let exitosos = 0;
  let fallidos = 0;

  for (const pago of pagosSinReporte) {
    console.log(`\n📋 Procesando pago ${pago.pago_id}...`);
    console.log(`   RUT: ${pago.rut}`);
    
    // Usar período correcto de 6 caracteres
    const resultado = await generarReporteIndividual(
      pago.user_id,
      pago.rut,
      '202412' // Período correcto (6 caracteres)
    );

    if (resultado.success) {
      exitosos++;
      console.log(`   ✅ Éxito`);
    } else {
      fallidos++;
      console.log(`   ❌ Falló: ${resultado.error?.message || resultado.message}`);
    }

    // Pequeña pausa entre generaciones
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n📊 RESUMEN FINAL:`);
  console.log(`✅ Reportes generados exitosamente: ${exitosos}`);
  console.log(`❌ Reportes fallidos: ${fallidos}`);
  console.log(`📈 Total procesados: ${pagosSinReporte.length}`);
  
  if (exitosos > 0) {
    console.log(`\n🎉 ¡Se generaron ${exitosos} reportes! Ejecuta 'node verificar-pagos-sin-reporte.js' para verificar.`);
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  generarReportesFaltantes().catch(console.error);
}

module.exports = { generarReporteIndividual, generarReportesFaltantes };