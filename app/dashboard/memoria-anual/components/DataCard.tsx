import React, { ReactNode } from 'react';

interface DataCardProps {
  title: string;
  children?: ReactNode;
  footer?: ReactNode;
  clp?: number;
  uf?: number;
}

export default function DataCard({ 
  title, 
  children, 
  footer,
  clp,
  uf
}: DataCardProps) {
  // Format number as currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(value);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] overflow-hidden transition-all duration-300 hover:shadow-md hover:translate-y-[-4px]">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-[#0F3460] font-['Space_Grotesk'] mb-4">{title}</h3>
        
        {(clp !== undefined || uf !== undefined) && (
          <div className="space-y-4 py-4">
            {uf !== undefined && (
              <div>
                <p className="text-sm text-[#6C757D]">Total en UF</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-[#0F3460] to-[#1A7F8E] bg-clip-text text-transparent">
                  {formatCurrency(uf)}
                </p>
              </div>
            )}
            {clp !== undefined && (
              <div>
                <p className="text-sm text-[#6C757D]">Total en CLP</p>
                <p className="text-2xl font-bold text-[#0F3460]">
                  {formatCurrency(clp)}
                </p>
              </div>
            )}
          </div>
        )}
        
        {children}
      </div>
      
      {footer && (
        <div className="bg-[#F8F9FC] px-6 py-3 border-t border-[#E9ECEF]">
          {footer}
        </div>
      )}
    </div>
  );
}