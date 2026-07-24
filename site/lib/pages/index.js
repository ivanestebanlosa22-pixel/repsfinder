'use strict';

const { esc, page, organizationJsonLd, websiteJsonLd } = require('../layout');
const { loadValidatedAgents } = require('../agent-data');

function isActive(v) {
  return String(v || '').trim().toUpperCase() === 'SI';
}

function pickFeaturedProducts(rows, limit) {
  const visible = rows.filter((r) => isActive(r.activo) && r['foto portada'] && r.nombre);
  const byCategory = new Map();
  for (const r of visible) {
    const cat = r.Categoria || 'Others';
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(r);
  }
  for (const list of byCategory.values()) {
    list.sort((a, b) => (parseFloat(String(b.ranking).replace(',', '.')) || 0) - (parseFloat(String(a.ranking).replace(',', '.')) || 0));
  }
  const categories = [...byCategory.keys()];
  const picked = [];
  let round = 0;
  while (picked.length < limit && categories.some((c) => byCategory.get(c)[round])) {
    for (const c of categories) {
      const item = byCategory.get(c)[round];
      if (item) picked.push(item);
      if (picked.length >= limit) break;
    }
    round++;
  }
  return picked;
}

function renderProductCard(p) {
  const price = p.precio ? `€${esc(p.precio)}` : '';
  const rating = p.ranking ? `⭐ ${esc(p.ranking)}` : '';
  return `<div class="card" style="padding:0;overflow:hidden;">
    <img src="${esc(p['foto portada'])}" alt="${esc(p.nombre)}" loading="lazy" style="width:100%;aspect-ratio:1/1;object-fit:cover;" />
    <div style="padding:14px;">
      <span class="badge" style="margin-bottom:8px;">${esc(p.Categoria || '')}</span>
      <h3 style="font-size:14px;margin:0 0 6px;">${esc(p.nombre)}</h3>
      <p style="font-size:12px;color:var(--text-secondary);margin:0 0 10px;">${rating}${rating && price ? ' · ' : ''}${price}</p>
      <a class="btn btn--outline btn--block" href="/verify.html">Validate this product</a>
    </div>
  </div>`;
}

function renderAgentChip(agent) {
  return `<a class="card card--glass" style="display:flex;align-items:center;gap:12px;text-decoration:none;" href="/agents.html#${esc(agent.display.toLowerCase())}">
    ${agent.logo ? `<img src="${esc(agent.logo)}" alt="${esc(agent.display)}" style="width:36px;height:36px;border-radius:8px;object-fit:contain;background:#111;flex-shrink:0;" />` : ''}
    <div>
      <strong style="display:block;font-size:14px;">${esc(agent.display)}</strong>
      ${agent.rating ? `<span style="font-size:12px;color:var(--text-secondary);">⭐ ${esc(agent.rating)}</span>` : ''}
    </div>
  </a>`;
}

function build(mainRows, agentsRows) {
  const products = pickFeaturedProducts(mainRows, 10);
  const { agents } = loadValidatedAgents(agentsRows);
  const totalVisibleProducts = mainRows.filter((r) => isActive(r.activo) && r['foto portada'] && r.nombre).length;

  const body = `
<main>
  <div class="container hero">
    <span class="hero__eyebrow">${agents.length} verified agents · ${totalVisibleProducts} products tracked</span>
    <h1>Find the best replicas of sneakers, clothing and accessories, buying directly from factories in China.</h1>
    <p class="hero__subtitle">Smart shopping. No surprises. Guaranteed.</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:18px;">
      <a class="btn btn--primary" href="/agents.html">Compare agents</a>
      <a class="btn btn--outline" href="/learn.html">Learn how it works</a>
    </div>
  </div>

  <section class="container">
    <h2>Why use RepsFinder?</h2>
    <p class="section__subtitle">Your smart shopping assistant. Find quality replicas, verify sellers and buy with total security.</p>
    <div class="grid grid--3">
      <div class="card"><span class="card__icon">🗂️</span><h3>Updated product catalog</h3><p class="card__desc">Thousands of verified replicas: sneakers, hoodies, luxury bags and more.</p></div>
      <div class="card"><span class="card__icon">✅</span><h3>Verified purchase agents</h3><p class="card__desc">The best agents with exclusive bonus codes, compared side by side.</p></div>
      <div class="card"><span class="card__icon">🔎</span><h3>Product validation guide</h3><p class="card__desc">Learn to check quality, sellers and QC photos before you buy.</p></div>
    </div>
  </section>

  ${agents.length ? `<section class="container">
    <h2>Verified Purchase Agents</h2>
    <p class="section__subtitle">Complete comparison • Community data</p>
    <div class="grid grid--3">
      ${agents.slice(0, 6).map(renderAgentChip).join('\n      ')}
    </div>
    <div class="text-center" style="margin-top:20px;"><a class="btn btn--outline" href="/agents.html">See full comparison →</a></div>
  </section>` : ''}

  <section class="container">
    <h2>Agent Verification Process</h2>
    <p class="section__subtitle">We verify the quality and reliability of each purchase agent</p>
    <div class="grid grid--3">
      <div class="card"><span class="card__icon">📊</span><h3>History analysis</h3><p class="card__desc">We review the agent's operation history, community ratings and recent activity.</p></div>
      <div class="card"><span class="card__icon">🛠️</span><h3>Service verification</h3><p class="card__desc">We check response times, communication and consistency in shipping quality.</p></div>
      <div class="card"><span class="card__icon">📡</span><h3>Continuous monitoring</h3><p class="card__desc">Tracking response time, successful delivery rate and community satisfaction.</p></div>
    </div>
  </section>

  ${products.length ? `<section class="container">
    <h2>Best Selling Products</h2>
    <p class="section__subtitle">Curated selection by our community • Only the best from each category</p>
    <div class="grid grid--4">
      ${products.map(renderProductCard).join('\n      ')}
    </div>
  </section>` : ''}

  <section class="container">
    <div class="cta-box">
      <h2>Ready to start saving on your purchases?</h2>
      <p>Compare verified agents, learn how to validate products, and buy directly with total confidence.</p>
      <a class="btn btn--primary" href="/agents.html" style="margin-top:14px;">Compare verified agents</a>
    </div>
  </section>
</main>`;

  return page({
    slug: 'index',
    title: 'RepsFinder — Compare Verified Replica Purchase Agents & Stores',
    description: 'RepsFinder compares verified replica purchase agents, helps you validate products before buying, and lists the best Weidian stores by category. Smart shopping, no surprises.',
    canonicalPath: '/index.html',
    breadcrumbItems: null,
    bodyHtml: body,
    jsonLdObjects: [organizationJsonLd(), websiteJsonLd()],
  });
}

module.exports = { build };
