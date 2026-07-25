'use strict';

const { esc, page, organizationJsonLd, websiteJsonLd, breadcrumbJsonLd } = require('../layout');
const { loadValidatedAgents } = require('../agent-data');

function renderAgentCard(agent, index) {
  const featured = index === 0;
  const pros = agent.pros.slice(0, 4);
  const cons = agent.cons.slice(0, 3);
  return `<div class="agent-card${featured ? ' agent-card--featured' : ''}" id="${esc(agent.display.toLowerCase())}">
    ${featured ? '<div class="badge badge--gold">⭐ MOST RECOMMENDED AGENT BY THE COMMUNITY</div>' : ''}
    <div class="agent-card__head">
      ${agent.logo ? `<img class="agent-card__logo" src="${esc(agent.logo)}" alt="${esc(agent.display)} logo" loading="lazy" />` : ''}
      <div>
        <h3 class="agent-card__name">${esc(agent.display)}</h3>
        ${agent.badge ? `<span class="badge">${esc(agent.badge)}</span>` : ''}
      </div>
    </div>
    ${agent.description ? `<p>${esc(agent.description)}</p>` : ''}
    <div class="agent-card__stats">
      ${agent.rating ? `<div><strong>⭐ ${esc(agent.rating)}</strong>Rating${agent.reviews ? ` (${esc(agent.reviews)})` : ''}</div>` : ''}
      ${agent.qcSuccess ? `<div><strong>${esc(agent.qcSuccess)}</strong>QC Success</div>` : ''}
      ${agent.shippingTime ? `<div><strong>${esc(agent.shippingTime)}</strong>Shipping</div>` : ''}
      ${agent.commission ? `<div><strong>${esc(agent.commission)}</strong>Commission</div>` : ''}
      ${agent.shippingCost ? `<div><strong>${esc(agent.shippingCost)}</strong>€/kg shipping</div>` : ''}
      ${agent.founded ? `<div><strong>${esc(agent.founded)}</strong>Since</div>` : ''}
    </div>
    ${pros.length || cons.length ? `<div class="agent-card__proscons">
      ${pros.length ? `<div><strong style="color:var(--primary);font-size:12px;">✓ STRONG POINTS</strong><ul>${pros.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>` : ''}
      ${cons.length ? `<div><strong style="color:var(--warning);font-size:12px;">⚠ KEEP IN MIND</strong><ul>${cons.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div>` : ''}
    </div>` : ''}
    <a class="btn btn--primary btn--block" href="${esc(agent.url)}" rel="nofollow sponsored noopener" target="_blank">Register free with ${esc(agent.display)} →</a>
  </div>`;
}

function build(agentsRows) {
  const { agents, report } = loadValidatedAgents(agentsRows);

  const body = `
<main>
  <div class="container hero">
    <span class="hero__eyebrow">⚡ 100% Free Registration</span>
    <h1>Buy from China<br />without risks</h1>
    <p class="hero__subtitle">Our verified agents manage your order from start to finish. You just choose and wait at home.</p>
  </div>

  <section class="container">
    <h2>How it works?</h2>
    <div class="grid grid--3">
      <div class="card"><span class="card__icon">🤝</span><h3>Choose your agent</h3><p class="card__desc">Compare and select the one that best fits you.</p></div>
      <div class="card"><span class="card__icon">📝</span><h3>Register for free</h3><p class="card__desc">Create your account in seconds, no card required.</p></div>
      <div class="card"><span class="card__icon">🛡️</span><h3>Buy with security</h3><p class="card__desc">The agent manages the entire process for you.</p></div>
    </div>
  </section>

  <section class="container">
    <h2>Why use an agent?</h2>
    <div class="grid grid--3">
      <div class="card"><span class="card__icon">🔒</span><h3>100% secure payment</h3><p class="card__desc">Your money protected until you receive the order.</p></div>
      <div class="card"><span class="card__icon">📸</span><h3>Free QC photos</h3><p class="card__desc">Quality photos before shipping home.</p></div>
      <div class="card"><span class="card__icon">💬</span><h3>24/7 support</h3><p class="card__desc">Help for any problem.</p></div>
    </div>
  </section>

  <section class="container">
    <h2>${agents.length} Verified Agents</h2>
    <p class="section__subtitle">Select the one that best fits your shopping style</p>
    <div class="grid grid--2">
      ${agents.map(renderAgentCard).join('\n      ')}
    </div>
  </section>
</main>`;

  const html = page({
    slug: 'agents',
    title: 'Verified Purchase Agents Comparison | RepsFinder',
    description: 'Compare verified replica purchase agents by rating, shipping time, QC success rate and commission — choose the right one and register for free.',
    canonicalPath: '/agents.html',
    breadcrumbItems: [
      { label: 'Home', href: 'index.html' },
      { label: 'Agents' },
    ],
    bodyHtml: body,
    jsonLdObjects: [
      organizationJsonLd(),
      websiteJsonLd(),
      breadcrumbJsonLd([
        { label: 'Home', href: '/index.html' },
        { label: 'Agents', href: '/agents.html' },
      ]),
    ],
  });

  return { html, report, agentCount: agents.length };
}

module.exports = { build };
