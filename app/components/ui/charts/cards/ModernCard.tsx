import React, { ReactNode } from 'react';

interface ModernCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export default function ModernCard({ title, subtitle, children, className = '' }: ModernCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-[#E9ECEF] overflow-hidden transition-all duration-300 hover:shadow-md ${className}`}>
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#0F3460] font-['Space_Grotesk']">{title}</h3>
          {subtitle && <p className="text-sm text-[#6C757D]">{subtitle}</p>}
        </div>
        
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}