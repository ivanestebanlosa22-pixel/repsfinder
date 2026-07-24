'use strict';

const { esc, page, organizationJsonLd, websiteJsonLd, breadcrumbJsonLd } = require('../layout');
const { isVisible } = require('../agents');

function splitPiped(s) {
  return String(s || '')
    .split('|')
    .map((x) => x.trim())
    .filter(Boolean);
}

function loadStores(rows) {
  const stores = [];
  const report = [];
  for (const row of rows) {
    const nombre = (row.nombre || '').trim();
    if (!nombre) continue;

    if (!isVisible(row.mostrar)) {
      report.push(`SKIP (mostrar=NO): ${nombre}`);
      continue;
    }

    if (nombre.toUpperCase() === 'TIENDA TEST') {
      report.push(`EXCLUIDO — fila de prueba/placeholder detectada en la hoja ("TIENDA TEST"), no es una tienda real. Ver DISCOVERY.md §4.`);
      continue;
    }

    stores.push({
      nombre,
      categoria: row.categoria_en || row.categoria_es || '',
      badge: row.badge_en || row.badge_es || '',
      nota: row.nota_en || row.nota_es || '',
      url: row.url || '',
      password: row.password || '',
      rating: row.valoracion || '',
      reviews: row.resenas || '',
      priceRange: row.rango_precio || '',
      trustScore: row.puntuacion_confianza || '',
      especialidades: splitPiped(row.especialidades_en || row.especialidades_es),
      loMasComprado: splitPiped(row.lo_mas_comprado_en || row.lo_mas_comprado_es),
      pros: splitPiped(row.pros_en || row.pros_es),
      contras: splitPiped(row.contras_en || row.contras_es),
      imagen: row.imagen || '',
    });
    report.push(`OK — ${nombre}`);
  }
  stores.sort((a, b) => (parseFloat(String(b.trustScore).replace(',', '.')) || 0) - (parseFloat(String(a.trustScore).replace(',', '.')) || 0));
  return { stores, report };
}

function renderStoreCard(s) {
  return `<div class="store-card">
    <div class="store-card__head">
      ${s.imagen ? `<img class="store-card__img" src="${esc(s.imagen)}" alt="${esc(s.nombre)}" loading="lazy" />` : ''}
      <div>
        <h3 style="margin:0;">${esc(s.nombre)}</h3>
        ${s.categoria ? `<span class="badge" style="margin-top:4px;">${esc(s.categoria)}</span>` : ''}
      </div>
    </div>
    ${s.nota ? `<p>${esc(s.nota)}</p>` : ''}
    <div class="agent-card__stats" style="margin-bottom:12px;">
      ${s.rating ? `<div><strong>⭐ ${esc(s.rating)}</strong>Rating${s.reviews ? ` (${esc(s.reviews)})` : ''}</div>` : ''}
      ${s.trustScore ? `<div><strong>${esc(s.trustScore)}</strong>Trust score</div>` : ''}
      ${s.priceRange ? `<div><strong>${esc(s.priceRange)}</strong>Price Range</div>` : ''}
    </div>
    ${s.especialidades.length ? `<p style="font-size:12px;color:var(--text-secondary);margin-bottom:4px;"><strong style="color:#fff;">Specialties:</strong> ${s.especialidades.map(esc).join(', ')}</p>` : ''}
    ${s.loMasComprado.length ? `<p style="font-size:12px;color:var(--text-secondary);margin-bottom:12px;"><strong style="color:#fff;">What people buy:</strong> ${s.loMasComprado.map(esc).join(', ')}</p>` : ''}
    ${s.pros.length || s.contras.length ? `<div class="agent-card__proscons">
      ${s.pros.length ? `<div><strong style="color:var(--primary);font-size:12px;">Advantages</strong><ul>${s.pros.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>` : ''}
      ${s.contras.length ? `<div><strong style="color:var(--warning);font-size:12px;">Disadvantages</strong><ul>${s.contras.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div>` : ''}
    </div>` : ''}
    ${s.password ? `<p style="font-size:12px;color:var(--text-secondary);margin:12px 0 6px;">Password required: <strong style="color:#fff;">${esc(s.password)}</strong></p>` : ''}
    ${s.url ? `<a class="btn btn--primary btn--block" href="${esc(s.url)}" rel="nofollow noopener" target="_blank">Visit Store</a>` : ''}
  </div>`;
}

function build(topTiendasRows) {
  const { stores, report } = loadStores(topTiendasRows);

  const body = `
<main>
  <div class="container hero">
    <span class="hero__eyebrow">🛍️ ${stores.length} verified stores</span>
    <h1>Top Sellers</h1>
    <p class="hero__subtitle">The best verified stores by category. These are the stores with the highest rating, best quality and most reliable by category — all have been verified by our team and have an impeccable history.</p>
  </div>

  ${stores.length ? `<section class="container">
    <div class="grid grid--3">
      ${stores.map(renderStoreCard).join('\n      ')}
    </div>
  </section>` : `<section class="container"><p>No stores available yet.</p></section>`}
</main>`;

  const html = page({
    slug: 'top-stores',
    title: 'Top Verified Weidian Stores by Category | RepsFinder',
    description: 'The best verified Weidian stores by category — trust score, specialties, pros and cons, checked by our team before being listed.',
    canonicalPath: '/top-stores.html',
    breadcrumbItems: [
      { label: 'Home', href: '/index.html' },
      { label: 'Top Stores' },
    ],
    bodyHtml: body,
    jsonLdObjects: [
      organizationJsonLd(),
      websiteJsonLd(),
      breadcrumbJsonLd([
        { label: 'Home', href: '/index.html' },
        { label: 'Top Stores', href: '/top-stores.html' },
      ]),
    ],
  });

  return { html, report };
}

module.exports = { build };
