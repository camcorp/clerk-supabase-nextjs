| table_name                              | column_name                   | data_type                   | object_type       |
| --------------------------------------- | ----------------------------- | --------------------------- | ----------------- |
| vista_companias_periodo                 | periodo                       | character(6)                | materialized_view |
| vista_companias_periodo                 | rutcia                        | character varying           | materialized_view |
| vista_companias_periodo                 | nombrecia                     | character varying           | materialized_view |
| vista_companias_periodo                 | grupo                         | character varying           | materialized_view |
| vista_companias_periodo                 | total_primaclp                | numeric                     | materialized_view |
| vista_companias_periodo                 | total_primauf                 | numeric                     | materialized_view |
| vista_companias_periodo                 | crecimiento_clp               | numeric                     | materialized_view |
| vista_companias_periodo                 | crecimiento_uf                | numeric                     | materialized_view |
| vista_companias_periodo                 | numero_de_corredores          | bigint                      | materialized_view |
| vista_concentracion_corredores          | periodo                       | character(6)                | materialized_view |
| vista_concentracion_corredores          | rut                           | character varying           | materialized_view |
| vista_concentracion_corredores          | total_clp                     | numeric                     | materialized_view |
| vista_concentracion_corredores          | total_uf                      | numeric                     | materialized_view |
| vista_concentracion_corredores          | participacion_porcentaje      | numeric                     | materialized_view |
| vista_concentracion_corredores          | varianza_anual                | numeric                     | materialized_view |
| vista_concentracion_corredores          | hhi                           | numeric                     | materialized_view |
| vista_concentracion_mercado             | periodo                       | character(6)                | materialized_view |
| vista_concentracion_mercado             | grupo                         | character varying           | materialized_view |
| vista_concentracion_mercado             | total_clp                     | numeric                     | materialized_view |
| vista_concentracion_mercado             | total_uf                      | numeric                     | materialized_view |
| vista_concentracion_mercado             | participacion_porcentaje      | numeric                     | materialized_view |
| vista_concentracion_mercado             | varianza_anual                | numeric                     | materialized_view |
| vista_concentracion_mercado             | hhi_grupo                     | numeric                     | materialized_view |
| vista_concentracion_mercado             | hhi_general                   | numeric                     | materialized_view |
| vista_corredores_periodo                | periodo                       | character(6)                | materialized_view |
| vista_corredores_periodo                | total_clp                     | numeric                     | materialized_view |
| vista_corredores_periodo                | total_uf                      | numeric                     | materialized_view |
| vista_corredores_periodo                | num_corredores                | bigint                      | materialized_view |
| vista_corredores_region                 | periodo                       | character(6)                | materialized_view |
| vista_corredores_region                 | region                        | smallint                    | materialized_view |
| vista_corredores_region                 | numero_corredores             | bigint                      | materialized_view |
| vista_corredores_region                 | total_primaclp                | numeric                     | materialized_view |
| vista_corredores_region                 | total_primauf                 | numeric                     | materialized_view |
| vista_corredores_tipo_persona           | periodo                       | character(6)                | materialized_view |
| vista_corredores_tipo_persona           | tipo_persona                  | character(1)                | materialized_view |
| vista_corredores_tipo_persona           | numero_corredores             | bigint                      | materialized_view |
| vista_corredores_tipo_persona           | total_primaclp                | numeric                     | materialized_view |
| vista_corredores_tipo_persona           | total_primauf                 | numeric                     | materialized_view |
| vista_evolucion_corredores              | periodo                       | character(6)                | materialized_view |
| vista_evolucion_corredores              | rut                           | character varying           | materialized_view |
| vista_evolucion_corredores              | nombre                        | character varying(100)      | materialized_view |
| vista_evolucion_corredores              | tipo_cambio                   | text                        | materialized_view |
| vista_evolucion_corredores_agrupado     | periodo                       | character(6)                | materialized_view |
| vista_evolucion_corredores_agrupado     | num_entradas                  | bigint                      | materialized_view |
| vista_evolucion_corredores_agrupado     | num_salidas                   | bigint                      | materialized_view |
| vista_evolucion_mercado                 | periodo                       | character(6)                | materialized_view |
| vista_evolucion_mercado                 | rutcia                        | character varying           | materialized_view |
| vista_evolucion_mercado                 | nombrecia                     | character varying(50)       | materialized_view |
| vista_evolucion_mercado                 | tipo_cambio                   | text                        | materialized_view |
| vista_evolucion_mercado                 | motivo                        | text                        | materialized_view |
| vista_grupos_periodo                    | periodo                       | character(6)                | materialized_view |
| vista_grupos_periodo                    | grupo                         | character varying           | materialized_view |
| vista_grupos_periodo                    | total_primaclp                | numeric                     | materialized_view |
| vista_grupos_periodo                    | total_primauf                 | numeric                     | materialized_view |
| vista_grupos_periodo                    | crecimiento_clp               | numeric                     | materialized_view |
| vista_grupos_periodo                    | crecimiento_uf                | numeric                     | materialized_view |
| vista_grupos_periodo                    | numero_de_corredores_unicos   | bigint                      | materialized_view |
| accesos_pkey                            | id                            | uuid                        | other             |
| actores_salientes_id_seq                | last_value                    | bigint                      | other             |
| actores_salientes_id_seq                | log_cnt                       | bigint                      | other             |
| actores_salientes_id_seq                | is_called                     | boolean                     | other             |
| actores_salientes_pkey                  | id                            | integer                     | other             |
| companias_id_seq                        | last_value                    | bigint                      | other             |
| companias_id_seq                        | log_cnt                       | bigint                      | other             |
| companias_id_seq                        | is_called                     | boolean                     | other             |
| companias_pkey                          | id                            | integer                     | other             |
| companias_rut_key                       | rut                           | character varying(10)       | other             |
| corredores_id_seq                       | last_value                    | bigint                      | other             |
| corredores_id_seq                       | log_cnt                       | bigint                      | other             |
| corredores_id_seq                       | is_called                     | boolean                     | other             |
| corredores_master_id_seq                | last_value                    | bigint                      | other             |
| corredores_master_id_seq                | log_cnt                       | bigint                      | other             |
| corredores_master_id_seq                | is_called                     | boolean                     | other             |
| corredores_master_pkey                  | id                            | integer                     | other             |
| corredores_master_rut_key               | rut                           | character varying(10)       | other             |
| corredores_pkey                         | id                            | integer                     | other             |
| fusiones_id_seq                         | last_value                    | bigint                      | other             |
| fusiones_id_seq                         | log_cnt                       | bigint                      | other             |
| fusiones_id_seq                         | is_called                     | boolean                     | other             |
| fusiones_pkey                           | id                            | integer                     | other             |
| idx_companias_rutcia                    | rutcia                        | character varying(10)       | other             |
| idx_corredores_rut                      | rut                           | character varying(10)       | other             |
| idx_intercia_periodo                    | periodo                       | character(6)                | other             |
| idx_intercia_periodo_rut                | periodo                       | character(6)                | other             |
| idx_intercia_periodo_rut                | rut                           | character varying           | other             |
| idx_intercia_rut                        | rut                           | character varying           | other             |
| idx_intercia_rutcia_periodo             | rutcia                        | character varying           | other             |
| idx_intercia_rutcia_periodo             | periodo                       | character(6)                | other             |
| idx_prodramo_periodo_rut                | periodo                       | character(6)                | other             |
| idx_prodramo_periodo_rut                | rut                           | character varying           | other             |
| idx_prodramo_primauf                    | primauf                       | numeric(15,2)               | other             |
| pagos_pkey                              | id                            | uuid                        | other             |
| periodos_id_seq                         | last_value                    | bigint                      | other             |
| periodos_id_seq                         | log_cnt                       | bigint                      | other             |
| periodos_id_seq                         | is_called                     | boolean                     | other             |
| periodos_periodo_key                    | periodo                       | character varying           | other             |
| periodos_pkey                           | id                            | integer                     | other             |
| produccion_id_seq                       | last_value                    | bigint                      | other             |
| produccion_id_seq                       | log_cnt                       | bigint                      | other             |
| produccion_id_seq                       | is_called                     | boolean                     | other             |
| produccion_pkey                         | id                            | integer                     | other             |
| produccion_ramos_id_seq                 | last_value                    | bigint                      | other             |
| produccion_ramos_id_seq                 | log_cnt                       | bigint                      | other             |
| produccion_ramos_id_seq                 | is_called                     | boolean                     | other             |
| produccion_ramos_pkey                   | id                            | integer                     | other             |
| productos_codigo_key                    | codigo                        | text                        | other             |
| productos_pkey                          | id                            | uuid                        | other             |
| ramos_id_seq                            | last_value                    | bigint                      | other             |
| ramos_id_seq                            | log_cnt                       | bigint                      | other             |
| ramos_id_seq                            | is_called                     | boolean                     | other             |
| ramos_master_codigo_key                 | codigo                        | character varying(10)       | other             |
| registro_empresa_pkey                   | id                            | uuid                        | other             |
| reporte_individual_pkey                 | id                            | uuid                        | other             |
| uf_values_date_key                      | date                          | character varying           | other             |
| uf_values_id_seq                        | last_value                    | bigint                      | other             |
| uf_values_id_seq                        | log_cnt                       | bigint                      | other             |
| uf_values_id_seq                        | is_called                     | boolean                     | other             |
| uf_values_pkey                          | id                            | integer                     | other             |
| accesos                                 | id                            | uuid                        | table             |
| accesos                                 | user_id                       | text                        | table             |
| accesos                                 | producto_id                   | uuid                        | table             |
| accesos                                 | modulo                        | text                        | table             |
| accesos                                 | fecha_inicio                  | timestamp without time zone | table             |
| accesos                                 | fecha_fin                     | timestamp without time zone | table             |
| accesos                                 | activo                        | boolean                     | table             |
| actores_salientes                       | id                            | integer                     | table             |
| actores_salientes                       | rutcia                        | character varying(10)       | table             |
| actores_salientes                       | nombrecia                     | character varying(100)      | table             |
| actores_salientes                       | motivo                        | text                        | table             |
| actores_salientes                       | fecha_salida                  | date                        | table             |
| companias                               | id                            | integer                     | table             |
| companias                               | rutcia                        | character varying(10)       | table             |
| companias                               | nombrecia                     | character varying(50)       | table             |
| companias                               | grupo                         | character varying           | table             |
| corredores                              | id                            | integer                     | table             |
| corredores                              | rut                           | character varying(10)       | table             |
| corredores                              | nombre                        | character varying(100)      | table             |
| corredores                              | telefono                      | character varying(15)       | table             |
| corredores                              | domicilio                     | character varying(100)      | table             |
| corredores                              | ciudad                        | character varying(50)       | table             |
| corredores                              | region                        | smallint                    | table             |
| corredores                              | tipo_persona                  | character(1)                | table             |
| fusiones                                | id                            | integer                     | table             |
| fusiones                                | rutcia_original               | character varying(10)       | table             |
| fusiones                                | rutcia_nueva                  | character varying(10)       | table             |
| fusiones                                | fecha_fusion                  | date                        | table             |
| fusiones                                | motivo                        | text                        | table             |
| identifi                                | id                            | integer                     | table             |
| identifi                                | rut                           | character varying           | table             |
| identifi                                | nombre                        | character varying(100)      | table             |
| identifi                                | telefono                      | character varying(15)       | table             |
| identifi                                | domicilio                     | character varying(100)      | table             |
| identifi                                | ciudad                        | character varying(50)       | table             |
| identifi                                | region                        | smallint                    | table             |
| identifi                                | tipo_persona                  | character(1)                | table             |
| identifi                                | periodo                       | character(6)                | table             |
| intercia                                | id                            | integer                     | table             |
| intercia                                | periodo                       | character(6)                | table             |
| intercia                                | rut                           | character varying           | table             |
| intercia                                | rutcia                        | character varying           | table             |
| intercia                                | ........pg.dropped.5........  | -                           | table             |
| intercia                                | primaclp                      | numeric(15,2)               | table             |
| intercia                                | ........pg.dropped.7........  | -                           | table             |
| intercia                                | ........pg.dropped.8........  | -                           | table             |
| intercia                                | nombrecia                     | character varying           | table             |
| intercia                                | grupo                         | character varying           | table             |
| intercia                                | signo                         | character varying           | table             |
| intercia                                | primauf                       | numeric                     | table             |
| intercia                                | ........pg.dropped.13........ | -                           | table             |
| pagos                                   | id                            | uuid                        | table             |
| pagos                                   | user_id                       | text                        | table             |
| pagos                                   | rut                           | character varying           | table             |
| pagos                                   | producto_id                   | uuid                        | table             |
| pagos                                   | orden_comercio                | text                        | table             |
| pagos                                   | amount                        | numeric(10,2)               | table             |
| pagos                                   | estado                        | text                        | table             |
| pagos                                   | fecha_creacion                | timestamp without time zone | table             |
| pagos                                   | token                         | text                        | table             |
| pagos                                   | url_pago                      | text                        | table             |
| periodos                                | id                            | integer                     | table             |
| periodos                                | periodo                       | character varying           | table             |
| prodramo                                | id                            | integer                     | table             |
| prodramo                                | periodo                       | character(6)                | table             |
| prodramo                                | ........pg.dropped.3........  | -                           | table             |
| prodramo                                | grupo                         | smallint                    | table             |
| prodramo                                | cod                           | character varying           | table             |
| prodramo                                | primaclp                      | numeric(15,2)               | table             |
| prodramo                                | primauf                       | numeric(15,2)               | table             |
| prodramo                                | rut                           | character varying           | table             |
| prodramo                                | signo                         | character varying           | table             |
| productos                               | id                            | uuid                        | table             |
| productos                               | codigo                        | text                        | table             |
| productos                               | nombre                        | text                        | table             |
| productos                               | descripcion                   | text                        | table             |
| productos                               | precio_neto                   | numeric(10,2)               | table             |
| productos                               | precio_bruto                  | numeric(10,2)               | table             |
| ramos                                   | id                            | smallint                    | table             |
| ramos                                   | codigo                        | character varying(10)       | table             |
| ramos                                   | ramo                          | character varying(100)      | table             |
| ramos                                   | grupo                         | character varying(50)       | table             |
| ramos                                   | subgrupo                      | character varying           | table             |
| ramos                                   | cod                           | character varying           | table             |
| ramos                                   | codsg                         | character varying           | table             |
| registro_empresa                        | id                            | uuid                        | table             |
| registro_empresa                        | user_id                       | text                        | table             |
| registro_empresa                        | email                         | text                        | table             |
| registro_empresa                        | empresa                       | text                        | table             |
| registro_empresa                        | rut_empresa                   | text                        | table             |
| registro_empresa                        | created_at                    | timestamp without time zone | table             |
| reporte_individual                      | id                            | uuid                        | table             |
| reporte_individual                      | user_id                       | text                        | table             |
| reporte_individual                      | rut                           | character varying           | table             |
| reporte_individual                      | periodo                       | text                        | table             |
| reporte_individual                      | data                          | jsonb                       | table             |
| reporte_individual                      | fecha_generacion              | timestamp without time zone | table             |
| reporte_individual                      | fecha_expiracion              | timestamp without time zone | table             |
| reporte_individual                      | activo                        | boolean                     | table             |
| temp_concentracion_mercado              | periodo                       | character(6)                | table             |
| temp_concentracion_mercado              | grupo                         | character varying           | table             |
| temp_concentracion_mercado              | total_clp                     | numeric                     | table             |
| temp_concentracion_mercado              | total_uf                      | numeric                     | table             |
| uf_values                               | id                            | integer                     | table             |
| uf_values                               | periodo                       | character varying           | table             |
| uf_values                               | valor                         | numeric(10,2)               | table             |
| indicadores_generales_corredor          | rut                           | character varying           | view              |
| indicadores_generales_corredor          | periodo                       | character(6)                | view              |
| indicadores_generales_corredor          | total_primaclp                | numeric                     | view              |
| indicadores_generales_corredor          | total_primauf                 | numeric                     | view              |
| indicadores_generales_corredor          | crecimiento_clp               | numeric                     | view              |
| indicadores_generales_corredor          | crecimiento_uf                | numeric                     | view              |
| indicadores_generales_corredor          | hhi_ramos                     | numeric                     | view              |
| indicadores_generales_corredor          | hhi_companias                 | numeric                     | view              |
| indicadores_generales_corredor          | participacion_clp             | numeric                     | view              |
| indicadores_generales_corredor          | variacion_clp_pp              | numeric                     | view              |
| indicadores_generales_corredor          | num_companias                 | bigint                      | view              |
| indicadores_generales_corredor          | num_ramos                     | bigint                      | view              |
| indicadores_generales_corredor          | ranking_general               | bigint                      | view              |
| memoria_anual_ramos                     | codigo                        | character varying(10)       | view              |
| memoria_anual_ramos                     | ramo                          | character varying(100)      | view              |
| memoria_anual_ramos                     | total_clp                     | numeric                     | view              |
| memoria_anual_ramos                     | total_uf                      | numeric                     | view              |
| ranking_companias                       | periodo                       | character(6)                | view              |
| ranking_companias                       | rutcia                        | character varying           | view              |
| ranking_companias                       | rut                           | character varying           | view              |
| ranking_companias                       | total_primaclp                | numeric                     | view              |
| ranking_companias                       | ranking_produccion            | bigint                      | view              |
| ranking_general                         | periodo                       | character(6)                | view              |
| ranking_general                         | rut                           | character varying           | view              |
| ranking_general                         | total_primaclp                | numeric                     | view              |
| ranking_general                         | ranking_produccion            | bigint                      | view              |
| ranking_ramos                           | periodo                       | character(6)                | view              |
| ranking_ramos                           | ramo_cod                      | character varying           | view              |
| ranking_ramos                           | rut                           | character varying           | view              |
| ranking_ramos                           | primaclp                      | numeric(15,2)               | view              |
| ranking_ramos                           | ranking_produccion            | bigint                      | view              |
| vista_concentracion_corredores_por_ramo | periodo                       | character(6)                | view              |
| vista_concentracion_corredores_por_ramo | ramo_cod                      | character varying           | view              |
| vista_concentracion_corredores_por_ramo | hhi_corredores_ramo           | numeric                     | view              |
| vista_concentracion_ramos               | periodo                       | character(6)                | view              |
| vista_concentracion_ramos               | hhi_general                   | numeric                     | view              |
| vista_concentracion_ramos               | grupo                         | character varying(50)       | view              |
| vista_concentracion_ramos               | hhi_grupo                     | numeric                     | view              |
| vista_concentracion_ramos               | subgrupo                      | character varying           | view              |
| vista_concentracion_ramos               | hhi_subgrupo                  | numeric                     | view              |
| vista_mercado_periodo                   | periodo                       | character(6)                | view              |
| vista_mercado_periodo                   | total_primaclp                | numeric                     | view              |
| vista_mercado_periodo                   | total_primauf                 | numeric                     | view              |
| vista_mercado_periodo                   | total_corredores              | bigint                      | view              |
| vista_mercado_periodo                   | total_companias               | bigint                      | view              |
| vista_ramos_periodo                     | periodo                       | character(6)                | view              |
| vista_ramos_periodo                     | cod                           | character varying(10)       | view              |
| vista_ramos_periodo                     | ramo                          | character varying(100)      | view              |
| vista_ramos_periodo                     | grupo                         | character varying(50)       | view              |
| vista_ramos_periodo                     | subgrupo                      | character varying           | view              |
| vista_ramos_periodo                     | total_primaclp                | numeric                     | view              |
| vista_ramos_periodo                     | total_primauf                 | numeric                     | view              |
| vista_ramos_periodo                     | crecimiento_clp               | numeric                     | view              |
| vista_ramos_periodo                     | participacion_clp             | numeric                     | view              |
| vista_ramos_periodo                     | variacion_clp_pp              | numeric                     | view              |
| vista_ramos_periodo                     | participacion_grupo_clp       | numeric                     | view              |
| vista_ramos_periodo                     | participacion_subgrupo_clp    | numeric                     | view              |
| vista_ramos_periodo                     | ranking_general               | bigint                      | view              |
| vista_ramos_periodo                     | ranking_grupo                 | bigint                      | view              |
| vista_ramos_periodo                     | ranking_subgrupo              | bigint                      | view              |
| vista_segmentos_companias               | periodo                       | character(6)                | view              |
| vista_segmentos_companias               | rutcia                        | character varying           | view              |
| vista_segmentos_companias               | nombrecia                     | character varying(50)       | view              |
| vista_segmentos_companias               | primauf                       | numeric                     | view              |
| vista_segmentos_companias               | segmento                      | text                        | view              |
| vista_segmentos_corredores              | periodo                       | character(6)                | view              |
| vista_segmentos_corredores              | rut                           | character varying           | view              |
| vista_segmentos_corredores              | promedio_primauf              | numeric                     | view              |
| vista_segmentos_corredores              | segmento                      | text                        | view              |