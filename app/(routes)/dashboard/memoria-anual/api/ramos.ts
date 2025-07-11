'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Implementar paginación
export const getRamosData = async (periodo: string, page = 0, pageSize = 50) => {
  try {
    // Crear cliente Supabase usando cookies para autenticación con await
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    // Verificar si hay una sesión activa
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('Estado de sesión:', sessionData?.session ? 'Activa' : 'Inactiva');
    
    // Realizar la consulta con paginación
    const { data, error } = await supabase
      .from("vista_ramos_periodo")
      .select("*")
      .eq("periodo", periodo)
      .order('ramo', { ascending: true })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Error detallado al obtener datos de ramos:", {
        mensaje: error.message,
        codigo: error.code,
        detalles: error.details,
        hint: error.hint
      });
      return [];
    }

    // Verificar los datos recibidos para depuración
    console.log("Datos recibidos de vista_ramos_periodo:", data?.length || 0, "registros");
    
    // Transformar los datos para mantener la compatibilidad con el componente
    return data?.map(item => {
      // Convertir explícitamente los valores a números
      const total_primauf = typeof item.total_primauf === 'string' ? parseFloat(item.total_primauf) : Number(item.total_primauf || 0);
      const total_primaclp = typeof item.total_primaclp === 'string' ? parseFloat(item.total_primaclp) : Number(item.total_primaclp || 0);
      const participacion_clp = typeof item.participacion_clp === 'string' ? parseFloat(item.participacion_clp) : Number(item.participacion_clp || 0);
      const crecimiento_clp = typeof item.crecimiento_clp === 'string' ? parseFloat(item.crecimiento_clp) : Number(item.crecimiento_clp || 0);
      
      return {
        ...item,
        id: item.cod, // Usar solo el código como ID
        grupo: item.grupo,   
        subgrupo: item.subgrupo,
        nombre: item.ramo,
        total_clp: total_primaclp,
        total_primauf,
        total_uf: total_primauf,
        total_primaclp,
        participacion_clp,
        crecimiento_clp
      };
    }) || [];
  } catch (err) {
    console.error("Error general al obtener datos de ramos:", err);
    return [];
  }
};