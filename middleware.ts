import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";

// Protege las rutas que requieren autenticación
export default authMiddleware({
  // Rutas públicas que no requieren autenticación
  publicRoutes: ["/", "/sign-in(.*)", "/sign-up(.*)"],
  
  // Función para manejar cuando un usuario no autenticado intenta acceder a una ruta protegida
  afterAuth(auth, req, evt) {
    // Manejar usuarios no autenticados
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  },
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
