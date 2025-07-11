const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnosticarLongitudCampos() {
  console.log('🔍 Diagnosticando longitud de campos...');
  
  // Datos de prueba del script anterior
  const datosPrueba = [
    {
      user_id: '4b5c6d7e-8f9a-1b2c-3d4e-5f6a7b8c9d0e',
      rut: '761650777',
      periodo: '202312'
    }
  ];
  
  // Verificar longitudes
  console.log('\n📏 Verificando longitudes de campos:');
  datosPrueba.forEach((datos, index) => {
    console.log(`\nRegistro ${index + 1}:`);
    console.log(`- user_id: "${datos.user_id}" (${datos.user_id.length} caracteres)`);
    console.log(`- rut: "${datos.rut}" (${datos.rut.length} caracteres)`);
    console.log(`- periodo: "${datos.periodo}" (${datos.periodo.length} caracteres)`);
  });
  
  // Intentar inserción de prueba con campos mínimos
  console.log('\n🧪 Intentando inserción de prueba...');
  try {
    const { data, error } = await supabase
      .from('reportes_individuales')
      .insert({
        user_id: datosPrueba[0].user_id,
        rut: datosPrueba[0].rut,
        periodo: datosPrueba[0].periodo,
        fecha_expiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        datos_reporte: { test: true },
        activo: true
      })
      .select();
    
    if (error) {
      console.log('❌ Error en inserción:', error);
      
      // Analizar el mensaje de error
      if (error.message.includes('character(6)')) {
        console.log('\n🔍 El error indica un campo con límite de 6 caracteres.');
        console.log('Campos candidatos:');
        console.log(`- periodo: "${datosPrueba[0].periodo}" (${datosPrueba[0].periodo.length} caracteres)`);
        
        if (datosPrueba[0].periodo.length > 6) {
          console.log('⚠️ El campo periodo excede 6 caracteres!');
          console.log('💡 Solución: Usar formato YYYYMM (6 dígitos) en lugar de YYYYMM.');
        }
      }
    } else {
      console.log('✅ Inserción exitosa:', data);
      
      // Limpiar el registro de prueba
      if (data && data[0]) {
        await supabase
          .from('reportes_individuales')
          .delete()
          .eq('id', data[0].id);
        console.log('🧹 Registro de prueba eliminado.');
      }
    }
  } catch (err) {
    console.log('❌ Error inesperado:', err.message);
  }
}

diagnosticarLongitudCampos()
  .then(() => {
    console.log('\n✅ Diagnóstico completado.');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error en diagnóstico:', err);
    process.exit(1);
  });