database strucutere in supabase
| table_name                  | column_name              | data_type                   |
| --------------------------- | ------------------------ | --------------------------- |
| actores_salientes           | id                       | integer                     |
| actores_salientes           | rutcia                   | character varying           |
| actores_salientes           | nombrecia                | character varying           |
| actores_salientes           | motivo                   | text                        |
| actores_salientes           | fecha_salida             | date                        |
| companias                   | id                       | integer                     |
| companias                   | rutcia                   | character varying           |
| companias                   | nombrecia                | character varying           |
| corredores                  | id                       | integer                     |
| corredores                  | rut                      | character varying           |
| corredores                  | nombre                   | character varying           |
| corredores                  | telefono                 | character varying           |
| corredores                  | domicilio                | character varying           |
| corredores                  | ciudad                   | character varying           |
| corredores                  | region                   | smallint                    |
| corredores                  | tipo_persona             | character                   |
| identifi                    | id                       | integer                     |
| identifi                    | rut                      | character varying           |
| identifi                    | nombre                   | character varying           |
| identifi                    | telefono                 | character varying           |
| identifi                    | domicilio                | character varying           |
| identifi                    | ciudad                   | character varying           |
| identifi                    | region                   | smallint                    |
| identifi                    | tipo_persona             | character                   |
| intercia                    | id                       | integer                     |
| intercia                    | periodo                  | character                   |
| intercia                    | rut                      | character varying           |
| intercia                    | rutcia                   | character varying           |
| intercia                    | primaclp                 | numeric                     |
| intercia                    | nombrecia                | character varying           |
| intercia                    | grupo                    | character varying           |
| intercia                    | signo                    | character varying           |
| intercia                    | primauf                  | numeric                     |
| memoria_anual_ramos         | codigo                   | character varying           |
| memoria_anual_ramos         | ramo                     | character varying           |
| memoria_anual_ramos         | total_clp                | numeric                     |
| memoria_anual_ramos         | total_uf                 | numeric                     |
| prodramo                    | id                       | integer                     |
| prodramo                    | periodo                  | character                   |
| prodramo                    | grupo                    | smallint                    |
| prodramo                    | cod                      | character varying           |
| prodramo                    | primaclp                 | numeric                     |
| prodramo                    | primauf                  | numeric                     |
| prodramo                    | rut                      | character varying           |
| prodramo                    | signo                    | character varying           |
| ramos                       | id                       | smallint                    |
| ramos                       | codigo                   | character varying           |
| ramos                       | ramo                     | character varying           |
| ramos                       | grupo                    | character varying           |
| ramos                       | subgrupo                 | character varying           |
| ramos                       | cod                      | character varying           |
| ramos                       | codsg                    | character varying           |
| registro_empresa            | id                       | uuid                        |
| registro_empresa            | user_id                  | text                        |
| registro_empresa            | email                    | text                        |
| registro_empresa            | empresa                  | text                        |
| registro_empresa            | rut_empresa              | text                        |
| registro_empresa            | created_at               | timestamp without time zone |
| uf_values                   | id                       | integer                     |
| uf_values                   | periodo                  | character varying           |
| uf_values                   | valor                    | numeric                     |
| vista_companias_periodo     | periodo                  | character                   |
| vista_companias_periodo     | nombrecia                | character varying           |
| vista_companias_periodo     | total_clp                | numeric                     |
| vista_companias_periodo     | total_uf                 | numeric                     |
| vista_concentracion_mercado | periodo                  | character                   |
| vista_concentracion_mercado | grupo                    | character varying           |
| vista_concentracion_mercado | total_clp                | numeric                     |
| vista_concentracion_mercado | total_uf                 | numeric                     |
| vista_concentracion_mercado | participacion_porcentaje | numeric                     |
| vista_concentracion_mercado | varianza_anual           | numeric                     |
| vista_corredores_periodo    | periodo                  | character                   |
| vista_corredores_periodo    | nombre                   | character varying           |
| vista_corredores_periodo    | total_clp                | numeric                     |
| vista_corredores_periodo    | total_uf                 | numeric                     |
| vista_evolucion_mercado     | periodo                  | character                   |
| vista_evolucion_mercado     | rutcia                   | character varying           |
| vista_evolucion_mercado     | nombrecia                | character varying           |
| vista_evolucion_mercado     | tipo_cambio              | text                        |
| vista_evolucion_mercado     | motivo                   | text                        |
| vista_ramos_periodo         | periodo                  | character                   |
| vista_ramos_periodo         | ramo                     | character varying           |
| vista_ramos_periodo         | total_clp                | numeric                     |
| vista_ramos_periodo         | total_uf                 | numeric                     |



views in supabase
| table_name                  |
| --------------------------- |
| vista_companias_periodo     |
| vista_ramos_periodo         |
| vista_corredores_periodo    |
| vista_evolucion_mercado     |
| vista_concentracion_mercado |
| memoria_anual_ramos         |