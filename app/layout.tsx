import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
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
          <header className="p-4 flex justify-between items-center bg-white shadow-sm">
            <div>
              <Link href="/" className="text-xl font-bold text-blue-600">MiApp</Link>
            </div>
            <div>
              <SignedOut>
                <SignInButton mode="modal" redirectUrl="/dashboard">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
                    Iniciar Sesión
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-4">
                  <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
                    Dashboard
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </div>
          </header>
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
