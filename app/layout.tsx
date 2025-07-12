// Importar otras dependencias
import '@/app/lib/utils/chartConfig';

import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  SignUpButton,
} from "@clerk/nextjs";
import "./globals.css";
import Link from "next/link";
import UserButtonWrapper from './components/ui/UserButtonWrapper';
import { Metadata } from 'next';

// Verify environment variables are available during build
const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!clerkPubKey) {
  console.error("Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
}

export const metadata: Metadata = {
  icons: {
    icon: '/icons/favicon-32x32.png',
    shortcut: '/icons/favicon-16x16.png',
    apple: '/icons/apple-touch-icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/icons/apple-touch-icon.png',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body>
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                {/* Se eliminó el div con el Link a la página principal */}
                
                <div className="flex items-center">
                  <SignedOut>
                    <div className="flex items-center space-x-4">
                      <SignInButton mode="modal">
                        <button className="text-gray-600 hover:text-blue-600">
                          Iniciar Sesión
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                          Registrarse
                        </button>
                      </SignUpButton>
                    </div>
                  </SignedOut>
                  
                  <SignedIn>
                    <nav className="flex items-center space-x-6 mr-6">
                      <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
                        Dashboard
                      </Link>
                      <Link href="/perfil" className="text-gray-600 hover:text-blue-600">
                        Mi Perfil
                      </Link>
                      <Link href="/dashboard/corredor/reportes" className="text-gray-600 hover:text-blue-600">
                        Reportes
                      </Link>
                      <Link href="/configuracion" className="text-gray-600 hover:text-blue-600">
                        Configuración
                      </Link>
                    </nav>
                    <UserButtonWrapper afterSignOutUrl="/" />
                  </SignedIn>
                </div>
              </div>
            </div>
          </header>
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
