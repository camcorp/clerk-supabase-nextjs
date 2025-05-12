'use client';

import { useState, useEffect } from 'react';
import { useSupabaseClient } from '../../../../lib/supabase-client';
import { usePeriod } from '../context/PeriodContext';
import DataTable from '../components/DataTable';
import SummaryCard from '../components/SummaryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import NoData from '../components/NoData';
import SearchInput from '../components/SearchInput';
import { formatUF, formatCLP, formatNumber } from '../utils/formatters';

// Definir la interfaz para los datos de compañías
interface Compania {
  id: number;
  nombrecia: string;
  primauf: number;
  primaclp?: number;
  periodo: string;
}

// Definir la interfaz para las estadísticas de resumen
interface Summary {
  totalPrimauf: number;
  totalPrimaclp: number;
  companyCount: number;
  growth: number | null;
}

export default function CompaniasView() {
  const [companias, setCompanias] = useState<Compania[]>([]);
  const [filteredCompanias, setFilteredCompanias] = useState<Compania[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState<Summary>({
    totalPrimauf: 0,
    totalPrimaclp: 0,
    companyCount: 0,
    growth: null
  });
  
  // Obtener el cliente de Supabase
  const supabase = useSupabaseClient();
  
  // Usar el contexto de período global
  const { selectedPeriodo, periodos } = usePeriod();
  
  // Load companies for the selected period
  useEffect(() => {
    async function loadCompanias() {
      if (!selectedPeriodo) return;
      
      try {
        setLoading(true);
        
        // Realizar la consulta a Supabase usando la vista correcta
        const { data, error } = await supabase
          .from('vista_companias_periodo')
          .select('nombrecia, total_primaclp, total_primauf, periodo')
          .eq('periodo', selectedPeriodo)
          .order('nombrecia', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        // Transformar los datos al formato esperado
        const transformedData = data?.map((item, index) => ({
          id: index, // Usar índice como ID ya que no hay ID explícito
          nombrecia: item.nombrecia,
          primauf: item.total_primauf,
          primaclp: item.total_primaclp,
          periodo: item.periodo
        })) || [];
        
        // Actualizar el estado con los datos transformados
        setCompanias(transformedData);
        setFilteredCompanias(transformedData);
        
        // Calculate summary statistics
        if (data) {
          const totalPrimauf = data.reduce((sum, company) => sum + (company.total_primauf || 0), 0);
          const companyCount = data.length;
          const totalPrimaclp = data.reduce((sum, company) => sum + (company.total_primaclp || 0), 0);
          
          // Get previous period data for growth calculation
          const periodIndex = periodos.indexOf(selectedPeriodo);
          let growth = null;
          
          if (periodIndex < periodos.length - 1) {
            const prevPeriod = periodos[periodIndex + 1];
            const { data: prevData, error: prevError } = await supabase
              .from('vista_companias_periodo')
              .select('total_uf')
              .eq('periodo', prevPeriod);
              
            if (!prevError && prevData) {
              const prevTotalPrimauf = prevData.reduce((sum, company) => sum + (company.total_uf || 0), 0);
              if (prevTotalPrimauf > 0) {
                growth = ((totalPrimauf - prevTotalPrimauf) / prevTotalPrimauf) * 100;
              }
            }
          }
          
          setSummary({
            totalPrimauf,
            totalPrimaclp,
            companyCount,
            growth
          });
        }
      } catch (err) {
        console.error('Error al cargar compañías:', err);
        setError('No se pudieron cargar las compañías. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    }
    
    loadCompanias();
  }, [supabase, selectedPeriodo, periodos]);
  
  // Filtrar compañías cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCompanias(companias);
    } else {
      const filtered = companias.filter(compania =>
        compania.nombrecia.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCompanias(filtered);
    }
  }, [searchTerm, companias]);
  
  // Definir las columnas para la tabla
  const columns = [
    {
      header: 'Compañía',
      accessor: 'nombrecia' as keyof Compania,
      isSortable: true
    },
    {
      header: 'Prima UF',
      accessor: 'primauf' as keyof Compania,
      isSortable: true,
      isNumeric: true,
      cell: (value: number) => formatUF(value, 2, true)
    },
    {
      header: 'Prima CLP (Miles)',
      accessor: 'primaclp' as keyof Compania,
      isSortable: true,
      isNumeric: true,
      cell: (value: number) => formatCLP(value)
    }
  ];
  
  // Formatear números para mostrar en las tarjetas de resumen
  const formatNumberValue = (value: number) => {
    return formatNumber(value);
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <NoData message={error} />;
  }
  
  return (
    <div className="space-y-6 font-inter">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Total Prima UF"
          value={formatNumberValue(summary.totalPrimauf)}
          subtitle="Total de primas en UF"
          trend={summary.growth ?? undefined}
          trendLabel="vs periodo anterior"
        />
        <SummaryCard
          title="Total Prima CLP"
          value={formatNumber(summary.totalPrimaclp)}
          subtitle="Total de primas en miles de CLP"
        />
        <SummaryCard
          title="Compañías"
          value={summary.companyCount.toString()}
          subtitle="Número de compañías activas"
        />
      </div>
      
      {/* Search and Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <SearchInput
            placeholder="Buscar compañía..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        
        <DataTable
          columns={columns}
          data={filteredCompanias}
          selectable={true}
          showTotals={true}
          emptyMessage="No se encontraron compañías para el período seleccionado."
        />
      </div>
    </div>
  );
}