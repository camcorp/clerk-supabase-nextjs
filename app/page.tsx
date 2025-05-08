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
    <main>
      {/* Hero */}
      <Hero />
      
      {/* Beneficios */}
      <Benefits />
      
      {/* Estadísticas */}
      <Stats />
      
      <PricingTable />
      <RegistrationCTA />
      <Footer />
    </main>
  );
}