'use client';

import { PeriodProvider } from './memoria-anual/context/PeriodContext';
import React from 'react';
import Sidebar from '@/components/ui/Sidebar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserButton } from '@clerk/nextjs';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Ahora funciona porque es un Client Component
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <PeriodProvider>
        <div className="h-screen flex overflow-hidden bg-gray-100">
          <Sidebar />
          <div className="flex flex-col w-0 flex-1 overflow-hidden">
            {/* Header */}
            <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
              <div className="flex-1 px-4 flex justify-end items-center">
                <div className="ml-4 flex items-center md:ml-6">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            </div>
            {/* Main content */}
            <main className="flex-1 relative overflow-y-auto focus:outline-none">
              {children}
            </main>
          </div>
        </div>
      </PeriodProvider>
    </QueryClientProvider>
  );
}