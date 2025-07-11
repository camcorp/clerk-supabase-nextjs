'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from '@clerk/nextjs';
import { useMemo } from 'react';

/**
 * Cliente de Supabase para componentes del lado del cliente
 * Utiliza la autenticación de Clerk para obtener el token JWT
 */
export function useSupabaseClient() {
  const { userId, getToken } = useAuth();
  
  const supabaseClient = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          get(name: string) {
            if (typeof document !== 'undefined') {
              const value = `; ${document.cookie}`;
              const parts = value.split(`; ${name}=`);
              if (parts.length === 2) {
                return parts.pop()?.split(';').shift();
              }
            }
            return undefined;
          },
          set(name: string, value: string, options: any) {
            if (typeof document !== 'undefined') {
              let cookieString = `${name}=${value}`;
              if (options?.expires) {
                cookieString += `; expires=${options.expires.toUTCString()}`;
              }
              if (options?.path) {
                cookieString += `; path=${options.path}`;
              }
              if (options?.domain) {
                cookieString += `; domain=${options.domain}`;
              }
              if (options?.secure) {
                cookieString += '; secure';
              }
              if (options?.sameSite) {
                cookieString += `; samesite=${options.sameSite}`;
              }
              document.cookie = cookieString;
            }
          },
          remove(name: string, options: any) {
            if (typeof document !== 'undefined') {
              let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
              if (options?.path) {
                cookieString += `; path=${options.path}`;
              }
              if (options?.domain) {
                cookieString += `; domain=${options.domain}`;
              }
              document.cookie = cookieString;
            }
          },
        },
        global: {
          fetch: async (url, options = {}) => {
            if (userId) {
              // Usar el token JWT de Clerk
              const token = await getToken({ template: 'supabase' });
              
              if (options && typeof options === 'object') {
                (options as any).headers = {
                  ...(options as any).headers,
                  'x-user-id': userId,
                  Authorization: `Bearer ${token}`
                };
              }
            }
            return fetch(url, options);
          }
        }
      }
    );
  }, [userId, getToken]);

  return supabaseClient;
}

// Cliente simple para uso en contextos donde no se necesita autenticación
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document !== 'undefined') {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) {
              return parts.pop()?.split(';').shift();
            }
          }
          return undefined;
        },
        set(name: string, value: string, options: any) {
          if (typeof document !== 'undefined') {
            let cookieString = `${name}=${value}`;
            if (options?.expires) {
              cookieString += `; expires=${options.expires.toUTCString()}`;
            }
            if (options?.path) {
              cookieString += `; path=${options.path}`;
            }
            if (options?.domain) {
              cookieString += `; domain=${options.domain}`;
            }
            if (options?.secure) {
              cookieString += '; secure';
            }
            if (options?.sameSite) {
              cookieString += `; samesite=${options.sameSite}`;
            }
            document.cookie = cookieString;
          }
        },
        remove(name: string, options: any) {
          if (typeof document !== 'undefined') {
            let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
            if (options?.path) {
              cookieString += `; path=${options.path}`;
            }
            if (options?.domain) {
              cookieString += `; domain=${options.domain}`;
            }
            document.cookie = cookieString;
          }
        },
      },
    }
  );

// Exportar cliente por defecto
export const supabase = createClient();
export default supabase;