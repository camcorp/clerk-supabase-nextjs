import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  hoverEffect?: boolean;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

// Componente principal Card (mantener compatibilidad)
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
          {title && <h3 className="text-lg font-semibold text-[#0F3460] font-sans">{title}</h3>}
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

// Exports nombrados para compatibilidad con shadcn/ui
export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={cn('p-6 pb-3', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={cn('text-lg font-semibold text-[#0F3460] font-sans', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={cn('p-6 pt-0', className)}>
      {children}
    </div>
  );
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </p>
  );
}

// Re-exportar el componente principal también como export nombrado
export { Card };