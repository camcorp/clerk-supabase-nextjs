import React, { ReactNode } from 'react';
import { formatCurrency } from '@/lib/utils/formatters';

// ... existing code ...

interface DataCardProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  clp?: number;
  uf?: number;
}

export default function DataCard({ title, children, footer, clp, uf }: DataCardProps) {
  // Format number as currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(value);
  };

  // Format number as currency
  const formatCurrencyValue = (value: number) => {
    return formatCurrency(value);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-[#0F3460] font-['Space_Grotesk'] mb-4">{title}</h3>
        
        {children}
        
        {(clp || uf) && (
          <div className="mt-4 pt-4 border-t border-[#E9ECEF]">
            {uf && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#6C757D]">Total UF:</span>
                <span className="font-semibold text-[#0F3460]">{formatCurrencyValue(uf)}</span>
              </div>
            )}
            {clp && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#6C757D]">Total CLP:</span>
                <span className="font-semibold text-[#0F3460]">{formatCurrency(clp)}</span>
              </div>
            )}
          </div>
        )}
        
        {footer && <div className="mt-4 pt-4 border-t border-[#E9ECEF]">{footer}</div>}
      </div>
    </div>
  );
}