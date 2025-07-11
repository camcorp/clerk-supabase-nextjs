import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function RegistroCompletoPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            ¡Bienvenido! Completa tu registro
          </h1>
          <p className="text-gray-600 mb-8">
            Tu cuenta ha sido creada exitosamente. Ahora puedes completar tu perfil.
          </p>
          
          {/* Aquí puedes agregar un formulario para completar el perfil */}
          <div className="space-y-4">
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium"
            >
              Ir al Dashboard
            </button>
            <button 
              onClick={() => window.location.href = '/perfil'}
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-lg font-medium"
            >
              Completar Perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}