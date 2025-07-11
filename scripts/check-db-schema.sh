#!/bin/bash

# Script de verificación de sincronización de base de datos

echo "🔍 Verificando sincronización de base de datos..."

# Verificar que Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI no está instalado"
    echo "Instala con: npm install -g supabase"
    exit 1
fi

# Verificar que estamos en un proyecto Supabase
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ No se encontró configuración de Supabase"
    echo "Ejecuta: supabase init"
    exit 1
fi

# Verificar estado del proyecto
echo "📊 Estado del proyecto:"
supabase status

echo ""
echo "🔍 Verificando diferencias..."

# Verificar diferencias
if supabase db diff --quiet; then
    echo "✅ Base de datos sincronizada"
else
    echo "⚠️  Hay diferencias en el esquema"
    echo ""
    echo "📋 Diferencias encontradas:"
    supabase db diff
    echo ""
    echo "💡 Para sincronizar:"
    echo "   - Aplicar cambios locales: supabase db push"
    echo "   - Traer cambios remotos: supabase db pull"
fi

echo ""
echo "🔐 Verificando políticas RLS..."
# Aquí puedes agregar verificaciones específicas de RLS

echo "✅ Verificación completada"