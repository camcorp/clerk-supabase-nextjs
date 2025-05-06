import React from 'react';
import { Hero } from './components/Hero';
import { Benefits } from './components/Benefits';
import { Stats } from './components/Stats';
import { PricingTable } from './components/PricingTable';
import { RegistrationCTA } from './components/RegistrationCTA';
import { Footer } from './components/Footer';
export function App() {
  return <div className="font-['SF Pro Display','Inter',system-ui,sans-serif] antialiased bg-gradient-to-br from-slate-50 to-white text-slate-900">
      <Hero />
      <Benefits />
      <Stats />
      <PricingTable />
      <RegistrationCTA />
      <Footer />
    </div>;
}