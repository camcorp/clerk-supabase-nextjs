'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, User, Building, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

interface Corredor {
  rut: string;
  nombre: string;
  telefono?: string;
  ciudad?: string;
}

interface ProcesoPagoProps {
  corredor: Corredor;
  onBack: () => void;
  onSuccess?: (rut: string) => void;
}

export default function ProcesoPago({ corredor, onBack, onSuccess }: ProcesoPagoProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const formatRut = (rut: string) => {
    const cleanRut = rut.replace(/[^0-9kK]/g, '');
    if (cleanRut.length > 1) {
      const body = cleanRut.slice(0, -1);
      const dv = cleanRut.slice(-1);
      return `${body.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}-${dv}`;
    }
    return rut;
  };

  const handleProceedToPayment = async () => {
    if (!user) {
      setError('Debes estar autenticado para realizar la compra');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pagos/crear-pago', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          rut: corredor.rut,
          producto_id: 'reporte_corredor',
          amount: 15000, // Precio del reporte
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el pago');
      }

      const data = await response.json();
      
      if (data.url_pago) {
        // Redirigir a Flow
        window.location.href = data.url_pago;
      } else {
        throw new Error('No se recibió URL de pago');
      }
    } catch (err) {
      console.error('Error en proceso de pago:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ¡Pago Exitoso!
            </h3>
            <p className="text-gray-600 mb-6">
              El reporte del corredor {corredor.nombre} ha sido comprado exitosamente.
            </p>
            <Button onClick={onBack}>
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-1"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Proceso de Pago
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Información del corredor */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Información del Corredor
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nombre:</span>
                <span className="font-medium">{corredor.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">RUT:</span>
                <span className="font-medium">{formatRut(corredor.rut)}</span>
              </div>
              {corredor.telefono && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Teléfono:</span>
                  <span className="font-medium">{corredor.telefono}</span>
                </div>
              )}
              {corredor.ciudad && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Ciudad:</span>
                  <span className="font-medium">{corredor.ciudad}</span>
                </div>
              )}
            </div>
          </div>

          {/* Información del producto */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Producto a Comprar
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Producto:</span>
                <span className="font-medium">Reporte Individual de Corredor</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Período:</span>
                <span className="font-medium">Diciembre 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vigencia:</span>
                <span className="font-medium">30 días</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Precio:</span>
                <Badge variant="secondary" className="text-lg font-bold">
                  $15.000 CLP
                </Badge>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleProceedToPayment}
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pagar $15.000
                </>
              )}
            </Button>
          </div>

          {/* Información adicional */}
          <div className="text-xs text-gray-500 text-center">
            <p>Al proceder con el pago serás redirigido a Flow para completar la transacción.</p>
            <p className="mt-1">El acceso al reporte estará disponible inmediatamente después del pago exitoso.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}