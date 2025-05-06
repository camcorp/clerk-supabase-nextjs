'use client';

import { useEffect } from 'react';

export default function DebugEnv() {
  useEffect(() => {
    // Log environment variables to verify they're being loaded
    console.log('Clerk Publishable Key:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_KEY);
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-md">
      <h2 className="text-lg font-bold mb-2">Environment Variables Debug</h2>
      <p>Check the console for environment variable values.</p>
      <p className="text-sm text-gray-600 mt-2">
        Note: Only public variables (NEXT_PUBLIC_*) will be visible in the browser.
      </p>
    </div>
  );
}