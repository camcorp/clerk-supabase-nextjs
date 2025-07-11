// Tipos generados automáticamente desde Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          price: number
          company_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          company_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          company_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      vista_companias_periodo: {
        Row: {
          id: string
          nombrecia: string
          periodo: string
          total_primauf: number
          grupo: string
          tipo: string
        }
      }
    }
  }
}