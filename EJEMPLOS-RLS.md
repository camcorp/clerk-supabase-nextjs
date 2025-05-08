# Ejemplos Prácticos de Políticas RLS con Clerk y Supabase

## Introducción

Este documento proporciona ejemplos prácticos de cómo implementar políticas de Row Level Security (RLS) en Supabase cuando se utiliza Clerk como proveedor de autenticación. Las políticas RLS son fundamentales para proteger tus datos y asegurar que los usuarios solo puedan acceder a la información que les corresponde.

## Ejemplo 1: Tabla de Perfiles de Usuario

```sql
-- Crear tabla de perfiles
CREATE TABLE perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  nombre TEXT,
  apellido TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo puedan ver su propio perfil
CREATE POLICY "Los usuarios pueden ver su propio perfil" 
ON perfiles 
FOR SELECT 
USING (auth.uid() = id);

-- Política para que los usuarios solo puedan actualizar su propio perfil
CREATE POLICY "Los usuarios pueden actualizar su propio perfil" 
ON perfiles 
FOR UPDATE 
USING (auth.uid() = id);
```

## Ejemplo 2: Tabla de Notas Privadas

```sql
-- Crear tabla de notas
CREATE TABLE notas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  contenido TEXT,
  user_id UUID NOT NULL,
  es_privada BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE notas ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver sus propias notas
CREATE POLICY "Los usuarios pueden ver sus propias notas" 
ON notas 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para que los usuarios puedan crear notas asociadas a su ID
CREATE POLICY "Los usuarios pueden crear sus propias notas" 
ON notas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios puedan actualizar sus propias notas
CREATE POLICY "Los usuarios pueden actualizar sus propias notas" 
ON notas 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Política para que los usuarios puedan eliminar sus propias notas
CREATE POLICY "Los usuarios pueden eliminar sus propias notas" 
ON notas 
FOR DELETE 
USING (auth.uid() = user_id);
```

## Ejemplo 3: Tabla de Proyectos Compartidos

```sql
-- Crear tabla de proyectos
CREATE TABLE proyectos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  creador_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de miembros del proyecto
CREATE TABLE miembros_proyecto (
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rol TEXT NOT NULL,
  PRIMARY KEY (proyecto_id, user_id)
);

-- Habilitar RLS
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE miembros_proyecto ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver proyectos donde son miembros
CREATE POLICY "Los usuarios pueden ver proyectos donde son miembros" 
ON proyectos 
FOR SELECT 
USING (
  auth.uid() = creador_id OR 
  EXISTS (
    SELECT 1 FROM miembros_proyecto 
    WHERE miembros_proyecto.proyecto_id = proyectos.id 
    AND miembros_proyecto.user_id = auth.uid()
  )
);

-- Política para que solo el creador pueda actualizar el proyecto
CREATE POLICY "Solo el creador puede actualizar el proyecto" 
ON proyectos 
FOR UPDATE 
USING (auth.uid() = creador_id);

-- Política para que solo el creador pueda eliminar el proyecto
CREATE POLICY "Solo el creador puede eliminar el proyecto" 
ON proyectos 
FOR DELETE 
USING (auth.uid() = creador_id);

-- Política para que el creador pueda gestionar miembros
CREATE POLICY "El creador puede gestionar miembros" 
ON miembros_proyecto 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM proyectos 
    WHERE proyectos.id = miembros_proyecto.proyecto_id 
    AND proyectos.creador_id = auth.uid()
  )
);

-- Política para que los miembros puedan ver a otros miembros
CREATE POLICY "Los miembros pueden ver a otros miembros" 
ON miembros_proyecto 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM miembros_proyecto AS mp 
    WHERE mp.proyecto_id = miembros_proyecto.proyecto_id 
    AND mp.user_id = auth.uid()
  )
);
```

## Ejemplo 4: Política para Datos Públicos y Privados

```sql
-- Crear tabla de publicaciones
CREATE TABLE publicaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  contenido TEXT,
  autor_id UUID NOT NULL,
  es_publica BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE publicaciones ENABLE ROW LEVEL SECURITY;

-- Política para que cualquiera pueda ver publicaciones públicas
CREATE POLICY "Cualquiera puede ver publicaciones públicas" 
ON publicaciones 
FOR SELECT 
USING (es_publica = TRUE);

-- Política para que los autores puedan ver sus propias publicaciones (públicas o privadas)
CREATE POLICY "Los autores pueden ver sus propias publicaciones" 
ON publicaciones 
FOR SELECT 
USING (auth.uid() = autor_id);

-- Política para que los autores puedan crear publicaciones
CREATE POLICY "Los autores pueden crear publicaciones" 
ON publicaciones 
FOR INSERT 
WITH CHECK (auth.uid() = autor_id);

-- Política para que los autores puedan actualizar sus publicaciones
CREATE POLICY "Los autores pueden actualizar sus publicaciones" 
ON publicaciones 
FOR UPDATE 
USING (auth.uid() = autor_id);

-- Política para que los autores puedan eliminar sus publicaciones
CREATE POLICY "Los autores pueden eliminar sus publicaciones" 
ON publicaciones 
FOR DELETE 
USING (auth.uid() = autor_id);
```

## Consejos para Implementar RLS con Clerk

1. **Siempre usa `auth.uid()`**: Esta función de Supabase devuelve el ID del usuario autenticado, que corresponderá al ID de usuario de Clerk cuando la integración esté configurada correctamente.

2. **Prueba tus políticas**: Después de implementar tus políticas RLS, asegúrate de probarlas exhaustivamente para verificar que funcionan como se espera.

3. **Considera políticas por defecto restrictivas**: Es una buena práctica denegar todo acceso por defecto y luego agregar políticas específicas que permitan acciones concretas.

4. **Documenta tus políticas**: Mantén documentación clara sobre qué políticas has implementado y por qué, para facilitar el mantenimiento futuro.

5. **Usa funciones para políticas complejas**: Si tienes lógica de autorización compleja, considera crear funciones PostgreSQL que puedas reutilizar en tus políticas RLS.