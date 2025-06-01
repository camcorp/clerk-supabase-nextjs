'use client';

import { PeriodProvider } from './memoria-anual/context/PeriodContext';
import React from 'react';


// To this:
import Sidebar from '@/app/components/ui/Sidebar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <PeriodProvider>
        <div className="h-screen flex overflow-hidden bg-gray-100">
          <Sidebar />
          <div className="flex flex-col w-0 flex-1 overflow-hidden">
            <main className="flex-1 relative overflow-y-auto focus:outline-none">
              {children}
            </main>
          </div>
        </div>
      </PeriodProvider>
    </QueryClientProvider>
  );
}