'use client';

import { useSupabaseClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

/**
 * Hook para verificar si un usuario tiene acceso a un módulo específico
 * @param userId ID del usuario de Clerk
 * @param modulo Nombre del módulo a verificar (ej: 'corredores')
 * @returns Objeto con estado de acceso y carga
 */
export const useAccessCheck = (userId: string, modulo: string) => {
  const [hasAccess, setHasAccess] = useState(true); // Cambiado a true para pruebas
  const [loading, setLoading] = useState(false); // Cambiado a false para evitar carga
  const supabase = useSupabaseClient();

  // Comentado temporalmente para pruebas
  /*
  useEffect(() => {
    const checkAccess = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("accesos")
        .select("id")
        .eq("user_id", userId)
        .eq("modulo", modulo)
        .eq("activo", true)
        .lte("fecha_inicio", new Date().toISOString())
        .gte("fecha_fin", new Date().toISOString());

      if (error) {
        console.error("Error al verificar acceso:", error.message);
        setLoading(false);
        return;
      }

      setHasAccess(data && data.length > 0);
      setLoading(false);
    };

    if (userId) {
      checkAccess();
    } else {
      setLoading(false);
    }
  }, [userId, modulo, supabase]);
  */

  return { hasAccess, loading };
};