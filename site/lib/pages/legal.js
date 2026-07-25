'use strict';

// privacy.html y terms.html — adaptados de app/legal.tsx + src/i18n/legalTranslations.ts
// (legalTranslationsEN), citas literales donde aplica. Se han retirado las cláusulas de cuentas
// de usuario, contraseñas, favoritos guardados y demás funcionalidad de "app" que no existe en
// este sitio estático (regla de cero-app, sección 0.2 del encargo), y se han conservado íntegros
// los avisos legales reales (réplicas, afiliación, responsabilidad) — son protección legal, no
// marketing de producto.

const { esc, page, organizationJsonLd, websiteJsonLd, breadcrumbJsonLd } = require('../layout');

const LAST_UPDATE = 'Last updated: February 2026';

function section(title, bodyHtml) {
  return `<h2>${esc(title)}</h2>\n${bodyHtml}`;
}

function p(text) {
  return `<p>${esc(text)}</p>`;
}

function ul(items) {
  return `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
}

function buildPrivacy() {
  const body = `
<main class="container legal-doc" style="padding:32px 0 60px;">
  <h1>🔒 Privacy Policy</h1>
  <p class="legal-updated">${esc(LAST_UPDATE)}</p>

  ${section('1. Information we collect', `
    ${p('RepsFinder is a static, informational website. We do not require account registration, login or a password to use it, and we do not directly collect personal information from visitors.')}
    ${ul([
      'Standard technical web logs (IP address, browser type, pages visited) collected automatically by our hosting provider as part of normal server operation.',
      'No account data, no email addresses, no passwords are collected — there is no registration on this site.',
    ])}
  `)}

  ${section('2. How we use information', `
    ${p('The limited technical data described above is used only to operate, secure and maintain the website (for example, detecting abuse or diagnosing errors). We do not build user profiles and we do not personalize content based on browsing history.')}
  `)}

  ${section('3. Cookies', `
    ${p('RepsFinder does not set its own tracking or analytics cookies. If our hosting provider requires a strictly necessary technical cookie for the site to function, it does not identify you personally.')}
    ${p('When you click a link to a purchase agent (Kakobuy, USFans, Litbuy, Superbuy, Mulebuy, Oopbuy, or any other agent shown on this site), you leave RepsFinder and that agent\'s own cookie and privacy policy applies. We do not control third-party cookies set by external agents.')}
  `)}

  ${section('4. Data sharing', `
    ${p('We do NOT sell your information and we do NOT share it with advertisers. We do not run advertising networks or trackers on this site.')}
    ${ul([
      'We do not access, request or store payment information — all transactions happen directly on the purchase agent\'s own website.',
      'Aggregated, anonymous server statistics (if any) are never linked to an individual visitor.',
    ])}
  `)}

  ${section('5. Your rights', `
    ${p('Because we do not hold personal accounts or profiles, there is generally no personal data of yours for us to access, rectify or delete. If you believe we hold any information about you and want to exercise your rights under applicable data protection law, contact us using the email below.')}
  `)}

  ${section('6. Security', `
    ${p('We keep the site and its hosting infrastructure updated using industry-standard practices. Since no accounts or passwords exist on this site, there is no login credential of yours to protect here.')}
  `)}

  ${section('7. Contact', `
    ${p('For any privacy inquiries:')}
    <p><a href="mailto:privacy@repsfinder.com" style="color:var(--primary);font-weight:700;">privacy@repsfinder.com</a></p>
  `)}
</main>`;

  return page({
    slug: null,
    title: 'Privacy Policy | RepsFinder',
    description: 'RepsFinder privacy policy: what limited technical data this informational website processes, and what it never collects — no accounts, no passwords, no tracking cookies.',
    canonicalPath: '/privacy.html',
    breadcrumbItems: [
      { label: 'Home', href: '/index.html' },
      { label: 'Privacy Policy' },
    ],
    bodyHtml: body,
    jsonLdObjects: [
      organizationJsonLd(),
      websiteJsonLd(),
      breadcrumbJsonLd([
        { label: 'Home', href: '/index.html' },
        { label: 'Privacy Policy', href: '/privacy.html' },
      ]),
    ],
  });
}

function buildTerms() {
  const body = `
<main class="container legal-doc" style="padding:32px 0 60px;">
  <h1>📜 Terms &amp; Conditions</h1>
  <p class="legal-updated">${esc(LAST_UPDATE)}</p>

  ${section('1. Acceptance of terms', p('By using the RepsFinder website, you accept these terms and conditions. If you do not agree, please do not use the website.'))}

  ${section('2. Service description', `
    ${p('RepsFinder is an informational platform that provides:')}
    ${ul([
      'Comparisons of verified replica purchase agents',
      'A guide to validating product quality and sellers before buying',
      'A curated list of trusted Weidian stores by category',
      'Educational guides about international shopping from China',
    ])}
  `)}

  ${section('3. Permitted use', `
    ${p('You can use RepsFinder to:')}
    ${ul([
      '✓ Check information about verified shopping agents',
      '✓ Explore products and compare information between agents',
      '✓ Access educational guides about international shopping',
      '✓ Share page links for informational purposes only',
    ])}
  `)}

  ${section('4. Prohibited use', `
    ${p('The following is NOT permitted:')}
    ${ul([
      '✗ Use the website for illegal activities',
      '✗ Attempt to access unauthorized systems or data',
      '✗ Distribute malware or malicious code',
      '✗ Use bots or automated scraping',
      '✗ Resell or redistribute website content without authorization',
    ])}
  `)}

  ${section('5. Intellectual property', `
    ${p('All RepsFinder content is protected by copyright:')}
    ${ul([
      'Logos, brand name and design are property of RepsFinder',
      'Guides and educational content are protected',
      'Product images belong to their respective owners',
      'You may NOT copy, modify or distribute content without permission',
    ])}
  `)}

  ${section('6. Important legal notice', `
    <div class="alert alert--warning">⚠️ REPSFINDER DOES NOT SELL PRODUCTS. We are an informational platform that compares external shopping agents. All transactions are performed directly with the agents.</div>
    ${p('You acknowledge and accept that:')}
    ${ul([
      'RepsFinder is not a store and does not sell products directly',
      'Transactions are between you and external agents',
      'We have no control over product availability or quality',
      'We are not responsible for disputes with external agents',
      "You must review each agent's policies before buying",
      'Images are illustrative and may vary from the actual product',
    ])}
  `)}

  ${section('7. Nature of replica products', `
    <div class="alert alert--danger">⚠️ LEGAL ALERT: Many products referenced on this website are replicas or imitations of registered brands. Their purchase and possession may have legal implications depending on your jurisdiction.</div>
    ${ul([
      'Mentioned brands are property of their respective owners',
      'RepsFinder does NOT sell products, only compares agents',
      'This website is an informational guide about international shopping',
      'Product availability depends entirely on third-party agents and stores',
    ])}
    <div class="alert alert--warning">👤 These products are intended for PERSONAL USE. Commercial resale of replicas is illegal in most countries and may carry criminal penalties.</div>
  `)}

  ${section('8. User responsibility & purchase process', `
    ${ul([
      "You are responsible for knowing your country's import laws",
      'Customs may retain or confiscate branded products',
      'You must correctly declare the value of products',
      'RepsFinder does NOT process payments or shipments — transactions happen directly on the agent\'s own website',
      'Each agent has its own policies; keep all documentation of your purchase',
    ])}
  `)}

  ${section('9. Quality and expectations', `
    ${ul([
      'Images may differ from the actual product',
      'Quality varies depending on seller and product',
      'Always request QC photos before shipping',
      'Low prices imply proportional quality',
    ])}
  `)}

  ${section('10. Affiliate disclosure & editorial independence', `
    ${p('At RepsFinder we believe in total transparency about how we finance and maintain this free website.')}
    ${ul([
      '🤝 Some links to agents are affiliate links',
      '🤝 If you register through our links, we may receive a commission',
      '🤝 This does NOT increase the cost for you',
      '• We show verified agents based on the same criteria for all — we do NOT prioritize agents by commission',
      '• Bonus codes shown are real and verified against each agent',
    ])}
    <div class="alert alert--warning">📢 We do NOT show invasive third-party ads. Our only source of income is affiliate commissions when you use our registration links.</div>
  `)}

  ${section('11. Limitation of liability', `
    ${p('RepsFinder is not responsible for:')}
    ${ul([
      'Quality or authenticity of products purchased through agents',
      'Shipping delays or customs issues',
      'Economic losses derived from international purchases',
      'Content of third-party linked websites',
    ])}
  `)}

  ${section('12. Informed decisions & legal advice', `
    <div class="alert alert--warning">💡 Shop informed and responsibly. Learn about your country's laws and risks before making any international purchase.</div>
    ${p("This content does not constitute legal advice. For specific inquiries about your country's legislation, contact a professional.")}
  `)}

  ${section('13. Modifications', `
    ${p('We reserve the right to modify these terms:')}
    ${ul([
      'Changes will be published on this page',
      'Continuing to use the website implies accepting the new terms',
      'The last update date is at the top of this document',
    ])}
  `)}

  ${section('14. Applicable law', p('These terms are governed by Spanish law. Any dispute will be submitted to the courts of Madrid, Spain.'))}
</main>`;

  return page({
    slug: null,
    title: 'Terms & Conditions | RepsFinder',
    description: 'RepsFinder terms and conditions: what this informational website is, how affiliate links work, and the legal notice on replica products.',
    canonicalPath: '/terms.html',
    breadcrumbItems: [
      { label: 'Home', href: '/index.html' },
      { label: 'Terms & Conditions' },
    ],
    bodyHtml: body,
    jsonLdObjects: [
      organizationJsonLd(),
      websiteJsonLd(),
      breadcrumbJsonLd([
        { label: 'Home', href: '/index.html' },
        { label: 'Terms & Conditions', href: '/terms.html' },
      ]),
    ],
  });
}

module.exports = { buildPrivacy, buildTerms };
