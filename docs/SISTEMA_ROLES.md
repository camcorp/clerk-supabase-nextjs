# Sistema de Roles y Suscripciones

Este documento describe la implementación del sistema de roles y suscripciones para la aplicación de Memoria Anual del Mercado de Corredores.

## Estructura del Sistema

El sistema implementa un modelo de suscripciones con los siguientes componentes:

### 1. Base de Datos

Se ha creado una tabla `user_subscriptions` en Supabase con la siguiente estructura:

```sql
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  plan TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'free',
  products TEXT[] NOT NULL DEFAULT '{"memoria_anual"}',
  status TEXT NOT NULL DEFAULT 'active',
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### 2. Roles de Usuario

El sistema contempla dos roles principales:

- **free**: Usuarios con acceso solo a la Memoria Anual (gratuita)
- **premium**: Usuarios con acceso a productos adicionales según su plan

### 3. Planes de Suscripción

Se han definido tres planes de suscripción:

- **individual**: Acceso a Memoria Anual e Informe Individual
- **comparativo**: Acceso a Memoria Anual, Informe Individual e Informe Comparativo
- **completo**: Acceso a todos los productos, incluyendo descarga de datos

## Componentes Implementados

### API Endpoints

- **GET /api/user-role**: Obtiene el rol y productos disponibles para el usuario actual
- **POST /api/user-role**: Actualiza la suscripción del usuario (simulado sin integración de pagos)

### Componentes de UI

- **ProductosBloqueados**: Muestra los productos premium bloqueados para usuarios gratuitos
- **UpgradeSubscription**: Modal para seleccionar y actualizar el plan de suscripción
- **InformacionEmpresa**: Muestra la información de la empresa registrada

## Flujo de Usuario

1. El usuario se registra en la plataforma (usando Clerk)
2. Completa su registro con información de empresa
3. Accede al dashboard donde ve la Memoria Anual (gratuita)
4. Visualiza los productos premium bloqueados
5. Puede actualizar su suscripción seleccionando un plan de pago

## Implementación de Seguridad

Se han implementado políticas de Row Level Security (RLS) en Supabase para garantizar que:

- Los usuarios solo pueden ver sus propias suscripciones
- Solo el rol de servicio puede insertar/actualizar/eliminar suscripciones

## Configuración Inicial

Para configurar el sistema de suscripciones, ejecute el script de migración:

```bash
node scripts/setup-user-subscriptions.js
```

Este script creará la tabla necesaria y configurará las políticas de seguridad en Supabase.

## Integración con Pagos (Pendiente)

Actualmente, el sistema simula la actualización de suscripciones sin integración real con un procesador de pagos. Para una implementación completa, se recomienda integrar con servicios como:

- Stripe
- PayPal
- Mercado Pago (para Chile)

## Próximos Pasos

1. Implementar la integración con un procesador de pagos
2. Desarrollar los componentes para visualizar los informes premium
3. Implementar un sistema de notificaciones para recordar renovaciones
4. Crear un panel de administración para gestionar suscripciones