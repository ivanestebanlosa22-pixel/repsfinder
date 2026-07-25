'use strict';

const { validateAgentRow, isVisible, KAKOBUY_FORCED } = require('./agents');

// Construye la lista de agentes ya validados contra la Sección 2 a partir de las filas crudas de
// data/agents.csv (28 columnas — ver DISCOVERY.md §3.2). Único punto de verdad reutilizado por
// agents.html, el widget de agentes de index.html y los bonos de learn.html.
//
// Devuelve { agents, report } — agents: array ordenado por rating desc, listo para renderizar.
// report: array de líneas de texto para el informe de verificación (qué se excluyó y por qué).
function loadValidatedAgents(rows) {
  const agents = [];
  const report = [];

  for (const row of rows) {
    const name = (row.name || '').trim();
    if (!name) continue;

    if (!isVisible(row.mostrar)) {
      report.push(`SKIP (mostrar=NO en la hoja): ${name}`);
      continue;
    }

    const urlForCode = row.register || row.productLink || '';
    const v = validateAgentRow(name, urlForCode);

    if (!v.publish) {
      report.push(`EXCLUIDO — ${name}: ${v.reason}`);
      continue;
    }

    if (v.conflict) {
      report.push(`AVISO (publicado con código corregido) — ${name}: ${v.reason}`);
    } else {
      report.push(`OK — ${v.display}: ${v.reason}`);
    }

    agents.push({
      display: v.display,
      code: v.code,
      url: v.forcedUrl || row.register || row.productLink || '#',
      rating: row.rating || '',
      reviews: row.reviews || '',
      badge: row.badge_en || '',
      description: row.description_en || '',
      shippingTime: row.shippingTime_en || '',
      qcSuccess: row.qcSuccess || '',
      shippingCost: row.shippingCost || '',
      commission: row.commission || '',
      founded: row.founded || '',
      trustpilot: row.trustpilot || '',
      storage: row.storage_en || '',
      recommendation: row.recommendation_en || '',
      pros: (row.pros_en || '').split(',').map((s) => s.trim()).filter(Boolean),
      cons: (row.cons_en || '').split(',').map((s) => s.trim()).filter(Boolean),
      logo: row.logo || '',
    });
  }

  agents.sort((a, b) => (parseFloat(String(b.rating).replace(',', '.')) || 0) - (parseFloat(String(a.rating).replace(',', '.')) || 0));

  return { agents, report };
}

module.exports = { loadValidatedAgents };
