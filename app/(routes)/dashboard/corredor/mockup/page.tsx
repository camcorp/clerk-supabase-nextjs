'use client';

import ReporteIndividualMockup from '../components/ReporteIndividualMockup';

// Datos de ejemplo completos
const mockData = {
  corredor: {
    rut: '96572800-7',
    nombre: 'Juan Pérez Corredor',
    ciudad: 'Santiago',
    telefono: '+56912345678'
  },
  reportData: {
    periodo: '2024',
    produccion: {
      total_primaclp: 150000000,
      total_primauf: 5000,
      ranking_general: 15,
      num_companias: 8,
      num_ramos: 12,
      crecimiento_anual: 0.15,
      participacion_mercado: 0.025
    },
    rankings: {
      general: 15,
      por_compania: [
        { compania: 'Seguros Generales', ranking: 5, total_corredores: 120 },
        { compania: 'Vida Seguros', ranking: 8, total_corredores: 95 },
        { compania: 'Protección Total', ranking: 12, total_corredores: 150 },
        { compania: 'Seguros del Sur', ranking: 20, total_corredores: 80 },
        { compania: 'Aseguradora Nacional', ranking: 25, total_corredores: 200 }
      ],
      por_ramo: [
        { ramo: 'Incendio', ranking: 3, total_corredores: 85 },
        { ramo: 'Automóviles', ranking: 7, total_corredores: 180 },
        { ramo: 'Vida', ranking: 15, total_corredores: 220 },
        { ramo: 'Salud', ranking: 22, total_corredores: 160 },
        { ramo: 'Responsabilidad Civil', ranking: 18, total_corredores: 90 }
      ]
    },
    companias: [
      {
        nombrecia: 'Seguros Generales',
        primaclp: 45000000,
        primauf: 1500,
        participacion: 0.30,
        crecimiento: 0.18,
        ranking_corredor: 5
      },
      {
        nombrecia: 'Vida Seguros',
        primaclp: 35000000,
        primauf: 1200,
        participacion: 0.23,
        crecimiento: 0.12,
        ranking_corredor: 8
      },
      {
        nombrecia: 'Protección Total',
        primaclp: 28000000,
        primauf: 950,
        participacion: 0.19,
        crecimiento: 0.08,
        ranking_corredor: 12
      },
      {
        nombrecia: 'Seguros del Sur',
        primaclp: 25000000,
        primauf: 850,
        participacion: 0.17,
        crecimiento: 0.15,
        ranking_corredor: 20
      },
      {
        nombrecia: 'Aseguradora Nacional',
        primaclp: 17000000,
        primauf: 500,
        participacion: 0.11,
        crecimiento: -0.05,
        ranking_corredor: 25
      }
    ],
    ramos: [
      {
        nombre: 'Incendio',
        primaclp: 40000000,
        primauf: 1350,
        participacion: 0.27,
        crecimiento: 0.22,
        ranking_corredor: 3
      },
      {
        nombre: 'Automóviles',
        primaclp: 35000000,
        primauf: 1200,
        participacion: 0.23,
        crecimiento: 0.10,
        ranking_corredor: 7
      },
      {
        nombre: 'Vida',
        primaclp: 30000000,
        primauf: 1000,
        participacion: 0.20,
        crecimiento: 0.15,
        ranking_corredor: 15
      },
      {
        nombre: 'Salud',
        primaclp: 25000000,
        primauf: 850,
        participacion: 0.17,
        crecimiento: 0.08,
        ranking_corredor: 22
      },
      {
        nombre: 'Responsabilidad Civil',
        primaclp: 20000000,
        primauf: 600,
        participacion: 0.13,
        crecimiento: 0.05,
        ranking_corredor: 18
      }
    ],
    concentracion: {
      hhi_companias: 2250,
      hhi_ramos: 1850,
      nivel_concentracion_companias: 'Moderada',
      nivel_concentracion_ramos: 'Baja'
    },
    top_performers: {
      ramos_mayor_crecimiento: [
        { ramo: 'Incendio', crecimiento: 0.22, prima_actual: 40000000 },
        { ramo: 'Vida', crecimiento: 0.15, prima_actual: 30000000 },
        { ramo: 'Automóviles', crecimiento: 0.10, prima_actual: 35000000 }
      ],
      ramos_mayor_decrecimiento: [
        { ramo: 'Transporte', crecimiento: -0.08, prima_actual: 8000000 },
        { ramo: 'Agrícola', crecimiento: -0.05, prima_actual: 5000000 }
      ],
      companias_mayor_crecimiento: [
        { compania: 'Seguros Generales', crecimiento: 0.18, prima_actual: 45000000 },
        { compania: 'Seguros del Sur', crecimiento: 0.15, prima_actual: 25000000 },
        { compania: 'Vida Seguros', crecimiento: 0.12, prima_actual: 35000000 }
      ],
      companias_mayor_decrecimiento: [
        { compania: 'Aseguradora Nacional', crecimiento: -0.05, prima_actual: 17000000 },
        { compania: 'Seguros Antiguos', crecimiento: -0.12, prima_actual: 8000000 }
      ]
    }
  }
};

export default function MockupPage() {
  return <ReporteIndividualMockup {...mockData} />;
}