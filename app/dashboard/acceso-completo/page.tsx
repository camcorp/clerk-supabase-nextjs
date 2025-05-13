'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from '@/lib/supabase-client';

export default function AccesoCompletoPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const planes = [
    {
      id: 'plan_mensual',
      nombre: 'Plan Mensual',
      precio: 9990,
      descripcion: 'Acceso completo por 1 mes',
      duracion: '1 mes',
      popular: false
    },
    {
      id: 'plan_trimestral',
      nombre: 'Plan Trimestral',
      precio: 24990,
      descripcion: 'Acceso completo por 3 meses',
      duracion: '3 meses',
      popular: true
    },
    {
      id: 'plan_anual',
      nombre: 'Plan Anual',
      precio: 89990,
      descripcion: 'Acceso completo por 12 meses',
      duracion: '12 meses',
      popular: false
    }
  ];

  const adquirirAcceso = async (planId: string) => {
    if (!user?.id) {
      setError('Debes iniciar sesión para adquirir un plan');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const plan = planes.find(p => p.id === planId);
      if (!plan) throw new Error('Plan no encontrado');

      // Calcular fechas de inicio y fin del acceso
      const fechaInicio = new Date();
      const fechaFin = new Date();
      
      // Ajustar fecha fin según duración del plan
      if (planId === 'plan_mensual') {
        fechaFin.setMonth(fechaFin.getMonth() + 1);
      } else if (planId === 'plan_trimestral') {
        fechaFin.setMonth(fechaFin.getMonth() + 3);
      } else if (planId === 'plan_anual') {
        fechaFin.setMonth(fechaFin.getMonth() + 12);
      }

      // Registrar pago (simulado)
      const { data: pago, error: errorPago } = await supabase
        .from('pagos')
        .insert({
          user_id: user.id,
          rut: '', // No aplica para suscripciones generales
          producto_id: planId,
          orden_comercio: `ORD-${Date.now()}`,
          amount: plan.precio,
          estado: 'pagado', // En un entorno real, esto sería 'pendiente' hasta confirmar el pago
          fecha_creacion: new Date().toISOString(),
          token: `TKN-${Math.random().toString(36).substring(2, 15)}`,
          url_pago: ''
        })
        .select()
        .single();

      if (errorPago) throw new Error(errorPago.message);

      // Registrar acceso
      const { error: errorAcceso } = await supabase
        .from('accesos')
        .insert({
          user_id: user.id,
          producto_id: planId,
          modulo: 'corredores', // Módulo al que se da acceso
          fecha_inicio: fechaInicio.toISOString(),
          fecha_fin: fechaFin.toISOString(),
          activo: true
        });

      if (errorAcceso) throw new Error(errorAcceso.message);

      // Simular procesamiento
      setTimeout(() => {
        setSuccess(true);
        setLoading(false);
      }, 1500);

    } catch (err: any) {
      console.error('Error al procesar la suscripción:', err.message);
      setError('Error al procesar la suscripción. Por favor intente nuevamente.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">¡Suscripción Exitosa!</h2>
          <p className="mb-6">Tu suscripción ha sido procesada correctamente. Ahora tienes acceso al módulo de corredores.</p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
            onClick={() => router.push('/dashboard/corredor')}
          >
            Ir al módulo de corredores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Planes de Acceso Completo</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-8 bg-gray-50 border-b">
          <h2 className="text-xl font-semibold">Beneficios del Acceso Completo</h2>
          <p className="mt-2 text-gray-600">Con tu suscripción obtendrás acceso a:</p>
          <ul className="mt-4 space-y-2">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Informes detallados de todos los corredores</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Análisis de cartera y distribución por compañías</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Indicadores de concentración y diversificación</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Comparativas con el mercado y evolución histórica</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planes.map((plan) => (
          <div 
            key={plan.id} 
            className={`bg-white shadow rounded-lg overflow-hidden ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
          >
            {plan.popular && (
              <div className="bg-blue-500 text-white text-center py-1 text-sm font-medium">
                Más popular
              </div>
            )}
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">{plan.nombre}</h3>
              <p className="text-gray-600 mb-4">{plan.descripcion}</p>
              <p className="text-3xl font-bold mb-6">
                {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(plan.precio)}
              </p>
              <ul className="mb-6 space-y-2">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Duración: {plan.duracion}</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Acceso ilimitado a informes</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Soporte prioritario</span>
                </li>
              </ul>
              <button
                className={`w-full py-2 px-4 rounded font-medium ${plan.popular
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
                onClick={() => adquirirAcceso(plan.id)}
                disabled={loading}
              >
                {loading ? 'Procesando...' : 'Adquirir plan'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}