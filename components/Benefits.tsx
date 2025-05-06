import React from 'react';
import { BarChartIcon, UsersIcon, BrainCircuitIcon } from 'lucide-react';
export function Benefits() {
  const benefits = [{
    icon: <BarChartIcon size={32} className="text-blue-500" />,
    title: 'Estrategia basada en datos',
    description: 'Identifica oportunidades en el mercado con datos históricos y análisis visual.'
  }, {
    icon: <UsersIcon size={32} className="text-indigo-500" />,
    title: 'Benchmark con competidores',
    description: 'Compara tu desempeño con los principales corredores del país.'
  }, {
    icon: <BrainCircuitIcon size={32} className="text-violet-500" />,
    title: 'Optimización de decisiones',
    description: 'Toma decisiones con confianza gracias a insights accionables y claros.'
  }];
  return <section className="w-full py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Potencia tu estrategia</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Descubre cómo nuestros informes transforman datos complejos en
            ventajas competitivas para tu negocio
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, i) => <div key={i} className="group relative bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="mb-6 p-3 inline-block rounded-2xl bg-slate-50 group-hover:bg-white transition-colors">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
              <p className="text-slate-600">{benefit.description}</p>
            </div>)}
        </div>
      </div>
    </section>;
}