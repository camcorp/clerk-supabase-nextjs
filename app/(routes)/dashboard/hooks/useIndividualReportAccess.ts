'use client';

import { useSupabaseClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type ReportData = {
  reporte_id: string;
  rut: string;
  periodo: string;
  data: any;
  fecha_generacion: string;
  fecha_expiracion: string;
  pagos: {
    estado: string;
  };
};

/**
 * Hook para verificar si un usuario tiene acceso a un informe individual de corredor
 * @param userId ID del usuario de Clerk
 * @param rut RUT del corredor para el informe
 * @returns Objeto con datos del reporte, estado de carga y error
 */
export const useIndividualReportAccess = (userId: string, rut: string) => {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabaseClient();

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);

      try {
        // CORRECCIÓN: Cambiar de "reporte_individual" a "reportes_individuales"
        const { data: reportData, error: reportError } = await supabase
          .from("reportes_individuales")
          .select("id, rut, periodo, datos_reporte, fecha_generacion, fecha_expiracion")
          .eq("user_id", userId)
          .eq("rut", rut)
          .eq("activo", true)
          .gte("fecha_expiracion", new Date().toISOString())
          .single();

        if (reportError) {
          console.error("Error al obtener informe:", reportError.message);
          setError(reportError.message);
          setLoading(false);
          return;
        }

        // También cambiar "data" por "datos_reporte" para coincidir con la estructura
        const { data: paymentData, error: paymentError } = await supabase
          .from("pagos")
          .select("estado")
          .eq("user_id", userId)
          .eq("rut", rut)
          .eq("estado", "pagado")
          .order("fecha_creacion", { ascending: false })
          .limit(1);
          
        if (paymentError) {
          console.error("Error al obtener pago:", paymentError.message);
          setError(paymentError.message);
          setLoading(false);
          return;
        }

        // If we have both report and payment, set the report data
        if (reportData && paymentData && paymentData.length > 0) {
          const reportWithPayment = {
            reporte_id: reportData.id,
            rut: reportData.rut,
            periodo: reportData.periodo,
            data: reportData.datos_reporte, // Cambiar aquí también
            fecha_generacion: reportData.fecha_generacion,
            fecha_expiracion: reportData.fecha_expiracion,
            pagos: {
              estado: paymentData[0].estado
            }
          };
          setReport(reportWithPayment);
        } else {
          setReport(null);
        }
      } catch (err: any) {
        console.error("Error inesperado:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId && rut) {
      fetchReport();
    } else {
      setLoading(false);
    }
  }, [userId, rut, supabase]);

  return { report, loading, error, hasAccess: !!report };
};