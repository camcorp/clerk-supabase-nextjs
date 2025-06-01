SELECT 
  periodo, 
  COUNT(*) FILTER (WHERE tipo_cambio = 'entrada') AS num_entradas, 
  COUNT(*) FILTER (WHERE tipo_cambio = 'salida') AS num_salidas 
FROM vista_evolucion_mercado 
WHERE tipo_cambio IN ('entrada', 'salida') 
GROUP BY periodo 
ORDER BY periodo;


SELECT 
  periodo, 
  COUNT(*) FILTER (WHERE tipo_cambio = 'entrada') AS num_entradas, 
  COUNT(*) FILTER (WHERE tipo_cambio = 'salida') AS num_salidas 
FROM vista_evolucion_corredores 
WHERE tipo_cambio IN ('entrada', 'salida') 
GROUP BY periodo 
ORDER BY periodo;