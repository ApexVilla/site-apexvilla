/**
 * Gera as landing pages de serviço em dist/ (3 pt-BR + 3 es-419).
 *
 * Por que existem: o site é uma página só, e âncora (#services) não ranqueia
 * para termo específico — URL dedicada sim. O rodapé do dist/index.html já
 * linkava esses três slugs pt sem que as páginas existissem, o que, com o
 * fallback SPA do _redirects, virava home duplicada em vez de 404.
 *
 * Reaproveita do dist/index.html o CSS crítico inline, as fontes e o bundle CSS
 * para que as landings pareçam o mesmo site. Conteúdo: landings.content.mjs.
 *
 * Uso: node build-landings.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGES, PAIRS, UI } from './landings.content.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const BASE = 'https://apexvilla.com.br';
const shell = readFileSync(join(ROOT, 'dist', 'index.html'), 'utf8');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Recorta um trecho do dist/index.html; falha alto se o shell mudou de forma. */
function grab(re, what) {
  const m = shell.match(re);
  if (!m) throw new Error(`build-landings: não achei ${what} em dist/index.html — ` +
                          `o shell mudou; ajuste o padrão antes de gerar.`);
  return m[0];
}

const criticalCss  = grab(/<style>\s*@font-face[\s\S]*?<\/style>/, 'o CSS crítico inline');
const fontPreloads = shell.match(/<link rel="preload" href="\/fonts\/[^>]*>/g)?.join('\n  ') ?? '';
const cssBundle    = grab(/<link rel="preload" href="\/assets\/index-[^>]*>\s*<noscript>[^<]*<link[^>]*><\/noscript>/, 'o bundle CSS');
// Não há AdSense: o script carregava nas 9 páginas sem um único <ins class="adsbygoogle">,
// ou seja, exibia zero anúncio e rendia zero — em troca de uma requisição de terceiro,
// do beacon `sodar` (13 KB, ~90% do peso desta página) e do rastreio dos leads. Removido
// em 2026-07-16. Se um dia voltar, precisa vir COM os slots <ins> e revisão de LGPD.

/** Par pt↔es desta página, para hreflang e para o seletor de idioma. */
function counterpart(slug) {
  const p = PAIRS.find((x) => x.pt === slug || x.es === slug);
  if (!p) throw new Error(`build-landings: slug "${slug}" não está em PAIRS`);
  return { pt: `${BASE}/${p.pt}/`, es: `${BASE}/${p.es}/` };
}

const jsonld = (o) => JSON.stringify(o, null, 2).replace(/</g, '\\u003c');

function head(page) {
  const url = `${BASE}/${page.slug}/`;
  const alt = counterpart(page.slug);
  const isEs = page.lang === 'es';
  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: page.serviceName,
      serviceType: page.serviceType,
      description: page.description,
      url,
      inLanguage: page.lang,
      provider: { '@id': `${BASE}/#organization` },
      areaServed: [
        { '@type': 'Country', name: isEs ? 'Argentina' : 'Brasil' },
        { '@type': 'AdministrativeArea', name: isEs ? 'América Latina' : 'Brasil' },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: UI[page.lang].home, item: isEs ? `${BASE}/es/` : `${BASE}/` },
        { '@type': 'ListItem', position: 2, name: page.breadcrumb, item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: page.lang,
      mainEntity: page.faq.map(([q, a]) => ({
        '@type': 'Question', name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  ];

  return `<!DOCTYPE html>
<html lang="${page.lang}">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests" />
  <meta name="theme-color" content="#05050A" />
  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.description)}" />
  <meta name="keywords" content="${esc(page.keywords)}" />
  <meta name="author" content="ApexVilla" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
  <meta name="language" content="${page.lang}" />
  <meta name="geo.region" content="BR-GO" />
  <meta name="geo.placename" content="Goiânia, Goiás, Brasil" />
  <link rel="canonical" href="${url}" />
  <link rel="alternate" hreflang="pt-BR" href="${alt.pt}" />
  <link rel="alternate" hreflang="es" href="${alt.es}" />
  <link rel="alternate" hreflang="es-VE" href="${alt.es}" />
  <link rel="alternate" hreflang="es-419" href="${alt.es}" />
  <link rel="alternate" hreflang="x-default" href="${alt.pt}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />
  <meta property="og:site_name" content="ApexVilla" />
  <meta property="og:title" content="${esc(page.title)}" />
  <meta property="og:description" content="${esc(page.description)}" />
  <meta property="og:image" content="${BASE}/images/banner.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="${isEs ? 'es_419' : 'pt_BR'}" />
  <meta property="og:locale:alternate" content="${isEs ? 'pt_BR' : 'es_419'}" />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:title" content="${esc(page.title)}" />
  <meta property="twitter:description" content="${esc(page.description)}" />
  <meta property="twitter:image" content="${BASE}/images/banner.png" />
  <link rel="icon" href="/images/logo-1.1.png" />
  <link rel="apple-touch-icon" href="/images/logo-1.1.png" />
  <link rel="dns-prefetch" href="https://wa.me" />
  ${fontPreloads}
  ${criticalCss}
  <style>
    /* Layout próprio das landings: usa as variáveis do CSS crítico acima. */
    .lp-main{padding-top:120px}
    .lp-crumb{font-family:var(--font-mono);font-size:.72rem;text-transform:uppercase;letter-spacing:.12em;color:var(--text-muted);margin-bottom:28px}
    .lp-crumb a{color:var(--gold);opacity:.85}
    .lp-crumb a:hover{opacity:1}
    .lp-hero{padding:20px 0 70px}
    .lp-eyebrow{display:inline-flex;align-items:center;gap:12px;font-family:var(--font-mono);font-size:.75rem;text-transform:uppercase;letter-spacing:.15em;color:var(--gold);margin-bottom:26px}
    .lp-eyebrow::before{content:"";width:40px;height:1px;background:var(--gold)}
    .lp-h1{font-family:var(--font-display);font-size:clamp(2.6rem,6vw,5rem);font-weight:600;line-height:1.06;letter-spacing:-.02em;margin-bottom:28px;max-width:16ch}
    .lp-h1 em{font-style:italic;color:var(--gold)}
    .lp-lead{font-size:1.12rem;line-height:1.75;color:var(--text-secondary);max-width:62ch;margin-bottom:40px}
    .lp-ctas{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:64px}
    .lp-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:720px}
    .lp-stat{background:rgba(255,255,255,.02);border:1px solid var(--gold-border);border-radius:14px;padding:22px}
    .lp-stat-n{font-family:var(--font-display);font-size:2rem;font-weight:600;color:var(--gold);line-height:1}
    .lp-stat-l{font-size:.82rem;color:var(--text-muted);margin-top:8px;line-height:1.4}
    .lp-section{padding:70px 0;border-top:1px solid var(--gold-border)}
    .lp-h2{font-family:var(--font-display);font-size:clamp(1.9rem,3.6vw,2.9rem);font-weight:600;line-height:1.15;margin-bottom:20px}
    .lp-h2 em{font-style:italic;color:var(--gold)}
    .lp-p{font-size:1.05rem;line-height:1.75;color:var(--text-secondary);max-width:64ch}
    .lp-facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:26px;margin-top:44px}
    .lp-fact-n{font-family:var(--font-display);font-size:2.6rem;font-weight:600;color:var(--gold);line-height:1;margin-bottom:12px}
    .lp-fact-t{font-size:.95rem;line-height:1.65;color:var(--text-secondary)}
    .lp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;margin-top:44px}
    .lp-card{background:rgba(255,255,255,.02);border:1px solid var(--gold-border);border-radius:14px;padding:28px}
    .lp-card h3{font-family:var(--font-display);font-size:1.3rem;font-weight:600;color:var(--gold-light);margin-bottom:12px}
    .lp-card p{font-size:.95rem;line-height:1.65;color:var(--text-secondary)}
    .lp-price{display:flex;flex-wrap:wrap;align-items:baseline;gap:14px;margin-top:12px}
    .lp-price-l{font-family:var(--font-mono);font-size:.78rem;text-transform:uppercase;letter-spacing:.12em;color:var(--text-muted)}
    .lp-price-v{font-family:var(--font-display);font-size:2.6rem;font-weight:600;color:var(--gold)}
    .lp-faq-item{border-top:1px solid var(--gold-border);padding:26px 0}
    .lp-faq-item:last-child{border-bottom:1px solid var(--gold-border)}
    .lp-faq-q{font-family:var(--font-display);font-size:1.25rem;font-weight:600;color:var(--text);margin-bottom:12px}
    .lp-faq-a{font-size:.98rem;line-height:1.75;color:var(--text-secondary);max-width:74ch}
    .lp-related{display:flex;gap:16px;flex-wrap:wrap;margin-top:28px}
    .lp-related a{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;border:1px solid var(--gold-border);border-radius:2px;color:var(--gold);font-size:.9rem;transition:border-color .3s}
    .lp-related a:hover{border-color:var(--gold)}
    .lp-close{text-align:center;padding:90px 0}
    .lp-close .lp-ctas{justify-content:center;margin-bottom:0}
    @media(max-width:768px){.lp-main{padding-top:96px}.lp-stats{grid-template-columns:1fr}.lp-h1{max-width:none}}
  </style>
  <noscript><style>.reveal,.reveal-left,.reveal-right,.reveal-scale{opacity:1!important;transform:none!important}</style></noscript>
  <script type="application/ld+json">
${jsonld(ld)}
  </script>
  ${cssBundle}
</head>
`;
}

function nav(page) {
  const t = UI[page.lang];
  const alt = counterpart(page.slug);
  const isEs = page.lang === 'es';
  // O seletor leva à MESMA página no outro idioma, não à home — trocar de
  // idioma e perder a página que se estava lendo é perda de contexto (e o
  // hreflang promete essa correspondência).
  const ptBtn = isEs ? `<a class="lang-btn" href="${alt.pt}" aria-label="Português" data-no-translate>PT</a>`
                     : `<a class="lang-btn active" aria-label="Português" data-no-translate>PT</a>`;
  const esBtn = isEs ? `<a class="lang-btn active" aria-label="Español" data-no-translate>ES</a>`
                     : `<a class="lang-btn" href="${alt.es}" aria-label="Español" data-no-translate>ES</a>`;
  const links = t.nav.map(([h, l]) => `        <a href="${h}">${l}</a>`).join('\n');
  const mobile = t.nav.map(([h, l]) => `      <a href="${h}">${l}</a>`).join('\n');
  const home = isEs ? '/es/' : '/';

  return `
  <canvas id="particleCanvas" aria-hidden="true"></canvas>

  <header class="navbar" id="navbar" role="banner">
    <div class="container nav-container">
      <a class="nav-logo" href="${home}" aria-label="${t.homeAria}">
        <picture>
          <source srcset="/img/logo_gold-68.avif 68w, /img/logo_gold-136.avif 136w" type="image/avif" sizes="54px">
          <source srcset="/img/logo_gold-68.webp 68w, /img/logo_gold-136.webp 136w" type="image/webp" sizes="54px">
          <img src="/images/logo-1.1.png" alt="ApexVilla Logo" class="nav-logo-icon" width="68" height="68" loading="eager" decoding="async">
        </picture>
        <span class="nav-logo-text">ApexVilla</span>
      </a>

      <nav class="nav-links" role="navigation" aria-label="${t.menuAria}">
${links}
      </nav>

      <div class="nav-right">
        <div class="lang-switcher">
          ${ptBtn}
          <span class="lang-divider">|</span>
          ${esBtn}
        </div>
        <a href="${home}#contact" class="nav-cta">
          <span>${t.navCta}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
        <button class="nav-hamburger" id="navHamburger" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>

  <div class="nav-mobile" id="navMobile" role="dialog" aria-label="Menu">
    <button class="nav-mobile-close" id="navClose" aria-label="Fechar menu">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F2EFE8" stroke-width="2" aria-hidden="true">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
    <nav class="nav-mobile-links">
${mobile}
    </nav>
  </div>
`;
}

function body(page) {
  const t = UI[page.lang];
  const isEs = page.lang === 'es';
  const home = isEs ? '/es/' : '/';
  const wa = `https://wa.me/5562981254228?text=${page.whatsapp}`;
  const [h1a, h1b, h1c] = page.h1;

  return `
  <main class="lp-main">
    <div class="container">
      <nav class="lp-crumb" aria-label="${t.breadcrumbAria}">
        <a href="${home}">${t.home}</a> &rsaquo; <span>${esc(page.breadcrumb)}</span>
      </nav>
    </div>

    <section class="lp-hero">
      <div class="container">
        <span class="lp-eyebrow">${esc(page.eyebrow)}</span>
        <h1 class="lp-h1">${esc(h1a)}<em>${esc(h1b)}</em>${esc(h1c)}</h1>
        <p class="lp-lead">${esc(page.lead)}</p>
        <div class="lp-ctas">
          <a href="${wa}" class="btn-primary" target="_blank" rel="noopener">
            <span>${esc(page.ctaPrimary)}</span>
          </a>
          <a href="${home}#portfolio" class="btn-ghost"><span>${esc(page.ctaSecondary)}</span></a>
        </div>
        <div class="lp-stats">
${page.stats.map(([n, l]) => `          <div class="lp-stat"><div class="lp-stat-n">${esc(n)}</div><div class="lp-stat-l">${esc(l)}</div></div>`).join('\n')}
        </div>
      </div>
    </section>

    <section class="lp-section">
      <div class="container">
        <h2 class="lp-h2">${esc(page.pitchTitle)}</h2>
        <p class="lp-p">${esc(page.pitchText)}</p>
        <div class="lp-facts">
${page.facts.map(([n, txt]) => `          <div class="lp-fact"><div class="lp-fact-n">${esc(n)}</div><p class="lp-fact-t">${esc(txt)}</p></div>`).join('\n')}
        </div>
      </div>
    </section>

    <section class="lp-section">
      <div class="container">
        <h2 class="lp-h2">${esc(page.deliverTitle)}</h2>
        <div class="lp-grid">
${page.deliverables.map(([h, d]) => `          <article class="lp-card"><h3>${esc(h)}</h3><p>${esc(d)}</p></article>`).join('\n')}
        </div>
        <div class="lp-price">
          <span class="lp-price-l">${esc(page.priceLabel)}</span>
          <span class="lp-price-v">${esc(page.price)}</span>
        </div>
        <p class="lp-p" style="margin-top:14px">${esc(page.priceNote)}</p>
      </div>
    </section>

    <section class="lp-section">
      <div class="container">
        <h2 class="lp-h2">${esc(t.faqTitle)}</h2>
        <div class="lp-faq">
${page.faq.map(([q, a]) => `          <div class="lp-faq-item"><h3 class="lp-faq-q">${esc(q)}</h3><p class="lp-faq-a">${esc(a)}</p></div>`).join('\n')}
        </div>
        <h2 class="lp-h2" style="font-size:1.4rem;margin-top:56px">${esc(t.related)}</h2>
        <div class="lp-related">
${page.related.map(([l, h]) => `          <a href="${h}">${esc(l)} →</a>`).join('\n')}
        </div>
      </div>
    </section>

    <section class="lp-section lp-close">
      <div class="container">
        <h2 class="lp-h2" style="margin-inline:auto">${esc(page.closeTitle)}</h2>
        <p class="lp-p" style="margin:0 auto 36px">${esc(page.closeText)}</p>
        <div class="lp-ctas">
          <a href="${wa}" class="btn-primary" target="_blank" rel="noopener"><span>${esc(page.ctaPrimary)}</span></a>
          <a href="${wa}" class="btn-ghost" target="_blank" rel="noopener"><span>${esc(t.talkWhatsapp)}</span></a>
        </div>
      </div>
    </section>
  </main>
`;
}

// Redes sociais: Instagram, Facebook e TikTok. Não há LinkedIn de propósito —
// linkedin.com/company/apexvilla dá 404 (verificado contra um perfil real, que
// devolve 200). Estava no rodapé e, pior, no sameAs do JSON-LD, afirmando ao
// Google um perfil inexistente e enfraquecendo o sinal de entidade da marca —
// o mesmo sinal que faz LLMs confundirem a ApexVilla com a Apex Engenharia.
// Se o perfil for criado, re-adicionar aqui E no sameAs de dist/index.html.
function footer(page) {
  const t = UI[page.lang];
  const home = page.lang === 'es' ? '/es/' : '/';
  return `
  <footer class="footer" role="contentinfo">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="footer-logo" href="${home}" aria-label="ApexVilla">
            <picture>
              <source srcset="/img/logo_gold-68.avif" type="image/avif">
              <source srcset="/img/logo_gold-68.webp" type="image/webp">
              <img src="/images/logo-1.1.png" width="42" height="42" alt="ApexVilla Footer Logo" loading="lazy" decoding="async" style="object-fit:contain">
            </picture>
            <span>ApexVilla</span>
          </a>
          <p class="footer-slogan">${t.footerSlogan}</p>
          <p class="footer-desc">${t.footerDesc}</p>
        </div>

        <div class="footer-links-col">
          <h3 class="footer-col-title">${t.footerLinksTitle}</h3>
          <ul class="footer-links">
${t.footerLinks.map(([h, l]) => `            <li><a href="${h}">${l}</a></li>`).join('\n')}
          </ul>
        </div>

        <div class="footer-contact-col">
          <h3 class="footer-col-title">${t.footerContactTitle}</h3>
          <div class="footer-contact-info">
            <p>(62) 98125-4228</p>
            <p>samir@apexvilla.com.br</p>
            <p>${t.footerLocation}</p>
          </div>
          <div class="footer-social">
            <a href="https://www.instagram.com/apex_villa" target="_blank" rel="noopener" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="https://www.facebook.com/share/17vmqVA8AD/" target="_blank" rel="noopener" aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="none" aria-hidden="true"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
            </a>
            <a href="https://www.tiktok.com/@apexvilla23" target="_blank" rel="noopener" aria-label="TikTok">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="none" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .55.04.81.11v-3.49a6.37 6.37 0 00-.81-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.62a8.25 8.25 0 004.79 1.53V6.69h-1.03z" /></svg>
            </a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <span>${t.rights}</span>
        <div class="footer-brands">
          <span>ApexVilla</span><span class="footer-brands-sep">|</span><span>Infinity.ia</span>
        </div>
      </div>
    </div>
  </footer>

  <script>
    // Só o menu mobile: as landings não carregam GSAP nem a cena Spline —
    // são páginas de entrada e precisam abrir rápido.
    document.getElementById('navHamburger')?.addEventListener('click', () =>
      document.getElementById('navMobile')?.classList.add('active'));
    document.getElementById('navClose')?.addEventListener('click', () =>
      document.getElementById('navMobile')?.classList.remove('active'));
    document.querySelectorAll('.nav-mobile-links a').forEach((a) =>
      a.addEventListener('click', () => document.getElementById('navMobile')?.classList.remove('active')));
    addEventListener('scroll', () =>
      document.getElementById('navbar')?.classList.toggle('scrolled', scrollY > 50), { passive: true });
  </script>
</body>

</html>
`;
}

let n = 0;
for (const page of Object.values(PAGES)) {
  const html = head(page) + '\n<body>\n' + nav(page) + body(page) + footer(page);
  const dir = join(ROOT, 'dist', page.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html, 'utf8');
  console.log(`  ✓ dist/${page.slug}/index.html  (${(html.length / 1024).toFixed(1)} KB)`);
  n++;
}
console.log(`\n✓ ${n} landing pages geradas`);
