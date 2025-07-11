import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { generarReporteIndividual } from '@/lib/api/reportes';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const { items, datosFacturacion } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'El carrito está vacío' },
        { status: 400 }
      );
    }

    if (!datosFacturacion?.rut || !datosFacturacion?.razonSocial || !datosFacturacion?.direccion) {
      return NextResponse.json(
        { error: 'Datos de facturación incompletos' },
        { status: 400 }
      );
    }

    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fechaActual = new Date().toISOString();

    // Calcular totales correctamente - precio_bruto ya incluye IVA
    const total = items.reduce((sum: number, item: any) => sum + (item.precio_bruto * item.cantidad), 0);
    const subtotal = Math.round(total / 1.19); // Calcular neto desde bruto
    const iva = total - subtotal; // IVA es la diferencia

    console.log('💰 Cálculo de montos:', {
      items: items.map(item => ({
        nombre: item.nombre,
        precio_bruto: item.precio_bruto,
        cantidad: item.cantidad,
        subtotal_item: item.precio_bruto * item.cantidad
      })),
      subtotal,
      iva,
      total
    });

    if (items.length === 1) {
      // Carrito con 1 línea: pago individual por producto
      const item = items[0];
      
      // Validar que el RUT del corredor esté presente
      if (!item.metadata?.rutCorredor) {
        return NextResponse.json(
          { error: `RUT del corredor requerido para el producto ${item.nombre}` },
          { status: 400 }
        );
      }
      
      const itemTotal = item.precio_bruto * item.cantidad;
      const itemSubtotal = Math.round(itemTotal / 1.19);
      const itemIva = itemTotal - itemSubtotal;
      
      // Simular datos que se enviarían a Flow
      const flowPaymentRequest = {
        apiKey: process.env.FLOW_API_KEY,
        commerceOrder: transactionId,
        subject: `Compra ${item.nombre}`,
        currency: 'CLP',
        amount: itemTotal,
        email: process.env.FLOW_USER_EMAIL || 'usuario@ejemplo.com',
        urlConfirmation: `${process.env.NEXT_PUBLIC_BASE_URL}/api/flow/webhook`,
        urlReturn: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/shop/success/${transactionId}`
      };

      console.log('🌐 Simulando envío a Flow:', flowPaymentRequest);
      
      const { data: pago, error } = await supabaseAdmin
        .from('pagos')
        .insert({
          user_id: userId,
          // CORREGIDO: usar RUT del corredor
          rut: item.metadata.rutCorredor,
          amount: itemTotal,
          monto: itemTotal,
          subtotal: itemSubtotal,
          iva: itemIva,
          producto_id: item.productoId,
          orden_comercio: transactionId,
          transaction_id: transactionId,
          fecha_creacion: fechaActual,
          datos_facturacion: datosFacturacion,
          estado: 'completed',
          metodo_pago: 'flow',
          flow_status: 'COMPLETED',
          flow_currency: 'CLP'
        })
        .select()
        .single();

      if (error) {
        console.error('Error al crear el pago:', error);
        return NextResponse.json(
          { error: 'Error al procesar el pago' },
          { status: 500 }
        );
      }

      // Crear acceso y generar reporte para el item individual
      const { data: acceso, error: accesoError } = await supabaseAdmin
        .from('accesos_usuarios')
        .insert({
          user_id: userId,
          producto_id: item.productoId,
          modulo: `reporte_corredor_${item.metadata.rutCorredor}`,
          fecha_inicio: fechaActual,
          fecha_fin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          activo: true
        })
        .select()
        .single();
        
      if (accesoError) {
        console.error('❌ Error creando acceso:', accesoError);
      } else {
        console.log('✅ Acceso creado exitosamente:', acceso);
        // Generar reporte individual después de crear el acceso
        try {
          await generarReporteIndividual(
            userId,
            item.metadata.rutCorredor,
            '202412'
          );
          console.log(`✅ Reporte generado para RUT: ${item.metadata.rutCorredor}`);
        } catch (reportError) {
          console.error(`❌ Error generando reporte para RUT ${item.metadata.rutCorredor}:`, reportError);
          // No fallar la compra por esto, solo loggear
        }
      }

      // Simular respuesta exitosa de Flow
      const flowResponse = {
        status: 'COMPLETED',
        paymentDate: fechaActual,
        amount: itemTotal,
        currency: 'CLP',
        commerceOrder: transactionId,
        paymentId: `FLOW-${Date.now()}`,
        subject: flowPaymentRequest.subject
      };

      console.log('📡 Simulando respuesta de Flow:', flowResponse);

      return NextResponse.json({
        success: true,
        transactionId,
        pagoId: pago.id,
        tipo: 'producto_individual',
        flow: flowResponse
      });
    } else {
      // Carrito con múltiples líneas: 1 pago por carrito completo
      
      // Validar que todos los items tengan RUT del corredor
      for (const item of items) {
        if (!item.metadata?.rutCorredor) {
          return NextResponse.json(
            { error: `RUT del corredor requerido para el producto ${item.nombre}` },
            { status: 400 }
          );
        }
      }
      
      const { data: pago, error } = await supabaseAdmin
        .from('pagos')
        .insert({
          user_id: userId,
          rut_factura: datosFacturacion.rut,
          amount: total,
          monto: total,
          subtotal: subtotal,
          iva: iva,
          producto_id: items[0].productoId,
          orden_comercio: transactionId,
          transaction_id: transactionId,
          fecha_creacion: fechaActual,
          datos_facturacion: {
            ...datosFacturacion,
            items_carrito: items,
            tipo_pago: 'carrito_completo',
            cantidad_items: items.length
          },
          estado: 'completed',
          metodo_pago: 'flow',
          flow_status: 'COMPLETED',
          flow_currency: 'CLP'
        })
        .select()
        .single();

      if (error) {
        console.error('Error al crear el pago:', error);
        return NextResponse.json(
          { error: 'Error al procesar el pago' },
          { status: 500 }
        );
      }

      // Crear accesos a reportes para todos los items del carrito
      for (const item of items) {
        const { data: acceso, error: accesoError } = await supabaseAdmin
          .from('accesos_usuarios')
          .insert({
            user_id: userId,
            producto_id: item.productoId,
            modulo: `reporte_corredor_${item.metadata.rutCorredor}`,
            fecha_inicio: fechaActual,
            fecha_fin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            activo: true
          })
          .select()
          .single();
          
        if (accesoError) {
          console.error('❌ Error creando acceso:', accesoError);
        } else {
          console.log('✅ Acceso creado exitosamente:', acceso);
          // Después de crear el acceso exitosamente
          try {
            await generarReporteIndividual(
              userId,
              item.metadata.rutCorredor,
              '202412'
            );
            console.log(`✅ Reporte generado para RUT: ${item.metadata.rutCorredor}`);
          } catch (reportError) {
            console.error(`❌ Error generando reporte para RUT ${item.metadata.rutCorredor}:`, reportError);
            // No fallar la compra por esto, solo loggear
          }
        }
      }

      // Simular respuesta exitosa de Flow
      const flowResponse = {
        status: 'COMPLETED',
        paymentDate: fechaActual,
        amount: total,
        currency: 'CLP',
        commerceOrder: transactionId,
        paymentId: `FLOW-${Date.now()}`,
        subject: `Compra de ${items.length} productos`
      };

      return NextResponse.json({
        success: true,
        transactionId,
        pagoId: pago.id,
        tipo: 'carrito_completo',
        items_count: items.length,
        flow: flowResponse
      });
    }

  } catch (error) {
    console.error('Error en el procesamiento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}