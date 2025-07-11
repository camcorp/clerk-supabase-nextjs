require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Importar la función desde tu API
const { generarReporteIndividual } = require('./app/lib/api/reportes.ts');

async function repararReportesFaltantes() {
  // Aquí usarías los datos de pagos sin reporte del script anterior
  const pagosSinReporte = [
    // Llenar con los datos del script anterior
  ];
  
  for (const pago of pagosSinReporte) {
    console.log(`🔧 Generando reporte para pago ${pago.pago_id}...`);
    
    const reporte = await generarReporteIndividual(
      pago.user_id, 
      pago.rut, 
      '202412' // O el período correspondiente
    );
    
    if (reporte) {
      console.log(`✅ Reporte generado: ${reporte.id}`);
    } else {
      console.log(`❌ Error generando reporte para pago ${pago.pago_id}`);
    }
  }
}

repararReportesFaltantes();