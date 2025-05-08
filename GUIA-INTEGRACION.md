# Guía de Integración: Clerk con Supabase en Next.js

## Corrección del Error de Instalación

El error que estás experimentando ocurre porque el paquete `@clerk/supabase` ya no está disponible. Según la documentación actualizada, la integración entre Clerk y Supabase ha cambiado.

### Paquetes Correctos para Instalar

```bash
npm install @clerk/nextjs @clerk/clerk-sdk-node @supabase/supabase-js @supabase/ssr
```

> **Nota importante**: La integración anterior de Clerk con Supabase está siendo descontinuada a partir del 1 de abril de 2025. Ahora se recomienda usar Clerk como un proveedor de autenticación de terceros con Supabase.

## Configuración de Row Level Security (RLS) en Supabase

Las políticas de Row Level Security (RLS) en Supabase te permiten controlar qué filas de datos pueden ser accedidas por los usuarios autenticados. Cuando usas Clerk con Supabase, necesitas implementar políticas RLS que utilicen el ID de usuario de Clerk.

### Paso 1: Habilitar RLS en tu tabla

Primero, debes habilitar RLS en tu tabla desde el panel de Supabase:

```sql
ALTER TABLE tu_tabla ENABLE ROW LEVEL SECURITY;
```

### Paso 2: Crear políticas RLS

Aquí hay ejemplos de políticas RLS comunes:

#### Política para SELECT (lectura)

```sql
CREATE POLICY "Los usuarios pueden ver sus propios datos" 
ON tu_tabla 
FOR SELECT 
USING (auth.uid() = user_id);
```

#### Política para INSERT (creación)

```sql
CREATE POLICY "Los usuarios pueden insertar sus propios datos" 
ON tu_tabla 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
```

#### Política para UPDATE (actualización)

```sql
CREATE POLICY "Los usuarios pueden actualizar sus propios datos" 
ON tu_tabla 
FOR UPDATE 
USING (auth.uid() = user_id);
```

#### Política para DELETE (eliminación)

```sql
CREATE POLICY "Los usuarios pueden eliminar sus propios datos" 
ON tu_tabla 
FOR DELETE 
USING (auth.uid() = user_id);
```

### Paso 3: Configurar la columna user_id en tus tablas

Para que las políticas RLS funcionen correctamente, tus tablas deben tener una columna (generalmente llamada `user_id`) que almacene el ID del usuario de Clerk. Ejemplo de creación de tabla:

```sql
CREATE TABLE tareas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  completada BOOLEAN DEFAULT FALSE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;

-- Crear políticas
CREATE POLICY "Los usuarios pueden ver sus propias tareas" 
ON tareas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propias tareas" 
ON tareas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias tareas" 
ON tareas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias tareas" 
ON tareas 
FOR DELETE 
USING (auth.uid() = user_id);
```

## Uso en tu aplicación Next.js

Para usar Supabase con Clerk en tu aplicación Next.js, debes asegurarte de que los tokens JWT de Clerk contengan la información necesaria para que Supabase pueda verificar la identidad del usuario.

### Ejemplo de cliente Supabase con autenticación de Clerk

En tu archivo de configuración de Supabase (como `/lib/supabase.ts`):

```typescript
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

// Cliente para uso en el servidor
export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${auth().getToken()}`
        }
      }
    }
  );
}

// Cliente para uso en componentes del cliente
export function createClientSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Uso en una ruta de API o Server Component

```typescript
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET() {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('tareas')
    .select('*');
    
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  
  return Response.json({ data });
}
```

## Recursos Adicionales

- [Documentación oficial de integración de Clerk con Supabase](https://clerk.com/docs/integrations/databases/supabase)
- [Documentación de Row Level Security de Supabase](https://supabase.com/docs/guides/auth/row-level-security)
- [Documentación de Clerk como proveedor de autenticación de terceros en Supabase](https://supabase.com/docs/guides/auth/third-party/clerk)