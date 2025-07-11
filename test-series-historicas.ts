import * as fs from 'fs';
import * as path from 'path';

// Interfaces para tipado
interface SerieHistorica {
  periodo: string;
  prima_uf: number;
  prima_clp: number;
}

interface Compania {
  rutcia: string;
  nombrecia?: string;
  nombre?: string;
  primaclp?: number;
  primauf?: number;
  prima_clp?: number;
  prima_uf?: number;
  series_historicas?: SerieHistorica[];
}

interface DatosReporte {
  corredor: any;
  reportData: {
    companias: Compania[];
  };
}

interface Reporte {
  id: string;
  datos_reporte: DatosReporte;
}

// Función para cargar y parsear el archivo JSON
function cargarDatos(): Reporte[] {
  try {
    const filePath = path.join(__dirname, 'docs', 'ejemplo.json');
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al cargar el archivo:', error);
    return [];
  }
}

// Función para buscar una compañía por RUT
function buscarCompania(reportes: Reporte[], rutcia: string): Compania | null {
  for (const reporte of reportes) {
    const companias = reporte.datos_reporte?.reportData?.companias || [];
    const compania = companias.find(c => c.rutcia === rutcia);
    if (compania) {
      return compania;
    }
  }
  return null;
}


// Script simple para obtener datos_reporte de la API
async function obtenerDatosReporte(rut: string) {
  try {
    console.log(`Obteniendo datos para RUT: ${rut}`);
    
    const response = await fetch(`http://localhost:3000/api/reportes/${rut}?periodo=202412`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extraer datos_reporte
    const datosReporte = data.success ? data.reporte?.datos_reporte : data.datos_reporte;
    
    console.log('datos_reporte:', JSON.stringify(datosReporte, null, 2));
    
    return datosReporte;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Ejecutar con un RUT de ejemplo
async function main() {
  const rut = '99147000K'; // BCI
  await obtenerDatosReporte(rut);
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

// Remover la línea duplicada y corregir las exportaciones
export { buscarCompania, obtenerDatosReporte };