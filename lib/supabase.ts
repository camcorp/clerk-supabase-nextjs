export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      actividades: {
        Row: {
          created_at: string | null
          factor_riesgo: number | null
          id: string
          nombre: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          factor_riesgo?: number | null
          id?: string
          nombre?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          factor_riesgo?: number | null
          id?: string
          nombre?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      archivos_storage: {
        Row: {
          bucket: string
          creado_por: string | null
          created_at: string | null
          id: string
          nombre_original: string | null
          path: string
          tipo: string
          url: string
        }
        Insert: {
          bucket: string
          creado_por?: string | null
          created_at?: string | null
          id?: string
          nombre_original?: string | null
          path: string
          tipo: string
          url: string
        }
        Update: {
          bucket?: string
          creado_por?: string | null
          created_at?: string | null
          id?: string
          nombre_original?: string | null
          path?: string
          tipo?: string
          url?: string
        }
        Relationships: []
      }
      capitales: {
        Row: {
          capital_uf: number | null
          created_at: string | null
          factor: number | null
          id: string
          plan_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          capital_uf?: number | null
          created_at?: string | null
          factor?: number | null
          id?: string
          plan_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          capital_uf?: number | null
          created_at?: string | null
          factor?: number | null
          id?: string
          plan_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "capitales_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "planes"
            referencedColumns: ["id"]
          },
        ]
      }
      certificados: {
        Row: {
          archivo_id: string | null
          created_at: string | null
          fecha_emision: string | null
          id: string
          orden_pago_id: string | null
          updated_at: string | null
        }
        Insert: {
          archivo_id?: string | null
          created_at?: string | null
          fecha_emision?: string | null
          id?: string
          orden_pago_id?: string | null
          updated_at?: string | null
        }
        Update: {
          archivo_id?: string | null
          created_at?: string | null
          fecha_emision?: string | null
          id?: string
          orden_pago_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificados_archivo_id_fkey"
            columns: ["archivo_id"]
            isOneToOne: false
            referencedRelation: "archivos_storage"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificados_orden_pago_id_fkey"
            columns: ["orden_pago_id"]
            isOneToOne: false
            referencedRelation: "ordenes_pago"
            referencedColumns: ["id"]
          },
        ]
      }
      companias: {
        Row: {
          correo: string | null
          created_at: string | null
          direccion: string | null
          id: string
          nombre: string
          razon_social: string | null
          rut: string | null
          sitio_web: string | null
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          correo?: string | null
          created_at?: string | null
          direccion?: string | null
          id?: string
          nombre: string
          razon_social?: string | null
          rut?: string | null
          sitio_web?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          correo?: string | null
          created_at?: string | null
          direccion?: string | null
          id?: string
          nombre?: string
          razon_social?: string | null
          rut?: string | null
          sitio_web?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contratacion_cargas: {
        Row: {
          contratacion_id: string | null
          created_at: string | null
          edad: number | null
          id: string
          prevision: string | null
          sexo: string | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          contratacion_id?: string | null
          created_at?: string | null
          edad?: number | null
          id?: string
          prevision?: string | null
          sexo?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          contratacion_id?: string | null
          created_at?: string | null
          edad?: number | null
          id?: string
          prevision?: string | null
          sexo?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contratacion_cargas_contratacion_id_fkey"
            columns: ["contratacion_id"]
            isOneToOne: false
            referencedRelation: "contrataciones"
            referencedColumns: ["id"]
          },
        ]
      }
      contrataciones: {
        Row: {
          actividad_id: string | null
          cotizacion_id: string | null
          created_at: string | null
          estado: string | null
          id: string
          mail: string | null
          nombre: string | null
          rut: string | null
          updated_at: string | null
        }
        Insert: {
          actividad_id?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          estado?: string | null
          id?: string
          mail?: string | null
          nombre?: string | null
          rut?: string | null
          updated_at?: string | null
        }
        Update: {
          actividad_id?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          estado?: string | null
          id?: string
          mail?: string | null
          nombre?: string | null
          rut?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contrataciones_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "actividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contrataciones_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizacion_lineas: {
        Row: {
          cobertura_id: string | null
          cotizacion_id: string | null
          created_at: string | null
          descuento_aplicado: number | null
          id: string
          precio_uf: number | null
          updated_at: string | null
        }
        Insert: {
          cobertura_id?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          descuento_aplicado?: number | null
          id?: string
          precio_uf?: number | null
          updated_at?: string | null
        }
        Update: {
          cobertura_id?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          descuento_aplicado?: number | null
          id?: string
          precio_uf?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizacion_lineas_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizaciones: {
        Row: {
          created_at: string | null
          fecha: string | null
          id: string
          plan_id: string | null
          producto_id: string | null
          resumen: Json | null
          sesion_id: string | null
          updated_at: string | null
          uuid_publico: string | null
        }
        Insert: {
          created_at?: string | null
          fecha?: string | null
          id?: string
          plan_id?: string | null
          producto_id?: string | null
          resumen?: Json | null
          sesion_id?: string | null
          updated_at?: string | null
          uuid_publico?: string | null
        }
        Update: {
          created_at?: string | null
          fecha?: string | null
          id?: string
          plan_id?: string | null
          producto_id?: string | null
          resumen?: Json | null
          sesion_id?: string | null
          updated_at?: string | null
          uuid_publico?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "planes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "producto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_sesion_id_fkey"
            columns: ["sesion_id"]
            isOneToOne: false
            referencedRelation: "sesiones"
            referencedColumns: ["id"]
          },
        ]
      }
      deducibles: {
        Row: {
          created_at: string | null
          d: string
          factor: number | null
          monto_uf: number | null
          plan_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          d?: string
          factor?: number | null
          monto_uf?: number | null
          plan_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          d?: string
          factor?: number | null
          monto_uf?: number | null
          plan_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deducibles_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "planes"
            referencedColumns: ["id"]
          },
        ]
      }
      descuentos_base: {
        Row: {
          acumulable: boolean | null
          cargas_max: number | null
          cargas_min: number
          created_at: string | null
          id: string
          plan_id: string | null
          porcentaje: number
          producto_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          acumulable?: boolean | null
          cargas_max?: number | null
          cargas_min: number
          created_at?: string | null
          id?: string
          plan_id?: string | null
          porcentaje: number
          producto_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          acumulable?: boolean | null
          cargas_max?: number | null
          cargas_min?: number
          created_at?: string | null
          id?: string
          plan_id?: string | null
          porcentaje?: number
          producto_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "descuentos_base_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "planes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "descuentos_base_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "producto"
            referencedColumns: ["id"]
          },
        ]
      }
      descuentos_promocionales: {
        Row: {
          acumulable: boolean | null
          canal_codigo: string | null
          codigo_descuento: string | null
          created_at: string | null
          fecha_inicio: string | null
          fecha_termino: string | null
          id: string
          plan_id: string | null
          porcentaje: number | null
          segmento_codigo: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          acumulable?: boolean | null
          canal_codigo?: string | null
          codigo_descuento?: string | null
          created_at?: string | null
          fecha_inicio?: string | null
          fecha_termino?: string | null
          id?: string
          plan_id?: string | null
          porcentaje?: number | null
          segmento_codigo?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          acumulable?: boolean | null
          canal_codigo?: string | null
          codigo_descuento?: string | null
          created_at?: string | null
          fecha_inicio?: string | null
          fecha_termino?: string | null
          id?: string
          plan_id?: string | null
          porcentaje?: number | null
          segmento_codigo?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "descuentos_promocionales_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "planes"
            referencedColumns: ["id"]
          },
        ]
      }
      ordenes_pago: {
        Row: {
          contratacion_id: string | null
          created_at: string | null
          estado: string | null
          fecha_expiracion: string | null
          id: string
          monto: number | null
          updated_at: string | null
        }
        Insert: {
          contratacion_id?: string | null
          created_at?: string | null
          estado?: string | null
          fecha_expiracion?: string | null
          id?: string
          monto?: number | null
          updated_at?: string | null
        }
        Update: {
          contratacion_id?: string | null
          created_at?: string | null
          estado?: string | null
          fecha_expiracion?: string | null
          id?: string
          monto?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordenes_pago_contratacion_id_fkey"
            columns: ["contratacion_id"]
            isOneToOne: false
            referencedRelation: "contrataciones"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_dimensiones: {
        Row: {
          id: string
          plan_id: string | null
          tipo: string | null
          valor: string | null
        }
        Insert: {
          id?: string
          plan_id?: string | null
          tipo?: string | null
          valor?: string | null
        }
        Update: {
          id?: string
          plan_id?: string | null
          tipo?: string | null
          valor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_dimensiones_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "planes"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_items: {
        Row: {
          created_at: string | null
          id: string
          item: string
          json: Json | null
          orden: number | null
          plan_id: string
          tipo: string
          titulo: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item: string
          json?: Json | null
          orden?: number | null
          plan_id: string
          tipo: string
          titulo?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item?: string
          json?: Json | null
          orden?: number | null
          plan_id?: string
          tipo?: string
          titulo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_items_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "planes"
            referencedColumns: ["id"]
          },
        ]
      }
      planes: {
        Row: {
          activo: boolean | null
          capital_uf: number | null
          cobertura: string | null
          codigo_plan: string | null
          created_at: string | null
          descripcion: string | null
          descripcion_json: Json | null
          id: string
          nombre: string | null
          prevision: string | null
          producto_id: string | null
          reglas_deducible: string | null
          uf_base: number | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          capital_uf?: number | null
          cobertura?: string | null
          codigo_plan?: string | null
          created_at?: string | null
          descripcion?: string | null
          descripcion_json?: Json | null
          id?: string
          nombre?: string | null
          prevision?: string | null
          producto_id?: string | null
          reglas_deducible?: string | null
          uf_base?: number | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          capital_uf?: number | null
          cobertura?: string | null
          codigo_plan?: string | null
          created_at?: string | null
          descripcion?: string | null
          descripcion_json?: Json | null
          id?: string
          nombre?: string | null
          prevision?: string | null
          producto_id?: string | null
          reglas_deducible?: string | null
          uf_base?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planes_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "producto"
            referencedColumns: ["id"]
          },
        ]
      }
      polizas: {
        Row: {
          certificado_id: string | null
          created_at: string | null
          estado: string | null
          fecha_recepcion: string | null
          id: string
          updated_at: string | null
          url_poliza: string | null
        }
        Insert: {
          certificado_id?: string | null
          created_at?: string | null
          estado?: string | null
          fecha_recepcion?: string | null
          id?: string
          updated_at?: string | null
          url_poliza?: string | null
        }
        Update: {
          certificado_id?: string | null
          created_at?: string | null
          estado?: string | null
          fecha_recepcion?: string | null
          id?: string
          updated_at?: string | null
          url_poliza?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "polizas_certificado_id_fkey"
            columns: ["certificado_id"]
            isOneToOne: false
            referencedRelation: "certificados"
            referencedColumns: ["id"]
          },
        ]
      }
      precios_base: {
        Row: {
          actividad_id: string | null
          capital_id: string | null
          cobertura: string | null
          created_at: string | null
          deducible_id: string | null
          edad_maxima: number | null
          edad_minima: number | null
          id: string
          plan_id: string | null
          precio_uf: number | null
          prevision: string | null
          producto_id: string | null
          sexo: string | null
          tramo_etario: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actividad_id?: string | null
          capital_id?: string | null
          cobertura?: string | null
          created_at?: string | null
          deducible_id?: string | null
          edad_maxima?: number | null
          edad_minima?: number | null
          id?: string
          plan_id?: string | null
          precio_uf?: number | null
          prevision?: string | null
          producto_id?: string | null
          sexo?: string | null
          tramo_etario?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actividad_id?: string | null
          capital_id?: string | null
          cobertura?: string | null
          created_at?: string | null
          deducible_id?: string | null
          edad_maxima?: number | null
          edad_minima?: number | null
          id?: string
          plan_id?: string | null
          precio_uf?: number | null
          prevision?: string | null
          producto_id?: string | null
          sexo?: string | null
          tramo_etario?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "precios_base_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "actividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "precios_base_capital_id_fkey"
            columns: ["capital_id"]
            isOneToOne: false
            referencedRelation: "capitales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "precios_base_deducible_id_fkey"
            columns: ["deducible_id"]
            isOneToOne: false
            referencedRelation: "deducibles"
            referencedColumns: ["d"]
          },
          {
            foreignKeyName: "precios_base_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "planes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "precios_base_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "producto"
            referencedColumns: ["id"]
          },
        ]
      }
      producto: {
        Row: {
          activo: boolean | null
          compania_id: string | null
          created_at: string | null
          descripcion: string | null
          descripcion_json: Json | null
          id: string
          nombre: string | null
          proveedor_id: string | null
          updated_at: string | null
          user_id: string | null
          yoolbrand: string | null
        }
        Insert: {
          activo?: boolean | null
          compania_id?: string | null
          created_at?: string | null
          descripcion?: string | null
          descripcion_json?: Json | null
          id?: string
          nombre?: string | null
          proveedor_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          yoolbrand?: string | null
        }
        Update: {
          activo?: boolean | null
          compania_id?: string | null
          created_at?: string | null
          descripcion?: string | null
          descripcion_json?: Json | null
          id?: string
          nombre?: string | null
          proveedor_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          yoolbrand?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "producto_compania_id_fkey"
            columns: ["compania_id"]
            isOneToOne: false
            referencedRelation: "companias"
            referencedColumns: ["id"]
          },
        ]
      }
      proveedores: {
        Row: {
          id: string
          id_cia: string | null
          nombre_corto: string | null
          razon_social: string | null
          rut: string | null
          tipo: string | null
        }
        Insert: {
          id?: string
          id_cia?: string | null
          nombre_corto?: string | null
          razon_social?: string | null
          rut?: string | null
          tipo?: string | null
        }
        Update: {
          id?: string
          id_cia?: string | null
          nombre_corto?: string | null
          razon_social?: string | null
          rut?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      reporte_estructura: {
        Row: {
          detalle: Json | null
          fecha: string | null
          id: number
          tabla: string | null
          tipo: string | null
        }
        Insert: {
          detalle?: Json | null
          fecha?: string | null
          id?: number
          tabla?: string | null
          tipo?: string | null
        }
        Update: {
          detalle?: Json | null
          fecha?: string | null
          id?: number
          tabla?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      sesiones: {
        Row: {
          canal: string | null
          created_at: string | null
          datos_dps: Json | null
          datos_simulacion: Json | null
          id: string
          ip: unknown | null
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          canal?: string | null
          created_at?: string | null
          datos_dps?: Json | null
          datos_simulacion?: Json | null
          id?: string
          ip?: unknown | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          canal?: string | null
          created_at?: string | null
          datos_dps?: Json | null
          datos_simulacion?: Json | null
          id?: string
          ip?: unknown | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      uf_diaria: {
        Row: {
          created_at: string | null
          fecha: string
          fuente: string | null
          id: string
          updated_at: string | null
          user_id: string | null
          valor_clp: number
        }
        Insert: {
          created_at?: string | null
          fecha: string
          fuente?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
          valor_clp: number
        }
        Update: {
          created_at?: string | null
          fecha?: string
          fuente?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
          valor_clp?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      actualizar_uf_diaria: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      api_insert_uf_diaria: {
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
