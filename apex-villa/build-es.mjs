/**
 * Gera dist/es/index.html — a versão estática em espanhol.
 *
 * Por que existe: o hreflang e o botão ES apontam para /es/, mas o site é uma
 * SPA traduzida em runtime. Crawler não clica em botão, então sem esta página
 * o Google só via português nas duas URLs. Aqui aplicamos o mesmo dicionário do
 * i18n.js em build time e emitimos HTML espanhol de verdade.
 *
 * Fonte da verdade é dist/index.html, NÃO index.html — veja CLAUDE.md.
 *
 * Uso: node build-es.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAIRS } from './landings.content.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'dist', 'index.html');
const OUT_DIR = join(ROOT, 'dist', 'es');
const OUT = join(OUT_DIR, 'index.html');

/** Extrai o objeto `translations` do i18n.js sem executar o resto do arquivo. */
function loadTranslations() {
  const js = readFileSync(join(ROOT, 'i18n.js'), 'utf8');
  const start = js.indexOf('const translations = {');
  if (start === -1) throw new Error('i18n.js: bloco `const translations = {` não encontrado');
  const open = js.indexOf('{', start);
  let depth = 0, end = -1;
  for (let i = open; i < js.length; i++) {
    if (js[i] === '{') depth++;
    else if (js[i] === '}') {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end === -1) throw new Error('i18n.js: objeto translations não fecha');
  return Function(`return ${js.slice(open, end + 1)}`)();
}

const translations = loadTranslations();
const normalize = (s) => s.replace(/\s+/g, ' ').trim();

const exact = new Map(Object.entries(translations).map(([pt, es]) => [normalize(pt), es]));

// O dicionário casa com o texto que o navegador enxerga (nodeValue, já
// decodificado), mas aqui manipulamos HTML cru. Decodificamos para consultar e
// recodificamos na volta, senão "CEO &amp; Fundador" nunca acha "CEO & Fundador".
const ENTITIES = [['&amp;', '&'], ['&thinsp;', ' '], ['&nbsp;', ' '],
                  ['&times;', '×'], ['&quot;', '"'], ['&#39;', "'"],
                  ['&lt;', '<'], ['&gt;', '>']];
const decode = (s) => ENTITIES.reduce((a, [e, c]) => a.replaceAll(e, c), s);
const encode = (s) => ENTITIES.reduce((a, [e, c]) => a.replaceAll(c, e), s);

/**
 * Espelha translateText() do i18n.js: só correspondência exata. Sem match,
 * devolve o português — nunca remendo de substring (veja a nota no i18n.js).
 */
function translateText(text) {
  const hit = exact.get(normalize(decode(text)));
  if (hit === undefined) return text;
  // Preserva o espaçamento de borda: várias chaves dependem dele
  // (ex.: "Tecnologia " com espaço no fim, que emenda no <span> seguinte).
  const [, lead = '', , trail = ''] = /^(\s*)([\s\S]*?)(\s*)$/.exec(text);
  return lead + encode(hit) + trail;
}

const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'template', 'code', 'pre']);

/**
 * Traduz os nós de texto de um fragmento HTML sem parser de DOM.
 * Tokeniza em tags vs texto e mantém uma pilha para pular subárvores de
 * script/style e de qualquer elemento com data-no-translate (o botão ES).
 */
function translateFragment(html) {
  let out = '';
  let skipDepth = 0;      // >0 enquanto dentro de uma subárvore ignorada
  let skipTag = null;      // tag que abriu a subárvore ignorada
  let i = 0;

  while (i < html.length) {
    const lt = html.indexOf('<', i);
    if (lt === -1) {
      out += skipDepth ? html.slice(i) : translateText(html.slice(i));
      break;
    }
    // Texto antes da próxima tag
    const text = html.slice(i, lt);
    out += skipDepth || !text.trim() ? text : translateText(text);

    // Comentários passam intactos
    if (html.startsWith('<!--', lt)) {
      const end = html.indexOf('-->', lt);
      const stop = end === -1 ? html.length : end + 3;
      out += html.slice(lt, stop);
      i = stop;
      continue;
    }

    const gt = html.indexOf('>', lt);
    if (gt === -1) { out += html.slice(lt); break; }
    const tag = html.slice(lt, gt + 1);
    out += tag;
    i = gt + 1;

    const m = /^<\/?\s*([a-zA-Z0-9-]+)/.exec(tag);
    if (!m) continue;
    const name = m[1].toLowerCase();
    const isClose = tag[1] === '/';
    const selfClosing = /\/>$/.test(tag) || name === 'br' || name === 'img' ||
                        name === 'input' || name === 'meta' || name === 'link' ||
                        name === 'source';

    if (skipDepth) {
      // Só conta aninhamento da mesma tag que abriu o skip.
      if (name === skipTag) isClose ? skipDepth-- : (selfClosing || skipDepth++);
      if (skipDepth === 0) skipTag = null;
      continue;
    }
    if (!isClose && !selfClosing && (SKIP_TAGS.has(name) || /\sdata-no-translate[\s>=]/.test(tag))) {
      skipDepth = 1;
      skipTag = name;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------

let html = readFileSync(SRC, 'utf8');

const bodyOpen = html.indexOf('<body');
const bodyStart = html.indexOf('>', bodyOpen) + 1;
const bodyEnd = html.lastIndexOf('</body>');
if (bodyOpen === -1 || bodyEnd === -1) throw new Error('dist/index.html: <body> não localizado');

let head = html.slice(0, bodyStart);
let body = html.slice(bodyStart, bodyEnd);
const tail = html.slice(bodyEnd);

// --- Corpo: traduz texto, placeholders e mensagens de WhatsApp -------------
body = translateFragment(body);

body = body.replace(/placeholder="([^"]*)"/g, (_, v) => `placeholder="${translateText(v)}"`);
body = body
  .replace(/Ol%C3%A1!\+Quero\+um\+diagn%C3%B3stico\+com\+ApexVilla/g,
           '%C2%A1Hola!+Quiero+un+diagn%C3%B3stico+con+ApexVilla')
  .replace(/Ol%C3%A1!\+Quero\+informacoes\+sobre\+ApexVilla/g,
           '%C2%A1Hola!+Quiero+informaci%C3%B3n+sobre+ApexVilla');

// Caminhos relativos quebram um nível abaixo, em /es/.
body = body.replace(/(src|href)="images\//g, '$1="/images/');

// As landings têm slug próprio por idioma; sem isto o rodapé em espanhol
// mandaria o leitor hispanohablante para a página em português.
for (const { pt, es } of PAIRS) body = body.replaceAll(`href="/${pt}/"`, `href="/${es}/"`);

// O seletor de idioma inverte: em /es/ o PT é que é o link de saída.
body = body.replace(/<a class="lang-btn" href="\/es\/"([^>]*)>ES<\/a>/,
                    '<a class="lang-btn active"$1>ES</a>');
// O PT já traz href="/"; só perde o .active, senão os dois ficam destacados.
body = body.replace(/<a class="lang-btn active"([^>]*)>PT<\/a>/,
                    '<a class="lang-btn"$1>PT</a>');

// --- Cabeça: metadados em espanhol -----------------------------------------
head = head.replace(/<html lang="pt-BR">/, '<html lang="es">');

// O redirect ?lang=es→/es/ só faz sentido na página portuguesa.
head = head.replace(/\s*<script>if \(\/\[\?&\]lang=es\\b\/\.test\(location\.search\)\) location\.replace\('\/es\/'\);<\/script>/, '');

head = head.replace(/<title>[\s\S]*?<\/title>/,
  '<title>Creación de Sitios Web, Aplicaciones y Sistemas | ApexVilla — Agencia Digital & IA</title>');

head = head.replace(/(<meta name="description"\s+content=")[^"]*(")/,
  '$1ApexVilla — Agencia digital especializada en creación de sitios web profesionales, desarrollo de aplicaciones móviles, sistemas SaaS a medida, automatización con inteligencia artificial y gestión de tráfico pagado (Google Ads, Meta Ads). Resultados medibles para empresas en América Latina.$2');

head = head.replace(/(<link rel="canonical" href=")[^"]*(")/, '$1https://apexvilla.com.br/es/$2');
head = head.replace(/<meta property="og:locale" content="pt_BR" \/>/, '<meta property="og:locale" content="es_419" />');
head = head.replace(/<meta property="og:locale:alternate" content="es_419" \/>/, '<meta property="og:locale:alternate" content="pt_BR" />');
head = head.replace(/(<meta property="og:url" content=")[^"]*(")/, '$1https://apexvilla.com.br/es/$2');
head = head.replace(/(<meta property="twitter:url" content=")[^"]*(")/, '$1https://apexvilla.com.br/es/$2');
head = head.replace(/(<meta name="language" content=")[^"]*(")/, '$1es$2');
head = head.replace(/(src|href)="images\//g, '$1="/images/');

// og/twitter title e description em espanhol
head = head.replace(/(<meta property="og:title" content=")[^"]*(")/,
  '$1ApexVilla | Agencia Digital: Sitios Web, Automatización IA & Sistemas SaaS$2');
head = head.replace(/(<meta property="og:description"\s+content=")[^"]*(")/,
  '$1Transformamos negocios con IA, sitios web de alta conversión, sistemas SaaS a medida y automatización inteligente. Tecnología premium para resultados reales y medibles.$2');
head = head.replace(/(<meta property="twitter:title" content=")[^"]*(")/,
  '$1ApexVilla | Agencia Digital: Sitios Web, IA & SaaS$2');
head = head.replace(/(<meta property="twitter:description"\s+content=")[^"]*(")/,
  '$1Sitios web de alta conversión, automatización con IA, sistemas SaaS y tráfico pagado. Resultados reales para tu negocio.$2');

// Keywords: mantém só o bloco em español (a metade pt não ajuda esta página).
head = head.replace(/(<meta name="keywords"\s+content=")[^"]*(")/,
  '$1agencia digital latinoamérica, creación de sitios web profesionales, creación de páginas web, desarrollo web profesional, desarrollo de sistemas a medida, creación de aplicaciones móviles, aplicación móvil iOS Android, sistema SaaS a medida, software a medida, automatización con inteligencia artificial, chatbot WhatsApp GPT, tráfico pagado Google Ads, Meta Ads Instagram, landing page alta conversión, marketing digital para empresas, agencia de tecnología, consultoría tecnológica, automatización de ventas, inteligencia artificial para negocios, ROI publicidad digital$2');

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, head + body + tail, 'utf8');
console.log(`✓ dist/es/index.html gerado (${((head + body + tail).length / 1024).toFixed(1)} KB)`);
