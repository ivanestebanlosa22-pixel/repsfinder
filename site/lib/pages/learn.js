'use strict';

// aprender.tsx es 100% contenido estático en la app (sin sheet propia) — confirmado en DISCOVERY.md §7bis.
// Todo el texto de esta página es cita literal de src/i18n/translations.ts (translations.en).

const { esc, page, organizationJsonLd, websiteJsonLd, breadcrumbJsonLd, faqJsonLd } = require('../layout');
const { validateAgentRow } = require('../agents');

const STEPS = [
  {
    n: 1,
    title: 'Find verified products',
    desc: 'Use the Discover tab to see products that have already been tested by the community.',
    tips: [
      'Filter by specific category',
      'Check rating and real sales numbers',
      'Tap Validate to see agent comparison',
      'Choose the agent that best fits your budget',
    ],
  },
  {
    n: 2,
    title: 'Choose your purchase agent',
    desc: 'Compare verified agents and choose the one that best fits your needs.',
    tips: [
      'Compare commissions between agents',
      'Check shipping times to your country',
      'Verify they have support',
      'Use bonus codes for discounts',
    ],
  },
  {
    n: 3,
    title: 'Register with bonus code',
    desc: 'Use our exclusive codes to get registration bonuses and discounts.',
    tips: [
      'Copy the code of the chosen agent',
      'Register with the provided link',
      'The bonus will apply automatically',
      'Save the code for future purchases',
    ],
  },
  {
    n: 4,
    title: 'Place your order',
    desc: 'Copy the product link and paste it in your agent.',
    tips: ['Copy the product link', "Paste it in the agent's website", 'Select size and color', 'Confirm the order'],
  },
  {
    n: 5,
    title: 'Request QC photos',
    desc: 'Before shipping, request quality control photos to verify the product.',
    tips: [
      'Wait for it to arrive at the warehouse',
      'Request detailed QC photos',
      'Check logos, seams and details',
      'Compare with official photos',
      'Approve or reject the product',
    ],
    warning: {
      title: 'Important',
      text: "Never approve shipping without seeing QC photos first. It's your quality guarantee.",
    },
  },
  {
    n: 6,
    title: 'Receive your order',
    desc: 'Track your shipment and receive your package at home.',
    tips: [
      'Save the tracking number',
      'Track with 17track.net',
      'Receive the package at your address',
      'Verify contents upon receipt',
    ],
  },
];

// AGENT_BONUSES real de aprender.tsx (translations.en, líneas 1109-1121). Joyagoo se filtra por
// exclusión permanente (Sección 2). Kakobuy conserva su texto de bono real pero el código mostrado
// se fuerza a FINDSES vía validateAgentRow (nunca al que trajera el código fuente de la app).
const AGENT_BONUSES_RAW = [
  { name: 'USFans', bonus: 'Up to $800 + 15% shipping', desc: 'Exclusive coupons for new users + discount on first shipping', sourceUrlForCode: 'https://www.usfans.com/product/3/1?ref=RCGD5Y' },
  { name: 'Mulebuy', bonus: '¥3150 + 15% discount', desc: 'Registration bonus + shipping discount for new users', sourceUrlForCode: 'https://mulebuy.com/product/?shop_type=weidian&id=1&ref=200642502' },
  { name: 'Litbuy', bonus: '$500 + shipping coupon', desc: 'Welcome bonus + free shipping coupon', sourceUrlForCode: 'https://litbuy.net/product/weidian/1?inviteCode=YBMHFG55L' },
  { name: 'Oopbuy', bonus: '¥3500 + free item', desc: 'Registration bonus + free item for new users', sourceUrlForCode: 'https://oopbuy.com/product/weidian/1?inviteCode=GH40R4J0O' },
  { name: 'Kakobuy', bonus: '¥3000 in bonuses', desc: 'Registration bonus for new users', sourceUrlForCode: '' },
  { name: 'Joyagoo', bonus: '¥1200 in bonuses', desc: 'Registration bonus for new users', sourceUrlForCode: '' },
];

const FAQ = [
  { q: 'Is it safe to buy replicas?', a: 'Yes, using verified agents and following our guide minimizes risks.' },
  { q: 'How much can I save?', a: 'Users save between 70-85% compared to retail prices.' },
  { q: 'What if there are problems?', a: 'Verified agents offer return and dispute policies.' },
  { q: 'How long does shipping take?', a: 'Typical shipping takes 12-18 days.' },
];

function renderStep(step) {
  return `<div class="step">
    <div class="step__num">${step.n}</div>
    <div class="card" style="flex:1;">
      <h3>${esc(step.title)}</h3>
      <p>${esc(step.desc)}</p>
      <ul style="margin:10px 0 0;padding-left:18px;color:var(--text-secondary);font-size:13px;">
        ${step.tips.map((t) => `<li style="margin-bottom:4px;">${esc(t)}</li>`).join('\n        ')}
      </ul>
      ${step.warning ? `<div class="alert alert--warning">⚠️ ${esc(step.warning.title)}: ${esc(step.warning.text)}</div>` : ''}
    </div>
  </div>`;
}

function renderBonusCard(b) {
  return `<div class="card card--glass">
    <div class="badge" style="margin-bottom:10px;">🎁 EXCLUSIVE BONUS</div>
    <h3>${esc(b.display)}</h3>
    <p style="color:var(--primary);font-weight:900;font-size:15px;margin-bottom:6px;">${esc(b.bonus)}</p>
    <p style="margin-bottom:10px;">${esc(b.desc)}</p>
    <p style="font-size:12px;color:var(--text-secondary);margin-bottom:14px;">Your code: <strong style="color:#fff;">${esc(b.code)}</strong></p>
    <a class="btn btn--outline btn--block" href="agents.html#${esc(b.display.toLowerCase())}">See full details &amp; register →</a>
  </div>`;
}

function build() {
  const bonusCards = AGENT_BONUSES_RAW.map((b) => {
    const v = validateAgentRow(b.name, b.sourceUrlForCode);
    if (!v.publish) return null;
    return renderBonusCard({ display: v.display, code: v.code, bonus: b.bonus, desc: b.desc });
  }).filter(Boolean);

  const body = `
<main>
  <div class="container hero">
    <span class="hero__eyebrow">📚 Free guide · 15 min read</span>
    <h1>Learn to Buy Quality Replicas</h1>
    <p class="hero__subtitle">The proven method to save 70-85% buying directly from factory without errors or scams.</p>
  </div>

  <section class="container">
    <h2>What you will learn</h2>
    <p class="section__subtitle">Master the art of buying quality replicas directly from Chinese factories</p>
    <div class="grid grid--3">
      <div class="card"><span class="card__icon">🔎</span><div class="card__title">Find verified products</div></div>
      <div class="card"><span class="card__icon">🤝</span><div class="card__title">Choose the ideal agent</div></div>
      <div class="card"><span class="card__icon">💳</span><div class="card__title">Pay securely</div></div>
      <div class="card"><span class="card__icon">📸</span><div class="card__title">Request QC photos</div></div>
      <div class="card"><span class="card__icon">📦</span><div class="card__title">Manage shipping</div></div>
      <div class="card"><span class="card__icon">⚖️</span><div class="card__title">Compare prices</div></div>
    </div>
  </section>

  <section class="container">
    <h2>Step-by-Step Guide</h2>
    <p class="section__subtitle">Follow these 6 steps to make your first purchase successfully</p>
    <div class="steps">
      ${STEPS.map(renderStep).join('\n      ')}
    </div>
  </section>

  ${bonusCards.length ? `<section class="container">
    <h2>Exclusive Bonus Codes</h2>
    <p class="section__subtitle">Get discounts and benefits when registering with our verified agents</p>
    <div class="grid grid--3">
      ${bonusCards.join('\n      ')}
    </div>
  </section>` : ''}

  <section class="container">
    <h2>Frequently Asked Questions</h2>
    <div>
      ${FAQ.map((qa) => `<div class="faq-item"><h3>${esc(qa.q)}</h3><p>${esc(qa.a)}</p></div>`).join('\n      ')}
    </div>
  </section>

  <section class="container">
    <div class="cta-box">
      <h2>🎉 Ready to start!</h2>
      <p>You have everything you need to make your first purchase.</p>
      <a class="btn btn--primary" href="verify.html" style="margin-top:14px;">View verified products</a>
    </div>
  </section>
</main>`;

  return page({
    slug: 'learn',
    title: 'How to Buy Replicas Safely — Step-by-Step Guide | RepsFinder',
    description: 'A free, complete guide to buying quality replicas from China: how to find verified products, choose a purchase agent, request QC photos and get your order home safely.',
    canonicalPath: '/learn.html',
    breadcrumbItems: [
      { label: 'Home', href: 'index.html' },
      { label: 'Learn' },
    ],
    bodyHtml: body,
    jsonLdObjects: [
      organizationJsonLd(),
      websiteJsonLd(),
      breadcrumbJsonLd([
        { label: 'Home', href: '/index.html' },
        { label: 'Learn', href: '/learn.html' },
      ]),
      faqJsonLd(FAQ),
    ],
  });
}

module.exports = { build };
