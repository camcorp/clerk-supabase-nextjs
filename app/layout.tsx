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

// Verify environment variables are available during build
const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!clerkPubKey) {
  console.error("Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
}

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
                <div className="flex items-center">
                  <Link href="/" className="text-xl font-bold text-blue-600">MiApp</Link>
                </div>
                
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
                      <Link href="/reportes" className="text-gray-600 hover:text-blue-600">
                        Reportes
                      </Link>
                      <Link href="/configuracion" className="text-gray-600 hover:text-blue-600">
                        Configuración
                      </Link>
                    </nav>
                    <UserButton afterSignOutUrl="/" />
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
