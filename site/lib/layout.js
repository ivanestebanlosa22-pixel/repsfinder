'use strict';

const SITE_NAME = 'RepsFinder';
const SITE_URL = 'https://www.qualityrepsfinder.com';
const SITE_TAGLINE = 'Smart shopping. No surprises. Guaranteed.';

const NAV_ITEMS = [
  { href: '/index.html', label: 'Discover', slug: 'index' },
  { href: '/agents.html', label: 'Agents', slug: 'agents' },
  { href: '/verify.html', label: 'Verify', slug: 'verify' },
  { href: '/top-stores.html', label: 'Top Stores', slug: 'top-stores' },
  { href: '/learn.html', label: 'Learn', slug: 'learn' },
];

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function header(activeSlug) {
  const links = NAV_ITEMS.map(
    (item) =>
      `<a href="${item.href}"${item.slug === activeSlug ? ' aria-current="page"' : ''}>${esc(item.label)}</a>`
  ).join('\n        ');

  return `<header class="site-header">
    <div class="site-header__bar"></div>
    <div class="site-header__inner">
      <div>
        <a href="/index.html" style="display:flex;align-items:baseline;gap:10px;">
          <span class="logo">RepsFinder</span>
          <span class="tagline">${esc(SITE_TAGLINE)}</span>
        </a>
      </div>
      <nav class="main-nav" aria-label="Main navigation">
        ${links}
      </nav>
    </div>
  </header>`;
}

function breadcrumb(items) {
  // items: [{label, href}] — el último no lleva href (página actual)
  const parts = items
    .map((it, i) => {
      if (i === items.length - 1) return `<span>${esc(it.label)}</span>`;
      return `<a href="${it.href}">${esc(it.label)}</a>`;
    })
    .join(' <span aria-hidden="true">/</span> ');
  return `<nav class="breadcrumb container" aria-label="Breadcrumb">${parts}</nav>`;
}

function footer() {
  return `<footer class="site-footer">
    <div class="container">
      <div class="site-footer__grid">
        <div>
          <div class="logo" style="margin-bottom:10px;">RepsFinder</div>
          <p style="max-width:420px;">Compare verified purchase agents, learn how to validate products, and find trusted Weidian stores — before you buy directly from the agent of your choice.</p>
        </div>
        <div class="site-footer__links">
          <strong style="color:#fff;font-size:13px;margin-bottom:4px;">Site</strong>
          <a href="/index.html">Discover</a>
          <a href="/agents.html">Agents</a>
          <a href="/verify.html">Verify</a>
          <a href="/top-stores.html">Top Stores</a>
          <a href="/learn.html">Learn</a>
        </div>
        <div class="site-footer__links">
          <strong style="color:#fff;font-size:13px;margin-bottom:4px;">Legal</strong>
          <a href="/privacy.html">Privacy Policy</a>
          <a href="/terms.html">Terms &amp; Conditions</a>
          <a href="mailto:legal@repsfinder.com">legal@repsfinder.com</a>
        </div>
      </div>
      <p class="site-footer__disclaimer">⚠️ REPSFINDER DOES NOT SELL PRODUCTS. We are an informational platform that compares external shopping agents. All transactions are performed directly with the agents. Products referenced are replicas of registered brands; their purchase and possession may have legal implications depending on your jurisdiction. Intended for personal use only.</p>
      <p class="site-footer__bottom">© 2026 RepsFinder. All rights reserved.</p>
    </div>
  </footer>`;
}

function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'RepsFinder is an informational platform that compares verified replica shopping agents and helps buyers validate products and stores before purchasing directly from the agent.',
  };
}

function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
  };
}

function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.label,
      item: it.href ? `${SITE_URL}${it.href}` : undefined,
    })),
  };
}

function faqJsonLd(qaPairs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qaPairs.map((qa) => ({
      '@type': 'Question',
      name: qa.q,
      acceptedAnswer: { '@type': 'Answer', text: qa.a },
    })),
  };
}

function jsonLdScript(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
}

function page({ slug, title, description, canonicalPath, breadcrumbItems, bodyHtml, jsonLdObjects = [] }) {
  const canonical = `${SITE_URL}${canonicalPath}`;
  const ld = jsonLdObjects.map(jsonLdScript).join('\n  ');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${canonical}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="RepsFinder" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${canonical}" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<link rel="stylesheet" href="/assets/css/style.css" />
${ld}
</head>
<body>
${header(slug)}
${breadcrumbItems ? breadcrumb(breadcrumbItems) : ''}
${bodyHtml}
${footer()}
</body>
</html>
`;
}

module.exports = {
  SITE_NAME,
  SITE_URL,
  SITE_TAGLINE,
  NAV_ITEMS,
  esc,
  header,
  footer,
  breadcrumb,
  organizationJsonLd,
  websiteJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  jsonLdScript,
  page,
};
