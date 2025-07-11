// app/api/user-role/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
// Cambiar de '@/ssr/client' a:
import { createServerSupabaseClient } from '@/ssr/client';

// Endpoint para obtener el rol y suscripciones del usuario
export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();

  try {
    // Primero verificamos si existe información de suscripción para el usuario
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Si hay un error pero no es porque no se encontró el registro
    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.error('Error al obtener suscripción:', subscriptionError);
      return NextResponse.json({ error: subscriptionError.message }, { status: 500 });
    }

    // Si no existe información de suscripción, el usuario es gratuito por defecto
    if (!subscriptionData) {
      return NextResponse.json({ 
        role: 'free',
        subscription: null,
        products: ['memoria_anual']
      });
    }

    // Si existe información de suscripción, devolvemos los detalles
    return NextResponse.json({
      role: subscriptionData.role || 'free',
      subscription: {
        plan: subscriptionData.plan,
        status: subscriptionData.status,
        valid_until: subscriptionData.valid_until
      },
      products: subscriptionData.products || ['memoria_anual']
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// Endpoint para actualizar el rol y suscripciones del usuario (simulado)
export async function POST(req: Request) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { plan } = body;
    
    // Define plan type
    type PlanType = 'individual' | 'comparativo' | 'completo';
    
    // Validar el plan
    if (!['individual', 'comparativo', 'completo'].includes(plan)) {
      return NextResponse.json({ error: 'Plan no válido' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Mapeo de planes a productos y roles
    const planConfig: Record<PlanType, { role: string; products: string[] }> = {
      individual: {
        role: 'premium',
        products: ['memoria_anual', 'informe_individual']
      },
      comparativo: {
        role: 'premium',
        products: ['memoria_anual', 'informe_individual', 'informe_comparativo']
      },
      completo: {
        role: 'premium',
        products: ['memoria_anual', 'informe_individual', 'informe_comparativo', 'descarga_datos']
      }
    };
    
    // Cast plan to PlanType since we've validated it
    const validatedPlan = plan as PlanType;

    // Fecha de validez (1 año desde hoy)
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    // Insertar o actualizar la suscripción
    const { error } = await supabase.from('user_subscriptions').upsert({
      user_id: userId,
      plan: validatedPlan,
      role: planConfig[validatedPlan].role,
      products: planConfig[validatedPlan].products,
      status: 'active',
      valid_until: validUntil.toISOString(),
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.error('Error al actualizar suscripción:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Suscripción actualizada correctamente',
      plan: validatedPlan,
      role: planConfig[validatedPlan].role,
      products: planConfig[validatedPlan].products,
      valid_until: validUntil.toISOString()
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}