'use client';

import { useState } from 'react';

type Plan = 'individual' | 'comparativo' | 'completo';

type UpgradeSubscriptionProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function UpgradeSubscription({ onSuccess, onCancel }: UpgradeSubscriptionProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plans = [
    {
      id: 'individual',
      title: 'Informe Individual',
      price: '$29.990',
      features: ['Análisis de un corredor', 'Participación por ramo', 'Comparativa con mercado'],
      description: 'Ideal para analizar un corredor específico en profundidad'
    },
    {
      id: 'comparativo',
      title: 'Informe Comparativo',
      price: '$49.990',
      features: ['Comparación de hasta 3 corredores', 'Históricos y crecimientos', 'Visualizaciones clave'],
      description: 'Perfecto para comparar tu empresa con la competencia'
    },
    {
      id: 'completo',
      title: 'Acceso Completo',
      price: '$99.990',
      features: ['Todos los informes', 'Descarga de datos', 'Actualizaciones por 1 año'],
      description: 'Acceso total a todas las funcionalidades y datos'
    }
  ];

  const handleUpgrade = async () => {
    if (!selectedPlan) {
      setError('Por favor selecciona un plan');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // En una implementación real, aquí se integraría con un sistema de pagos
      // Por ahora, solo actualizamos el rol del usuario en la base de datos
      const response = await fetch('/api/user-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar la suscripción');
      }

      // Simulamos un proceso de pago exitoso
      alert(`¡Suscripción al plan ${selectedPlan} completada con éxito!`);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Actualiza tu suscripción</h2>
            <button 
              onClick={onCancel} 
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-gray-600 mb-6">Selecciona el plan que mejor se adapte a tus necesidades:</p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`border rounded-lg p-6 cursor-pointer transition-all ${selectedPlan === plan.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                onClick={() => setSelectedPlan(plan.id as Plan)}
              >
                <h3 className="text-xl font-semibold mb-2">{plan.title}</h3>
                <p className="text-blue-600 text-2xl font-bold mb-4">{plan.price}</p>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  <div className={`h-6 flex items-center justify-center ${selectedPlan === plan.id ? 'visible' : 'invisible'}`}>
                    <span className="text-blue-600 font-medium">Seleccionado</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleUpgrade}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading || !selectedPlan}
            >
              {loading ? 'Procesando...' : 'Actualizar suscripción'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}