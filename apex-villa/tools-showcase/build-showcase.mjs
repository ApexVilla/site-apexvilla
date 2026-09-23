import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const DIST = '/root/apexvilla/sites/apexvilla/apex-villa/dist';
const SCRATCH = '/root/apexvilla/sites/apexvilla/apex-villa/tools-showcase';

/* ── Projetos reais no ar (verificados: HTTP 200 em 02/08/2026) ── */
const SITES = [
  ['infinity',   'Infinity.ai',            'home.infinity-ai.dev',        'https://home.infinity-ai.dev/',        'Automação &amp; IA para operações B2B', 'br ia'],
  ['sfera',      'SFERA',                  'sferalabs.org',               'https://sferalabs.org/',               'Integração de sistemas e IA na gestão', 'br ia'],
  ['carlyle',    'Renato Carlyle',         'renatocarlyle.com',           'https://renatocarlyle.com/',           'Mentoria executiva C-Level',           'br'],
  ['elsangela',  'Elsângela Melo',         'elsangelamelo.com',           'https://elsangelamelo.com/',           'Biomedicina estética · Goiânia',       'br'],
  ['fenix',      'Fênix Funerária',        'fenixfuneraria.com',          'https://fenixfuneraria.com/',          'Planos funerários · Goiás',            'br'],
  ['beritolam',  'Berit Olam',             'promesaeterna.com.br',        'https://promesaeterna.com.br/',        'Vestidos de noiva sob medida',         'br latam'],
  ['drasory',    'Dra. Sory',              'drasorylm.com',               'https://drasorylm.com/',               'Pediatria e lactância',                'latam'],
  ['servidmed',  'Servid Med ELAM',        'servidmedelam.com',           'https://servidmedelam.com/',           'Planos odontológicos e visuais',       'latam'],
  ['mitsujas',   'Mitsujas Guayana',       'mitsujasguayana.com',         'https://mitsujasguayana.com/',         'Autopeças Mitsubishi · Puerto Ordaz',  'latam'],
  ['despacho',   'Despacho de Abogados AP','despachodeabogadosap.com',    'https://www.despachodeabogadosap.com/','Advocacia e defesa jurídica',          'latam'],
  ['futuristas', 'Futuristas de la Radio', 'futuristasdelaradio.com',     'https://futuristasdelaradio.com/',     'Academia de locução',                  'latam'],
  ['wladimir',   'Wladimir Cova 360',      'wladimirsoluciones360.com',   'https://wladimirsoluciones360.com/',   'Suprimento industrial integral',       'latam'],
];

/* Sistemas proprietários — atrás de login, por isso card sem print */
const SYS = [
  ['Apex-finanças', '+420%', 'Financiamentos, cobrança automática e contratos', 'sys'],
  ['Apex-estética', '24/7',  'Agenda inteligente, prontuário digital e CRM',    'sys'],
  ['Apex-glass',    '100%',  'Orçamentos, estoque técnico e fluxo de oficina',  'sys'],
];

const esc = s => s.replace(/&(?!amp;|lt;|gt;|#)/g, '&amp;');

const siteCard = ([slug, name, host, url, desc, cat]) => `
          <article class="wk-card" data-cat="site ${cat}">
            <a class="wk-frame" href="${url}" target="_blank" rel="noopener noreferrer"
              aria-label="Abrir ${esc(name)} em nova aba — ${host}">
              <span class="wk-chrome" aria-hidden="true">
                <i></i><i></i><i></i>
                <span class="wk-url">${host}</span>
              </span>
              <span class="wk-vp">
                <img class="wk-shot" src="/img/work/${slug}.webp" width="640" height="1600"
                  loading="lazy" decoding="async" alt="Site de ${esc(name)} desenvolvido pela ApexVilla" />
              </span>
              <span class="wk-live" aria-hidden="true"><i></i>no ar</span>
            </a>
            <div class="wk-meta">
              <h3>${esc(name)}</h3>
              <p>${desc}</p>
              <span class="wk-go">ver no ar <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 8.5 8.5 3.5M4.2 3.5h4.3v4.3"/></svg></span>
            </div>
          </article>`;

const sysCard = ([name, metric, desc, cat]) => `
          <article class="wk-card wk-card--sys" data-cat="${cat}">
            <a class="wk-frame" href="#contact" aria-label="Falar sobre um sistema como o ${esc(name)}">
              <span class="wk-chrome" aria-hidden="true">
                <i></i><i></i><i></i>
                <span class="wk-url">sistema proprietário · acesso restrito</span>
              </span>
              <span class="wk-vp">
                <span class="wk-sys">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="7" rx="1.8" />
                    <rect x="3" y="13" width="18" height="7" rx="1.8" />
                    <path d="M7 7.5h.01M7 16.5h.01" />
                  </svg>
                  <b>${metric}</b>
                  <span>${desc}</span>
                </span>
              </span>
            </a>
            <div class="wk-meta">
              <h3>${esc(name)}</h3>
              <p>Sistema SaaS proprietário</p>
              <span class="wk-go">quero um assim <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 8.5 8.5 3.5M4.2 3.5h4.3v4.3"/></svg></span>
            </div>
          </article>`;

const all = SITES.length + SYS.length;
const nBr = SITES.filter(s => s[5].includes('br')).length;
const nLat = SITES.filter(s => s[5].includes('latam')).length;
const nIa = SITES.filter(s => s[5].includes('ia')).length + SYS.length;

/* Sem contador de propósito: o número exposto entrega o tamanho da carteira.
   Sem ele, a régua vira "role para ver mais" em vez de "são só N". */
const chips = [
  ['all', 'Todos'],
  ['br', 'Brasil'],
  ['latam', 'LatAm'],
  ['ia', 'IA &amp; Sistemas'],
].map(([cat, label], i) => `
          <button class="wk__chip" type="button" data-cat="${cat}" aria-pressed="${i === 0}">${label}</button>`).join('');

const names = SITES.map(s => s[1]).concat(SYS.map(s => s[0]));
const marquee = names.concat(names).map(n => `<span>${esc(n)}</span>`).join('\n            ');

const SECTION = `
    <!-- ===================== PORTFÓLIO AO VIVO ===================== -->
    <section class="wk" id="work">
      <div class="container">
        <div class="section-header section-center wk__head">
          <span class="section-tag reveal">Portfólio ao Vivo</span>
          <h2 class="section-title wk__title">Projetos <em>no ar</em> agora</h2>
          <p class="section-desc reveal">Nada de mockup. É o site real do cliente, rodando neste momento — passe o mouse e a página rola dentro do frame.</p>
        </div>

        <div class="wk__filters" role="group" aria-label="Filtrar projetos">${chips}
        </div>
      </div>

      <div class="wk__flow">
        <div class="wk__stage">
          <div class="wk__track">${SITES.map(siteCard).join('')}${SYS.map(sysCard).join('')}
          </div>
          <div class="wk__rail" aria-hidden="true"><i></i></div>
          <p class="wk__hint">role para percorrer o portfólio</p>
        </div>
      </div>

      <div class="container">
        <div class="wk__band" aria-hidden="true">
          <div class="wk__marquee">
            ${marquee}
          </div>
        </div>
        <div class="wk__foot">
          <a href="#contact" class="btn btn-primary">Quero um projeto assim</a>
        </div>
      </div>
    </section>
`;

/* ── Assets com hash no nome (contrato de cache do /assets/) ── */
const css = readFileSync(`${SCRATCH}/showcase.css`, 'utf8');
const js = readFileSync(`${SCRATCH}/showcase.js`, 'utf8');
const h = s => createHash('sha256').update(s).digest('base64url').slice(0, 8);
const cssName = `showcase-${h(css)}.css`;
const jsName = `showcase-${h(js)}.js`;
copyFileSync(`${SCRATCH}/showcase.css`, `${DIST}/assets/${cssName}`);
copyFileSync(`${SCRATCH}/showcase.js`, `${DIST}/assets/${jsName}`);

/* ── Injeção no dist/index.html ── */
const file = `${DIST}/index.html`;
let html = readFileSync(file, 'utf8');

if (html.includes('id="work"')) throw new Error('A seção #work já existe — rode o rollback antes de reinjetar.');

const ANCHOR = '    <!-- ===================== TESTIMONIALS ===================== -->';
if (!html.includes(ANCHOR)) throw new Error('Âncora TESTIMONIALS não encontrada em dist/index.html');
html = html.replace(ANCHOR, SECTION + '\n' + ANCHOR);

const CSS_ANCHOR = '</head>';
html = html.replace(CSS_ANCHOR, `  <link rel="stylesheet" href="/assets/${cssName}" />\n</head>`);

const JS_ANCHOR = '</body>';
html = html.replace(JS_ANCHOR, `  <script src="/assets/${jsName}" defer></script>\n</body>`);

writeFileSync(file, html);
console.log(`OK — seção #work injetada
   css: assets/${cssName}
   js : assets/${jsName}
   cards: ${SITES.length} sites + ${SYS.length} sistemas = ${all}`);
