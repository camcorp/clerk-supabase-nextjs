import React from 'react';
import { Hero } from '@/app/components/ui/Hero';
import { Benefits } from '@/app/components/ui/Benefits';
import { Stats } from '@/app/components/ui/Stats';
import { PricingTable } from '@/app/components/ui/PricingTable';
import { RegistrationCTA } from '@/app/components/ui/RegistrationCTA';
import { Footer } from '@/app/components/ui/Footer';
export function App() {
  return <div className="font-sans antialiased bg-gradient-to-br from-slate-50 to-white text-slate-900">
      <Hero />
      <Benefits />
      <Stats />
      <PricingTable />
      <RegistrationCTA />
      <Footer />
    </div>;
}