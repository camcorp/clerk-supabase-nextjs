#!/usr/bin/env node

const { program } = require('commander')
const SupabaseHealthChecker = require('./supabase-health-check')

program
  .name('supabase-cli')
  .description('Herramientas de verificación y análisis de Supabase')
  .version('1.0.0')

program
  .command('health')
  .description('Ejecutar verificación completa de salud')
  .option('-o, --output <format>', 'Formato de salida (json|html|both)', 'both')
  .action(async (options) => {
    const checker = new SupabaseHealthChecker()
    await checker.runCompleteCheck()
  })

program
  .command('rls')
  .description('Verificar solo políticas RLS')
  .action(async () => {
    const checker = new SupabaseHealthChecker()
    await checker.checkRLSPolicies()
    await checker.checkRLSEnabledTables()
  })

program
  .command('tables')
  .description('Verificar acceso a tablas')
  .action(async () => {
    const checker = new SupabaseHealthChecker()
    await checker.checkTableAccess()
  })

program
  .command('analyze')
  .description('Analizar uso en la aplicación')
  .action(async () => {
    const checker = new SupabaseHealthChecker()
    await checker.analyzeApplicationUsage()
  })

program.parse()