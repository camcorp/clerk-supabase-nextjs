'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center px-6 py-24">
        <h1 className="text-6xl font-extrabold mb-6">404</h1>
        <h2 className="text-3xl font-bold mb-6">Página no encontrada</h2>
        <p className="text-xl text-gray-700 mb-8">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/" 
            className="inline-block bg-blue-600 text-white text-lg font-semibold px-8 py-3 rounded-full hover:bg-blue-700 transition"
          >
            Volver al inicio
          </Link>
          <Link 
            href="/#informes" 
            className="inline-block bg-white border border-blue-600 text-blue-600 text-lg font-semibold px-8 py-3 rounded-full hover:bg-blue-50 transition"
          >
            Ver planes disponibles
          </Link>
        </div>
      </div>
    </main>
  );
}