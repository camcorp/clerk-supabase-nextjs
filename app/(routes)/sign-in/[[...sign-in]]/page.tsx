'use client';

import { SignIn } from "@clerk/nextjs";
import { useEffect, useState } from 'react';

export default function Page() {
  // Usar un estado para controlar el renderizado del lado del cliente
  const [isMounted, setIsMounted] = useState(false);
  
  // Efecto que se ejecuta solo en el cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Iniciar Sesión
          </h2>
        </div>
        {/* Renderizar SignIn solo en el cliente para evitar errores de hidratación */}
        {isMounted && (
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            redirectUrl="/dashboard"
          />
        )}
      </div>
    </div>
  );
}