import React from 'react';
import { GithubIcon, LinkedinIcon, TwitterIcon } from 'lucide-react';
export function Footer() {
  return <footer className="w-full bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">Análisis de Mercado</h3>
            <p className="text-slate-400 mb-6 max-w-md">
              Ofrecemos análisis independiente del mercado de corredores de
              seguros en Chile, con datos actualizados y visualizaciones claras
              para mejorar tu estrategia comercial.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
                <TwitterIcon size={18} />
              </a>
              <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
                <LinkedinIcon size={18} />
              </a>
              <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
                <GithubIcon size={18} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-300 uppercase tracking-wider mb-4">
              Recursos
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#informes" className="text-slate-400 hover:text-white transition-colors">
                  Tipos de informe
                </a>
              </li>
              <li>
                <a href="#registro" className="text-slate-400 hover:text-white transition-colors">
                  Registro
                </a>
              </li>
              <li>
                <a href="/terminos" className="text-slate-400 hover:text-white transition-colors">
                  Términos y condiciones
                </a>
              </li>
              <li>
                <a href="/privacidad" className="text-slate-400 hover:text-white transition-colors">
                  Política de privacidad
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-300 uppercase tracking-wider mb-4">
              Contacto
            </h4>
            <ul className="space-y-2">
              <li className="text-slate-400">consultas@tudominio.cl</li>
              <li className="text-slate-400">+56 2 2123 4567</li>
              <li className="text-slate-400">Santiago, Chile</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Tu Empresa. Todos los derechos
            reservados.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="/terminos" className="text-slate-500 text-sm hover:text-white transition-colors">
              Términos
            </a>
            <a href="/privacidad" className="text-slate-500 text-sm hover:text-white transition-colors">
              Privacidad
            </a>
            <a href="/cookies" className="text-slate-500 text-sm hover:text-white transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>;
}