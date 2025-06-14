import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Protege las rutas que requieren autenticación
const isPublic = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Resolver la promesa de auth() para obtener el objeto de autenticación
  const authResult = await auth();
  
  // Si el usuario está en la página principal y ya está autenticado, redirigir al dashboard
  if (authResult.userId && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  // Si el usuario no está autenticado e intenta acceder a una ruta protegida
  if (!authResult.userId && !isPublic(req)) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|api|trpc|.*\.(?:jpg|jpeg|gif|png|webp|svg|ico|webmanifest)).*)",
    "/",
    "/(api|trpc)(.*)"
  ],
};
