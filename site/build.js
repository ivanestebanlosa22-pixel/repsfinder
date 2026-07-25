#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { csvToObjects } = require('./lib/csv');
const { SITE_URL } = require('./lib/layout');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');

const REQUIRED_CSV = {
  main: 'main.csv',
  agents: 'agents.csv',
  validar: 'validar.csv',
  topTiendas: 'top-tiendas.csv',
};

// AGENTS INDEX es opcional: da la curaduría real de qué agentes se muestran en el widget de la
// home (distinta de agents.csv — ver lib/pages/index.js). Si no está, index.html se genera igual
// con un fallback razonable (los primeros agentes validados por rating), así que su ausencia nunca
// bloquea el build.
const OPTIONAL_CSV = {
  agentsIndex: 'agents-index.csv',
};

function readCsvOrNull(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return null;
  const text = fs.readFileSync(filePath, 'utf8');
  return csvToObjects(text);
}

function main() {
  console.log('RepsFinder static site build\n' + '='.repeat(40));

  const data = {};
  const missing = [];
  for (const [key, filename] of Object.entries(REQUIRED_CSV)) {
    const rows = readCsvOrNull(filename);
    if (rows === null) {
      missing.push(filename);
    } else {
      data[key] = rows;
      console.log(`✓ data/${filename} — ${rows.length} filas leídas`);
    }
  }

  if (missing.length) {
    console.log('\n⚠ Faltan estos CSV en site/data/ (ver site/data/README.md para exportarlos):');
    missing.forEach((m) => console.log(`  - ${m}`));
    console.log('\nLas páginas que dependen de ellos NO se generarán en esta pasada — nunca se');
    console.log('genera contenido de relleno en su lugar.\n');
  }

  for (const [key, filename] of Object.entries(OPTIONAL_CSV)) {
    const rows = readCsvOrNull(filename);
    if (rows === null) {
      console.log(`○ data/${filename} — no encontrado (opcional, se usa un fallback razonable)`);
    } else {
      data[key] = rows;
      console.log(`✓ data/${filename} — ${rows.length} filas leídas`);
    }
  }

  let generated = 0;
  let skipped = 0;
  const sitemapEntries = [];
  const today = new Date().toISOString().slice(0, 10);

  // El informe de validación de agentes/tiendas (qué se excluyó y por qué, Sección 2 no-negociable)
  // se imprime SOLO por consola — nunca se escribe dentro de un HTML servido, ni siquiera como
  // comentario, porque el propio nombre de un agente excluido (ej. "Joyagoo") no debe aparecer en
  // ningún archivo publicado bajo ninguna circunstancia (ver protocolo de verificación, Sección 7).
  function printReport(label, report) {
    if (!report || !report.length) return;
    console.log(`\n--- Informe de validación: ${label} ---`);
    report.forEach((line) => console.log(`  ${line}`));
  }

  function write(filename, html, urlPath) {
    fs.writeFileSync(path.join(ROOT, filename), html, 'utf8');
    console.log(`✓ generado ${filename}`);
    sitemapEntries.push(urlPath);
    generated++;
  }

  // Páginas sin dependencia de CSV — siempre se generan.
  write('learn.html', require('./lib/pages/learn').build(), '/learn.html');
  write('privacy.html', require('./lib/pages/legal').buildPrivacy(), '/privacy.html');
  write('terms.html', require('./lib/pages/legal').buildTerms(), '/terms.html');

  // Páginas dependientes de la hoja.
  if (data.agents) {
    const r = require('./lib/pages/agents').build(data.agents);
    write('agents.html', r.html, '/agents.html');
    printReport('agents.html (data/agents.csv)', r.report);
  } else {
    console.log('✗ agents.html NO generado (falta data/agents.csv)');
    skipped++;
  }

  if (data.main && data.agents) {
    write('index.html', require('./lib/pages/index').build(data.main, data.agents, data.agentsIndex), '/index.html');
  } else {
    console.log('✗ index.html NO generado (falta data/main.csv y/o data/agents.csv)');
    skipped++;
  }

  if (data.main && data.validar) {
    const r = require('./lib/pages/verify').build(data.main, data.validar);
    write('verify.html', r.html, '/verify.html');
    printReport('verify.html (data/validar.csv)', r.report);
  } else {
    console.log('✗ verify.html NO generado (falta data/main.csv y/o data/validar.csv)');
    skipped++;
  }

  if (data.topTiendas) {
    const r = require('./lib/pages/top-stores').build(data.topTiendas);
    write('top-stores.html', r.html, '/top-stores.html');
    printReport('top-stores.html (data/top-tiendas.csv)', r.report);
  } else {
    console.log('✗ top-stores.html NO generado (falta data/top-tiendas.csv)');
    skipped++;
  }

  // sitemap.xml — solo con las páginas realmente generadas en esta pasada.
  const urls = sitemapEntries
    .map(
      (p) => `  <url>\n    <loc>${SITE_URL}${p}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`
    )
    .join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');
  console.log(`✓ generado sitemap.xml (${sitemapEntries.length} URLs)`);

  console.log('\n' + '='.repeat(40));
  console.log(`Build terminado: ${generated} páginas generadas, ${skipped} pendientes de CSV.`);
  if (skipped > 0) {
    console.log('Exporta los CSV que faltan y vuelve a correr `node build.js` para completar el sitio.');
    process.exitCode = 1;
  }
}

main();
