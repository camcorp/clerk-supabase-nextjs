# Demostración Completa: API de Simulación de Compra de Reportes

## 🎯 Resumen

Este documento demuestra cómo funciona la **simulación de compra vía API** que hemos implementado para el sistema de reportes. La API permite crear registros de compra completos usando las funciones corregidas del sistema.

## 📋 Endpoint Implementado

### URL del Endpoint
```
POST /api/reportes/simular-compra
```

### Código del Endpoint
```typescript
// /app/api/reportes/simular-compra/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { comprarReporte } from '@/app/lib/api/reportes';

export async function POST(request: NextRequest) {
  try {
    const { userId, rut, periodo } = await request.json();
    
    // Validaciones
    if (!userId || !rut || !periodo) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: userId, rut, periodo' },
        { status: 400 }
      );
    }
    
    if (!/^\d{7,8}$/.test(rut)) {
      return NextResponse.json(
        { error: 'RUT debe contener solo números (7-8 dígitos)' },
        { status: 400 }
      );
    }
    
    if (!/^\d{6}$/.test(periodo)) {
      return NextResponse.json(
        { error: 'Período debe tener formato YYYYMM' },
        { status: 400 }
      );
    }
    
    // Llamar a la función corregida
    const resultado = await comprarReporte(userId, rut, periodo);
    
    if (resultado.success) {
      return NextResponse.json({
        success: true,
        message: 'Compra simulada exitosamente',
        data: resultado.data
      });
    } else {
      return NextResponse.json(
        { error: resultado.error, details: resultado.details },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error en simulación de compra:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    description: 'Endpoint para simular compra de reportes',
    method: 'POST',
    endpoint: '/api/reportes/simular-compra',
    example: {
      userId: 'user_demo_762686856',
      rut: '762686856',
      periodo: '202412'
    }
  });
}
```

## 🔧 Funciones Corregidas Utilizadas

El endpoint utiliza la función `comprarReporte` que hemos corregido previamente:

### Correcciones Implementadas:
1. ✅ **Código de producto correcto**: `rp_001` (antes era `rp_002`)
2. ✅ **Precio correcto**: $35,688.10 CLP (antes era $59,500)
3. ✅ **Validación de corredor**: Verifica existencia en BD
4. ✅ **Creación de registros completos**: Pago + Acceso + Reporte
5. ✅ **Manejo de errores**: Validaciones y rollback

## 📊 Datos de Prueba

### Corredor de Prueba
- **RUT**: 762686856
- **Nombre**: Corredor Demo
- **Estado**: Activo

### Producto
- **Código**: rp_001
- **Nombre**: Reporte Individual de Corredor
- **Precio**: $35,688.10 CLP
- **Período**: 202412 (Diciembre 2024)

## 🚀 Métodos de Prueba

### 1. Usando curl (Recomendado)
```bash
# Iniciar servidor
npm run dev

# Simular compra
curl -X POST http://localhost:3000/api/reportes/simular-compra \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_demo_762686856",
    "rut": "762686856",
    "periodo": "202412"
  }'
```

### 2. Usando Node.js (Alternativo)
```javascript
// simular-compra-api-nativo.js
const response = await fetch('http://localhost:3000/api/reportes/simular-compra', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user_demo_762686856',
    rut: '762686856',
    periodo: '202412'
  })
});

const resultado = await response.json();
console.log(resultado);
```

### 3. Desde el Frontend
```typescript
// Componente React
const simularCompra = async () => {
  try {
    const response = await fetch('/api/reportes/simular-compra', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user_demo_762686856',
        rut: '762686856',
        periodo: '202412'
      })
    });
    
    const resultado = await response.json();
    
    if (resultado.success) {
      console.log('✅ Compra exitosa:', resultado.data);
      // Redirigir al dashboard o mostrar mensaje
    } else {
      console.error('❌ Error:', resultado.error);
    }
  } catch (error) {
    console.error('💥 Error de conexión:', error);
  }
};
```

## 📋 Respuesta Esperada

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Compra simulada exitosamente",
  "data": {
    "pago": {
      "id": "uuid-generado",
      "orden_comercio": "ORD_762686856_202412_timestamp",
      "amount": 35688.10,
      "estado": "completado",
      "fecha_creacion": "2024-12-XX",
      "metodo_pago": "simulado"
    },
    "acceso": {
      "id": "uuid-generado",
      "user_id": "user_demo_762686856",
      "modulo": "reportes_individuales",
      "activo": true,
      "fecha_inicio": "2024-12-XX",
      "fecha_fin": "2025-12-XX"
    },
    "reporte": {
      "id": "uuid-generado",
      "rut": "762686856",
      "periodo": "202412",
      "activo": true,
      "fecha_generacion": "2024-12-XX",
      "fecha_expiracion": "2025-12-XX"
    },
    "url_acceso": "/dashboard/corredor/reportes/762686856/202412"
  }
}
```

### Respuesta de Error (400/500)
```json
{
  "error": "Descripción del error",
  "details": "Detalles adicionales si están disponibles"
}
```

## 🔍 Verificación de Resultados

### 1. En la Base de Datos
```sql
-- Verificar pago creado
SELECT * FROM pagos 
WHERE orden_comercio LIKE 'ORD_762686856_202412_%'
ORDER BY fecha_creacion DESC LIMIT 1;

-- Verificar acceso creado
SELECT * FROM accesos_usuarios 
WHERE user_id = 'user_demo_762686856' 
AND modulo = 'reportes_individuales'
ORDER BY fecha_creacion DESC LIMIT 1;

-- Verificar reporte creado
SELECT * FROM reportes_individuales 
WHERE rut = '762686856' 
AND periodo = '202412'
ORDER BY fecha_generacion DESC LIMIT 1;
```

### 2. En el Dashboard
1. Ir a: `http://localhost:3000/dashboard/corredor/reportes`
2. El reporte debería aparecer en "Mis Reportes"
3. Hacer clic en "Ver Reporte" para acceder

## 🎯 Ventajas del Enfoque API

### ✅ Beneficios
1. **Reutilizable**: Puede usarse desde cualquier cliente
2. **Validación centralizada**: Manejo consistente de errores
3. **Mantenible**: Usa las funciones corregidas existentes
4. **Escalable**: Fácil integración con frontend/mobile
5. **Testeable**: Permite pruebas automatizadas
6. **Documentado**: Endpoint autodocumentado con GET

### 🔧 Casos de Uso
1. **Simulación de compras** para testing
2. **Integración con sistemas externos**
3. **Automatización de procesos**
4. **Pruebas de carga**
5. **Desarrollo frontend independiente**

## 🚨 Consideraciones Importantes

### Variables de Entorno Requeridas
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### Prerrequisitos
1. ✅ Servidor Next.js ejecutándose
2. ✅ Variables de entorno configuradas
3. ✅ Base de datos Supabase accesible
4. ✅ Corredor 762686856 existe en BD
5. ✅ Producto rp_001 configurado correctamente

## 📝 Próximos Pasos

1. **Configurar entorno**: Asegurar variables de Supabase
2. **Probar endpoint**: Usar curl o script Node.js
3. **Verificar resultados**: Revisar BD y dashboard
4. **Integrar frontend**: Conectar con componentes React
5. **Documentar API**: Crear documentación completa

---

**✨ La simulación vía API está completamente implementada y lista para usar. Solo requiere un entorno configurado correctamente para ejecutarse.**