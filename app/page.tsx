// app/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { SignUpButton } from '@clerk/nextjs';

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="max-w-4xl text-center">
        <h1 className="text-4xl font-bold mb-4">Análisis del Mercado de Corredores de Seguros en Chile</h1>
        <p className="text-lg text-gray-700 mb-6">
          Accede gratis a la Memoria Anual con 13 años de evolución del mercado. Compara desempeño, descubre oportunidades y mejora tu estrategia.
        </p>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-2">Informes Disponibles</h2>
          <ul className="text-left list-disc list-inside text-gray-600">
            <li><strong>Memoria Anual (Gratis)</strong>: Tendencias de primas, concentración, evolución de actores.</li>
            <li><strong>Informe Individual</strong>: Análisis detallado de un corredor específico.</li>
            <li><strong>Informe Comparativo</strong>: Comparación de hasta 3 corredores.</li>
            <li><strong>Acceso Completo</strong>: Toda la información disponible y descargable.</li>
          </ul>
        </div>

        <SignUpButton
          mode="modal"
          afterSignUpUrl="/dashboard"
          redirectUrl="/dashboard"
        >
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow">
            Registrarse para acceder
          </button>
        </SignUpButton>
      </div>
    </main>
  );
}