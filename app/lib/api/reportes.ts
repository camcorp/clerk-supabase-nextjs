import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Tipos para el sistema de reportes
export interface Corredor {
  rut: string;
  nombre: string;
  telefono?: string;
  domicilio?: string;
  ciudad?: string;
  region?: number;
  tipo_persona?: string;
}

export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio_neto: number;
  precio_bruto: number;
  activo: boolean;
  fecha_creacion: string;
  iva: number;
  tipo_producto: string;
  duracion_dias: number;
}

export interface Pago {
  id: string;
  user_id: string;
  rut: string;
  producto_id: string;
  orden_comercio: string;
  amount: number;
  estado: string;
  fecha_creacion: Date;
  token?: string;
  url_pago?: string;
}

export interface Acceso {
  id: string;
  user_id: string;
  producto_id: string;
  modulo: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  activo: boolean;
}

export interface ReporteIndividual {
  id: string;
  user_id: string;
  rut: string;
  periodo: string;
  datos_reporte: any; // Cambiar de 'data' a 'datos_reporte'
  fecha_generacion: Date;
  fecha_expiracion: Date;
  activo: boolean;
}

// API para buscar corredores
export async function buscarCorredores(query: string): Promise<Corredor[]> {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Agregar logging para debugging
    console.log('Buscando corredores con query:', query);
    
    const { data, error } = await supabase
      .from('corredores')
      .select('rut, nombre, telefono, domicilio, ciudad, region, tipo_persona')
      .or(`rut.ilike.%${query}%,nombre.ilike.%${query}%`)
      .limit(20);

    if (error) {
      console.error('Error buscando corredores:', error);
      // Intentar con cliente anónimo si falla la autenticación
      const { createClient } = await import('@supabase/supabase-js');
      const anonSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: anonData, error: anonError } = await anonSupabase
        .from('corredores')
        .select('rut, nombre, telefono, domicilio, ciudad, region, tipo_persona')
        .or(`rut.ilike.%${query}%,nombre.ilike.%${query}%`)
        .limit(20);
      
      if (anonError) {
        console.error('Error con cliente anónimo:', anonError);
        return [];
      }
      
      return anonData || [];
    }

    console.log('Corredores encontrados:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error en buscarCorredores:', error);
    return [];
  }
}

// API para obtener corredor por RUT
export async function getCorredor(rut: string): Promise<Corredor | null> {
  try {
    const supabase = await createServerSupabaseClient();
    
    console.log('Buscando corredor con RUT:', rut);
    
    const { data, error } = await supabase
      .from('corredores')
      .select('rut, nombre, telefono, domicilio, ciudad, region, tipo_persona')
      .eq('rut', rut)
      .single();

    if (error) {
      console.error('Error obteniendo corredor con cliente autenticado:', error);
      // Usar cliente anónimo como fallback (igual que buscarCorredores)
      const { createClient } = await import('@supabase/supabase-js');
      const anonSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: anonData, error: anonError } = await anonSupabase
        .from('corredores')
        .select('rut, nombre, telefono, domicilio, ciudad, region, tipo_persona')
        .eq('rut', rut)
        .single();
      
      if (anonError) {
        console.error('Error con cliente anónimo:', anonError);
        return null;
      }
      
      console.log('✅ Corredor encontrado con cliente anónimo:', anonData?.nombre);
      return anonData;
    }

    console.log('✅ Corredor encontrado con cliente autenticado:', data?.nombre);
    return data;
  } catch (error) {
    console.error('Error en getCorredor:', error);
    return null;
  }
}

// API para obtener productos disponibles
export async function getProductos(): Promise<Producto[]> {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('nombre');

  if (error) {
    console.error('Error obteniendo productos:', error);
    return [];
  }

  return data || [];
}

// API para crear un producto (reporte de corredor)
export async function crearProductoReporte(): Promise<Producto | null> {
  const producto = {
    codigo: 'rp_001',
    nombre: 'Reporte Individual',
    descripcion: 'Reporte detallado de un corredor',
    precio_neto: 29990, // $29.990 CLP
    precio_bruto: 35688.10 // $35.688,10 CLP (con IVA)
  };

  const { data, error } = await supabaseAdmin
    .from('productos')
    .insert(producto)
    .select()
    .single();

  if (error) {
    console.error('Error creando producto:', error);
    return null;
  }

  return data;
}

// API para obtener datos del corredor desde las vistas
export async function getDatosCorredor(rut: string, periodo: string = '202412') {
  const supabase = await createServerSupabaseClient();
  
  try {
    // Obtener indicadores generales
    const { data: indicadores, error: errorIndicadores } = await supabase
      .from('indicadores_generales_corredor')
      .select('*')
      .eq('rut', rut)
      .eq('periodo', periodo)
      .single();

    if (errorIndicadores) {
      console.error('Error obteniendo indicadores:', errorIndicadores);
    }

    // Obtener datos de producción por compañía
    // Obtener datos de producción por compañía
    const { data: companias, error: errorCompanias } = await supabase
      .from('intercia')
      .select('rutcia, nombrecia, primaclp, primauf, grupo') // ← AQUÍ ESTÁ EL PROBLEMA
      .eq('rut', rut)
      .eq('periodo', periodo)
      .order('primaclp', { ascending: false })
      .limit(100);

    if (errorCompanias) {
      console.error('Error obteniendo compañías:', errorCompanias);
    }

    // Obtener datos de producción por ramo
    const { data: ramos, error: errorRamos } = await supabase
      .from('prodramo')
      .select('cod, primaclp, primauf, grupo')
      .eq('rut', rut)
      .eq('periodo', periodo)
      .order('primaclp', { ascending: false })
      .limit(100); // Limitar resultados

    if (errorRamos) {
      console.error('Error obteniendo ramos:', errorRamos);
    }

    // Obtener nombres de ramos
    const { data: nombresRamos, error: errorNombresRamos } = await supabase
      .from('ramos')
      .select('codigo, ramo');

    if (errorNombresRamos) {
      console.error('Error obteniendo nombres de ramos:', errorNombresRamos);
    }

    return {
      indicadores: indicadores || null,
      companias: companias || [],
      ramos: ramos || [],
      nombresRamos: nombresRamos || []
    };
  } catch (error) {
    console.error('Error general obteniendo datos del corredor:', error);
    return {
      indicadores: null,
      companias: [],
      ramos: [],
      nombresRamos: []
    };
  }
}



// API para verificar acceso a reporte
export async function verificarAccesoReporte(
  userId: string,
  rutCorredor: string,
  periodo?: string
): Promise<boolean> {
  const modulo = `reporte_corredor_${rutCorredor}`;
  
  console.log('🔍 Verificando acceso:', { userId, rutCorredor, modulo });
  
  // Cambiar de createServerSupabaseClient() a supabaseAdmin
  const { data, error } = await supabaseAdmin
    .from('accesos_usuarios')
    .select('*')
    .eq('user_id', userId)
    .eq('modulo', modulo)
    .eq('activo', true)
    .gte('fecha_fin', new Date().toISOString());

  console.log('📊 Resultado verificación:', { data, error });

  if (error) {
    console.error('Error verificando acceso:', error);
    return false;
  }

  return !!(data && data.length > 0);
}



export async function obtenerReportesComprados(userId: string) {
  console.log('=== DEBUG obtenerReportesComprados ===');
  console.log('userId recibido:', userId);
  
  try {
    // Primero verificar que tenemos accesos
    const { data: accesos, error: errorAccesos } = await supabaseAdmin
      .from('accesos_usuarios')
      .select(`
        id,
        user_id,
        modulo,
        fecha_inicio,
        fecha_fin,
        activo,
        producto_id,
        productos!inner(
          id,
          codigo,
          nombre
        )
      `)
      .eq('user_id', userId)
      .eq('productos.codigo', 'rp_001')
      .eq('activo', true)
      .order('fecha_inicio', { ascending: false });

    console.log('Consulta accesos - Error:', errorAccesos);
    console.log('Consulta accesos - Datos:', accesos);
    
    if (errorAccesos) {
      console.error('Error obteniendo accesos:', errorAccesos);
      return [];
    }

    if (!accesos || accesos.length === 0) {
      console.log('No se encontraron accesos para el usuario:', userId);
      return [];
    }

    console.log(`Encontrados ${accesos.length} accesos para usuario ${userId}`);

    // Para cada acceso, extraemos el RUT del módulo y obtenemos el reporte
    const reportesConCorredores = await Promise.all(
      accesos.map(async (acceso) => {
        try {
          // El módulo tiene formato 'reporte_corredor_{rut}'
          const rutMatch = acceso.modulo.match(/reporte_corredor_(.+)/);
          if (!rutMatch) {
            console.warn('Formato de módulo inválido:', acceso.modulo);
            return null;
          }
          
          const rut = rutMatch[1];
          console.log(`Procesando acceso para RUT: ${rut}`);
          
          // Obtener información del corredor
          const { data: corredor, error: errorCorredor } = await supabaseAdmin
            .from('corredores')
            .select('rut, nombre')
            .eq('rut', rut)
            .single();

          if (errorCorredor || !corredor) {
            console.warn(`Corredor no encontrado para RUT: ${rut}`, errorCorredor);
            return null;
          }

          // Buscar el reporte individual correspondiente
          console.log(`Buscando reporte para userId: ${userId}, rut: ${rut}`);
          const { data: reporte, error: reporteError } = await supabaseAdmin
            .from('reportes_individuales')
            .select('periodo, fecha_generacion')
            .eq('user_id', userId)
            .eq('rut', rut)
            .eq('activo', true)
            .order('fecha_generacion', { ascending: false })
            .limit(1)
            .maybeSingle();

          console.log(`Reporte para RUT ${rut} - Error:`, reporteError);
          console.log(`Reporte para RUT ${rut} - Datos:`, reporte);

          if (reporteError) {
            console.warn(`Error obteniendo reporte para RUT ${rut}:`, reporteError);
          }

          const ahora = new Date();
          const fechaFin = new Date(acceso.fecha_fin);
          const activo = fechaFin > ahora && acceso.activo;

          return {
            rut: rut,
            nombre: corredor.nombre,
            periodo: reporte?.periodo || '202412',
            fecha_compra: acceso.fecha_inicio,
            fecha_expiracion: acceso.fecha_fin,
            activo,
            reporte_disponible: !!reporte
          };
        } catch (error) {
          console.error(`Error procesando acceso:`, error);
          return null;
        }
      })
    );

    // Filtrar reportes nulos y retornar
    const reportesValidos = reportesConCorredores.filter(reporte => reporte !== null);
    console.log(`Retornando ${reportesValidos.length} reportes válidos`);
    
    return reportesValidos;
  } catch (error) {
    console.error('Error obteniendo reportes comprados:', error);
    return [];
  }
}

// API para obtener reporte existente
export async function getReporteIndividual(
  userId: string,
  rutCorredor: string,
  periodo: string = '202412'
): Promise<ReporteIndividual | null> {
  console.log('🔍 Consultando reportes_individuales con parámetros:', {
    userId,
    rutCorredor,
    periodo
  });

  // Usar supabaseAdmin para bypasear RLS
  const { data, error } = await supabaseAdmin
    .from('reportes_individuales')
    .select('*')
    .eq('user_id', userId)
    .eq('rut', rutCorredor)
    .eq('periodo', periodo)
    .eq('activo', true)
    .gte('fecha_expiracion', new Date().toISOString())
    .order('fecha_generacion', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('❌ Error obteniendo reporte individual:', error);
    return null;
  }

  // LOG DETALLADO: Mostrar exactamente lo que se recibe de la base de datos
  console.log('📊 DATOS RAW de reportes_individuales:');
  console.log('📊 ID:', data.id);
  console.log('📊 USER_ID:', data.user_id);
  console.log('📊 RUT:', data.rut);
  console.log('📊 PERIODO:', data.periodo);
  console.log('📊 DATOS_REPORTE (estructura completa):');
  console.log(JSON.stringify(data.datos_reporte, null, 2));
  
  // Verificar específicamente las compañías y sus series históricas
  if (data.datos_reporte?.companias) {
    console.log('📊 COMPANIAS encontradas:', data.datos_reporte.companias.length);
    
    // ❌ ELIMINAR ESTA LÍNEA PROBLEMÁTICA:
    // const companiasConSeriesValidas = useSeriesHistoricasAgrupadas(data.datos_reporte.companias);
    
    // ✅ REEMPLAZAR CON LOGGING SIMPLE:
    console.log('📊 Compañías disponibles:', data.datos_reporte.companias.length);
    
    data.datos_reporte.companias.forEach((compania: any, index: number) => {
      console.log(`📊 Compañía ${index + 1}:`, {
        rutcia: compania.rutcia,
        nombrecia: compania.nombrecia,
        prima_clp: compania.prima_clp,
        prima_uf: compania.prima_uf,
        tiene_series_historicas: !!compania.series_historicas,
        cantidad_series: compania.series_historicas?.length || 0
      });
      
      if (compania.series_historicas && compania.series_historicas.length > 0) {
        console.log(`📊 Series históricas de ${compania.nombrecia}:`);
        compania.series_historicas.forEach((serie: any, serieIndex: number) => {
          console.log(`   Serie ${serieIndex + 1}:`, {
            periodo: serie.periodo,
            prima_clp: serie.prima_clp,
            prima_uf: serie.prima_uf
          });
        });
      } else {
        console.log(`❌ ${compania.nombrecia} NO tiene series_historicas`);
      }
    });
  } else {
    console.log('❌ NO se encontró array de compañias en datos_reporte');
  }

  // Los datos ya están completos en reportes_individuales, no necesitamos consultar intercia
  return data;
}

// API para obtener un reporte individual por ID
export async function obtenerReporteIndividual(userId: string, reporteId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('reportes_individuales')
      .select('*')
      .eq('id', reporteId)
      .eq('user_id', userId)
      .eq('activo', true)
      .single();

    if (error) {
      console.error('Error obteniendo reporte individual:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error obteniendo reporte individual:', error);
    return null;
  }
}



// Función principal para comprar reporte
export async function comprarReporte(
  userId: string,
  rutCorredor: string,
  periodo: string = '202412'
) {
  try {
    console.log('Iniciando compra de reporte:', { userId, rutCorredor, periodo });
    
    // 1. Verificar que el corredor existe
    const corredor = await getCorredor(rutCorredor);
    if (!corredor) {
      throw new Error('Corredor no encontrado');
    }
    console.log('Corredor encontrado:', corredor.nombre);

    // 2. Obtener el producto (debe existir como maestro)
    const producto = await getProductoPorCodigo('rp_001');
    if (!producto) {
      throw new Error('Producto requerido no disponible. Contacte al administrador.');
    }
    console.log('Producto obtenido:', producto.codigo);

    // 3. Simular el pago
    const pago = await simularPago(userId, rutCorredor, producto.id);
    if (!pago) {
      throw new Error('Error simulando pago');
    }
    console.log('Pago simulado exitosamente:', pago.id);

    // 4. Crear acceso
    const acceso = await crearAcceso(userId, producto.id, `reporte_corredor_${rutCorredor}`);
    if (!acceso) {
      throw new Error('Error creando acceso');
    }
    console.log('Acceso creado:', acceso.id);

    // 5. Generar reporte individual
    // En la función comprarReporte (líneas 520-540)
    const reporte = await generarReporteIndividual(userId, rutCorredor, periodo);
    if (!reporte) {
    throw new Error('Error generando reporte individual');
    }
    console.log('Reporte generado:', reporte.id);

    return {
      success: true,
      corredor,
      pago,
      acceso,
      reporte,
      url_reporte: `/dashboard/reportes/${reporte.id}`
    };
  } catch (error) {
    console.error('Error en comprarReporte:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

// Función para obtener producto por código
export async function getProductoPorCodigo(codigo: string): Promise<Producto | null> {
  const { data, error } = await supabaseAdmin
    .from('productos')
    .select('*')
    .eq('codigo', codigo)
    .single();

  if (error) {
    console.error('Error obteniendo producto por código:', error);
    console.error('Detalles del error:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    return null;
  }

  return data;
}

// Función para simular pago (actualizada)
export async function simularPago(
  userId: string,
  rutCorredor: string,
  productoId: string
): Promise<Pago | null> {
  try {
    const ordenComercio = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const flowToken = `TOKEN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const flowOrder = Math.floor(Math.random() * 1000000);
    const flowPaymentId = `PAY_${Date.now()}`;
    
    // 1. Crear registro en pagos (actualizado con campos Flow)
    const pago = {
      user_id: userId,
      rut: rutCorredor,
      producto_id: productoId,
      orden_comercio: ordenComercio,
      amount: 35688, // Precio bruto con IVA
      estado: 'completed',
      metodo_pago: 'flow',
      flow_token: flowToken,
      flow_order: flowOrder,
      flow_payment_id: flowPaymentId,
      flow_status: 'completed',
      flow_subject: 'Reporte Individual Corredor',
      flow_currency: 'CLP',
      flow_payer_email: 'usuario@ejemplo.com', // En producción obtener del usuario
      fecha_creacion: new Date().toISOString()
    };

    const { data: pagoData, error: pagoError } = await supabaseAdmin
      .from('pagos')
      .insert(pago)
      .select()
      .single();

    if (pagoError) {
      console.error('Error creando pago:', pagoError);
      return null;
    }

    // 2. Crear registro de auditoría en transacciones_flow
    const transaccionFlow = {
      pago_id: pagoData.id,
      flow_token: flowToken,
      flow_order: flowOrder,
      flow_payment_id: flowPaymentId,
      flow_status: 'completed',
      flow_amount: 35688,
      flow_currency: 'CLP',
      flow_payer_email: 'usuario@ejemplo.com',
      flow_payment_date: new Date().toISOString(),
      flow_confirmation_date: new Date().toISOString(),
      flow_raw_response: {
        status: 'completed',
        amount: 35688,
        currency: 'CLP',
        simulation: true
      }
    };

    const { error: transaccionError } = await supabaseAdmin
      .from('transacciones_flow')
      .insert(transaccionFlow);

    if (transaccionError) {
      console.error('Error creando transacción Flow:', transaccionError);
      // No fallar el pago por esto, solo logear
    }

    return pagoData;
  } catch (error) {
    console.error('Error en simularPago:', error);
    return null;
  }
}

// Función para crear acceso (actualizada para usar accesos_usuarios)
export async function crearAcceso(
  userId: string,
  productoId: string,
  modulo: string
): Promise<Acceso | null> {
  try {
    const fechaInicio = new Date();
    const fechaFin = new Date();
    fechaFin.setFullYear(fechaFin.getFullYear() + 1); // Acceso por 1 año según esquema

    const acceso = {
      user_id: userId,
      producto_id: productoId,
      modulo,
      fecha_inicio: fechaInicio.toISOString(),
      fecha_fin: fechaFin.toISOString(),
      activo: true
    };

    const { data, error } = await supabaseAdmin
      .from('accesos_usuarios') // Tabla correcta según esquema
      .insert(acceso)
      .select()
      .single();

    if (error) {
      console.error('Error creando acceso:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error en crearAcceso:', error);
    return null;
  }
}

// Función para generar reporte individual (actualizada)
export async function generarReporteIndividual(
  userId: string,
  rutCorredor: string,
  periodo: string = '202412'
): Promise<ReporteIndividual | null> {
  try {
    const fechaExpiracion = new Date();
    fechaExpiracion.setMonth(fechaExpiracion.getMonth() + 3);
    
    // Generar datos completos del reporte
    const datosCompletos = await generarDatosReporteCompleto(rutCorredor, periodo);
    
    if (!datosCompletos) {
      throw new Error('No se pudieron generar los datos del reporte');
    }
    
    const reporte = {
      user_id: userId,
      rut: rutCorredor,
      periodo: periodo,
      datos_reporte: datosCompletos, // Usar datos completos
      fecha_generacion: new Date().toISOString(),
      fecha_expiracion: fechaExpiracion.toISOString(),
      activo: true
    };
    
    const { data, error } = await supabaseAdmin
      .from('reportes_individuales')
      .insert(reporte)
      .select()
      .single();

    if (error) {
      console.error('Error generando reporte:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error en generarReporteIndividual:', error);
    return null;
  }
}

// Función para generar datos completos del reporte
export async function generarDatosReporteCompleto(
  rutCorredor: string,
  periodo: string = '202412'
) {
  try {
    // 1. Obtener datos de producción del corredor
    const { data: produccionData, error } = await supabaseAdmin
      .from('produccion_ramos')
      .select(`
        *,
        companias!inner(*),
        ramos!inner(*)
      `)
      .eq('rut', rutCorredor)
      .eq('periodo', periodo);

    if (error) throw error;

    // 2. Obtener series históricas (últimos 11 períodos)
    const periodosHistoricos = generarPeriodosHistoricos(periodo, 11);
    
    const { data: seriesHistoricas } = await supabaseAdmin
      .from('produccion_ramos')
      .select('*')
      .eq('rut', rutCorredor)
      .in('periodo', periodosHistoricos)
      .order('periodo', { ascending: false });

    // 3. Construir estructura de compañías con series históricas
    const companias = construirCompaniasConSeries(
      produccionData,
      seriesHistoricas
    );

    // 4. Construir estructura completa
    return {
      corredor: await getCorredor(rutCorredor),
      periodo,
      indicadores: null,
      companias,
      ramos: construirRamos(produccionData),
      nombresRamos: await obtenerNombresRamos()
    };
  } catch (error) {
    console.error('Error generando datos completos:', error);
    return null;
  }
}

// Función auxiliar para construir compañías con series históricas
function construirCompaniasConSeries(produccionActual: any[], seriesHistoricas: any[]) {
  const companiasPorRut = new Map();
  
  // Calcular totales para participación
  const totalPrimaClp = produccionActual.reduce((sum, item) => sum + (item.prima_clp || 0), 0);
  
  // Agrupar por compañía
  produccionActual.forEach(item => {
    const rutcia = item.rutcia;
    if (!companiasPorRut.has(rutcia)) {
      companiasPorRut.set(rutcia, {
        grupo: item.grupo || "1",
        rutcia,
        nombrecia: item.companias?.nombre || 'Sin nombre',
        primauf: 0,
        primaclp: 0,
        participacion: 0,
        crecimiento: 0,
        ranking_corredor: 0,
        series_historicas: []
      });
    }
    
    const compania = companiasPorRut.get(rutcia);
    compania.primauf += item.prima_uf || 0;
    compania.primaclp += item.prima_clp || 0;
  });
  
  // Agregar series históricas ANTES de crear el array final
  companiasPorRut.forEach((compania, rutcia) => {
    const seriesCompania = seriesHistoricas
      .filter(item => item.rutcia === rutcia)
      .reduce((acc, item) => {
        const periodo = item.periodo;
        if (!acc[periodo]) {
          acc[periodo] = { 
            periodo, 
            prima_uf: 0,  // Cambiado de primauf a prima_uf
            prima_clp: 0  // Cambiado de primaclp a prima_clp
          };
        }
        acc[periodo].prima_uf += item.prima_uf || 0;  // Cambiado
        acc[periodo].prima_clp += item.prima_clp || 0; // Cambiado
        return acc;
      }, {});
    
    compania.series_historicas = Object.values(seriesCompania)
      .sort((a: any, b: any) => b.periodo.localeCompare(a.periodo));
    
    // Calcular crecimiento basado en series históricas
    if (compania.series_historicas.length >= 2) {
      const actual = compania.series_historicas[0]?.prima_clp || 0;  // Cambiado
      const anterior = compania.series_historicas[1]?.prima_clp || 0; // Cambiado
      if (anterior > 0) {
        compania.crecimiento = ((actual - anterior) / anterior) * 100;
      }
    }
  });
  
  // Crear array final DESPUÉS de procesar las series históricas
  const companiasArray = Array.from(companiasPorRut.values());
  
  // Calcular participación
  companiasArray.forEach(compania => {
    if (totalPrimaClp > 0) {
      compania.participacion = (compania.primaclp / totalPrimaClp) * 100;
    }
  });
  
  // Ordenar por prima CLP para ranking
  companiasArray.sort((a, b) => b.primaclp - a.primaclp);
  companiasArray.forEach((compania, index) => {
    compania.ranking_corredor = index + 1;
  });
  
  return companiasArray;
}

// Función auxiliar para generar períodos históricos
function generarPeriodosHistoricos(periodoActual: string, cantidad: number): string[] {
  const año = parseInt(periodoActual.substring(0, 4));
  const mes = parseInt(periodoActual.substring(4, 6));
  const periodos = [];
  
  for (let i = 0; i < cantidad; i++) {
    const fechaCalculo = new Date(año, mes - 1 - i, 1);
    const añoCalc = fechaCalculo.getFullYear();
    const mesCalc = fechaCalculo.getMonth() + 1;
    periodos.push(`${añoCalc}${mesCalc.toString().padStart(2, '0')}`);
  }
  
  return periodos;
}

// Función auxiliar para construir ramos
function construirRamos(produccionData: any[]) {
  const ramosPorCodigo = new Map();
  
  produccionData.forEach(item => {
    const codigo = item.ramos?.codigo || item.cod;
    if (!ramosPorCodigo.has(codigo)) {
      ramosPorCodigo.set(codigo, {
        cod: codigo,
        primaclp: 0,
        primauf: 0,
        grupo: item.grupo || "1",
        nombre: item.ramos?.ramo || 'Sin nombre'
      });
    }
    
    const ramo = ramosPorCodigo.get(codigo);
    ramo.primaclp += item.prima_clp || 0;
    ramo.primauf += item.prima_uf || 0;
  });
  
  return Array.from(ramosPorCodigo.values())
    .sort((a, b) => b.primaclp - a.primaclp);
}

// Función auxiliar para obtener nombres de ramos
async function obtenerNombresRamos() {
  try {
    const { data, error } = await supabaseAdmin
      .from('ramos')
      .select('codigo, ramo');
    
    if (error) {
      console.error('Error obteniendo nombres de ramos:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error en obtenerNombresRamos:', error);
    return [];
  }
}

