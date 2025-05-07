'use client';

import { SignUpButton } from '@clerk/nextjs';
import { Stats } from '../components/Stats';
import { Benefits } from '../components/Benefits';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
    {/* Hero */}
    <section className="bg-gradient-to-br from-blue-50 to-white py-24 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold leading-tight mb-6">
          Domina el Mercado de Corredores de Seguros en Chile
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Accede gratis a la Memoria Anual con 13 años de evolución del mercado. Compara, aprende y mejora tu estrategia comercial.
        </p>
        <a
          href="#registro"
          className="inline-block bg-blue-600 text-white text-lg font-semibold px-8 py-3 rounded-full hover:bg-blue-700 transition"
        >
          Obtener Memoria Anual Gratis
        </a>
      </div>
    </section>
  
    {/* Beneficios */}
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10 text-center">
        <div>
          <h3 className="text-2xl font-semibold mb-3">Estrategia basada en datos</h3>
          <p className="text-gray-600">Identifica oportunidades en el mercado con datos históricos y análisis visual.</p>
        </div>
        <div>
          <h3 className="text-2xl font-semibold mb-3">Benchmark con competidores</h3>
          <p className="text-gray-600">Compara tu desempeño con los principales corredores del país.</p>
        </div>
        <div>
          <h3 className="text-2xl font-semibold mb-3">Optimización de decisiones</h3>
          <p className="text-gray-600">Toma decisiones con confianza gracias a insights accionables y claros.</p>
        </div>
      </div>
    </section>
  
      {/* Beneficios */}
      <Benefits />
    {/* Estadísticas */}
    <Stats />

  
    {/* Comparación de informes */}
    <section className="py-20 px-6 bg-white" id="informes">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">Elige el informe que se adapta a tus objetivos</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              title: "Memoria Anual",
              price: "Gratis",
              features: ["Evolución del mercado", "Ranking y participación", "Tendencias de primas"],
              highlight: true,
            },
            {
              title: "Informe Individual",
              price: "$29.990",
              features: ["Análisis de un corredor", "Participación por ramo", "Comparativa con mercado"],
            },
            {
              title: "Informe Comparativo",
              price: "$49.990",
              features: ["Comparación de hasta 3 corredores", "Históricos y crecimientos", "Visualizaciones clave"],
            },
            {
              title: "Acceso Completo",
              price: "$99.990",
              features: ["Todos los informes", "Descarga de datos", "Actualizaciones por 1 año"],
            },
          ].map((plan, i) => (
            <div
              key={i}
              className={`border rounded-2xl p-6 shadow-sm ${
                plan.highlight ? "border-blue-600" : "border-gray-200"
              }`}
            >
              <h3 className="text-xl font-bold mb-2">{plan.title}</h3>
              <p className="text-blue-600 text-2xl font-extrabold mb-4">{plan.price}</p>
              <ul className="text-left space-y-2 text-gray-600 text-sm">
                {plan.features.map((f, j) => (
                  <li key={j}>✓ {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
   {/* Registro */}
   <section className="py-24 px-6 bg-blue-50 text-center" id="registro">
    <div className="max-w-3xl mx-auto">
      <h2 className="text-4xl font-bold mb-6">Empieza gratis con la Memoria Anual</h2>
      <p className="text-lg text-gray-700 mb-8">
        Descárgala sin costo y empieza a tomar mejores decisiones con datos reales.
      </p>
      <SignUpButton>

<button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow"> Registrarse</button>
</SignUpButton>
    </div>
  </section>


 {/* Footer */}
 <footer className="bg-gray-900 text-white py-12 px-6">
    <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-sm">
      <div>
        <h3 className="font-semibold mb-2">Sobre el proyecto</h3>
        <p className="text-gray-400">Análisis independiente del mercado de corredores de seguros en Chile.</p>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Recursos</h3>
        <ul className="text-gray-400 space-y-1">
          <li><a href="#informes" className="hover:underline">Tipos de informe</a></li>
          <li><a href="#registro" className="hover:underline">Registro</a></li>
          <li><a href="/terminos" className="hover:underline">Términos y condiciones</a></li>
        </ul>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Contacto</h3>
        <p className="text-gray-400">consultas@tudominio.cl</p>
      </div>
    </div>
    <div className="text-center text-gray-500 text-xs mt-12">&copy; {new Date().getFullYear()} Tu Empresa. Todos los derechos reservados.</div>
  </footer>
</main>
  );
}