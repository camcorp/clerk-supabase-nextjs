import React, { memo } from 'react';
import { SignUpButton } from '@clerk/nextjs';

export function RegistrationCTA() {
  return <section id="registro" className="w-full py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 z-0"></div>
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[url('https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover opacity-10"></div>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-12 relative z-10">
        <div className="md:w-1/2">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold mb-6">
              Empieza gratis con la Memoria Anual
            </h2>
            <p className="text-slate-600 mb-8">
              Descárgala sin costo y empieza a tomar mejores decisiones con
              datos reales. Accede a información exclusiva del mercado chileno
              de seguros.
            </p>
            <div className="space-y-4">
              <SignUpButton>
                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-4 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all">
                  Registrarse
                </button>
              </SignUpButton>
              <p className="text-sm text-slate-500 text-center">
                Sin tarjeta de crédito. Acceso inmediato.
              </p>
            </div>
          </div>
        </div>
        <div className="md:w-1/2">
          <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-xl shadow-blue-900/5 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-2 w-2 rounded-full bg-red-400"></div>
              <div className="h-2 w-2 rounded-full bg-amber-400"></div>
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <div className="h-6 w-full bg-slate-50 rounded-md text-xs text-slate-400 flex items-center px-3">
                memoria-anual-2025.pdf
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-12 bg-slate-50 rounded-lg w-3/4"></div>
              <div className="h-8 bg-slate-50 rounded-lg w-full"></div>
              <div className="h-8 bg-slate-50 rounded-lg w-5/6"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 bg-slate-50 rounded-lg"></div>
                <div className="h-24 bg-slate-50 rounded-lg"></div>
              </div>
              <div className="h-8 bg-slate-50 rounded-lg w-full"></div>
              <div className="h-8 bg-slate-50 rounded-lg w-4/5"></div>
            </div>
          </div>
        </div>
      </div>
    </section>;
}