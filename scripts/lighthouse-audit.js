#!/usr/bin/env node

/**
 * Script de Auditoría Lighthouse para FormAI PWA
 * 
 * Uso:
 * node scripts/lighthouse-audit.js [url]
 * 
 * Ejemplo:
 * node scripts/lighthouse-audit.js https://tu-app.vercel.app
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuración
const DEFAULT_URL = 'http://localhost:19006'; // Puerto por defecto de Expo Web
const OUTPUT_DIR = path.join(__dirname, '../lighthouse-reports');
const CATEGORIES = ['pwa', 'performance', 'best-practices', 'accessibility', 'seo'];

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${message}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logSection(message) {
  log(`\n${'-'.repeat(40)}`, 'yellow');
  log(`  ${message}`, 'yellow');
  log(`${'-'.repeat(40)}`, 'yellow');
}

function checkDependencies() {
  try {
    execSync('lighthouse --version', { stdio: 'ignore' });
    log('✅ Lighthouse CLI detectado', 'green');
    return true;
  } catch (error) {
    log('❌ Lighthouse CLI no encontrado', 'red');
    log('Instala Lighthouse CLI con:', 'yellow');
    log('npm install -g lighthouse', 'cyan');
    return false;
  }
}

function createOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    log(`📁 Directorio de reportes creado: ${OUTPUT_DIR}`, 'green');
  }
}

function runLighthouseAudit(url, category) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join(OUTPUT_DIR, `lighthouse-${category}-${timestamp}.html`);
  
  log(`🔍 Ejecutando auditoría ${category.toUpperCase()}...`, 'blue');
  
  try {
    const command = `lighthouse "${url}" --output=html --output-path="${outputFile}" --only-categories=${category} --chrome-flags="--headless --no-sandbox --disable-gpu"`;
    
    execSync(command, { 
      stdio: 'pipe',
      timeout: 120000 // 2 minutos timeout
    });
    
    log(`✅ Auditoría ${category} completada: ${outputFile}`, 'green');
    return outputFile;
  } catch (error) {
    log(`❌ Error en auditoría ${category}:`, 'red');
    log(error.message, 'red');
    return null;
  }
}

function generateSummaryReport(reports) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const summaryFile = path.join(OUTPUT_DIR, `lighthouse-summary-${timestamp}.md`);
  
  let summary = `# 📊 Reporte de Auditoría Lighthouse - FormAI PWA\n\n`;
  summary += `**Fecha:** ${new Date().toLocaleString()}\n`;
  summary += `**URL:** ${reports.url}\n\n`;
  
  summary += `## 📋 Resumen de Auditorías\n\n`;
  
  reports.results.forEach(report => {
    if (report) {
      summary += `### ${report.category.toUpperCase()}\n`;
      summary += `- **Archivo:** ${path.basename(report.file)}\n`;
      summary += `- **Estado:** ✅ Completado\n\n`;
    } else {
      summary += `### ${report.category.toUpperCase()}\n`;
      summary += `- **Estado:** ❌ Falló\n\n`;
    }
  });
  
  summary += `## 🚀 Próximos Pasos\n\n`;
  summary += `1. Revisa cada reporte HTML para detalles específicos\n`;
  summary += `2. Implementa las mejoras sugeridas\n`;
  summary += `3. Ejecuta la auditoría nuevamente para verificar mejoras\n`;
  summary += `4. Considera integrar Lighthouse CI en tu pipeline de CI/CD\n\n`;
  
  summary += `## 📚 Recursos\n\n`;
  summary += `- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)\n`;
  summary += `- [PWA Checklist](https://web.dev/pwa-checklist/)\n`;
  summary += `- [Web Performance](https://web.dev/performance/)\n`;
  
  fs.writeFileSync(summaryFile, summary);
  log(`📝 Reporte de resumen generado: ${summaryFile}`, 'green');
  
  return summaryFile;
}

function main() {
  const url = process.argv[2] || DEFAULT_URL;
  
  logHeader('🚀 AUDITORÍA LIGHTHOUSE - FORMAI PWA');
  
  // Verificar dependencias
  if (!checkDependencies()) {
    process.exit(1);
  }
  
  // Crear directorio de salida
  createOutputDir();
  
  logSection('CONFIGURACIÓN');
  log(`URL a auditar: ${url}`, 'cyan');
  log(`Directorio de salida: ${OUTPUT_DIR}`, 'cyan');
  log(`Categorías: ${CATEGORIES.join(', ')}`, 'cyan');
  
  logSection('EJECUTANDO AUDITORÍAS');
  
  const reports = {
    url,
    results: []
  };
  
  // Ejecutar auditorías para cada categoría
  CATEGORIES.forEach(category => {
    const report = runLighthouseAudit(url, category);
    reports.results.push({
      category,
      file: report
    });
  });
  
  logSection('GENERANDO REPORTE DE RESUMEN');
  const summaryFile = generateSummaryReport(reports);
  
  logSection('RESULTADOS');
  log(`📊 Auditorías completadas: ${reports.results.filter(r => r.file).length}/${CATEGORIES.length}`, 'green');
  log(`📁 Reportes guardados en: ${OUTPUT_DIR}`, 'cyan');
  log(`📝 Resumen: ${path.basename(summaryFile)}`, 'cyan');
  
  logHeader('🎯 RECOMENDACIONES');
  log('1. Revisa cada reporte HTML para detalles específicos', 'yellow');
  log('2. Enfócate primero en PWA y Performance', 'yellow');
  log('3. Implementa las mejoras sugeridas iterativamente', 'yellow');
  log('4. Ejecuta auditorías regulares para monitorear el progreso', 'yellow');
  
  logHeader('✅ AUDITORÍA COMPLETADA');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { runLighthouseAudit, generateSummaryReport };
