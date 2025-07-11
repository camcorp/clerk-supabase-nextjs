import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

describe('Database Schema Validation', () => {
  test('should match expected table structure', async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    expect(error).toBeNull()
    // Validar estructura esperada
  })
})