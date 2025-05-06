import React from 'react';
import { ChevronRightIcon, DownloadIcon } from 'lucide-react';
export function Hero() {
  return <section className="w-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 z-0"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl"></div>
      <div className="max-w-7xl mx-auto px-6 py-32 relative z-10">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
            <span className="mr-1">2025</span>
            <div className="w-1 h-1 bg-blue-600 rounded-full mx-1.5"></div>
            <span>Análisis de Mercado</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Domina el Mercado de Corredores de Seguros en Chile
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mb-12">
            Accede gratis a la Memoria Anual con 13 años de evolución del
            mercado. Compara, aprende y mejora tu estrategia comercial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#registro" className="group flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-blue-200/50 hover:shadow-xl">
              <DownloadIcon size={20} />
              <span>Obtener Memoria Anual Gratis</span>
              <ChevronRightIcon size={16} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </a>
            <a href="#informes" className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-medium px-8 py-4 rounded-full border border-slate-200 transition-all">
              Ver Informes Disponibles
            </a>
          </div>
        </div>
        <div className="w-full max-w-4xl mx-auto bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-4 shadow-xl shadow-blue-900/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{
            label: 'Años de Datos',
            value: '13'
          }, {
            label: 'Corredores',
            value: '+350'
          }, {
            label: 'Informes',
            value: '4'
          }, {
            label: 'Satisfacción',
            value: '98%'
          }].map((stat, i) => <div key={i} className="flex flex-col items-center p-4 text-center">
                <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stat.value}
                </span>
                <span className="text-sm text-slate-500 mt-1">
                  {stat.label}
                </span>
              </div>)}
          </div>
        </div>
      </div>
    </section>;
}