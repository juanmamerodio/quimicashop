/**
 * Script de Utilidad / Historial Técnico: Extracción y Unificación de Assets
 * Proyecto: QuimicaShop (Esencia Técnica) · E.E.S.T N°1 Luciano Reyes 2026
 * 
 * Propósito: Automatizar la extracción de los bloques <style> de index.html y tasks.html
 * hacia style.css y vincular el módulo de tareas tasks.js, reduciendo drásticamente
 * el peso de los documentos HTML y manteniendo una arquitectura modular limpia.
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
const tasksPath = path.join(__dirname, 'tasks.html');

if (!fs.existsSync(indexPath) || !fs.existsSync(tasksPath)) {
  console.error("No se encontraron index.html o tasks.html en el directorio.");
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const tasksHtml = fs.readFileSync(tasksPath, 'utf8');

const indexStyleMatch = indexHtml.match(/<style>([\s\S]*?)<\/style>/);
const tasksStyleMatch = tasksHtml.match(/<style>([\s\S]*?)<\/style>/);

if (!indexStyleMatch || !tasksStyleMatch) {
  console.log("ℹ Los archivos ya se encuentran desacoplados y vinculando style.css de forma externa.");
  process.exit(0);
}

const indexCss = indexStyleMatch[1].trim();
const tasksCss = tasksStyleMatch[1].trim();

const combinedCss = `/* ==========================================================================
   ESTILOS GLOBALES & COMPARTIDOS — QUIMICASHOP (ESENCIA TÉCNICA)
   E.E.S.T N°1 Luciano Reyes · 7mo Año Programación 2026
   Material 3 Expressive + iOS 26 (Glassmorphism & Depth)
   ========================================================================== */

${indexCss}

/* ==========================================================================
   MÓDULO DE EQUIPO, KANBAN, MEETINGS & GOBERNANZA PRIVADA (tasks.html)
   ========================================================================== */
${tasksCss.split('/* ============================================================')[1] || tasksCss}
`;

fs.writeFileSync(path.join(__dirname, 'style.css'), combinedCss, 'utf8');
console.log('✔ style.css generado con éxito. Tamaño:', combinedCss.length, 'bytes');

// Reemplazar style en index.html
const newIndexHtml = indexHtml.replace(
  /<style>[\s\S]*?<\/style>/,
  '<link rel="stylesheet" href="./style.css" />'
);
fs.writeFileSync(indexPath, newIndexHtml, 'utf8');
console.log('✔ index.html actualizado vinculando style.css.');

// Reemplazar style en tasks.html y vincular tasks.js
let newTasksHtml = tasksHtml.replace(
  /<style>[\s\S]*?<\/style>/,
  '<link rel="stylesheet" href="./style.css" />'
);

newTasksHtml = newTasksHtml.replace(
  /<script>[\s\S]*?<\/script>\s*<\/body>/,
  '<script src="./tasks.js"></script>\n</body>'
);

fs.writeFileSync(tasksPath, newTasksHtml, 'utf8');
console.log('✔ tasks.html actualizado vinculando style.css y tasks.js.');
