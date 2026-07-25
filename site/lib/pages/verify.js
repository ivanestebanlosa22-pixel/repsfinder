'use strict';

const { esc, page, organizationJsonLd, websiteJsonLd, breadcrumbJsonLd } = require('../layout');
const { validateAgentRow, isVisible, buildProductLink } = require('../agents');

function isActive(v) {
  return String(v || '').trim().toUpperCase() === 'SI';
}

function extractWeidianId(row) {
  if (row.weidian_id) return row.weidian_id.trim();
  const m = (row['link weidian'] || '').match(/itemID[=:](\d+)/) || (row['link weidian'] || '').match(/\/(\d+)(?:\?|$)/);
  return m ? m[1] : null;
}

function loadValidLinkFormats(validarRows) {
  const out = [];
  const report = [];
  for (const row of validarRows) {
    const name = (row.nombre || '').trim();
    if (!name) continue;
    if (!isVisible(row.mostrar)) {
      report.push(`SKIP (mostrar=NO): ${name}`);
      continue;
    }
    const template = row['formato de link'] || '';
    const v = validateAgentRow(name, template);
    if (!v.publish) {
      report.push(`EXCLUIDO — ${name}: ${v.reason}`);
      continue;
    }
    out.push({ display: v.display, template: v.forcedUrl || template, logo: row.logo || '', forced: !!v.forcedUrl });
    report.push(`OK — ${v.display}: ${v.reason}`);
  }
  return { formats: out, report };
}

function pickExampleProducts(mainRows, limit) {
  return mainRows
    .filter((r) => isActive(r.activo) && r['foto portada'] && r.nombre && extractWeidianId(r))
    .sort((a, b) => (parseFloat(String(b.ranking).replace(',', '.')) || 0) - (parseFloat(String(a.ranking).replace(',', '.')) || 0))
    .slice(0, limit);
}

function badgeFor(ranking, precio) {
  const rating = parseFloat(String(ranking).replace(',', '.')) || 0;
  const price = parseFloat(String(precio).replace(',', '.')) || 0;
  if (rating >= 4.8) return { text: 'TOP', color: '#8B5CF6' };
  if (rating >= 4.5) return { text: 'RECOMMENDED', color: '#4FACFE' };
  if (price > 0 && price < 20) return { text: 'DEAL', color: '#AB47BC' };
  return null;
}

function renderExample(product, formats) {
  const weidianId = extractWeidianId(product);
  const badge = badgeFor(product.ranking, product.precio);
  const links = formats
    .map((f) => {
      const href = f.forced ? f.template : buildProductLink(f.template, weidianId);
      if (!href) return null;
      return `<a class="btn btn--outline" style="font-size:12px;padding:9px 14px;" href="${esc(href)}" rel="nofollow sponsored noopener" target="_blank">${esc(f.display)}</a>`;
    })
    .filter(Boolean);

  return `<div class="card" style="padding:0;overflow:hidden;">
    <img src="${esc(product['foto portada'])}" alt="${esc(product.nombre)}" loading="lazy" style="width:100%;aspect-ratio:1/1;object-fit:cover;" />
    <div style="padding:16px;">
      ${badge ? `<span class="badge" style="background:${badge.color}26;color:${badge.color};border-color:${badge.color}55;margin-bottom:8px;">${badge.text}</span>` : ''}
      <h3 style="font-size:15px;margin:0 0 6px;">${esc(product.nombre)}</h3>
      <p style="font-size:12px;color:var(--text-secondary);margin:0 0 6px;">${esc(product.marca || '')} · ${esc(product.Categoria || '')}</p>
      <p style="font-size:13px;margin:0 0 12px;">${product.precio ? `€${esc(product.precio)}` : ''}${product.ranking ? ` · ⭐ ${esc(product.ranking)}` : ''}</p>
      <p class="card__desc" style="margin-bottom:12px;">Buy with:</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">${links.join('')}</div>
    </div>
  </div>`;
}

function build(mainRows, validarRows) {
  const { formats, report } = loadValidLinkFormats(validarRows);
  const examples = pickExampleProducts(mainRows, 3);

  const body = `
<main>
  <div class="container hero">
    <span class="hero__eyebrow">✅ Verify before you buy</span>
    <h1>Choose your Purchase Agent</h1>
    <p class="hero__subtitle">Every product on RepsFinder can be checked against our verified agents before you buy — compare rating, sales and price, then order directly from the agent's own website.</p>
  </div>

  <section class="container">
    <h2>How we rate products</h2>
    <p class="section__subtitle">Badges are calculated directly from community rating and price — nothing is assigned by hand</p>
    <div class="grid grid--3">
      <div class="card"><span class="badge" style="background:#8B5CF626;color:#8B5CF6;border-color:#8B5CF655;">TOP</span><p class="card__desc" style="margin-top:10px;">Rating of 4.8★ or higher.</p></div>
      <div class="card"><span class="badge" style="background:#4FACFE26;color:#4FACFE;border-color:#4FACFE55;">RECOMMENDED</span><p class="card__desc" style="margin-top:10px;">Rating of 4.5★ or higher.</p></div>
      <div class="card"><span class="badge" style="background:#AB47BC26;color:#AB47BC;border-color:#AB47BC55;">DEAL</span><p class="card__desc" style="margin-top:10px;">Priced under €20.</p></div>
    </div>
  </section>

  <section class="container">
    <h2>Product Comparison</h2>
    <p class="section__subtitle">What to check before choosing between similar products: Rating, Sales, Category and Brand — always compare across agents before deciding.</p>
  </section>

  ${examples.length && formats.length ? `<section class="container">
    <h2>${formats.length} verified agents available</h2>
    <p class="section__subtitle">Worked examples — the same link pattern applies to any product in our catalog</p>
    <div class="grid grid--3">
      ${examples.map((p) => renderExample(p, formats)).join('\n      ')}
    </div>
  </section>` : ''}
</main>`;

  const html = page({
    slug: 'verify',
    title: 'How to Validate a Product Before Buying | RepsFinder',
    description: 'Learn how RepsFinder rates and validates replica products, and how to buy the same product from any of our verified purchase agents.',
    canonicalPath: '/verify.html',
    breadcrumbItems: [
      { label: 'Home', href: 'index.html' },
      { label: 'Verify' },
    ],
    bodyHtml: body,
    jsonLdObjects: [
      organizationJsonLd(),
      websiteJsonLd(),
      breadcrumbJsonLd([
        { label: 'Home', href: '/index.html' },
        { label: 'Verify', href: '/verify.html' },
      ]),
    ],
  });

  return { html, report };
}

module.exports = { build };
