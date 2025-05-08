'use client';

import { SignUpButton } from '@clerk/nextjs';
import { Stats } from '../components/Stats';
import { Benefits } from '../components/Benefits';
import { Hero } from '../components/Hero';
import { PricingTable } from '../components/PricingTable';
import { RegistrationCTA } from '../components/RegistrationCTA';
import { Footer } from '../components/Footer';

export default function LandingPage() {
  return (
    
          {/* Hero */}
          <Hero />
  
    
  
      {/* Beneficios */}
      <Benefits />
    {/* Estadísticas */}
    <Stats />

  

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
  <PricingTable />
      <RegistrationCTA />
      <Footer />

 
</main>
  );
}