const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugCompraReporte() {
  const userId = 'test_user_debug';
  const rutCorredor = '762686856';
  const periodo = '202412';
  
  console.log('🔍 Iniciando debug de compra de reporte...');
  
  try {
    // 1. Verificar producto rp_001
    console.log('1. Verificando producto rp_001...');
    const { data: producto, error: errorProducto } = await supabaseAdmin
      .from('productos')
      .select('*')
      .eq('codigo', 'rp_001')
      .single();
    
    if (errorProducto) {
      console.error('❌ Error obteniendo producto:', errorProducto);
      return;
    }
    
    if (!producto) {
      console.error('❌ Producto rp_001 no encontrado');
      return;
    }
    
    console.log('✅ Producto encontrado:', producto.codigo);
    
    // 2. Probar inserción directa en reportes_individuales
    console.log('2. Probando inserción directa en reportes_individuales...');
    
    const fechaExpiracion = new Date();
    fechaExpiracion.setMonth(fechaExpiracion.getMonth() + 3);
    
    const reporte = {
      user_id: userId,
      rut: rutCorredor,
      periodo: periodo,
      datos_reporte: {
        rut: rutCorredor,
        periodo: periodo,
        fecha_generacion: new Date().toISOString(),
        tipo: 'individual',
        estado: 'generado'
      },
      fecha_generacion: new Date().toISOString(),
      fecha_expiracion: fechaExpiracion.toISOString(),
      activo: true
    };
    
    const { data: reporteData, error: errorReporte } = await supabaseAdmin
      .from('reportes_individuales')
      .insert(reporte)
      .select()
      .single();
    
    if (errorReporte) {
      console.error('❌ Error insertando reporte:', errorReporte);
      console.error('Detalles:', {
        code: errorReporte.code,
        message: errorReporte.message,
        details: errorReporte.details,
        hint: errorReporte.hint
      });
      return;
    }
    
    console.log('✅ Reporte insertado exitosamente:', reporteData.id);
    
    // 3. Verificar que se insertó
    const { data: verificacion, error: errorVerificacion } = await supabaseAdmin
      .from('reportes_individuales')
      .select('*')
      .eq('id', reporteData.id)
      .single();
    
    if (errorVerificacion) {
      console.error('❌ Error verificando inserción:', errorVerificacion);
    } else {
      console.log('✅ Verificación exitosa. Reporte existe en BD.');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

debugCompraReporte();