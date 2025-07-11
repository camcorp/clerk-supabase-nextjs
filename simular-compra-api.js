/**
 * Script para simular compra de reporte usando el endpoint API
 * RUT: 762686856
 * Producto: rp_001 (Reporte Individual de Corredor)
 * Período: 202412
 */

const fetch = require('node-fetch');

// Configuración
const API_BASE_URL = 'http://localhost:3000';
const ENDPOINT = '/api/reportes/simular-compra';

// Datos para la simulación
const datosCompra = {
  userId: 'user_demo_762686856',
  rut: '762686856',
  periodo: '202412'
};

async function simularCompraAPI() {
  try {
    console.log('🚀 Simulando compra de reporte vía API...');
    console.log('📋 Datos de la compra:');
    console.log(`   - Usuario: ${datosCompra.userId}`);
    console.log(`   - RUT: ${datosCompra.rut}`);
    console.log(`   - Período: ${datosCompra.periodo}`);
    console.log('');

    console.log('⏳ Enviando solicitud al API...');
    console.log(`   URL: ${API_BASE_URL}${ENDPOINT}`);
    
    const response = await fetch(`${API_BASE_URL}${ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datosCompra)
    });

    const resultado = await response.json();

    if (response.ok && resultado.success) {
      console.log('✅ ¡Compra simulada exitosamente vía API!');
      console.log('');
      console.log('📊 Detalles del registro creado:');
      console.log('');
      
      // Información del pago
      console.log('💳 Pago:');
      console.log(`   - ID: ${resultado.data.pago.id}`);
      console.log(`   - Orden: ${resultado.data.pago.orden_comercio}`);
      console.log(`   - Monto: $${resultado.data.pago.amount.toLocaleString('es-CL')} CLP`);
      console.log(`   - Estado: ${resultado.data.pago.estado}`);
      console.log(`   - Fecha: ${new Date(resultado.data.pago.fecha_creacion).toLocaleString('es-CL')}`);
      console.log('');
      
      // Información del acceso
      console.log('🔑 Acceso:');
      console.log(`   - ID: ${resultado.data.acceso.id}`);
      console.log(`   - Módulo: ${resultado.data.acceso.modulo}`);
      console.log(`   - Activo: ${resultado.data.acceso.activo ? 'Sí' : 'No'}`);
      console.log(`   - Válido desde: ${new Date(resultado.data.acceso.fecha_inicio).toLocaleDateString('es-CL')}`);
      console.log(`   - Válido hasta: ${new Date(resultado.data.acceso.fecha_fin).toLocaleDateString('es-CL')}`);
      console.log('');
      
      // Información del reporte
      console.log('📄 Reporte:');
      console.log(`   - ID: ${resultado.data.reporte.id}`);
      console.log(`   - RUT: ${resultado.data.reporte.rut}`);
      console.log(`   - Período: ${resultado.data.reporte.periodo}`);
      console.log(`   - Activo: ${resultado.data.reporte.activo ? 'Sí' : 'No'}`);
      console.log(`   - Generado: ${new Date(resultado.data.reporte.fecha_generacion).toLocaleDateString('es-CL')}`);
      console.log(`   - Expira: ${new Date(resultado.data.reporte.fecha_expiracion).toLocaleDateString('es-CL')}`);
      console.log('');
      
      // URL de acceso
      console.log('🌐 Acceso al reporte:');
      console.log(`   ${API_BASE_URL}${resultado.data.url_acceso}`);
      console.log('');
      
      console.log('🎉 El usuario puede ahora acceder al reporte desde el dashboard!');
      console.log('');
      
      // Instrucciones adicionales
      console.log('📝 Próximos pasos:');
      console.log('   1. Iniciar el servidor de desarrollo: npm run dev');
      console.log('   2. Ir al dashboard: http://localhost:3000/dashboard/corredor/reportes');
      console.log('   3. El reporte debería aparecer en "Mis Reportes"');
      console.log(`   4. Hacer clic en "Ver Reporte" para acceder a: ${resultado.data.url_acceso}`);
      
    } else {
      console.error('❌ Error en la simulación:');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${resultado.error}`);
      if (resultado.details) {
        console.error(`   Detalles: ${resultado.details}`);
      }
      
      if (response.status === 400) {
        console.log('');
        console.log('💡 Verifica que los parámetros sean correctos:');
        console.log('   - userId: string no vacío');
        console.log('   - rut: solo números, 7-8 dígitos');
        console.log('   - periodo: formato YYYYMM');
      }
    }

  } catch (error) {
    console.error('💥 Error de conexión:', error.message);
    console.log('');
    console.log('🔧 Posibles soluciones:');
    console.log('   1. Verificar que el servidor esté ejecutándose: npm run dev');
    console.log('   2. Verificar que la URL sea correcta: http://localhost:3000');
    console.log('   3. Verificar conexión a internet');
    console.log('   4. Verificar que las variables de entorno estén configuradas');
  }
}

// Función para obtener información del endpoint
async function obtenerInfoAPI() {
  try {
    console.log('📖 Obteniendo información del API...');
    
    const response = await fetch(`${API_BASE_URL}${ENDPOINT}`, {
      method: 'GET'
    });

    const info = await response.json();
    
    console.log('📋 Información del endpoint:');
    console.log(`   Descripción: ${info.description}`);
    console.log(`   Método: ${info.method}`);
    console.log(`   Endpoint: ${info.endpoint}`);
    console.log('');
    console.log('📝 Ejemplo de uso:');
    console.log(JSON.stringify(info.example, null, 2));
    console.log('');
    
  } catch (error) {
    console.error('❌ Error obteniendo información del API:', error.message);
  }
}

// Función principal
async function main() {
  console.log('🎯 Simulación de Compra de Reporte vía API');
  console.log('==========================================');
  console.log('');

  // Verificar argumentos de línea de comandos
  const args = process.argv.slice(2);
  
  if (args.includes('--info') || args.includes('-i')) {
    await obtenerInfoAPI();
    return;
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('📖 Uso del script:');
    console.log('   node simular-compra-api.js          # Simular compra');
    console.log('   node simular-compra-api.js --info   # Información del API');
    console.log('   node simular-compra-api.js --help   # Mostrar ayuda');
    console.log('');
    return;
  }

  // Ejecutar simulación
  await simularCompraAPI();
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { simularCompraAPI, obtenerInfoAPI };