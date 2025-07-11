export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accesos: {
        Row: {
          activo: boolean
          fecha_fin: string
          fecha_inicio: string
          id: string
          modulo: string
          producto_id: string
          user_id: string
        }
        Insert: {
          activo?: boolean
          fecha_fin: string
          fecha_inicio?: string
          id?: string
          modulo: string
          producto_id: string
          user_id: string
        }
        Update: {
          activo?: boolean
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          modulo?: string
          producto_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accesos_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      accesos_usuarios: {
        Row: {
          activo: boolean | null
          fecha_actualizacion: string | null
          fecha_creacion: string | null
          fecha_fin: string
          fecha_inicio: string
          id: string
          modulo: string
          producto_id: string | null
          user_id: string
        }
        Insert: {
          activo?: boolean | null
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          fecha_fin: string
          fecha_inicio: string
          id?: string
          modulo: string
          producto_id?: string | null
          user_id: string
        }
        Update: {
          activo?: boolean | null
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          modulo?: string
          producto_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accesos_usuarios_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      actores_salientes: {
        Row: {
          fecha_salida: string | null
          id: number
          motivo: string | null
          nombrecia: string
          rutcia: string
        }
        Insert: {
          fecha_salida?: string | null
          id?: number
          motivo?: string | null
          nombrecia: string
          rutcia: string
        }
        Update: {
          fecha_salida?: string | null
          id?: number
          motivo?: string | null
          nombrecia?: string
          rutcia?: string
        }
        Relationships: []
      }
      companias: {
        Row: {
          grupo: string | null
          id: number
          nombrecia: string
          rutcia: string
        }
        Insert: {
          grupo?: string | null
          id?: number
          nombrecia: string
          rutcia: string
        }
        Update: {
          grupo?: string | null
          id?: number
          nombrecia?: string
          rutcia?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string | null
          id: string
          name: string
          rut: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          rut?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          rut?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      configuracion_flow: {
        Row: {
          activo: boolean | null
          api_key: string
          api_url: string
          fecha_actualizacion: string | null
          fecha_creacion: string | null
          id: string
          sandbox_mode: boolean | null
          secret_key: string
        }
        Insert: {
          activo?: boolean | null
          api_key: string
          api_url?: string
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          id?: string
          sandbox_mode?: boolean | null
          secret_key: string
        }
        Update: {
          activo?: boolean | null
          api_key?: string
          api_url?: string
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          id?: string
          sandbox_mode?: boolean | null
          secret_key?: string
        }
        Relationships: []
      }
      corredores: {
        Row: {
          activo: boolean | null
          ciudad: string | null
          domicilio: string | null
          fecha_actualizacion: string | null
          fecha_creacion: string | null
          id: number
          nombre: string
          region: number | null
          rut: string
          telefono: string | null
          tipo_persona: string | null
        }
        Insert: {
          activo?: boolean | null
          ciudad?: string | null
          domicilio?: string | null
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          id?: number
          nombre: string
          region?: number | null
          rut: string
          telefono?: string | null
          tipo_persona?: string | null
        }
        Update: {
          activo?: boolean | null
          ciudad?: string | null
          domicilio?: string | null
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          id?: number
          nombre?: string
          region?: number | null
          rut?: string
          telefono?: string | null
          tipo_persona?: string | null
        }
        Relationships: []
      }
      fusiones: {
        Row: {
          fecha_fusion: string
          id: number
          motivo: string | null
          rutcia_nueva: string
          rutcia_original: string
        }
        Insert: {
          fecha_fusion: string
          id?: number
          motivo?: string | null
          rutcia_nueva: string
          rutcia_original: string
        }
        Update: {
          fecha_fusion?: string
          id?: number
          motivo?: string | null
          rutcia_nueva?: string
          rutcia_original?: string
        }
        Relationships: []
      }
      identifi: {
        Row: {
          ciudad: string | null
          domicilio: string | null
          id: number
          nombre: string
          periodo: string | null
          region: number | null
          rut: string
          telefono: string | null
          tipo_persona: string | null
        }
        Insert: {
          ciudad?: string | null
          domicilio?: string | null
          id?: number
          nombre: string
          periodo?: string | null
          region?: number | null
          rut: string
          telefono?: string | null
          tipo_persona?: string | null
        }
        Update: {
          ciudad?: string | null
          domicilio?: string | null
          id?: number
          nombre?: string
          periodo?: string | null
          region?: number | null
          rut?: string
          telefono?: string | null
          tipo_persona?: string | null
        }
        Relationships: []
      }
      intercia: {
        Row: {
          grupo: string | null
          id: number
          nombrecia: string | null
          periodo: string
          primaclp: number
          primauf: number
          rut: string
          rutcia: string | null
          signo: string | null
        }
        Insert: {
          grupo?: string | null
          id?: number
          nombrecia?: string | null
          periodo: string
          primaclp: number
          primauf: number
          rut: string
          rutcia?: string | null
          signo?: string | null
        }
        Update: {
          grupo?: string | null
          id?: number
          nombrecia?: string | null
          periodo?: string
          primaclp?: number
          primauf?: number
          rut?: string
          rutcia?: string | null
          signo?: string | null
        }
        Relationships: []
      }
      logs_sistema: {
        Row: {
          accion: string
          datos_anteriores: Json | null
          datos_nuevos: Json | null
          fecha_creacion: string | null
          id: string
          ip_address: unknown | null
          registro_id: string | null
          tabla_afectada: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          accion: string
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          fecha_creacion?: string | null
          id?: string
          ip_address?: unknown | null
          registro_id?: string | null
          tabla_afectada?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          accion?: string
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          fecha_creacion?: string | null
          id?: string
          ip_address?: unknown | null
          registro_id?: string | null
          tabla_afectada?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pagos: {
        Row: {
          amount: number
          datos_facturacion: Json | null
          estado: string
          fecha_actualizacion: string | null
          fecha_creacion: string | null
          flow_currency: string | null
          flow_optional: string | null
          flow_order: number | null
          flow_payer_email: string | null
          flow_payment_data: Json | null
          flow_payment_id: string | null
          flow_pending_info: Json | null
          flow_status: string | null
          flow_subject: string | null
          flow_token: string | null
          id: string
          ip_address: unknown | null
          iva: number | null
          metodo_pago: string | null
          monto: number | null
          orden_comercio: string
          producto_id: string
          rut_factura: string
          subtotal: number | null
          token: string | null
          transaction_id: string | null
          url_pago: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          amount: number
          datos_facturacion?: Json | null
          estado?: string
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          flow_currency?: string | null
          flow_optional?: string | null
          flow_order?: number | null
          flow_payer_email?: string | null
          flow_payment_data?: Json | null
          flow_payment_id?: string | null
          flow_pending_info?: Json | null
          flow_status?: string | null
          flow_subject?: string | null
          flow_token?: string | null
          id?: string
          ip_address?: unknown | null
          iva?: number | null
          metodo_pago?: string | null
          monto?: number | null
          orden_comercio: string
          producto_id: string
          rut_factura: string
          subtotal?: number | null
          token?: string | null
          transaction_id?: string | null
          url_pago?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          datos_facturacion?: Json | null
          estado?: string
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          flow_currency?: string | null
          flow_optional?: string | null
          flow_order?: number | null
          flow_payer_email?: string | null
          flow_payment_data?: Json | null
          flow_payment_id?: string | null
          flow_pending_info?: Json | null
          flow_status?: string | null
          flow_subject?: string | null
          flow_token?: string | null
          id?: string
          ip_address?: unknown | null
          iva?: number | null
          metodo_pago?: string | null
          monto?: number | null
          orden_comercio?: string
          producto_id?: string
          rut_factura?: string
          subtotal?: number | null
          token?: string | null
          transaction_id?: string | null
          url_pago?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pagos_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      periodos: {
        Row: {
          id: number
          periodo: string
        }
        Insert: {
          id?: number
          periodo: string
        }
        Update: {
          id?: number
          periodo?: string
        }
        Relationships: []
      }
      prodramo: {
        Row: {
          cod: string
          grupo: number
          id: number
          periodo: string
          primaclp: number
          primauf: number | null
          rut: string | null
          signo: string | null
        }
        Insert: {
          cod: string
          grupo: number
          id?: number
          periodo: string
          primaclp: number
          primauf?: number | null
          rut?: string | null
          signo?: string | null
        }
        Update: {
          cod?: string
          grupo?: number
          id?: number
          periodo?: string
          primaclp?: number
          primauf?: number | null
          rut?: string | null
          signo?: string | null
        }
        Relationships: []
      }
      productos: {
        Row: {
          activo: boolean | null
          codigo: string
          descripcion: string | null
          duracion_dias: number | null
          fecha_creacion: string | null
          id: string
          iva: number | null
          nombre: string
          precio_bruto: number | null
          precio_neto: number
          tipo_producto: string | null
        }
        Insert: {
          activo?: boolean | null
          codigo: string
          descripcion?: string | null
          duracion_dias?: number | null
          fecha_creacion?: string | null
          id?: string
          iva?: number | null
          nombre: string
          precio_bruto?: number | null
          precio_neto: number
          tipo_producto?: string | null
        }
        Update: {
          activo?: boolean | null
          codigo?: string
          descripcion?: string | null
          duracion_dias?: number | null
          fecha_creacion?: string | null
          id?: string
          iva?: number | null
          nombre?: string
          precio_bruto?: number | null
          precio_neto?: number
          tipo_producto?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          price: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          price?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ramos: {
        Row: {
          cod: string | null
          codigo: string
          codsg: string | null
          grupo: string
          id: number
          ramo: string
          subgrupo: string | null
        }
        Insert: {
          cod?: string | null
          codigo: string
          codsg?: string | null
          grupo: string
          id?: number
          ramo: string
          subgrupo?: string | null
        }
        Update: {
          cod?: string | null
          codigo?: string
          codsg?: string | null
          grupo?: string
          id?: number
          ramo?: string
          subgrupo?: string | null
        }
        Relationships: []
      }
      registro_empresa: {
        Row: {
          created_at: string | null
          email: string | null
          empresa: string | null
          id: string
          rut_empresa: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          empresa?: string | null
          id?: string
          rut_empresa?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          empresa?: string | null
          id?: string
          rut_empresa?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reporte_individual: {
        Row: {
          activo: boolean
          data: Json
          fecha_expiracion: string
          fecha_generacion: string | null
          id: string
          periodo: string
          rut: string
          user_id: string
        }
        Insert: {
          activo?: boolean
          data: Json
          fecha_expiracion: string
          fecha_generacion?: string | null
          id?: string
          periodo: string
          rut: string
          user_id: string
        }
        Update: {
          activo?: boolean
          data?: Json
          fecha_expiracion?: string
          fecha_generacion?: string | null
          id?: string
          periodo?: string
          rut?: string
          user_id?: string
        }
        Relationships: []
      }
      reportes_individuales: {
        Row: {
          activo: boolean | null
          datos_reporte: Json | null
          fecha_actualizacion: string | null
          fecha_creacion: string | null
          fecha_expiracion: string
          fecha_generacion: string | null
          id: string
          periodo: string
          rut: string
          user_id: string
        }
        Insert: {
          activo?: boolean | null
          datos_reporte?: Json | null
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          fecha_expiracion: string
          fecha_generacion?: string | null
          id?: string
          periodo: string
          rut: string
          user_id: string
        }
        Update: {
          activo?: boolean | null
          datos_reporte?: Json | null
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          fecha_expiracion?: string
          fecha_generacion?: string | null
          id?: string
          periodo?: string
          rut?: string
          user_id?: string
        }
        Relationships: []
      }
      temp_concentracion_mercado: {
        Row: {
          grupo: string | null
          periodo: string | null
          total_clp: number | null
          total_uf: number | null
        }
        Insert: {
          grupo?: string | null
          periodo?: string | null
          total_clp?: number | null
          total_uf?: number | null
        }
        Update: {
          grupo?: string | null
          periodo?: string | null
          total_clp?: number | null
          total_uf?: number | null
        }
        Relationships: []
      }
      transacciones_flow: {
        Row: {
          fecha_creacion: string | null
          flow_amount: number
          flow_confirmation_date: string | null
          flow_currency: string | null
          flow_order: number | null
          flow_payer_email: string | null
          flow_payment_date: string | null
          flow_payment_id: string | null
          flow_raw_response: Json | null
          flow_status: string
          flow_token: string
          id: string
          pago_id: string | null
        }
        Insert: {
          fecha_creacion?: string | null
          flow_amount: number
          flow_confirmation_date?: string | null
          flow_currency?: string | null
          flow_order?: number | null
          flow_payer_email?: string | null
          flow_payment_date?: string | null
          flow_payment_id?: string | null
          flow_raw_response?: Json | null
          flow_status: string
          flow_token: string
          id?: string
          pago_id?: string | null
        }
        Update: {
          fecha_creacion?: string | null
          flow_amount?: number
          flow_confirmation_date?: string | null
          flow_currency?: string | null
          flow_order?: number | null
          flow_payer_email?: string | null
          flow_payment_date?: string | null
          flow_payment_id?: string | null
          flow_raw_response?: Json | null
          flow_status?: string
          flow_token?: string
          id?: string
          pago_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transacciones_flow_pago_id_fkey"
            columns: ["pago_id"]
            isOneToOne: false
            referencedRelation: "pagos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_flow_pago_id_fkey"
            columns: ["pago_id"]
            isOneToOne: false
            referencedRelation: "vista_pagos_exitosos"
            referencedColumns: ["id"]
          },
        ]
      }
      uf_values: {
        Row: {
          id: number
          periodo: string
          valor: number
        }
        Insert: {
          id?: number
          periodo: string
          valor: number
        }
        Update: {
          id?: number
          periodo?: string
          valor?: number
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          id: string
          plan: string
          products: string[] | null
          role: string
          status: string
          updated_at: string | null
          user_id: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          plan: string
          products?: string[] | null
          role?: string
          status?: string
          updated_at?: string | null
          user_id: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          plan?: string
          products?: string[] | null
          role?: string
          status?: string
          updated_at?: string | null
          user_id?: string
          valid_until?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      indicadores_generales_corredor: {
        Row: {
          crecimiento_clp: number | null
          crecimiento_uf: number | null
          hhi_companias: number | null
          hhi_ramos: number | null
          num_companias: number | null
          num_ramos: number | null
          participacion_clp: number | null
          periodo: string | null
          ranking_general: number | null
          rut: string | null
          total_primaclp: number | null
          total_primauf: number | null
          variacion_clp_pp: number | null
        }
        Relationships: []
      }
      memoria_anual_ramos: {
        Row: {
          codigo: string | null
          ramo: string | null
          total_clp: number | null
          total_uf: number | null
        }
        Relationships: []
      }
      ranking_companias: {
        Row: {
          periodo: string | null
          ranking_produccion: number | null
          rut: string | null
          rutcia: string | null
          total_primaclp: number | null
        }
        Relationships: []
      }
      ranking_general: {
        Row: {
          periodo: string | null
          ranking_produccion: number | null
          rut: string | null
          total_primaclp: number | null
        }
        Relationships: []
      }
      ranking_ramos: {
        Row: {
          periodo: string | null
          primaclp: number | null
          ramo_cod: string | null
          ranking_produccion: number | null
          rut: string | null
        }
        Relationships: []
      }
      vista_accesos_activos: {
        Row: {
          fecha_creacion: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string | null
          modulo: string | null
          producto_codigo: string | null
          producto_nombre: string | null
          user_id: string | null
          vigente: boolean | null
        }
        Relationships: []
      }
      vista_companias_periodo: {
        Row: {
          crecimiento_clp: number | null
          crecimiento_uf: number | null
          grupo: string | null
          nombrecia: string | null
          numero_de_corredores: number | null
          periodo: string | null
          rutcia: string | null
          total_primaclp: number | null
          total_primauf: number | null
        }
        Relationships: []
      }
      vista_concentracion_corredores: {
        Row: {
          hhi: number | null
          participacion_porcentaje: number | null
          periodo: string | null
          rut: string | null
          total_clp: number | null
          total_uf: number | null
          varianza_anual: number | null
        }
        Relationships: []
      }
      vista_concentracion_corredores_por_ramo: {
        Row: {
          hhi_corredores_ramo: number | null
          periodo: string | null
          ramo_cod: string | null
        }
        Relationships: []
      }
      vista_concentracion_mercado: {
        Row: {
          grupo: string | null
          hhi_general: number | null
          hhi_grupo: number | null
          participacion_porcentaje: number | null
          periodo: string | null
          total_clp: number | null
          total_uf: number | null
          varianza_anual: number | null
        }
        Relationships: []
      }
      vista_concentracion_ramos: {
        Row: {
          grupo: string | null
          hhi_general: number | null
          hhi_grupo: number | null
          hhi_subgrupo: number | null
          periodo: string | null
          subgrupo: string | null
        }
        Relationships: []
      }
      vista_corredores_periodo: {
        Row: {
          num_corredores: number | null
          periodo: string | null
          total_clp: number | null
          total_uf: number | null
        }
        Relationships: []
      }
      vista_corredores_region: {
        Row: {
          numero_corredores: number | null
          periodo: string | null
          region: number | null
          total_primaclp: number | null
          total_primauf: number | null
        }
        Relationships: []
      }
      vista_corredores_tipo_persona: {
        Row: {
          numero_corredores: number | null
          periodo: string | null
          tipo_persona: string | null
          total_primaclp: number | null
          total_primauf: number | null
        }
        Relationships: []
      }
      vista_evolucion_corredores: {
        Row: {
          nombre: string | null
          periodo: string | null
          rut: string | null
          tipo_cambio: string | null
        }
        Relationships: []
      }
      vista_evolucion_corredores_agrupado: {
        Row: {
          num_entradas: number | null
          num_salidas: number | null
          periodo: string | null
        }
        Relationships: []
      }
      vista_evolucion_mercado: {
        Row: {
          motivo: string | null
          nombrecia: string | null
          periodo: string | null
          rutcia: string | null
          tipo_cambio: string | null
        }
        Relationships: []
      }
      vista_grupos_periodo: {
        Row: {
          crecimiento_clp: number | null
          crecimiento_uf: number | null
          grupo: string | null
          numero_de_corredores_unicos: number | null
          periodo: string | null
          total_primaclp: number | null
          total_primauf: number | null
        }
        Relationships: []
      }
      vista_mercado_periodo: {
        Row: {
          periodo: string | null
          total_companias: number | null
          total_corredores: number | null
          total_primaclp: number | null
          total_primauf: number | null
        }
        Relationships: []
      }
      vista_pagos_exitosos: {
        Row: {
          amount: number | null
          estado: string | null
          fecha_creacion: string | null
          id: string | null
          metodo_pago: string | null
          orden_comercio: string | null
          producto_codigo: string | null
          producto_nombre: string | null
          rut: string | null
          user_id: string | null
        }
        Relationships: []
      }
      vista_ramos_periodo: {
        Row: {
          cod: string | null
          crecimiento_clp: number | null
          grupo: string | null
          participacion_clp: number | null
          participacion_grupo_clp: number | null
          participacion_subgrupo_clp: number | null
          periodo: string | null
          ramo: string | null
          ranking_general: number | null
          ranking_grupo: number | null
          ranking_subgrupo: number | null
          subgrupo: string | null
          total_primaclp: number | null
          total_primauf: number | null
          variacion_clp_pp: number | null
        }
        Relationships: []
      }
      vista_reportes_disponibles: {
        Row: {
          activo: boolean | null
          corredor_nombre: string | null
          fecha_expiracion: string | null
          fecha_generacion: string | null
          id: string | null
          periodo: string | null
          rut: string | null
          user_id: string | null
          vigente: boolean | null
        }
        Relationships: []
      }
      vista_segmentos_companias: {
        Row: {
          nombrecia: string | null
          periodo: string | null
          primauf: number | null
          rutcia: string | null
          segmento: string | null
        }
        Relationships: []
      }
      vista_segmentos_corredores: {
        Row: {
          periodo: string | null
          promedio_primauf: number | null
          rut: string | null
          segmento: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      actualizar_todos_los_reportes: {
        Args: Record<PropertyKey, never>
        Returns: {
          rut_actualizado: string
          periodo_actualizado: string
          resultado: string
        }[]
      }
      exec_sql: {
        Args: { query: string }
        Returns: {
          result: Json
        }[]
      }
      generar_reporte_individual: {
        Args: { p_rut: string; p_periodo?: string }
        Returns: Json
      }
      get_object_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          column_name: string
          data_type: string
          object_type: string
          definition: string
          sample_data: Json
        }[]
      }
      get_table_rls_status: {
        Args: { table_name: string }
        Returns: {
          rls_enabled: boolean
          policy_count: number
        }[]
      }
      insertar_reporte_individual: {
        Args: {
          p_rut: string
          p_periodo: string
          p_user_id: string
          p_duracion_dias?: number
        }
        Returns: string
      }
      limpiar_datos_expirados: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      materializar_concentracion_mercado: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
