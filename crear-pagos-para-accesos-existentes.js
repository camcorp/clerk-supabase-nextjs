const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function crearPagosParaAccesos() {
  const rutsCorredores = ['760071951', '520023585', '761650777', '762503360'];
  const userId = 'user_2witt4wDGLn9Rxdc5rO5w7QdRNH'; // Tu user_id de los accesos
  
  console.log('💳 Creando pagos para accesos existentes...');
  console.log('RUTs a procesar:', rutsCorredores.join(', '));
  console.log('=' .repeat(80));
  
  try {
    // 1. Obtener el producto rp_001
    console.log('1️⃣ Obteniendo información del producto...');
    const { data: producto, error: errorProducto } = await supabaseAdmin
      .from('productos')
      .select('id, codigo, precio_bruto')
      .eq('codigo', 'rp_001')
      .single();
    
    if (errorProducto) {
      console.error('❌ Error obteniendo producto:', errorProducto.message);
      return;
    }
    
    console.log('✅ Producto encontrado:', producto.codigo, '- Precio:', producto.precio_bruto);
    
    // 2. Crear pagos para cada RUT
    for (const rutCorredor of rutsCorredores) {
      console.log(`\n📋 Procesando RUT: ${rutCorredor}`);
      console.log('-' .repeat(50));
      
      // Verificar si ya existe un pago para este RUT
      const { data: pagoExistente, error: errorVerificar } = await supabaseAdmin
        .from('pagos')
        .select('id')
        .eq('user_id', userId)
        .eq('rut', rutCorredor)
        .eq('producto_id', producto.id)
        .single();
      
      if (pagoExistente) {
        console.log('⚠️  Ya existe un pago para este RUT, saltando...');
        continue;
      }
      
      // Crear el pago
      const ordenComercio = `ORD_${rutCorredor}_${Date.now()}`;
      const flowOptional = JSON.stringify({ rutCorredor: rutCorredor });
      
      const { data: nuevoPago, error: errorPago } = await supabaseAdmin
        .from('pagos')
        .insert({
          user_id: userId,
          rut: rutCorredor, // RUT del corredor como RUT de facturación
          producto_id: producto.id,
          orden_comercio: ordenComercio,
          amount: producto.precio_bruto,
          estado: 'completed',
          flow_status: 'completed',
          flow_optional: flowOptional,
          flow_subject: `Reporte Corredor ${rutCorredor}`,
          fecha_creacion: new Date().toISOString(),
          token: `TKN_${rutCorredor}_${Date.now()}`,
          url_pago: null
        })
        .select()
        .single();
      
      if (errorPago) {
        console.error(`❌ Error creando pago para ${rutCorredor}:`, errorPago.message);
        continue;
      }
      
      console.log(`✅ Pago creado exitosamente:`);
      console.log(`   ID: ${nuevoPago.id}`);
      console.log(`   Orden: ${nuevoPago.orden_comercio}`);
      console.log(`   Monto: $${nuevoPago.amount}`);
      console.log(`   Estado: ${nuevoPago.estado}`);
      console.log(`   Flow Optional: ${nuevoPago.flow_optional}`);
    }
    
    console.log('\n' + '=' .repeat(80));
    console.log('✅ Proceso completado');
    console.log('\n🔄 Ahora puedes ejecutar el script de generación de reportes:');
    console.log('   node generar-reportes-con-rut-correcto-fixed.js');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

crearPagosParaAccesos();