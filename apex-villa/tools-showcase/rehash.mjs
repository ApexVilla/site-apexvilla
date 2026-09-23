/* Re-publica showcase.css / showcase.js com hash novo no nome e troca a
   referência em dist/index.html. Nome novo = contrato de cache respeitado. */
import { readFileSync, writeFileSync, copyFileSync, unlinkSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const DIST = '/root/apexvilla/sites/apexvilla/apex-villa/dist';
const SCRATCH = '/root/apexvilla/sites/apexvilla/apex-villa/tools-showcase';
const file = `${DIST}/index.html`;
let html = readFileSync(file, 'utf8');

for (const ext of ['css', 'js']) {
  const src = `${SCRATCH}/showcase.${ext}`;
  const body = readFileSync(src, 'utf8');
  const name = `showcase-${createHash('sha256').update(body).digest('base64url').slice(0, 8)}.${ext}`;
  const re = new RegExp(`assets/showcase-[A-Za-z0-9_-]+\\.${ext}`);
  const old = (html.match(re) || [])[0];
  if (old === `assets/${name}`) { console.log(`${ext}: sem mudança (${name})`); continue; }
  copyFileSync(src, `${DIST}/assets/${name}`);
  html = html.split(old).join(`assets/${name}`);
  if (old && existsSync(`${DIST}/${old}`)) unlinkSync(`${DIST}/${old}`);
  console.log(`${ext}: ${old} -> assets/${name}`);
}

writeFileSync(file, html);
