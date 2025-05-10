import React, { ReactNode } from 'react';

interface ModernCardProps {
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  title?: string;
}

export default function ModernCard({ 
  children, 
  className = '', 
  footer,
  title
}: ModernCardProps) {
  return (
    <div className={`bg-gradient-to-br from-white to-[#f8f9fc] rounded-2xl shadow-md border border-[rgba(231,231,231,0.8)] p-6 transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg ${className}`}>
      {title && (
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-[rgba(231,231,231,0.8)]">
          <h3 className="font-['Space_Grotesk'] font-semibold text-xl text-[#0F3460]">{title}</h3>
        </div>
      )}
      
      <div>
        {children}
      </div>
      
      {footer && (
        <div className="mt-4 pt-3 border-t border-[rgba(231,231,231,0.8)]">
          {footer}
        </div>
      )}
    </div>
  );
}