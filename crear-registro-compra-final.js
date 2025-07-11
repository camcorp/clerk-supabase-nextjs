/**
 * Script final para crear registro de compra
 * RUT: 762686856
 * Producto: rp_001 (Reporte Individual de Corredor)
 * Período: 202412
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (usar variables de entorno del sistema)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Si no están en el entorno, usar valores de ejemplo (CAMBIAR POR LOS REALES)
const url = supabaseUrl || 'https://tu-proyecto.supabase.co';
const key = supabaseKey || 'tu-service-role-key';

if (!supabaseUrl || !supabaseKey) {
  console.log('⚠️  Variables de entorno no encontradas, usando valores de ejemplo');
  console.log('📝 Para usar valores reales, configura:');
  console.log('   export NEXT_PUBLIC_SUPABASE_URL="tu-url"');
  console.log('   export SUPABASE_SERVICE_ROLE_KEY="tu-key"');
  console.log('');
}

const supabase = createClient(url, key);

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

    if (errorCorredor) {
      console.log('⚠️  Corredor no encontrado, creando registro...');
      
      // Crear corredor si no existe
      const { data: nuevoCorrector, error: errorCrear } = await supabase
        .from('corredores')
        .insert({
          rut: rut,
          nombre: 'Corredor Demo 762686856',
          activo: true
        })
        .select()
        .single();

      if (errorCrear) {
        console.error('❌ Error creando corredor:', errorCrear.message);
        return;
      }
      console.log('✅ Corredor creado:', nuevoCorrector.nombre);
    } else {
      console.log('✅ Corredor encontrado:', corredor.nombre);
    }

    // 2. Verificar/crear producto rp_001
    console.log('🔍 Verificando producto rp_001...');
    let { data: producto, error: errorProducto } = await supabase
      .from('productos')
      .select('*')
      .eq('codigo', 'rp_001')
      .single();

    if (errorProducto) {
      console.log('⚠️  Producto no encontrado, creando...');
      
      const { data: nuevoProducto, error: errorCrearProducto } = await supabase
        .from('productos')
        .insert({
          codigo: 'rp_001',
          nombre: 'Reporte Individual de Corredor',
          descripcion: 'Análisis detallado del desempeño individual de un corredor de seguros',
          precio_neto: 29990,
          precio_bruto: 35688.10,
          activo: true
        })
        .select()
        .single();

      if (errorCrearProducto) {
        console.error('❌ Error creando producto:', errorCrearProducto.message);
        return;
      }
      producto = nuevoProducto;
      console.log('✅ Producto creado:', producto.nombre);
    } else {
      console.log('✅ Producto encontrado:', producto.nombre);
    }

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
        nombre: corredor?.nombre || 'Corredor Demo 762686856'
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
    console.log('');
    console.log('📋 Consulta SQL para verificar:');
    console.log(`   SELECT * FROM pagos WHERE rut = '${rut}';`);
    console.log(`   SELECT * FROM accesos WHERE modulo = 'reporte_corredor_${rut}';`);
    console.log(`   SELECT * FROM reporte_individual WHERE rut = '${rut}';`);

  } catch (error) {
    console.error('💥 Error inesperado:', error.message);
    if (error.message.includes('connect') || error.message.includes('network')) {
      console.log('');
      console.log('🔧 Posibles soluciones:');
      console.log('   1. Verificar que las variables de entorno estén configuradas');
      console.log('   2. Verificar conexión a internet');
      console.log('   3. Verificar que la URL de Supabase sea correcta');
      console.log('   4. Verificar que el Service Role Key tenga permisos');
    }
  }
}

// Función para mostrar instrucciones
function mostrarInstrucciones() {
  console.log('📖 INSTRUCCIONES DE USO');
  console.log('========================');
  console.log('');
  console.log('1. Configurar variables de entorno:');
  console.log('   export NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"');
  console.log('   export SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key"');
  console.log('');
  console.log('2. Ejecutar el script:');
  console.log('   node crear-registro-compra-final.js');
  console.log('');
  console.log('3. Verificar en el dashboard:');
  console.log('   http://localhost:3000/dashboard/corredor/reportes');
  console.log('');
}

// Ejecutar
if (require.main === module) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    mostrarInstrucciones();
  } else {
    crearRegistroCompra().catch(console.error);
  }
}

module.exports = { crearRegistroCompra };