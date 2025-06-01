create materialized view public.vista_companias_periodo as
select
  i.periodo,
  i.rutcia,
  i.nombrecia,
  i.grupo,
  sum(i.primaclp) as total_primaclp,
  sum(i.primauf) as total_primauf,
  (
    sum(i.primaclp) - lag(sum(i.primaclp)) over (
      partition by
        i.rutcia
      order by
        i.periodo
    )
  ) / NULLIF(
    lag(sum(i.primaclp)) over (
      partition by
        i.rutcia
      order by
        i.periodo
    ),
    0::numeric
  ) * 100::numeric as crecimiento_clp,
  (
    sum(i.primauf) - lag(sum(i.primauf)) over (
      partition by
        i.rutcia
      order by
        i.periodo
    )
  ) / NULLIF(
    lag(sum(i.primauf)) over (
      partition by
        i.rutcia
      order by
        i.periodo
    ),
    0::numeric
  ) * 100::numeric as crecimiento_uf,
  count(distinct i.rut) as numero_de_corredores
from
  intercia i
group by
  i.periodo,
  i.rutcia,
  i.nombrecia,
  i.grupo;