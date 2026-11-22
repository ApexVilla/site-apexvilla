/* Gera dist/sitemap.xml a partir das próprias páginas publicadas.
   Cada <url> só entra se o diretório existir em dist/, e o bloco hreflang é
   COPIADO do <head> da página — então o sitemap não tem como divergir das
   páginas (era a invariante que o sitemap escrito à mão vivia quebrando).

   Uso: node tools-showcase/build-sitemap.mjs   (a partir de apex-villa/) */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const DIST = new URL('../dist/', import.meta.url).pathname;
const BASE = 'https://apexvilla.com.br';

/* [caminho do arquivo, URL, changefreq, priority, imagem opcional [loc, título]] */
const PAGES = [
  ['index.html',                             '/',                            'weekly',  '1.0', ['/img/hero_tech-896.webp', 'ApexVilla — Agência Digital & IA em Goiânia']],
  ['es/index.html',                          '/es/',                         'weekly',  '0.9', ['/img/hero_tech-896.webp', 'ApexVilla — Agencia Digital e IA']],
  ['criacao-de-sites/index.html',            '/criacao-de-sites/',           'monthly', '0.9'],
  ['desenvolvimento-de-aplicativos/index.html','/desenvolvimento-de-aplicativos/','monthly','0.9'],
  ['sistemas-sob-medida/index.html',         '/sistemas-sob-medida/',        'monthly', '0.9'],
  ['es/creacion-de-sitios-web/index.html',   '/es/creacion-de-sitios-web/',  'monthly', '0.8'],
  ['es/desarrollo-de-aplicaciones/index.html','/es/desarrollo-de-aplicaciones/','monthly','0.8'],
  ['es/sistemas-a-medida/index.html',        '/es/sistemas-a-medida/',       'monthly', '0.8'],
  ['links/index.html',                       '/links/',                      'monthly', '0.8', ['/links-og.jpg', 'ApexVilla — Links Oficiais']],
  ['es/links/index.html',                    '/es/links/',                   'monthly', '0.8', ['/links-og.jpg', 'ApexVilla — Enlaces Oficiales']],
  ['es/sitio-web/index.html',                '/es/sitio-web/',               'weekly',  '0.8'],
  ['es/privacidad/index.html',               '/es/privacidad/',              'yearly',  '0.3'],
];

const today = process.argv[2] || '2026-08-03';
const out = [];
const skipped = [];

for (const [file, url, freq, prio, img] of PAGES) {
  const path = DIST + file;
  if (!existsSync(path)) { skipped.push(url); continue; }

  const head = readFileSync(path, 'utf8');
  const alts = [...head.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)]
    .map(m => `    <xhtml:link rel="alternate" hreflang="${m[1]}" href="${m[2]}"/>`);

  out.push([
    '  <url>',
    `    <loc>${BASE}${url}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    `    <changefreq>${freq}</changefreq>`,
    `    <priority>${prio}</priority>`,
    ...alts,
    ...(img ? [
      '    <image:image>',
      `      <image:loc>${BASE}${img[0]}</image:loc>`,
      `      <image:title>${img[1].replace(/&/g, '&amp;')}</image:title>`,
      '    </image:image>',
    ] : []),
    '  </url>',
  ].join('\n'));
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Gerado por tools-showcase/build-sitemap.mjs a partir das páginas em dist/.
     Não editar à mão: rode o script depois de publicar/remover uma página. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${out.join('\n')}
</urlset>
`;

writeFileSync(DIST + 'sitemap.xml', xml);
console.log(`dist/sitemap.xml: ${out.length} URLs`);
if (skipped.length) console.log('ignoradas (diretório não existe em dist/): ' + skipped.join(', '));
