// scripts/setup-user-subscriptions.js
// Script para crear la tabla de suscripciones de usuario en Supabase

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no definidas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function setupUserSubscriptions() {
  console.log('Iniciando configuración de tabla de suscripciones de usuario...');

  try {
    // Verificar si la tabla ya existe
    const { data: existingTables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_subscriptions');

    if (tablesError) {
      throw new Error(`Error al verificar tablas existentes: ${tablesError.message}`);
    }

    // Si la tabla ya existe, preguntar si se desea continuar
    if (existingTables && existingTables.length > 0) {
      console.log('La tabla user_subscriptions ya existe. Se omitirá la creación.');
    } else {
      // Crear la tabla user_subscriptions
      console.log('Creando tabla user_subscriptions...');
      
      // Usar SQL directo para crear la tabla con todas las restricciones necesarias
      const { error: createTableError } = await supabase.rpc('exec_sql', {
        sql_query: `
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
          
          -- Crear índice para búsquedas rápidas por user_id
          CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
          
          -- Crear política RLS para que los usuarios solo puedan ver sus propias suscripciones
          ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Users can view their own subscriptions"
            ON public.user_subscriptions
            FOR SELECT
            USING (auth.uid()::text = user_id);
          
          -- Solo permitir que el servicio actualice las suscripciones
          CREATE POLICY "Only service role can insert/update/delete"
            ON public.user_subscriptions
            FOR ALL
            USING (auth.role() = 'service_role');
        `
      });

      if (createTableError) {
        throw new Error(`Error al crear tabla user_subscriptions: ${createTableError.message}`);
      }

      console.log('Tabla user_subscriptions creada exitosamente.');
    }

    console.log('Configuración completada con éxito.');
  } catch (error) {
    console.error('Error durante la configuración:', error.message);
    process.exit(1);
  }
}

setupUserSubscriptions();