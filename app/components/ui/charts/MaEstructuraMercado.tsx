import React from 'react';

import { formatUF, formatNumber } from '@/lib/utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface MaEstructuraMercadoProps {
  grupoGenerales: any;
  grupoVida: any;
  selectedPeriodo: string;
  periodos: string[];
  historicalConcentracion: any[];
  concentracionMercado: any;
}

export default function MaEstructuraMercado({
  grupoGenerales,
  grupoVida,
  selectedPeriodo,
  periodos,
  historicalConcentracion,
  concentracionMercado,
}: MaEstructuraMercadoProps) {
  
  // Obtener los indicadores HHI
  const obtenerIndicadoresHHI = () => {
    if (!Array.isArray(historicalConcentracion)) return { total: 0, generales: 0, vida: 0 };

    const periodoData = historicalConcentracion.find(item => item.periodo === selectedPeriodo);

    if (!periodoData) return { total: 0, generales: 0, vida: 0 };

    return {
      total: Number(periodoData.hhi_general || 0),
      generales: Number(periodoData.hhi_generales || 0),
      vida: Number(periodoData.hhi_vida || 0)
    };
  };

  const indicadoresHHI = obtenerIndicadoresHHI();

  // Agrupar datos por grupo y calcular totales
  const calcularTotalesPorGrupo = () => {
    if (!Array.isArray(concentracionMercado)) return { generales: 0, vida: 0 };
    
    const totales = { generales: 0, vida: 0 };
    
    concentracionMercado.forEach(item => {
      if (item.periodo === selectedPeriodo) {
        // Usar el campo grupo para identificar el tipo
        if (item.grupo === '1') {
          totales.generales += Number(item.total_uf || 0);
        } else if (item.grupo === '2') {
          totales.vida += Number(item.total_uf || 0);
        }
      }
    });
    
    return totales;
  };
  
  const totalesPorGrupo = calcularTotalesPorGrupo();
  const totalGenerales = totalesPorGrupo.generales;
  const totalVida = totalesPorGrupo.vida;
  
  const totalMercado = totalGenerales + totalVida;
  const participacionGenerales = totalMercado > 0 ? (totalGenerales / totalMercado) * 100 : 0;
  const participacionVida = totalMercado > 0 ? (totalVida / totalMercado) * 100 : 0;
  
  // Calcular crecimiento para cada grupo
  const calcularCrecimiento = (grupo: string) => {
    if (!Array.isArray(concentracionMercado)) return null;
    
    const periodoAnteriorIndex = periodos.indexOf(selectedPeriodo) + 1;
    const periodoAnterior = periodoAnteriorIndex < periodos.length ? periodos[periodoAnteriorIndex] : null;
    
    if (!periodoAnterior) return null;
    
    // Usar el campo grupo para identificar el tipo
    const datosPeriodoActual = concentracionMercado.filter(
      item => item.periodo === selectedPeriodo && item.grupo === (grupo === 'general' ? '1' : '2')
    );
    
    const datosPeriodoAnterior = concentracionMercado.filter(
      item => item.periodo === periodoAnterior && item.grupo === (grupo === 'general' ? '1' : '2')
    );
    
    if (datosPeriodoActual.length === 0 || datosPeriodoAnterior.length === 0) return null;
    
    const valorActual = datosPeriodoActual.reduce((sum, item) => sum + Number(item.total_uf || 0), 0);
    const valorAnterior = datosPeriodoAnterior.reduce((sum, item) => sum + Number(item.total_uf || 0), 0);
    
    if (valorAnterior === 0) return null;
    
    return ((valorActual - valorAnterior) / valorAnterior) * 100;
  };
  
  const crecimientoGenerales = calcularCrecimiento('general');
  const crecimientoVida = calcularCrecimiento('vida');
  
  // Preparar datos para el gráfico de HHI
  const datosHHI = [
    {
      name: 'Total Mercado',
      HHI: indicadoresHHI.total,
      fill: '#8884d8'
    },
    {
      name: 'Seguros Generales',
      HHI: indicadoresHHI.generales,
      fill: '#0088FE'
    },
    {
      name: 'Seguros de Vida',
      HHI: indicadoresHHI.vida,
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
        <h3 className="text-lg leading-6 font-medium text-gray-900">Estructura por Grupo de Seguros</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Identificación de cambios en la concentración del mercado y tendencias significativas.
        </p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        {/* Primera fila: Indicadores HHI */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Índice Herfindahl-Hirschman (HHI)</h4>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Tarjeta HHI Total */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="text-sm font-medium text-gray-700">Total Mercado</h5>
              <p className="text-2xl font-semibold">{formatNumber(indicadoresHHI.total, 0)}</p>
              <p className="text-xs text-gray-500">{interpretarHHI(indicadoresHHI.total)}</p>
            </div>
            
            {/* Tarjeta HHI Generales */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="text-sm font-medium text-gray-700">Seguros Generales</h5>
              <p className="text-2xl font-semibold">{formatNumber(indicadoresHHI.generales, 0)}</p>
              <p className="text-xs text-gray-500">{interpretarHHI(indicadoresHHI.generales)}</p>
            </div>
            
            {/* Tarjeta HHI Vida */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="text-sm font-medium text-gray-700">Seguros de Vida</h5>
              <p className="text-2xl font-semibold">{formatNumber(indicadoresHHI.vida, 0)}</p>
              <p className="text-xs text-gray-500">{interpretarHHI(indicadoresHHI.vida)}</p>
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
                <Bar dataKey="HHI" name="Índice HHI" fill="#8884d8">
                  {datosHHI.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
</div>
    </div>
  );
}