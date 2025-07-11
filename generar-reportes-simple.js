#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas')
  console.log('SUPABASE_URL:', supabaseUrl ? 'Configurada' : 'No configurada')
  console.log('SUPABASE_KEY:', supabaseKey ? 'Configurada' : 'No configurada')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  try {
    console.log('🔌 Conectando a Supabase...')
    console.log('URL:', supabaseUrl)
    
    // Test de conexión simple
    console.log('🧪 Probando conexión básica...')
    const { data: testData, error: testError } = await supabase
      .from('pagos')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.error('❌ Error de conexión:', testError.message)
      return
    }
    
    console.log('✅ Conexión exitosa')

    // 1. Buscar pagos completados (consulta simple)
    console.log('\n🔍 Buscando pagos completados...')
    
    const { data: pagos, error: pagosError } = await supabase
      .from('pagos')
      .select('id, rut, user_id, datos_facturacion, created_at')
      .eq('estado', 'completado')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (pagosError) {
      console.error('❌ Error obteniendo pagos:', pagosError.message)
      return
    }
    
    console.log(`📊 Encontrados ${pagos.length} pagos completados`)

    if (pagos.length === 0) {
      console.log('✅ No hay pagos para procesar')
      return
    }

    // 2. Verificar cuáles ya tienen reportes
    console.log('\n🔍 Verificando reportes existentes...')
    const pagosIds = pagos.map(p => p.id)
    
    const { data: reportesExistentes, error: reportesError } = await supabase
      .from('reportes_individuales')
      .select('pago_id')
      .in('pago_id', pagosIds)
    
    if (reportesError) {
      console.error('❌ Error verificando reportes:', reportesError.message)
      return
    }
    
    const idsConReporte = new Set(reportesExistentes.map(r => r.pago_id))
    const pagosSinReporte = pagos.filter(p => !idsConReporte.has(p.id))
    
    console.log(`📋 Pagos sin reporte: ${pagosSinReporte.length}`)

    // 3. Procesar cada pago sin reporte
    for (const pago of pagosSinReporte) {
      console.log(`\n📝 Procesando pago ID: ${pago.id}`)
      
      try {
        // Extraer rutCorredor de datos_facturacion
        let datosFacturacion
        try {
          datosFacturacion = typeof pago.datos_facturacion === 'string' 
            ? JSON.parse(pago.datos_facturacion) 
            : pago.datos_facturacion
        } catch (parseError) {
          console.log(`⚠️  Error parseando datos_facturacion en pago ${pago.id}`)
          continue
        }
        
        let rutCorredor = null
        
        // Buscar rutCorredor en items_carrito
        if (datosFacturacion?.items_carrito) {
          for (const item of datosFacturacion.items_carrito) {
            if (item.metadata?.rutCorredor) {
              rutCorredor = item.metadata.rutCorredor
              break
            }
          }
        }
        
        if (!rutCorredor) {
          console.log(`⚠️  No se encontró rutCorredor en pago ${pago.id}`)
          console.log(`   Estructura datos_facturacion:`, JSON.stringify(datosFacturacion, null, 2))
          continue
        }
        
        console.log(`🎯 RUT Corredor encontrado: ${rutCorredor}`)
        
        // 4. Verificar si el corredor existe
        const { data: corredores, error: correctorError } = await supabase
          .from('corredores')
          .select('id, rut, nombre')
          .eq('rut', rutCorredor)
          .limit(1)
        
        if (correctorError) {
          console.log(`❌ Error buscando corredor: ${correctorError.message}`)
          continue
        }
        
        if (!corredores || corredores.length === 0) {
          console.log(`❌ Corredor con RUT ${rutCorredor} no encontrado`)
          continue
        }
        
        const corredor = corredores[0]
        console.log(`👤 Corredor: ${corredor.nombre} (${corredor.rut})`)
        
        // 5. Generar datos del reporte
        const reporteData = {
          companias: [
            {
              rut: rutCorredor,
              nombre: corredor.nombre,
              ventas_periodo: 1,
              comision_total: 50000,
              fecha_ultimo_reporte: new Date().toISOString().split('T')[0]
            }
          ],
          resumen: {
            total_companias: 1,
            total_ventas: 1,
            comision_total: 50000,
            periodo: new Date().toISOString().split('T')[0]
          }
        }
        
        // 6. Insertar el reporte
        const { data: reporteResult, error: reporteError } = await supabase
          .from('reportes_individuales')
          .insert({
            user_id: pago.user_id,
            pago_id: pago.id,
            rut_corredor: rutCorredor,
            datos_reporte: reporteData
          })
          .select('id')
        
        if (reporteError) {
          console.error(`❌ Error creando reporte: ${reporteError.message}`)
          continue
        }
        
        console.log(`✅ Reporte generado con ID: ${reporteResult[0].id}`)
        
      } catch (error) {
        console.error(`❌ Error procesando pago ${pago.id}:`, error.message)
      }
    }
    
    console.log('\n🎉 Proceso completado')
    
  } catch (error) {
    console.error('❌ Error general:', error)
    console.error('Stack:', error.stack)
  }
}

if (require.main === module) {
  main().catch(console.error)
}