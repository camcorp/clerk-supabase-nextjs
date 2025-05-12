import React from 'react';

interface NoDataProps {
  message?: string;
}

export default function NoData({ message = 'No hay datos disponibles' }: NoDataProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-lg shadow-sm border border-[#E9ECEF]">
      <svg
        className="w-16 h-16 text-[#6C757D] mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p className="text-[#6C757D] text-center">{message}</p>
    </div>
  );
}