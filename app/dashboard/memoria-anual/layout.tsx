'use client';

import { ClerkProvider } from '@clerk/nextjs';
import React from 'react';
import { PeriodProvider } from './context/PeriodContext';
import { inter, spaceGrotesk } from './fonts';

export default function MemoriaAnualLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PeriodProvider>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </div>
    </PeriodProvider>
  );
}
