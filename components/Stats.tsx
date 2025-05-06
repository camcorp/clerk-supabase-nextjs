import React from 'react';
export function Stats() {
  const stats = [{
    value: '13',
    label: 'Años de datos históricos'
  }, {
    value: '+350',
    label: 'Corredores analizados'
  }, {
    value: '4',
    label: 'Tipos de informes disponibles'
  }, {
    value: '98%',
    label: 'Usuarios satisfechos'
  }];
  return <section className="w-full py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-blue-900 z-0"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-30"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-30"></div>
      {/* Abstract shapes */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Resultados que hablan por sí solos
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-400 to-indigo-400 mx-auto"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
          {stats.map((stat, i) => <div key={i} className="text-center">
              <div className="relative">
                <span className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                  {stat.value}
                </span>
                <div className="absolute -bottom-3 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-70 rounded-full"></div>
              </div>
              <p className="text-blue-100 mt-6 font-medium">{stat.label}</p>
            </div>)}
        </div>
      </div>
    </section>;
}