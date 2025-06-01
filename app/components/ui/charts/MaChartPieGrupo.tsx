import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatUF, formatCLP } from '@/lib/utils/formatters';

interface MaChartPieGrupoProps {
  concentracionMercado: any[];
  loading?: boolean;
}

export default function MaChartPieGrupo({ concentracionMercado, loading = false }: MaChartPieGrupoProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  const [pieData, setPieData] = useState<any[]>([]);
  
  // Función para procesar los datos del mercado
  const procesarDatos = React.useCallback(() => {
    // Verificar que concentracionMercado sea un array válido
    const mercadoArray = Array.isArray(concentracionMercado) ? concentracionMercado : [];
    
    if (mercadoArray.length === 0) {
      setPieData([]);
      return;
    }
    
    // Obtener el período más reciente si hay múltiples períodos
    const periodos = Array.from(new Set(mercadoArray.map(item => item.periodo))).sort().reverse();
    const periodoActual = periodos[0];
    
    // Filtrar por período actual
    const datosPeriodoActual = mercadoArray.filter(item => item.periodo === periodoActual);
    
    // Agrupar por tipo de seguro (Generales y Vida)
    // Primero intentamos filtrar por el campo grupo que es el que viene en vista_concentracion_mercado
    let segurosGenerales = datosPeriodoActual.filter(item => 
      item && typeof item === 'object' && item.grupo && 
      (item.grupo.toLowerCase().includes('general') || item.grupo === 'GENERALES')
    );
    
    let segurosVida = datosPeriodoActual.filter(item => 
      item && typeof item === 'object' && item.grupo && 
      (item.grupo.toLowerCase().includes('vida') || item.grupo === 'VIDA')
    );
    
    // Si no encontramos datos por grupo, intentamos filtrar por tipo
    if (segurosGenerales.length === 0 && segurosVida.length === 0) {
      segurosGenerales = datosPeriodoActual.filter(item => 
        item && typeof item === 'object' && item.tipo === 'GENERALES'
      );
      
      segurosVida = datosPeriodoActual.filter(item => 
        item && typeof item === 'object' && item.tipo === 'VIDA'
      );
    }
    
    console.log('Datos procesados:', { segurosGenerales, segurosVida });
    
    // Calcular totales por tipo usando los campos de vista_concentracion_mercado
    const totalGeneralesUF = segurosGenerales.reduce((sum, item) => {
      // Primero intentamos con total_uf que es el campo de vista_concentracion_mercado
      const valor = item.total_uf || 0;
      return sum + (typeof valor === 'string' ? parseFloat(valor) : valor);
    }, 0);
    
    const totalGeneralesCLP = segurosGenerales.reduce((sum, item) => {
      // Primero intentamos con total_clp que es el campo de vista_concentracion_mercado
      const valor = item.total_clp || 0;
      return sum + (typeof valor === 'string' ? parseFloat(valor) : valor);
    }, 0);
    
    const totalVidaUF = segurosVida.reduce((sum, item) => {
      const valor = item.total_uf || 0;
      return sum + (typeof valor === 'string' ? parseFloat(valor) : valor);
    }, 0);
    
    const totalVidaCLP = segurosVida.reduce((sum, item) => {
      const valor = item.total_clp || 0;
      return sum + (typeof valor === 'string' ? parseFloat(valor) : valor);
    }, 0);
    
    const totalMercadoUF = totalGeneralesUF + totalVidaUF;
    
    // Calcular participación
    const participacionGenerales = totalMercadoUF > 0 ? (totalGeneralesUF / totalMercadoUF) * 100 : 0;
    const participacionVida = totalMercadoUF > 0 ? (totalVidaUF / totalMercadoUF) * 100 : 0;
    
    // Crear datos para el gráfico
    const newPieData = [
      {
        name: '1 Seguros Generales',
        value: participacionGenerales,
        primaUF: totalGeneralesUF,
        primaCLP: totalGeneralesCLP
      },
      {
        name: '2 Seguros de Vida',
        value: participacionVida,
        primaUF: totalVidaUF,
        primaCLP: totalVidaCLP
      }
    ];
    
    console.log('Datos para el gráfico:', newPieData);
    setPieData(newPieData);
  }, [concentracionMercado]);
  
  useEffect(() => {
    procesarDatos();
  }, [procesarDatos]);

  // Si está cargando o no hay datos, mostrar mensaje
  if (loading) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Distribución del Mercado por Tipo
          </h3>
          <p className="text-center text-gray-500">Cargando datos...</p>
        </div>
      </div>
    );
  }
  
  if (pieData.length === 0) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Distribución del Mercado por Tipo
          </h3>
          <p className="text-center text-gray-500">No hay datos disponibles para este período</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Distribución del Mercado por Grupo
        </h3>
        
        <div className="flex flex-col md:flex-row">
          {/* Gráfico de pie */}
          <div className="w-full md:w-1/2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => {
                    if (name === 'value') {
                      return [`${typeof value === 'number' ? value.toFixed(2) : value}%`, 'Participación'];
                    }
                    if (name === 'primaUF') {
                      return [formatUF(Number(value), 0), 'Prima UF'];
                    }
                    if (name === 'primaCLP') {
                      return [formatCLP(Number(value)), 'Prima CLP'];
                    }
                    return [value, name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Tabla de leyenda */}
          <div className="w-full md:w-1/2 mt-4 md:mt-0 md:pl-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grupo
                    </th>
                    <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participación
                    </th>
                    <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prima UF
                    </th>
                    <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prima CLP
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pieData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        {item.name}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                        {typeof item.value === 'number' ? item.value.toFixed(2) : item.value}%
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatUF(item.primaUF, 0)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatCLP(item.primaCLP)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      Total
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      100%
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {formatUF(pieData.reduce((sum, item) => sum + item.primaUF, 0), 0)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {formatCLP(pieData.reduce((sum, item) => sum + item.primaCLP, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}