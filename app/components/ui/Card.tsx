import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  hoverEffect?: boolean;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

// Componente Card principal
export default function Card({ 
  children, 
  className = '', 
  title,
  subtitle,
  footer,
  hoverEffect = true
}: CardProps) {
  return (
    <div className={`
      bg-gradient-to-br from-white to-[#f8f9fc] 
      rounded-xl shadow-sm border border-[rgba(231,231,231,0.8)] 
      p-6 
      ${hoverEffect ? 'transition-all duration-300 hover:translate-y-[-5px] hover:shadow-md' : ''}
      ${className}
    `}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-[#0F3460] font-['Space_Grotesk']">{title}</h3>}
          {subtitle && <p className="text-sm text-[#6C757D]">{subtitle}</p>}
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

// Exportaciones nombradas
export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-lg font-semibold text-[#0F3460] font-['Space_Grotesk'] ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-[#6C757D] ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
}

// Exportación nombrada del componente principal para compatibilidad
export { Card };