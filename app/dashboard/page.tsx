'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import GraficoPrimas from '@/components/GraficoPrimas';
import { createClient } from '@supabase/supabase-js';
import UpgradeSubscription from '@/components/UpgradeSubscription';

// Componente para mostrar productos premium bloqueados
const ProductosBloqueados = ({ onUpgrade }: { onUpgrade: () => void }) => (
  <div className="mt-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
    <h2 className="text-xl font-bold mb-2">Productos Premium</h2>
    <p className="text-gray-600 mb-4">Accede a informes detallados y análisis comparativos desbloqueando nuestros productos premium.</p>
    
    <div className="grid md:grid-cols-3 gap-4 mb-6">
      <div className="p-4 border border-gray-200 rounded-lg bg-white">
        <h3 className="font-semibold">Informe Individual</h3>
        <p className="text-sm text-gray-500 mb-2">Análisis detallado de un corredor</p>
        <div className="flex items-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-sm">Bloqueado</span>
        </div>
      </div>
      
      <div className="p-4 border border-gray-200 rounded-lg bg-white">
        <h3 className="font-semibold">Informe Comparativo</h3>
        <p className="text-sm text-gray-500 mb-2">Compara hasta 3 corredores</p>
        <div className="flex items-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-sm">Bloqueado</span>
        </div>
      </div>
      
      <div className="p-4 border border-gray-200 rounded-lg bg-white">
        <h3 className="font-semibold">Acceso Completo</h3>
        <p className="text-sm text-gray-500 mb-2">Todos los informes y datos</p>
        <div className="flex items-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-sm">Bloqueado</span>
        </div>
      </div>
    </div>
    
    <button 
      onClick={onUpgrade}
      className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
    >
      Desbloquear Productos Premium
    </button>
  </div>
);

// Definición de tipo para la información de empresa
type EmpresaInfo = {
  empresa?: string;
  rut_empresa?: string;
  [key: string]: any; // Para otras propiedades que pueda tener
};

// Componente para mostrar información de la empresa
const InformacionEmpresa = ({ empresa }: { empresa: EmpresaInfo }) => (
  <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white">
    <h2 className="text-lg font-semibold mb-2">Información de Empresa</h2>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-gray-500">Empresa</p>
        <p className="font-medium">{empresa.empresa || 'No disponible'}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">RUT</p>
        <p className="font-medium">{empresa.rut_empresa || 'No disponible'}</p>
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const { user } = useUser();
  const [empresaInfo, setEmpresaInfo] = useState<EmpresaInfo | null>(null);
  const [userRole, setUserRole] = useState('free'); // 'free', 'premium'
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Función para obtener información de la empresa y el rol del usuario
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        // Crear cliente de Supabase
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_KEY || ''
        );
        
        // Obtener información de la empresa
        const { data: empresaData, error: empresaError } = await supabase
          .from('registro_empresa')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (empresaError) throw empresaError;
        
        // Aquí se podría obtener información sobre el rol/suscripción del usuario
        // Por ahora, simulamos que todos los usuarios son 'free'
        // En una implementación real, esto vendría de una tabla de suscripciones
        
        setEmpresaInfo(empresaData);
        setUserRole('free'); // Por defecto todos son usuarios gratuitos
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const handleUpgradeClick = () => {
    setShowUpgradeModal(true);
  };
  
  const handleUpgradeSuccess = async () => {
    setShowUpgradeModal(false);
    // Recargar los datos del usuario para reflejar su nueva suscripción
    setLoading(true);
    try {
      const response = await fetch('/api/user-role');
      const data = await response.json();
      
      if (response.ok) {
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error al actualizar el rol del usuario:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpgradeCancel = () => {
    setShowUpgradeModal(false);
  };
  
  if (loading) {
    return (
      <main className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Memoria Anual del Mercado de Corredores</h1>
      <p className="text-gray-700 mb-6">Explora las tendencias del mercado de los últimos 13 años.</p>
      
      {empresaInfo && <InformacionEmpresa empresa={empresaInfo} />}
      
      <div className="mt-8">
        <GraficoPrimas />
      </div>
      
      {userRole === 'free' && <ProductosBloqueados onUpgrade={handleUpgradeClick} />}
      
      {showUpgradeModal && (
        <UpgradeSubscription 
          onSuccess={handleUpgradeSuccess} 
          onCancel={handleUpgradeCancel} 
        />
      )}
    </main>
  );
}