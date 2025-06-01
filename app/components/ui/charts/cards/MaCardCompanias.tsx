'use client';

import React from 'react';

interface MaCardCompaniasProps {
  companyCount: number;
  corredorCount: number;
}

export default function MaCardCompanias({ companyCount, corredorCount }: MaCardCompaniasProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <dt className="text-sm font-medium text-gray-500 truncate">
          Compañías y Corredores
        </dt>
        <dd className="mt-1 text-3xl font-semibold text-gray-900">
          {companyCount} / {corredorCount}
        </dd>
        <dd className="mt-2 text-sm text-gray-500">
          Compañías / Corredores activos
        </dd>
      </div>
    </div>
  );
}