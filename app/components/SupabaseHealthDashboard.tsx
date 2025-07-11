'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'

interface HealthReport {
  timestamp: string
  rlsPolicies: any[]
  rlsEnabledTables: any[]
  tableAccess: Record<string, any>
  views: any[]
  functions: any[]
  storage: any
  applicationUsage: any
  recommendations: any[]
}

export function SupabaseHealthDashboard() {
  const [report, setReport] = useState<HealthReport | null>(null)
  const [loading, setLoading] = useState(false)

  const runHealthCheck = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/supabase-health')
      const data = await response.json()
      setReport(data)
    } catch (error) {
      console.error('Error ejecutando verificación:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Cargar reporte existente si existe
    fetch('/supabase-health-report.json')
      .then(res => res.json())
      .then(setReport)
      .catch(() => {})
  }, [])

  if (!report) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard de Salud de Supabase</h1>
        <Button onClick={runHealthCheck} disabled={loading}>
          {loading ? 'Ejecutando...' : 'Ejecutar Verificación'}
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard de Salud de Supabase</h1>
        <Button onClick={runHealthCheck} disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Políticas RLS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.rlsPolicies.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tablas con RLS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.rlsEnabledTables.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tablas Accesibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(report.tableAccess).filter((t: any) => t.accessible).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recomendaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {report.recommendations.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tables" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tables">Tablas</TabsTrigger>
          <TabsTrigger value="rls">Políticas RLS</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estado de Acceso a Tablas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(report.tableAccess).map(([table, info]: [string, any]) => (
                  <div key={table} className="flex justify-between items-center p-2 border rounded">
                    <span className="font-medium">{table}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={info.accessible ? "default" : "danger"}>
                        {info.accessible ? 'Accesible' : 'Error'}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {info.recordCount} registros
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Políticas RLS Activas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.rlsPolicies.map((policy, index) => (
                  <div key={index} className="border rounded p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{policy.tablename}</h4>
                      <Badge>{policy.cmd}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Política:</strong> {policy.policyname}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Roles:</strong> {policy.roles}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Buckets de Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.storage.buckets?.map((bucket: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                    <span className="font-medium">{bucket.name}</span>
                    <Badge variant={bucket.public ? "info" : "default"}>
                      {bucket.public ? 'Público' : 'Privado'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {report.recommendations.map((rec, index) => (
            <Card key={index} className={`border-l-4 ${
              rec.priority === 'critical' ? 'border-l-red-500' :
              rec.priority === 'high' ? 'border-l-orange-500' : 'border-l-blue-500'
            }`}>
              <CardHeader>
                <CardTitle className="text-lg">{rec.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">{rec.description}</p>
                <p className="text-sm font-medium">💡 {rec.action}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}