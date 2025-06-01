'use client';

import { SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { Stats } from '@/app/components/ui/Stats';
import { Benefits } from '@/app/components/ui/Benefits';
import { Hero } from '@/app/components/ui/Hero';
import { PricingTable } from '@/app/components/ui/PricingTable';
import { RegistrationCTA } from '@/app/components/ui/RegistrationCTA';
import { Footer } from '@/app/components/ui//Footer';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <main>
      {/* Hero */}
      <Hero />
      
      {/* Beneficios */}
      <Benefits />
      
      {/* Estadísticas */}
      <Stats />
      
      {/* Sección de registro - solo visible para usuarios no autenticados */}
      <SignedOut>
        <section className="py-24 px-6 bg-blue-50 text-center" id="registro">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Empieza gratis con la Memoria Anual</h2>
            <p className="text-lg text-gray-700 mb-8">
              Descárgala sin costo y empieza a tomar mejores decisiones con datos reales.
            </p>
            <SignUpButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow">
                Registrarse
              </button>
            </SignUpButton>
          </div>
        </section>
      </SignedOut>
      
      {/* Para usuarios autenticados, mostrar un botón de acceso al dashboard */}
      <SignedIn>
        <section className="py-24 px-6 bg-blue-50 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">¡Bienvenido de vuelta!</h2>
            <p className="text-lg text-gray-700 mb-8">
              Continúa trabajando con tus datos y análisis.
            </p>
            <Link href="/dashboard">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow">
                Ir al Dashboard
              </button>
            </Link>
          </div>
        </section>
      </SignedIn>
      
      <PricingTable />
      
      {/* Solo mostrar CTA de registro para usuarios no autenticados */}
      <SignedOut>
        <RegistrationCTA />
      </SignedOut>
      
      <Footer />
    </main>
  );
}