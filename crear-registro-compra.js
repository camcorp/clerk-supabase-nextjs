/**
 * Script para crear registro de compra usando la API
 * RUT: 762686856
 * Producto: rp_001 (Reporte Individual de Corredor)
 * Período: 202412
 */

const { createClient } = require('@supabase/supabase-js');
const { comprarReporte } = require('./app/lib/api/reportes');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  console.log('Necesitas configurar:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function crearRegistroCompra() {
  try {
    console.log('🚀 Iniciando creación de registro de compra...');
    console.log('📋 Datos:');
    console.log('   - RUT: 762686856');
    console.log('   - Producto: rp_001');
    console.log('   - Período: 202412');
    console.log('');

    // ID de usuario de ejemplo (en producción sería el ID real del usuario autenticado)
    const userId = 'user_demo_762686856';
    const rut = '762686856';
    const periodo = '202412';

    console.log('⏳ Ejecutando compra...');
    
    // Llamar a la función de compra
    const resultado = await comprarReporte(userId, rut, periodo);

    if (resultado.success) {
      console.log('✅ ¡Registro de compra creado exitosamente!');
      console.log('');
      console.log('📊 Detalles del registro:');
      console.log('   - Pago ID:', resultado.pago.id);
      console.log('   - Orden:', resultado.pago.orden_comercio);
      console.log('   - Monto:', `$${resultado.pago.amount.toLocaleString('es-CL')} CLP`);
      console.log('   - Estado:', resultado.pago.estado);
      console.log('');
      console.log('🔑 Acceso creado:');
      console.log('   - Acceso ID:', resultado.acceso.id);
      console.log('   - Módulo:', resultado.acceso.modulo);
      console.log('   - Válido hasta:', new Date(resultado.acceso.fecha_fin).toLocaleDateString('es-CL'));
      console.log('');
      console.log('📄 Reporte generado:');
      console.log('   - Reporte ID:', resultado.reporte.id);
      console.log('   - RUT:', resultado.reporte.rut);
      console.log('   - Período:', resultado.reporte.periodo);
      console.log('   - Expira:', new Date(resultado.reporte.fecha_expiracion).toLocaleDateString('es-CL'));
      console.log('');
      console.log('🌐 URL de acceso:');
      console.log(`   http://localhost:3000/dashboard/corredor/reportes/${rut}`);
      console.log('');
      console.log('🎉 El usuario ahora puede acceder al reporte desde el dashboard!');
      
    } else {
      console.error('❌ Error al crear el registro:', resultado.error);
      if (resultado.details) {
        console.error('📝 Detalles:', resultado.details);
      }
    }

  } catch (error) {
    console.error('💥 Error inesperado:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Verificar que el corredor existe antes de proceder
async function verificarCorredor() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔍 Verificando que existe el corredor...');
    const { data: corredor, error } = await supabase
      .from('corredores')
      .select('rut, nombre')
      .eq('rut', '762686856')
      .single();

    if (error || !corredor) {
      console.error('❌ Error: El corredor con RUT 762686856 no existe en la base de datos');
      console.log('💡 Necesitas insertar el corredor primero:');
      console.log(`
   INSERT INTO corredores (rut, nombre, activo) 
   VALUES ('762686856', 'Corredor Demo', true);
`);
      return false;
    }

    console.log('✅ Corredor encontrado:', corredor.nombre);
    return true;
    
  } catch (error) {
    console.error('💥 Error verificando corredor:', error.message);
    return false;
  }
}

// Función principal
async function main() {
  console.log('🎯 Script de Creación de Registro de Compra');
  console.log('==========================================');
  console.log('');

  // Verificar corredor
  const corredorExiste = await verificarCorredor();
  if (!corredorExiste) {
    process.exit(1);
  }

  console.log('');
  
  // Crear registro de compra
  await crearRegistroCompra();
}

// Ejecutar
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { crearRegistroCompra, verificarCorredor };