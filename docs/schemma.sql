-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.accesos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  producto_id uuid NOT NULL,
  modulo text NOT NULL,
  fecha_inicio timestamp without time zone NOT NULL DEFAULT now(),
  fecha_fin timestamp without time zone NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  CONSTRAINT accesos_pkey PRIMARY KEY (id),
  CONSTRAINT accesos_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id)
);
CREATE TABLE public.accesos_usuarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  producto_id uuid,
  modulo text NOT NULL,
  fecha_inicio timestamp without time zone NOT NULL,
  fecha_fin timestamp without time zone NOT NULL,
  activo boolean DEFAULT true,
  fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT accesos_usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT accesos_usuarios_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id)
);
CREATE TABLE public.actores_salientes (
  id integer NOT NULL DEFAULT nextval('actores_salientes_id_seq'::regclass),
  rutcia character varying NOT NULL,
  nombrecia character varying NOT NULL,
  motivo text,
  fecha_salida date,
  CONSTRAINT actores_salientes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.companias (
  id integer NOT NULL DEFAULT nextval('companias_id_seq'::regclass),
  rutcia character varying NOT NULL UNIQUE,
  nombrecia character varying NOT NULL,
  grupo character varying,
  CONSTRAINT companias_pkey PRIMARY KEY (id)
);
CREATE TABLE public.companies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rut text UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT companies_pkey PRIMARY KEY (id)
);
CREATE TABLE public.configuracion_flow (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  api_key text NOT NULL,
  secret_key text NOT NULL,
  api_url text NOT NULL DEFAULT 'https://www.flow.cl/api'::text,
  sandbox_mode boolean DEFAULT true,
  activo boolean DEFAULT true,
  fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT configuracion_flow_pkey PRIMARY KEY (id)
);
CREATE TABLE public.corredores (
  id integer NOT NULL DEFAULT nextval('corredores_master_id_seq'::regclass),
  rut character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  telefono character varying,
  domicilio character varying,
  ciudad character varying,
  region smallint,
  tipo_persona character CHECK (tipo_persona = ANY (ARRAY['N'::bpchar, 'J'::bpchar])),
  activo boolean DEFAULT true,
  fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT corredores_pkey PRIMARY KEY (id)
);
CREATE TABLE public.fusiones (
  id integer NOT NULL DEFAULT nextval('fusiones_id_seq'::regclass),
  rutcia_original character varying NOT NULL,
  rutcia_nueva character varying NOT NULL,
  fecha_fusion date NOT NULL,
  motivo text,
  CONSTRAINT fusiones_pkey PRIMARY KEY (id)
);
CREATE TABLE public.identifi (
  id integer NOT NULL DEFAULT nextval('corredores_id_seq'::regclass),
  rut character varying NOT NULL,
  nombre character varying NOT NULL,
  telefono character varying,
  domicilio character varying,
  ciudad character varying,
  region smallint,
  tipo_persona character CHECK (tipo_persona = ANY (ARRAY['N'::bpchar, 'J'::bpchar])),
  periodo character,
  CONSTRAINT identifi_pkey PRIMARY KEY (id)
);
CREATE TABLE public.intercia (
  id integer NOT NULL DEFAULT nextval('produccion_id_seq'::regclass),
  periodo character NOT NULL,
  rut character varying NOT NULL,
  rutcia character varying,
  primaclp numeric NOT NULL,
  nombrecia character varying,
  grupo character varying,
  signo character varying,
  primauf numeric NOT NULL,
  CONSTRAINT intercia_pkey PRIMARY KEY (id)
);
CREATE TABLE public.logs_sistema (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id text,
  accion text NOT NULL,
  tabla_afectada text,
  registro_id text,
  datos_anteriores jsonb,
  datos_nuevos jsonb,
  ip_address inet,
  user_agent text,
  fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT logs_sistema_pkey PRIMARY KEY (id)
);
CREATE TABLE public.pagos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  rut_factura character varying NOT NULL,
  producto_id uuid NOT NULL,
  orden_comercio text NOT NULL,
  amount numeric NOT NULL,
  estado text NOT NULL DEFAULT 'pendiente'::text,
  fecha_creacion timestamp without time zone DEFAULT now(),
  token text,
  url_pago text,
  metodo_pago text DEFAULT 'flow'::text,
  flow_token text,
  flow_order integer,
  flow_payment_id text,
  flow_status text,
  flow_subject text,
  flow_currency text DEFAULT 'CLP'::text,
  flow_payer_email text,
  flow_optional text,
  flow_pending_info jsonb,
  flow_payment_data jsonb,
  fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  ip_address inet,
  user_agent text,
  subtotal numeric,
  iva numeric,
  datos_facturacion jsonb,
  monto numeric,
  transaction_id text,
  CONSTRAINT pagos_pkey PRIMARY KEY (id),
  CONSTRAINT pagos_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id)
);
CREATE TABLE public.periodos (
  id integer NOT NULL DEFAULT nextval('periodos_id_seq'::regclass),
  periodo character varying NOT NULL UNIQUE,
  CONSTRAINT periodos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.prodramo (
  id integer NOT NULL DEFAULT nextval('produccion_ramos_id_seq'::regclass),
  periodo character NOT NULL,
  grupo smallint NOT NULL CHECK (grupo = ANY (ARRAY[1, 2])),
  cod character varying NOT NULL,
  primaclp numeric NOT NULL,
  primauf numeric,
  rut character varying,
  signo character varying,
  CONSTRAINT prodramo_pkey PRIMARY KEY (id)
);
CREATE TABLE public.productos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  nombre text NOT NULL,
  descripcion text,
  precio_neto numeric NOT NULL,
  precio_bruto numeric DEFAULT (precio_neto * 1.19),
  activo boolean DEFAULT true,
  fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  iva numeric DEFAULT 19.00,
  tipo_producto text DEFAULT 'reporte'::text,
  duracion_dias integer DEFAULT 365,
  CONSTRAINT productos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text,
  full_name text,
  role text DEFAULT 'user'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.ramos (
  id smallint GENERATED ALWAYS AS IDENTITY NOT NULL,
  codigo character varying NOT NULL UNIQUE,
  ramo character varying NOT NULL,
  grupo character varying NOT NULL,
  subgrupo character varying,
  cod character varying,
  codsg character varying
);
CREATE TABLE public.registro_empresa (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  email text,
  empresa text,
  rut_empresa text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT registro_empresa_pkey PRIMARY KEY (id)
);
CREATE TABLE public.reporte_individual (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  rut character varying NOT NULL,
  periodo text NOT NULL,
  data jsonb NOT NULL,
  fecha_generacion timestamp without time zone DEFAULT now(),
  fecha_expiracion timestamp without time zone NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  CONSTRAINT reporte_individual_pkey PRIMARY KEY (id)
);
CREATE TABLE public.reportes_individuales (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  rut character varying NOT NULL,
  periodo character NOT NULL,
  datos_reporte jsonb,
  fecha_generacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion timestamp without time zone NOT NULL,
  activo boolean DEFAULT true,
  fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT reportes_individuales_pkey PRIMARY KEY (id)
);
CREATE TABLE public.temp_concentracion_mercado (
  periodo character,
  grupo character varying,
  total_clp numeric,
  total_uf numeric
);
CREATE TABLE public.transacciones_flow (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pago_id uuid,
  flow_token text NOT NULL UNIQUE,
  flow_order integer,
  flow_payment_id text,
  flow_status text NOT NULL,
  flow_amount numeric NOT NULL,
  flow_currency text DEFAULT 'CLP'::text,
  flow_payer_email text,
  flow_payment_date timestamp without time zone,
  flow_confirmation_date timestamp without time zone,
  flow_raw_response jsonb,
  fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT transacciones_flow_pkey PRIMARY KEY (id),
  CONSTRAINT transacciones_flow_pago_id_fkey FOREIGN KEY (pago_id) REFERENCES public.pagos(id)
);
CREATE TABLE public.uf_values (
  id integer NOT NULL DEFAULT nextval('uf_values_id_seq'::regclass),
  periodo character varying NOT NULL UNIQUE,
  valor numeric NOT NULL,
  CONSTRAINT uf_values_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  plan text NOT NULL,
  role text NOT NULL DEFAULT 'free'::text,
  products ARRAY DEFAULT ARRAY['memoria_anual'::text],
  status text NOT NULL DEFAULT 'active'::text,
  valid_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id)
);