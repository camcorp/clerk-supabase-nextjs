// Script para probar la compra de reporte para RUT 762686856
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (usar variables de entorno en producción)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function simularCompraReporte() {
  const userId = 'user_test_123';
  const rutCorredor = '762686856';
  const periodo = '202412';
  
  try {
    console.log('Iniciando simulación de compra de reporte...');
    console.log(`Usuario: ${userId}`);
    console.log(`RUT Corredor: ${rutCorredor}`);
    console.log(`Período: ${periodo}`);
    
    // 1. Verificar que el corredor existe
    console.log('\n1. Verificando corredor...');
    const { data: corredor, error: errorCorredor } = await supabase
      .from('corredores')
      .select('rut, nombre, telefono, domicilio, ciudad')
      .eq('rut', rutCorredor)
      .single();
    
    if (errorCorredor || !corredor) {
      throw new Error(`Corredor ${rutCorredor} no encontrado`);
    }
    
    console.log(`Corredor encontrado: ${corredor.nombre}`);
    
    // 2. Obtener producto rp_001
    console.log('\n2. Obteniendo producto rp_001...');
    const { data: producto, error: errorProducto } = await supabase
      .from('productos')
      .select('*')
      .eq('codigo', 'rp_001')
      .single();
    
    if (errorProducto || !producto) {
      throw new Error('Producto rp_001 no encontrado');
    }
    
    console.log(`Producto: ${producto.nombre} - $${producto.precio_bruto}`);
    
    // 3. Simular pago
    console.log('\n3. Simulando pago...');
    const ordenComercio = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data: pago, error: errorPago } = await supabase
      .from('pagos')
      .insert({
        user_id: userId,
        rut: rutCorredor,
        producto_id: producto.id,
        orden_comercio: ordenComercio,
        amount: producto.precio_bruto,
        estado: 'COMPLETADO',
        fecha_creacion: new Date().toISOString(),
        token: `TKN_${Math.random().toString(36).substr(2, 16)}`
      })
      .select()
      .single();
    
    if (errorPago) {
      throw new Error(`Error en pago: ${errorPago.message}`);
    }
    
    console.log(`Pago completado: ${pago.orden_comercio}`);
    
    // 4. Crear acceso
    console.log('\n4. Creando acceso...');
    const fechaInicio = new Date();
    const fechaFin = new Date();
    fechaFin.setMonth(fechaFin.getMonth() + 1); // Acceso por 1 mes
    
    const { data: acceso, error: errorAcceso } = await supabase
      .from('accesos')
      .insert({
        user_id: userId,
        producto_id: producto.id,
        modulo: `reporte_corredor_${rutCorredor}`,
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
        activo: true
      })
      .select()
      .single();
    
    if (errorAcceso) {
      throw new Error(`Error creando acceso: ${errorAcceso.message}`);
    }
    
    console.log(`Acceso creado hasta: ${fechaFin.toLocaleDateString()}`);
    
    // 5. Generar reporte individual
    console.log('\n5. Generando reporte individual...');
    const fechaExpiracion = new Date();
    fechaExpiracion.setMonth(fechaExpiracion.getMonth() + 3); // Expira en 3 meses
    
    // Datos simulados del reporte
    const reportData = {
      corredor,
      periodo,
      indicadores: {
        produccion_total: 150000000,
        crecimiento: 15.5,
        ranking: 25
      },
      companias: [],
      ramos: [],
      fecha_generacion: new Date().toISOString()
    };
    
    const { data: reporte, error: errorReporte } = await supabase
      .from('reporte_individual')
      .insert({
        user_id: userId,
        rut: rutCorredor,
        periodo,
        data: reportData,
        fecha_generacion: new Date().toISOString(),
        fecha_expiracion: fechaExpiracion.toISOString(),
        activo: true
      })
      .select()
      .single();
    
    if (errorReporte) {
      throw new Error(`Error generando reporte: ${errorReporte.message}`);
    }
    
    console.log(`Reporte generado con ID: ${reporte.id}`);
    
    console.log('\n✅ Compra de reporte completada exitosamente!');
    console.log('\nResumen:');
    console.log(`- Corredor: ${corredor.nombre} (${rutCorredor})`);
    console.log(`- Producto: ${producto.nombre}`);
    console.log(`- Precio: $${producto.precio_bruto}`);
    console.log(`- Acceso válido hasta: ${fechaFin.toLocaleDateString()}`);
    console.log(`- Reporte expira: ${fechaExpiracion.toLocaleDateString()}`);
    
    return {
      success: true,
      corredor,
      producto,
      pago,
      acceso,
      reporte
    };
    
  } catch (error) {
    console.error('\n❌ Error en la compra:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Ejecutar la simulación
simularCompraReporte()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 Proceso completado exitosamente');
    } else {
      console.log('\n💥 Proceso falló');
    }
  })
  .catch(err => {
    console.error('Error fatal:', err);
  });