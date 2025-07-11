/**
 * Script simplificado para crear registro de compra
 * RUT: 762686856
 * Producto: rp_001 (Reporte Individual de Corredor)
 * Período: 202412
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  console.log('Necesitas configurar en .env:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function crearRegistroCompra() {
  try {
    console.log('🚀 Iniciando creación de registro de compra...');
    console.log('📋 Datos:');
    console.log('   - RUT: 762686856');
    console.log('   - Producto: rp_001');
    console.log('   - Período: 202412');
    console.log('');

    const userId = 'user_demo_762686856';
    const rut = '762686856';
    const periodo = '202412';

    // 1. Verificar que existe el corredor
    console.log('🔍 Verificando corredor...');
    const { data: corredor, error: errorCorredor } = await supabase
      .from('corredores')
      .select('rut, nombre')
      .eq('rut', rut)
      .single();

    if (errorCorredor || !corredor) {
      console.error('❌ Error: El corredor no existe');
      return;
    }
    console.log('✅ Corredor encontrado:', corredor.nombre);

    // 2. Obtener producto rp_001
    console.log('🔍 Verificando producto rp_001...');
    const { data: producto, error: errorProducto } = await supabase
      .from('productos')
      .select('*')
      .eq('codigo', 'rp_001')
      .single();

    if (errorProducto || !producto) {
      console.error('❌ Error: El producto rp_001 no existe');
      return;
    }
    console.log('✅ Producto encontrado:', producto.nombre);

    // 3. Crear pago
    console.log('💳 Creando registro de pago...');
    const ordenComercio = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const token = `TKN_${Math.random().toString(36).substr(2, 16)}`;
    
    const { data: pago, error: errorPago } = await supabase
      .from('pagos')
      .insert({
        user_id: userId,
        rut: rut,
        producto_id: producto.id,
        orden_comercio: ordenComercio,
        amount: producto.precio_bruto,
        estado: 'COMPLETADO',
        fecha_creacion: new Date().toISOString(),
        token: token
      })
      .select()
      .single();

    if (errorPago) {
      console.error('❌ Error creando pago:', errorPago.message);
      return;
    }
    console.log('✅ Pago creado:', pago.orden_comercio);

    // 4. Crear acceso
    console.log('🔑 Creando acceso...');
    const fechaInicio = new Date();
    const fechaFin = new Date();
    fechaFin.setMonth(fechaFin.getMonth() + 1); // 1 mes de acceso

    const { data: acceso, error: errorAcceso } = await supabase
      .from('accesos')
      .insert({
        user_id: userId,
        producto_id: producto.id,
        modulo: `reporte_corredor_${rut}`,
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
        activo: true
      })
      .select()
      .single();

    if (errorAcceso) {
      console.error('❌ Error creando acceso:', errorAcceso.message);
      return;
    }
    console.log('✅ Acceso creado hasta:', fechaFin.toLocaleDateString('es-CL'));

    // 5. Generar datos del reporte (simulados)
    console.log('📊 Generando reporte...');
    const datosReporte = {
      corredor: {
        rut: rut,
        nombre: corredor.nombre
      },
      periodo: periodo,
      indicadores: {
        produccion_total: 150000000,
        crecimiento: 15.5,
        concentracion: 0.75,
        market_share: 2.3,
        diversificacion: 0.85,
        ranking: 25
      },
      companias: [
        {
          nombre: "Compañía A",
          produccion: 80000000,
          participacion: 53.3
        },
        {
          nombre: "Compañía B",
          produccion: 45000000,
          participacion: 30.0
        },
        {
          nombre: "Compañía C",
          produccion: 25000000,
          participacion: 16.7
        }
      ],
      ramos: [
        {
          nombre: "Vida",
          produccion: 90000000,
          participacion: 60.0
        },
        {
          nombre: "Salud",
          produccion: 35000000,
          participacion: 23.3
        },
        {
          nombre: "Generales",
          produccion: 25000000,
          participacion: 16.7
        }
      ]
    };

    // 6. Crear reporte individual
    const fechaExpiracion = new Date();
    fechaExpiracion.setMonth(fechaExpiracion.getMonth() + 3); // 3 meses de vigencia

    const { data: reporte, error: errorReporte } = await supabase
      .from('reporte_individual')
      .insert({
        user_id: userId,
        rut: rut,
        periodo: periodo,
        data: JSON.stringify(datosReporte),
        fecha_generacion: new Date().toISOString(),
        fecha_expiracion: fechaExpiracion.toISOString(),
        activo: true
      })
      .select()
      .single();

    if (errorReporte) {
      console.error('❌ Error creando reporte:', errorReporte.message);
      return;
    }
    console.log('✅ Reporte generado exitosamente');

    // Resumen final
    console.log('');
    console.log('🎉 ¡REGISTRO DE COMPRA CREADO EXITOSAMENTE!');
    console.log('==========================================');
    console.log('');
    console.log('📊 Resumen:');
    console.log(`   - Pago ID: ${pago.id}`);
    console.log(`   - Orden: ${pago.orden_comercio}`);
    console.log(`   - Monto: $${pago.amount.toLocaleString('es-CL')} CLP`);
    console.log(`   - Acceso válido hasta: ${fechaFin.toLocaleDateString('es-CL')}`);
    console.log(`   - Reporte expira: ${fechaExpiracion.toLocaleDateString('es-CL')}`);
    console.log('');
    console.log('🌐 URL de acceso:');
    console.log(`   http://localhost:3000/dashboard/corredor/reportes/${rut}`);
    console.log('');
    console.log('✨ El usuario puede ahora ver el reporte en el dashboard!');

  } catch (error) {
    console.error('💥 Error inesperado:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar
if (require.main === module) {
  crearRegistroCompra().catch(console.error);
}

module.exports = { crearRegistroCompra };