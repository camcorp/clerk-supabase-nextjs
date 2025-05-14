import React from 'react';
import MaChartPieGrupo from './MaChartPieGrupo';
import { formatUF, formatNumber } from '../memoria-anual/utils/formatters';

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
  
  // Agrupar datos por grupo y calcular totales
  const calcularTotalesPorGrupo = () => {
    if (!Array.isArray(concentracionMercado)) return { generales: 0, vida: 0 };
    
    const totales = { generales: 0, vida: 0 };
    
    concentracionMercado.forEach(item => {
      if (item.periodo === selectedPeriodo) {
        // Usar una comparación más flexible para detectar el tipo de grupo
        if (item.grupo && item.grupo.toLowerCase().includes('general')) {
          totales.generales += Number(item.total_uf || 0);
        } else if (item.grupo && item.grupo.toLowerCase().includes('vida')) {
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
    
    // Usar una comparación más flexible
    const datosPeriodoActual = concentracionMercado.find(
      item => item.periodo === selectedPeriodo && item.grupo && item.grupo.toLowerCase().includes(grupo.toLowerCase())
    );
    
    const datosPeriodoAnterior = concentracionMercado.find(
      item => item.periodo === periodoAnterior && item.grupo && item.grupo.toLowerCase().includes(grupo.toLowerCase())
    );
    
    if (!datosPeriodoActual || !datosPeriodoAnterior) return null;
    
    // Usar el campo correcto
    const valorActual = Number(datosPeriodoActual.total_uf || 0);
    const valorAnterior = Number(datosPeriodoAnterior.total_uf || 0);
    
    if (valorAnterior === 0) return null;
    
    return ((valorActual - valorAnterior) / valorAnterior) * 100;
  };
  
  const crecimientoGenerales = calcularCrecimiento('general');
  const crecimientoVida = calcularCrecimiento('vida');
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Estructura por Grupo de Seguros</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Identificación de cambios en la concentración del mercado y tendencias significativas.
        </p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        {/* Segunda fila: Tarjetas de grupos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tarjeta Seguros Generales */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                1 Seguros Generales
              </h3>
              <div className="mt-3">
                <p className="text-3xl font-semibold text-gray-900">
                  {formatUF(totalGenerales, 0)}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Crecimiento: {crecimientoGenerales !== null ? (
                    <span className={crecimientoGenerales >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {crecimientoGenerales >= 0 ? '+' : ''}{formatNumber(crecimientoGenerales, 2)}%
                    </span>
                  ) : 'N/A'}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Participación: {formatNumber(participacionGenerales, 2)}%
                </p>
              </div>
            </div>
          </div>
          
          {/* Tarjeta Seguros de Vida */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                2 Seguros de Vida
              </h3>
              <div className="mt-3">
                <p className="text-3xl font-semibold text-gray-900">
                  {formatUF(totalVida, 0)}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Crecimiento: {crecimientoVida !== null ? (
                    <span className={crecimientoVida >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {crecimientoVida >= 0 ? '+' : ''}{formatNumber(crecimientoVida, 2)}%
                    </span>
                  ) : 'N/A'}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Participación: {formatNumber(participacionVida, 2)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}