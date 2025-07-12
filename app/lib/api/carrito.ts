// Nuevo archivo para manejar carrito de compras
'use client';
import { createServerSupabaseClient } from '@/lib/supabase/server'; // Cambiar de @/app/lib/supabase/server

// Only import admin client if we're on the server side
let supabaseAdmin: any = null;
if (typeof window === 'undefined') {
  // We're on the server, safe to import admin client
  try {
    const { supabaseAdmin: adminClient } = require('@/lib/supabase/admin'); // Cambiar de @/app/lib/supabase/admin
    supabaseAdmin = adminClient;
  } catch (error) {
    console.warn('Admin client not available:', error);
  }
}

// Remover estas importaciones que causan el error
// import { createServerSupabaseClient } from '@/app/lib/supabase/server';
// import { supabaseAdmin } from '@/app/lib/supabase/admin';

export interface ItemCarrito {
  productoId: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio_neto: number;
  precio_bruto: number;
  cantidad: number;
  // Metadata específica del producto (ej: para reportes)
  metadata?: {
    rutCorredor?: string;
    nombreCorredor?: string;
    periodo?: string;
    [key: string]: any;
  };
}

export interface CarritoEstado {
  items: ItemCarrito[];
  subtotal: number;
  iva: number;
  total: number;
  cantidadItems: number;
}

export class CarritoCompras {
  private items: ItemCarrito[] = [];
  private readonly IVA_RATE = 0.19;

  constructor() {
    // Cargar carrito desde localStorage al inicializar
    if (typeof window !== 'undefined') {
      const carritoGuardado = carritoUtils.cargarCarrito();
      if (carritoGuardado && carritoGuardado.items) {
        this.items = carritoGuardado.items;
      }
    }
  }

  // Nuevo método para establecer items
  establecerItems(items: ItemCarrito[]): void {
    this.items = [...items];
  }







  // Calcular subtotal (sin IVA)
  calcularSubtotal(): number {
    return this.items.reduce((total, item) => total + (item.precio_neto * item.cantidad), 0);
  }

  // Calcular IVA total
  calcularIVA(): number {
    return this.items.reduce((total, item) => {
      const subtotalItem = item.precio_neto * item.cantidad;
      const ivaItem = subtotalItem * 0.19; // 19% IVA
      return total + ivaItem;
    }, 0);
  }

  // Calcular total (con IVA)
  calcularTotal(): number {
    return this.items.reduce((total, item) => total + (item.precio_bruto * item.cantidad), 0);
  }

  // Obtener cantidad total de items
  obtenerCantidadItems(): number {
    return this.items.reduce((total, item) => total + item.cantidad, 0);
  }

  // Obtener todos los items
  obtenerItems(): ItemCarrito[] {
    return [...this.items];
  }

  // Limpiar carrito
  limpiarCarrito(): void {
    this.items = [];
    // También limpiar localStorage
    carritoUtils.limpiarCarritoLocal();
    // Guardar el estado vacío
    carritoUtils.guardarCarrito(this.obtenerEstado());
  }

  // Agregar método para sincronizar con localStorage después de cada operación
  private sincronizarConLocalStorage(): void {
    if (typeof window !== 'undefined') {
      carritoUtils.guardarCarrito(this.obtenerEstado());
    }
  }

  // Actualizar el método agregarItem
  agregarItem(item: ItemCarrito): boolean {
    // Verificar si el item ya existe
    const existeItem = this.items.find(i => 
      i.productoId === item.productoId && 
      JSON.stringify(i.metadata) === JSON.stringify(item.metadata)
    );
    
    if (existeItem) {
      // Incrementar cantidad si ya existe
      existeItem.cantidad += item.cantidad;
    } else {
      this.items.push(item);
    }
    
    // Sincronizar con localStorage
    this.sincronizarConLocalStorage();
    return true;
  }

  // Actualizar el método eliminarItem
  eliminarItem(productoId: string, metadata?: any): boolean {
    const indiceInicial = this.items.length;
    this.items = this.items.filter(item => {
      if (item.productoId !== productoId) return true;
      if (metadata && JSON.stringify(item.metadata) !== JSON.stringify(metadata)) return true;
      return false;
    });
    
    // Sincronizar con localStorage
    this.sincronizarConLocalStorage();
    return this.items.length < indiceInicial;
  }

  // Actualizar el método actualizarCantidad
  actualizarCantidad(productoId: string, nuevaCantidad: number, metadata?: any): boolean {
    const item = this.items.find(i => 
      i.productoId === productoId && 
      (!metadata || JSON.stringify(i.metadata) === JSON.stringify(metadata))
    );
    
    if (!item) return false;
    
    if (nuevaCantidad <= 0) {
      return this.eliminarItem(productoId, metadata);
    }
    
    item.cantidad = nuevaCantidad;
    // Sincronizar con localStorage
    this.sincronizarConLocalStorage();
    return true;
  }

  // Verificar si el carrito está vacío
  estaVacio(): boolean {
    return this.items.length === 0;
  }

  // Obtener estado completo del carrito
  obtenerEstado(): CarritoEstado {
    return {
      items: this.obtenerItems(),
      subtotal: this.calcularSubtotal(),
      iva: this.calcularIVA(),
      total: this.calcularTotal(),
      cantidadItems: this.obtenerCantidadItems()
    };
  }

  // Procesar compra - crear registros en la base de datos
  // Modificar el método procesarCompra en la clase CarritoCompras
  async procesarCompra(userId: string, datosFacturacion?: any): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      console.log('🛒 CarritoCompras.procesarCompra iniciado');
      console.log('👤 UserId:', userId);
      console.log('📄 Datos facturación:', datosFacturacion);
      console.log('🛍️ Items:', this.items);
      
      if (this.estaVacio()) {
        console.log('❌ Carrito está vacío');
        return { success: false, error: 'El carrito está vacío' };
      }
  
      // Validar datos de facturación en el frontend también
      if (!datosFacturacion?.rut || !datosFacturacion?.razonSocial || !datosFacturacion?.direccion) {
        return {
          success: false,
          error: 'Por favor complete todos los datos de facturación requeridos: RUT, Razón Social y Dirección'
        };
      }
  
      console.log('🌐 Haciendo fetch a /api/carrito/procesar');
      
      const response = await fetch('/api/carrito/procesar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: this.items,
          datosFacturacion
        })
      });
  
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
  
      const resultado = await response.json();
      console.log('📋 Resultado del API:', resultado);
  
      if (!response.ok) {
        console.log('❌ Response no ok:', resultado.error);
        // Mejorar el mensaje de error basado en el status
        let errorMessage = resultado.error || 'Error procesando la compra';
        
        if (response.status === 400) {
          errorMessage = resultado.error || 'Datos de facturación incompletos o inválidos';
        } else if (response.status === 500) {
          errorMessage = 'Error interno del servidor. Por favor intente nuevamente.';
        }
        
        return { success: false, error: errorMessage };
      }
  
      if (resultado.success) {
        console.log('✅ Compra exitosa, limpiando carrito');
        this.limpiarCarrito();
        return { success: true, transactionId: resultado.transactionId };
      }
  
      console.log('❌ Resultado no exitoso:', resultado.error);
      return { success: false, error: resultado.error || 'Error desconocido' };
  
    } catch (error) {
      console.error('💥 Error en procesarCompra:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error de conexión. Verifique su conexión a internet.' 
      };
    }
  }
}

// Funciones utilitarias para manejo del carrito en localStorage
export const carritoUtils = {
  // Guardar carrito en localStorage
  guardarCarrito: (carrito: CarritoEstado): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('carrito_productos', JSON.stringify(carrito));
    }
  },

  // Cargar carrito desde localStorage
  cargarCarrito: (): CarritoEstado => {
    if (typeof window !== 'undefined') {
      const carritoGuardado = localStorage.getItem('carrito_productos');
      if (carritoGuardado) {
        try {
          return JSON.parse(carritoGuardado);
        } catch (error) {
          console.error('Error parseando carrito guardado:', error);
        }
      }
    }
    return { items: [], subtotal: 0, iva: 0, total: 0, cantidadItems: 0 };
  },

  // Limpiar carrito de localStorage
  limpiarCarritoLocal: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('carrito_productos');
    }
  }
};

// Función para obtener producto completo desde la base de datos
export async function obtenerProducto(productoId: string): Promise<any> {
  try {
    const { data, error } = await supabaseAdmin
      .from('productos')
      .select('*')
      .eq('id', productoId)
      .eq('activo', true)
      .single();

    if (error) {
      console.error('Error obteniendo producto:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    return null;
  }
}

// Función para crear un item de carrito desde un producto
export async function crearItemCarrito(
  productoId: string,
  cantidad: number = 1,
  metadata?: any
): Promise<ItemCarrito | null> {
  try {
    const producto = await obtenerProducto(productoId);
    
    if (!producto) {
      return null;
    }

    return {
      productoId: producto.id,
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio_neto: producto.precio_neto,
      precio_bruto: producto.precio_bruto,
      cantidad,
      metadata
    };
  } catch (error) {
    console.error('Error creando item de carrito:', error);
    return null;
  }
}

// Función para obtener todos los productos activos
export async function obtenerProductosActivos(): Promise<any[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('nombre');

    if (error) {
      console.error('Error obteniendo productos:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    return [];
  }
}