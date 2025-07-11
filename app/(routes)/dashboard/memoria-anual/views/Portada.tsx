import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { DollarSign, Building2, TrendingUp, BarChart3 } from 'lucide-react';
import SummaryCard from '@/components/ui/charts/SummaryCard';
import MaMemoriaCard from '@/components/ui/charts/MaMemoriaCard';
// Import centralized utilities
import { formatUF, formatNumber } from '@/lib/utils/formatters';
import { colors } from '@/lib/utils/colors';
import { inter } from '../fonts';

interface PortadaProps {
  selectedPeriodo: string;
}

// Actualizar la interfaz MarketSummary:
interface MarketSummary {
  totalPrimaMercado: number;     // ← AGREGAR esta línea
  totalCompanias: number;
  totalCorredores: number;       // ← AGREGAR esta línea también
  totalRamos: number;
  crecimientoMercado: number;
  crecimientoCompanias: number;
  crecimientoRamos: number;
}

export default function Portada({ selectedPeriodo }: PortadaProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Actualizar el estado inicial (líneas 29-35):
  const [summary, setSummary] = useState<MarketSummary>({
    totalPrimaMercado: 0,
    totalCompanias: 0,
    totalCorredores: 0,
    totalRamos: 0,
    crecimientoMercado: 0,
    crecimientoCompanias: 0,    // ← AGREGAR
    crecimientoRamos: 0         // ← AGREGAR
  });

  useEffect(() => {
    const loadMarketSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading data for period:', selectedPeriodo);

        // Fetch market summary data
        const { data: mercadoData, error: mercadoError } = await supabase
          .from('vista_mercado_periodo')
          .select('total_primauf')
          .eq('periodo', selectedPeriodo)
          .single();

        if (mercadoError) {
          console.error('Error fetching mercado data:', mercadoError);
          throw new Error(`Error en vista_mercado_periodo: ${mercadoError.message}`);
        }
        
        console.log('Mercado data:', mercadoData);

        // Fetch companies count
        const { data: companiasData, error: companiasError } = await supabase
          .from('vista_companias_periodo')
          .select('rutcia', { count: 'exact' })
          .eq('periodo', selectedPeriodo);

        if (companiasError) {
          console.error('Error fetching companias data:', companiasError);
          throw new Error(`Error en vista_companias_periodo: ${companiasError.message}`);
        }
        
        // Fetch companies count for previous year
        const previousYear = (parseInt(selectedPeriodo.substring(0, 4)) - 1).toString() + selectedPeriodo.substring(4);
        const { data: companiasDataPrev, error: companiasErrorPrev } = await supabase
          .from('vista_companias_periodo')
          .select('rutcia', { count: 'exact' })
          .eq('periodo', previousYear);

        // Fetch brokers count - vista_corredores_periodo already has the count
        const { data: corredoresData, error: corredoresError } = await supabase
          .from('vista_corredores_periodo')
          .select('num_corredores')
          .eq('periodo', selectedPeriodo)
          .single();

        if (corredoresError) throw corredoresError;

        // Fetch branches count
        const { data: ramosData, error: ramosError } = await supabase
          .from('vista_ramos_periodo')
          .select('ramo', { count: 'exact' })
          .eq('periodo', selectedPeriodo);

        if (ramosError) throw ramosError;

        // Fetch branches count for previous year
        const { data: ramosDataPrev, error: ramosErrorPrev } = await supabase
          .from('vista_ramos_periodo')
          .select('ramo', { count: 'exact' })
          .eq('periodo', previousYear);

        // Calculate growth (comparing with previous period)
        const currentYear = parseInt(selectedPeriodo);
        const previousPeriodo = (currentYear - 1).toString();
        
        const { data: previousMercadoData, error: previousMercadoError } = await supabase
          .from('vista_mercado_periodo')
          .select('total_primauf')
          .eq('periodo', previousPeriodo)
          .single();

        let crecimiento = 0;
        if (!previousMercadoError && previousMercadoData && previousMercadoData.total_primauf > 0) {
          crecimiento = ((mercadoData.total_primauf - previousMercadoData.total_primauf) / previousMercadoData.total_primauf) * 100;
        }

        // Calculate year-over-year changes
        const totalCompanias = companiasData?.length || 0;
        const totalCompaniasPrev = companiasDataPrev?.length || 0;
        const crecimientoCompanias = totalCompaniasPrev > 0 ? ((totalCompanias - totalCompaniasPrev) / totalCompaniasPrev) * 100 : 0;

        const totalRamos = ramosData?.length || 0;
        const totalRamosPrev = ramosDataPrev?.length || 0;
        const crecimientoRamos = totalRamosPrev > 0 ? ((totalRamos - totalRamosPrev) / totalRamosPrev) * 100 : 0;

        // Corregir línea 129 - cambiar 'crecimiento' por 'crecimientoMercado':
        setSummary({
          totalPrimaMercado: mercadoData.total_primauf || 0,
          totalCompanias: totalCompanias,
          totalCorredores: corredoresData?.num_corredores || 0,
          totalRamos: totalRamos,
          crecimientoMercado: crecimiento,
          crecimientoCompanias: crecimientoCompanias,
          crecimientoRamos: crecimientoRamos
        });
      } catch (err) {
        console.error('Error loading market summary:', err);
        setError(`Error al cargar el resumen del mercado: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      } finally {
        setLoading(false);
      }
    };

    if (selectedPeriodo) {
      loadMarketSummary();
    }
  }, [selectedPeriodo]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary.deepBlue }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p style={{ color: colors.accent.alert }}>{error}</p>
      </div>
    );
  }
  
  return (
    <div className={`space-y-8 ${inter.className}`}>
      <div className="bg-white p-6 rounded-xl shadow-sm border" style={{ borderColor: colors.neutral.lightGray }}>
        <h2 className="text-xl font-semibold mb-6" style={{ color: colors.primary.deepBlue }}>Resumen del Mercado Asegurador</h2>
        <p className="mb-4" style={{ color: colors.neutral.mediumGray }}>
          Bienvenido a la Memoria Anual del Mercado Asegurador para el período {selectedPeriodo}. 
          Este informe proporciona una visión general del estado del mercado de seguros en Chile.
        </p>
        <p className="mb-6" style={{ color: colors.neutral.mediumGray }}>
          Explore las diferentes secciones para obtener información detallada sobre compañías, ramos y corredores.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard 
            title="Prima Total" 
            value={formatUF(summary.totalPrimaMercado, 0)}
            subtitle="Prima total del mercado"
            icon={<DollarSign className="h-5 w-5" style={{ color: colors.accent.info }} />}
            trend={summary.crecimientoMercado}
          />
          
          <SummaryCard 
            title="Compañías" 
            value={formatNumber(summary.totalCompanias, 0)}
            subtitle="Compañías activas"
            trend={summary.crecimientoCompanias}
            icon={<Building2 className="h-5 w-5" style={{ color: colors.accent.success }} />}
          />
          
          <SummaryCard 
            title="Ramos" 
            value={formatNumber(summary.totalRamos, 0)}
            subtitle="Ramos disponibles"
            trend={summary.crecimientoRamos}
            icon={<BarChart3 className="h-5 w-5" style={{ color: colors.accent.warning }} />}
          />
        </div>
      </div>
      
      {/* Estructura de la Memoria Anual - MOVED FROM DASHBOARD */}
      <MaMemoriaCard 
        title="Estructura de la Memoria Anual"
        sections={[
          {
            title: "1. Portada y Presentación",
            items: [
              "Título: \"Memoria Anual de Corredores de Seguros de Chile [AÑO]\"",
              "Logo y elementos de identidad visual",
              "Fecha de publicación"
            ]
          },
          {
            title: "2. Índice de Contenidos",
            items: []
          },
          {
            title: "3. Introducción",
            items: [
              "Objetivo de la memoria anual",
              "Metodología y fuentes de información",
              "Contexto del mercado asegurador chileno"
            ]
          }
        ]}
      />
      
      <div className="bg-white p-6 rounded-xl shadow-sm border" style={{ borderColor: colors.neutral.lightGray }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: colors.primary.deepBlue }}>Acerca de la Memoria Anual</h2>
        <p className="mb-3" style={{ color: colors.neutral.mediumGray }}>
          La Memoria Anual del Mercado Asegurador es un informe completo que analiza el desempeño y las tendencias 
          del sector de seguros en Chile durante el período {selectedPeriodo}.
        </p>
        <p className="mb-3" style={{ color: colors.neutral.mediumGray }}>
          Este informe incluye análisis detallados de las compañías aseguradoras, los ramos de seguros 
          y los corredores que operan en el mercado chileno.
        </p>
        <p style={{ color: colors.neutral.mediumGray }}>
          Utilice la navegación superior para explorar las diferentes secciones del informe y obtener 
          información específica sobre cada aspecto del mercado asegurador.
        </p>
      </div>
    </div>
  );
}


interface Summary {
  totalPrimaMercado: number;
  totalCompanias: number;
  totalCorredores: number;
  totalRamos: number;
  crecimiento: number;
  crecimientoCompanias: number;
  crecimientoRamos: number;
}