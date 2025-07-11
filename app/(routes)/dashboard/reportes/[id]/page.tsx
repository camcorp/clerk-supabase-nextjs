import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { obtenerReporteIndividual } from '@/lib/api/reportes';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ReportePage({ params }: Props) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  // Await params since it's now a Promise in Next.js 15
  const { id } = await params;
  const reporte = await obtenerReporteIndividual(userId, id);
  
  if (!reporte) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-xl font-bold text-red-800 mb-2">Reporte no encontrado</h1>
          <p className="text-red-600">El reporte solicitado no existe o no tienes acceso a él.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-green-800 mb-2">✅ Compra Exitosa</h1>
        <p className="text-green-600">Tu reporte ha sido generado correctamente y está listo para consultar.</p>
      </div>
      
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Reporte Individual - {reporte.datos_reporte?.nombre || 'Sin nombre'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>RUT:</strong> {reporte.rut}</p>
            <p><strong>Período:</strong> {reporte.periodo}</p>
            <p><strong>Fecha de generación:</strong> {new Date(reporte.fecha_generacion).toLocaleDateString()}</p>
          </div>
          <div>
            <p><strong>Válido hasta:</strong> {new Date(reporte.fecha_expiracion).toLocaleDateString()}</p>
            <p><strong>Estado:</strong> {reporte.activo ? 'Activo' : 'Inactivo'}</p>
          </div>
        </div>
        
        {reporte.datos_reporte && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Datos del Reporte:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(reporte.datos_reporte, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}