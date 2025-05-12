import React from 'react';
import MaChartHHI from './MaChartHHI';
import MaChartPieGrupo from './MaChartPieGrupo';
import { formatUF, formatNumber } from '../memoria-anual/utils/formatters';

interface MaEstructuraMercadoProps {
    grupoGenerales: any;
    grupoVida: any;
    selectedPeriodo: string;
    periodos: string[];
    historicalConcentracion: any[];
    concentracionMercado: any; // Añade esta línea
  }

  export default function MaEstructuraMercado({
    grupoGenerales,
    grupoVida,
    selectedPeriodo,
    periodos,
    historicalConcentracion,
    concentracionMercado, // Añade esta línea
  }: MaEstructuraMercadoProps) {
  
  // Calcular participación de cada grupo
  const totalMercado = grupoGenerales.total_uf + grupoVida.total_uf;
  const participacionGenerales = totalMercado > 0 ? (grupoGenerales.total_uf / totalMercado) * 100 : 0;
  const participacionVida = totalMercado > 0 ? (grupoVida.total_uf / totalMercado) * 100 : 0;
  
  // Calcular crecimiento para cada grupo
  const calcularCrecimiento = (grupo: string) => {
    const periodoAnteriorIndex = periodos.indexOf(selectedPeriodo) + 1;
    const periodoAnterior = periodoAnteriorIndex < periodos.length ? periodos[periodoAnteriorIndex] : null;
    
    if (!periodoAnterior) return null;
    
    const datosAnteriores = historicalConcentracion.find(
      item => item.periodo === periodoAnterior && item.grupo === grupo
    );
    
    if (!datosAnteriores || !datosAnteriores.total_uf) return null;
    
    const valorActual = grupo === 'Seguros Generales' ? grupoGenerales.total_uf : grupoVida.total_uf;
    return ((valorActual - datosAnteriores.total_uf) / datosAnteriores.total_uf) * 100;
  };
  
  const crecimientoGenerales = calcularCrecimiento('Seguros Generales');
  const crecimientoVida = calcularCrecimiento('Seguros de Vida');
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Cambios en la Estructura de Mercado</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Identificación de cambios en la concentración del mercado y tendencias significativas.
        </p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        {/* Primera fila: HHI en una columna */}
        <div className="mb-6">
          <MaChartHHI historicalConcentracion={historicalConcentracion} />
        </div>
        
        {/* Segunda fila: Gráfico de pie y tarjetas de grupos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico de pie */}
          <div className="lg:col-span-1">
            <MaChartPieGrupo concentracionMercado={concentracionMercado} />
          </div>
          
          {/* Tarjeta Seguros Generales */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Seguros Generales
              </h3>
              <div className="mt-3">
                <p className="text-3xl font-semibold text-gray-900">
                  {formatUF(grupoGenerales.total_uf, 0)}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Crecimiento: {crecimientoGenerales !== null ? (
                    <span className={crecimientoGenerales >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {crecimientoGenerales >= 0 ? '+' : ''}{formatNumber(crecimientoGenerales, 2)}%
                    </span>
                  ) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Tarjeta Seguros de Vida */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Seguros de Vida
              </h3>
              <div className="mt-3">
                <p className="text-3xl font-semibold text-gray-900">
                  {formatUF(grupoVida.total_uf, 0)}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Crecimiento: {crecimientoVida !== null ? (
                    <span className={crecimientoVida >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {crecimientoVida >= 0 ? '+' : ''}{formatNumber(crecimientoVida, 2)}%
                    </span>
                  ) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}