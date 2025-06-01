import React from 'react';
import { formatUF, formatNumber } from '@/lib/utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MaEstructuraRamosProps {
  concentracionRamos: any[];
  selectedPeriodo: string;
  periodos: string[];
}

export default function MaEstructuraRamos({
  concentracionRamos,
  selectedPeriodo,
  periodos,
}: MaEstructuraRamosProps) {
  
  // Obtener los indicadores HHI
  const obtenerIndicadoresHHI = () => {
    if (!Array.isArray(concentracionRamos)) return { general: 0, grupo1: 0, grupoVida: 0 };
    
    let hhi_general = 0;
    let hhi_grupo1 = 0;
    let hhi_grupoVida = 0;
    
    // Filtrar solo un registro para cada categoría
    const registroGeneral = concentracionRamos.find(item => 
      item.periodo === selectedPeriodo && item.hhi_general !== undefined);
    
    // Buscar Grupo 1 o cualquier grupo que contenga "General" (para "Seguros Generales")
    const registroGrupo1 = concentracionRamos.find(item => 
      item.periodo === selectedPeriodo && 
      (item.grupo === 'Grupo 1' || 
       item.grupo?.toLowerCase().includes('general')) && 
      item.hhi_grupo !== undefined);
    
    // Buscar Grupo 2 Vida o cualquier grupo que contenga "Vida" (para "Seguros de Vida")
    const registroGrupoVida = concentracionRamos.find(item => 
      item.periodo === selectedPeriodo && 
      (item.grupo === 'Grupo 2 Vida' || 
       item.grupo?.toLowerCase().includes('vida')) && 
      item.hhi_grupo !== undefined);
    
    if (registroGeneral) {
      hhi_general = Number(registroGeneral.hhi_general);
    }
    
    if (registroGrupo1) {
      hhi_grupo1 = Number(registroGrupo1.hhi_grupo);
    }
    
    if (registroGrupoVida) {
      hhi_grupoVida = Number(registroGrupoVida.hhi_grupo);
    }
    
    // Agregar logs para depuración
    console.log('Datos de concentración recibidos:', concentracionRamos);
    console.log('Periodo seleccionado:', selectedPeriodo);
    console.log('Indicadores HHI calculados:', { 
      general: hhi_general, 
      segurosGenerales: hhi_grupo1, 
      segurosVida: hhi_grupoVida,
      datosEncontrados: {
        general: !!registroGeneral,
        grupo1: !!registroGrupo1,
        grupoVida: !!registroGrupoVida
      }
    });
    
    return { 
      general: hhi_general, 
      grupo1: hhi_grupo1, 
      grupoVida: hhi_grupoVida 
    };
  };
  
  const indicadoresHHI = obtenerIndicadoresHHI();
  
  // Preparar datos para el gráfico de HHI
  const datosHHI = [
    {
      name: 'General',
      HHI: indicadoresHHI.general,
      fill: '#8884d8'
    },
    {
      name: 'Seguros Generales',  // Cambiado de 'Grupo 1'
      HHI: indicadoresHHI.grupo1,
      fill: '#0088FE'
    },
    {
      name: 'Seguros de Vida',    // Cambiado de 'Grupo 2 Vida'
      HHI: indicadoresHHI.grupoVida,
      fill: '#00C49F'
    }
  ];
  
  // Función para interpretar el nivel de concentración según HHI
  const interpretarHHI = (valor: number): string => {
    if (valor < 1500) return 'Baja concentración';
    if (valor < 2500) return 'Concentración moderada';
    return 'Alta concentración';
  };
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Estructura de Concentración de Ramos</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Análisis de concentración en la oferta de ramos de seguros.
        </p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        {/* Indicadores HHI */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Índice Herfindahl-Hirschman (HHI) para Ramos</h4>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Tarjeta HHI General */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="text-sm font-medium text-gray-700">General</h5>
              <p className="text-2xl font-semibold">{formatNumber(indicadoresHHI.general, 0)}</p>
              <p className="text-xs text-gray-500">{interpretarHHI(indicadoresHHI.general)}</p>
            </div>
            
            {/* Tarjeta HHI Seguros Generales */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="text-sm font-medium text-gray-700">Seguros Generales</h5>
              <p className="text-2xl font-semibold">{formatNumber(indicadoresHHI.grupo1, 0)}</p>
              <p className="text-xs text-gray-500">{interpretarHHI(indicadoresHHI.grupo1)}</p>
            </div>
            
            {/* Tarjeta HHI Seguros de Vida */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="text-sm font-medium text-gray-700">Seguros de Vida</h5>
              <p className="text-2xl font-semibold">{formatNumber(indicadoresHHI.grupoVida, 0)}</p>
              <p className="text-xs text-gray-500">{interpretarHHI(indicadoresHHI.grupoVida)}</p>
            </div>
          </div>
          
          {/* Gráfico de barras para HHI */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datosHHI}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [formatNumber(Number(value), 0), 'HHI']} />
                <Legend />
                <Bar dataKey="HHI" name="Índice HHI" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            <strong>Nota:</strong> El Índice Herfindahl-Hirschman (HHI) mide la concentración del mercado. 
            Un HHI menor a 1,500 indica baja concentración, entre 1,500 y 2,500 indica concentración moderada, 
            y mayor a 2,500 indica alta concentración.
          </p>
        </div>
      </div>
    </div>
  );
}