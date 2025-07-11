# 🔗 Configuración de Webhooks Flow.cl

## 📋 Resumen

Los webhooks son **fundamentales** para el funcionamiento del sistema de pagos. Flow.cl enviará notificaciones automáticas a tu servidor cuando ocurran eventos de pago.

## 🎯 ¿Por qué usar Webhooks?

### **Sin Webhooks:**
- ❌ El usuario paga pero el sistema no se entera
- ❌ No se genera el reporte automáticamente
- ❌ El usuario no obtiene acceso al sistema
- ❌ Hay que verificar manualmente cada pago

### **Con Webhooks:**
- ✅ Confirmación automática de pagos
- ✅ Generación automática de reportes
- ✅ Acceso inmediato para el usuario
- ✅ Auditoría completa de transacciones

## 🏗️ Implementación de Webhooks

### **1. Endpoint Principal: `/api/flow/webhook`**

```typescript
// app/api/flow/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyFlowPayment } from '@/lib/flow';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Webhook Flow.cl recibido');
    
    // 1. Obtener datos del webhook
    const body = await request.text();
    const params = new URLSearchParams(body);
    const token = params.get('token');
    
    if (!token) {
      console.error('❌ Token no encontrado en webhook');
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 });
    }
    
    console.log('🔍 Verificando pago con token:', token);
    
    // 2. Verificar pago en Flow.cl
    const paymentStatus = await verifyFlowPayment(token);
    console.log('📊 Estado del pago:', paymentStatus);
    
    // 3. Buscar pago en base de datos
    const supabase = createClient();
    const { data: pago, error: pagoError } = await supabase
      .from('pagos')
      .select('*')
      .eq('flow_token', token)
      .single();
    
    if (pagoError || !pago) {
      console.error('❌ Pago no encontrado en BD:', pagoError);
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 });
    }
    
    // 4. Actualizar estado del pago
    const nuevoEstado = paymentStatus.status === 2 ? 'completed' : 'failed';
    
    const { error: updateError } = await supabase
      .from('pagos')
      .update({
        estado: nuevoEstado,
        flow_status: paymentStatus.status.toString(),
        flow_payment_id: paymentStatus.flowOrder?.toString(),
        flow_payment_data: paymentStatus,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', pago.id);
    
    if (updateError) {
      console.error('❌ Error actualizando pago:', updateError);
      return NextResponse.json({ error: 'Error actualizando pago' }, { status: 500 });
    }
    
    // 5. Registrar transacción Flow para auditoría
    await supabase
      .from('transacciones_flow')
      .insert({
        pago_id: pago.id,
        flow_token: token,
        flow_order: paymentStatus.flowOrder,
        flow_payment_id: paymentStatus.flowOrder?.toString(),
        flow_status: paymentStatus.status.toString(),
        flow_amount: paymentStatus.amount,
        flow_currency: paymentStatus.currency || 'CLP',
        flow_payer_email: paymentStatus.payer?.email,
        flow_payment_date: paymentStatus.paymentDate,
        flow_confirmation_date: new Date().toISOString(),
        flow_raw_response: paymentStatus
      });
    
    // 6. Si el pago fue exitoso, procesar
    if (paymentStatus.status === 2) {
      console.log('✅ Pago exitoso, procesando...');
      await procesarPagoExitoso(pago, supabase);
    } else {
      console.log('❌ Pago fallido o pendiente');
    }
    
    // 7. Registrar en logs
    await supabase
      .from('logs_sistema')
      .insert({
        user_id: pago.user_id,
        accion: 'webhook_flow_recibido',
        tabla_afectada: 'pagos',
        registro_id: pago.id,
        datos_nuevos: {
          flow_status: paymentStatus.status,
          estado_anterior: pago.estado,
          estado_nuevo: nuevoEstado
        }
      });
    
    console.log('🎉 Webhook procesado exitosamente');
    return NextResponse.json({ received: true, status: 'processed' });
    
  } catch (error) {
    console.error('💥 Error procesando webhook:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}

// Función para procesar pago exitoso
async function procesarPagoExitoso(pago: any, supabase: any) {
  try {
    // 1. Crear acceso de usuario (1 año)
    const fechaInicio = new Date();
    const fechaFin = new Date();
    fechaFin.setFullYear(fechaFin.getFullYear() + 1);
    
    const { error: accesoError } = await supabase
      .from('accesos_usuarios')
      .insert({
        user_id: pago.user_id,
        producto_id: pago.producto_id,
        modulo: 'reportes_individuales',
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
        activo: true
      });
    
    if (accesoError) {
      console.error('❌ Error creando acceso:', accesoError);
      throw accesoError;
    }
    
    // 2. Generar reporte individual
    const datosReporte = await generarDatosReporte(pago.rut, pago.periodo);
    
    const { error: reporteError } = await supabase
      .from('reportes_individuales')
      .insert({
        user_id: pago.user_id,
        rut: pago.rut,
        periodo: pago.periodo,
        datos_reporte: datosReporte,
        fecha_expiracion: fechaFin.toISOString(),
        activo: true
      });
    
    if (reporteError) {
      console.error('❌ Error creando reporte:', reporteError);
      throw reporteError;
    }
    
    // 3. Log de éxito
    await supabase
      .from('logs_sistema')
      .insert({
        user_id: pago.user_id,
        accion: 'compra_exitosa_procesada',
        tabla_afectada: 'reportes_individuales',
        datos_nuevos: {
          pago_id: pago.id,
          rut: pago.rut,
          periodo: pago.periodo,
          acceso_creado: true,
          reporte_generado: true
        }
      });
    
    console.log('✅ Pago exitoso procesado completamente');
    
  } catch (error) {
    console.error('💥 Error procesando pago exitoso:', error);
    throw error;
  }
}

// Función para generar datos del reporte
async function generarDatosReporte(rut: string, periodo: string) {
  const supabase = createClient();
  
  // Consultar datos de producción del corredor
  const { data: produccion } = await supabase
    .from('intercia')
    .select(`
      periodo,
      rut,
      rutcia,
      primaclp,
      primauf,
      nombrecia,
      grupo
    `)
    .eq('rut', rut)
    .eq('periodo', periodo);
  
  if (!produccion || produccion.length === 0) {
    throw new Error(`No hay datos disponibles para RUT ${rut} en período ${periodo}`);
  }
  
  // Calcular métricas
  const totalPrimaClp = produccion.reduce((sum, item) => sum + (item.primaclp || 0), 0);
  const totalPrimaUf = produccion.reduce((sum, item) => sum + (item.primauf || 0), 0);
  const numeroCompanias = new Set(produccion.map(item => item.rutcia)).size;
  
  return {
    corredor: {
      rut,
      periodo,
      total_prima_clp: totalPrimaClp,
      total_prima_uf: totalPrimaUf,
      numero_companias: numeroCompanias
    },
    produccion_detalle: produccion,
    fecha_generacion: new Date().toISOString(),
    version: '1.0'
  };
}
```

### **2. Páginas de Retorno**

#### **Página de Éxito: `/app/pago/exito/page.tsx`**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function PagoExitoso() {
  const [estado, setEstado] = useState<'cargando' | 'exitoso' | 'error'>('cargando');
  const [datosPago, setDatosPago] = useState<any>(null);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  useEffect(() => {
    if (token) {
      verificarPago(token);
    }
  }, [token]);
  
  const verificarPago = async (token: string) => {
    try {
      const supabase = createClient();
      
      // Buscar pago por token
      const { data: pago, error } = await supabase
        .from('pagos')
        .select(`
          *,
          productos(nombre, descripcion)
        `)
        .eq('flow_token', token)
        .single();
      
      if (error || !pago) {
        setEstado('error');
        return;
      }
      
      setDatosPago(pago);
      setEstado(pago.estado === 'completed' ? 'exitoso' : 'error');
      
    } catch (error) {
      console.error('Error verificando pago:', error);
      setEstado('error');
    }
  };
  
  if (estado === 'cargando') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Verificando tu pago...</p>
        </div>
      </div>
    );
  }
  
  if (estado === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Pago No Confirmado</h1>
          <p className="text-gray-600 mb-4">Hubo un problema con tu pago. Por favor contacta soporte.</p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-green-600 text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-green-600 mb-2">¡Pago Exitoso!</h1>
        <p className="text-gray-600 mb-4">
          Tu pago ha sido confirmado. Ya tienes acceso a tu reporte individual.
        </p>
        
        {datosPago && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left">
            <h3 className="font-semibold mb-2">Detalles de la Compra:</h3>
            <p><strong>Producto:</strong> {datosPago.productos?.nombre}</p>
            <p><strong>Monto:</strong> ${datosPago.amount?.toLocaleString()} CLP</p>
            <p><strong>Orden:</strong> {datosPago.orden_comercio}</p>
            <p><strong>RUT:</strong> {datosPago.rut}</p>
            <p><strong>Período:</strong> {datosPago.periodo}</p>
          </div>
        )}
        
        <div className="space-y-2">
          <button 
            onClick={() => window.location.href = '/dashboard/corredor/reportes'}
            className="w-full bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Ver Mi Reporte
          </button>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
```

## 🔧 Configuración en Panel Flow.cl

### **Paso a Paso Detallado**

#### **1. Acceder al Panel**
```
1. Ir a: https://www.flow.cl
2. Hacer clic en "Ingresar"
3. Iniciar sesión con tu cuenta
4. Ir a "Panel de administración"
```

#### **2. Configurar Webhooks**
```
1. En el menú lateral: Configuración > Webhooks
2. Hacer clic en "Agregar Webhook"
3. Completar formulario:
   - Nombre: "Webhook Reportes Individuales"
   - URL: http://localhost:3000/api/flow/webhook (desarrollo)
   - Método: POST
   - Eventos: Seleccionar todos los de "payment"
   - Estado: Activo
4. Guardar configuración
```

#### **3. Configurar URLs de Retorno**
```
1. En el menú lateral: Configuración > URLs
2. Configurar:
   - URL de Éxito: http://localhost:3000/pago/exito
   - URL de Error: http://localhost:3000/pago/error
   - URL de Confirmación: http://localhost:3000/api/flow/webhook
3. Guardar configuración
```

#### **4. Obtener Credenciales API**
```
1. En el menú lateral: Configuración > API
2. Copiar:
   - API Key
   - Secret Key
3. Pegar en archivo .env.local
```

## 🧪 Testing de Webhooks

### **1. Usando ngrok (Recomendado)**

```bash
# Instalar ngrok
brew install ngrok

# Ejecutar servidor Next.js
npm run dev

# En otra terminal, exponer puerto
ngrok http 3000

# Copiar URL HTTPS generada
# Ejemplo: https://abc123.ngrok.io

# Configurar en Flow.cl:
# https://abc123.ngrok.io/api/flow/webhook
```

### **2. Verificar Webhook Funcionando**

```bash
# Ver logs en tiempo real
tail -f .next/server.log

# O en consola del navegador (F12)
# Buscar mensajes como:
# 🔔 Webhook Flow.cl recibido
# ✅ Pago exitoso procesado completamente
```

### **3. Script de Prueba**

```javascript
// test-webhook.js
const fetch = require('node-fetch');

async function testWebhook() {
  const webhookUrl = 'http://localhost:3000/api/flow/webhook';
  const testData = new URLSearchParams({
    token: 'test_token_123'
  });
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: testData
    });
    
    const result = await response.json();
    console.log('Respuesta webhook:', result);
    
  } catch (error) {
    console.error('Error testing webhook:', error);
  }
}

testWebhook();
```

## 🚨 Troubleshooting

### **Webhook no recibe llamadas**

```bash
# Verificar:
1. ✅ Servidor corriendo en puerto 3000
2. ✅ ngrok exponiendo puerto correctamente
3. ✅ URL configurada correctamente en Flow.cl
4. ✅ Endpoint /api/flow/webhook existe
5. ✅ No hay firewall bloqueando
```

### **Webhook recibe llamadas pero falla**

```bash
# Verificar logs:
1. ✅ Token presente en request
2. ✅ Credenciales Flow.cl correctas
3. ✅ Base de datos accesible
4. ✅ Pago existe en tabla pagos
5. ✅ No hay errores de SQL
```

### **Pago confirmado pero no se genera reporte**

```bash
# Verificar:
1. ✅ Estado del pago = 'completed'
2. ✅ Datos del corredor existen
3. ✅ Período tiene datos en tabla intercia
4. ✅ No hay errores en función generarDatosReporte
```

## 📊 Monitoreo de Webhooks

### **Dashboard de Webhooks**

```sql
-- Ver webhooks recientes
SELECT 
    tf.flow_token,
    tf.flow_status,
    tf.flow_amount,
    tf.fecha_creacion,
    p.orden_comercio,
    p.estado
FROM transacciones_flow tf
JOIN pagos p ON tf.pago_id = p.id
ORDER BY tf.fecha_creacion DESC
LIMIT 20;
```

### **Alertas Automáticas**

```javascript
// Función para detectar webhooks fallidos
export async function verificarWebhooksFallidos() {
  const supabase = createClient();
  
  // Buscar pagos pendientes por más de 10 minutos
  const { data: pagosPendientes } = await supabase
    .from('pagos')
    .select('*')
    .eq('estado', 'pending')
    .lt('fecha_creacion', new Date(Date.now() - 10 * 60 * 1000).toISOString());
  
  if (pagosPendientes && pagosPendientes.length > 0) {
    console.warn(`⚠️ ${pagosPendientes.length} pagos pendientes detectados`);
    // Enviar alerta por email o Slack
  }
}
```

---

## ✅ Checklist de Webhooks

- [ ] **Configuración Flow.cl**
  - [ ] Webhook URL configurada
  - [ ] Eventos seleccionados
  - [ ] URLs de retorno configuradas
  - [ ] Credenciales API copiadas

- [ ] **Implementación**
  - [ ] Endpoint `/api/flow/webhook` creado
  - [ ] Página `/pago/exito` creada
  - [ ] Función `verifyFlowPayment` implementada
  - [ ] Función `procesarPagoExitoso` implementada

- [ ] **Testing**
  - [ ] ngrok configurado
  - [ ] Webhook recibe llamadas
  - [ ] Pago de prueba exitoso
  - [ ] Reporte generado automáticamente

- [ ] **Monitoreo**
  - [ ] Logs configurados
  - [ ] Dashboard de transacciones
  - [ ] Alertas de webhooks fallidos

**🎉 ¡Webhooks Flow.cl configurados correctamente!**