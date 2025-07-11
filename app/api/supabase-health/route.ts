import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Ejecutar el script de verificación
    await execAsync('node scripts/supabase-health-check.js')
    
    // Leer el reporte generado
    const reportPath = path.join(process.cwd(), 'supabase-health-report.json')
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
    
    return NextResponse.json(report)
  } catch (error) {
    console.error('Error ejecutando verificación:', error)
    return NextResponse.json(
      { error: 'Error ejecutando verificación de salud' },
      { status: 500 }
    )
  }
}