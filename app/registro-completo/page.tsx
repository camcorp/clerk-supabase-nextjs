// app/registro-completo/page.tsx
'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function RegistroCompleto() {
  const { user } = useUser();
  const router = useRouter();
  const [empresa, setEmpresa] = useState('');
  const [rutEmpresa, setRutEmpresa] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/guardar-datos-empresa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user?.id,
        email: user?.primaryEmailAddress?.emailAddress,
        empresa,
        rut_empresa: rutEmpresa,
      }),
    });

    if (res.ok) {
      router.push('/dashboard');
    } else {
      alert('Hubo un error al guardar tus datos.');
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-100 p-6 rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Completa tu Registro</h1>

        <label className="block">
          <span className="text-gray-700">Empresa</span>
          <input
            type="text"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            required
            className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2"
          />
        </label>

        <label className="block">
          <span className="text-gray-700">RUT de la Empresa</span>
          <input
            type="text"
            value={rutEmpresa}
            onChange={(e) => setRutEmpresa(e.target.value)}
            required
            className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Guardando...' : 'Guardar y Continuar'}
        </button>
      </form>
    </main>
  );
}