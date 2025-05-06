import React from 'react';
import { CheckIcon, ArrowRightIcon } from 'lucide-react';
export function PricingTable() {
  const plans = [{
    title: 'Memoria Anual',
    price: 'Gratis',
    features: ['Evolución del mercado', 'Ranking y participación', 'Tendencias de primas'],
    highlight: true,
    cta: 'Obtener ahora'
  }, {
    title: 'Informe Individual',
    price: '$29.990',
    features: ['Análisis de un corredor', 'Participación por ramo', 'Comparativa con mercado'],
    highlight: false,
    cta: 'Seleccionar plan'
  }, {
    title: 'Informe Comparativo',
    price: '$49.990',
    features: ['Comparación de hasta 3 corredores', 'Históricos y crecimientos', 'Visualizaciones clave'],
    highlight: false,
    cta: 'Seleccionar plan'
  }, {
    title: 'Acceso Completo',
    price: '$99.990',
    features: ['Todos los informes', 'Descarga de datos', 'Actualizaciones por 1 año'],
    highlight: false,
    cta: 'Seleccionar plan'
  }];
  return <section id="informes" className="w-full py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Elige el informe que se adapta a tus objetivos
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Ofrecemos diferentes niveles de análisis para satisfacer tus
            necesidades específicas
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, i) => <div key={i} className={`relative rounded-3xl p-8 transition-all duration-300 ${plan.highlight ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-700/20' : 'bg-white border border-slate-100 hover:border-slate-200 hover:shadow-lg'}`}>
              {plan.highlight && <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  Más popular
                </div>}
              <h3 className={`text-xl font-bold mb-2 ${plan.highlight ? 'text-white' : ''}`}>
                {plan.title}
              </h3>
              <div className="mb-6">
                <span className={`text-3xl font-bold ${plan.highlight ? 'text-white' : 'text-blue-600'}`}>
                  {plan.price}
                </span>
                {!plan.highlight && plan.price !== 'Gratis' && <span className="text-slate-400 text-sm ml-1">/ anual</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => <li key={j} className="flex items-start">
                    <CheckIcon size={18} className={`mr-2 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-blue-200' : 'text-blue-500'}`} />
                    <span className={plan.highlight ? 'text-blue-50' : 'text-slate-600'}>
                      {feature}
                    </span>
                  </li>)}
              </ul>
              <a href="#registro" className={`flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl font-medium transition-all ${plan.highlight ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}>
                <span>{plan.cta}</span>
                <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
            </div>)}
        </div>
      </div>
    </section>;
}