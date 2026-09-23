import pw from '/root/apex-erp/frontend/node_modules/playwright-core/index.js';
const { chromium } = pw;
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, statSync } from 'node:fs';

const OUT_RAW = '/tmp/apexvilla-shots';
const OUT_WEBP = '/root/apexvilla/sites/apexvilla/apex-villa/dist/img/work';
mkdirSync(OUT_RAW, { recursive: true });
mkdirSync(OUT_WEBP, { recursive: true });

const SITES = [
  ['infinity',     'https://home.infinity-ai.dev/'],
  ['sfera',        'https://sferalabs.org/'],
  ['drasory',      'https://drasorylm.com/'],
  ['elsangela',    'https://elsangelamelo.com/'],
  ['fenix',        'https://fenixfuneraria.com/'],
  ['futuristas',   'https://futuristasdelaradio.com/'],
  ['mitsujas',     'https://mitsujasguayana.com/'],
  ['carlyle',      'https://renatocarlyle.com/'],
  ['servidmed',    'https://servidmedelam.com/'],
  ['wladimir',     'https://wladimirsoluciones360.com/'],
  ['beritolam',    'https://promesaeterna.com.br/'],
  ['despacho',     'https://www.despachodeabogadosap.com/'],
];

const VW = 1440, VH = 900;
const MAX_SRC_H = 3600;   // recorta o topo da página (≈4 telas)
const OUT_W = 640;

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const ctx = await browser.newContext({
  viewport: { width: VW, height: VH },
  deviceScaleFactor: 1,
  locale: 'pt-BR',
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
});

const results = [];

for (const [slug, url] of SITES) {
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    try { await page.waitForLoadState('networkidle', { timeout: 12000 }); } catch {}

    // força o lazy-load: desce a página em passos e volta ao topo
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8;
      const max = Math.min(document.body.scrollHeight, 4200);
      for (let y = 0; y < max; y += step) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 220));
      }
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 600));
    });
    await page.waitForTimeout(900);

    // esconde barras fixas/cookie banners que grudariam no scroll do print
    await page.addStyleTag({
      content: `*{scroll-behavior:auto!important}
        [class*="cookie"],[id*="cookie"],[class*="consent"],[id*="consent"]{display:none!important}`
    });

    const raw = `${OUT_RAW}/${slug}.png`;
    await page.screenshot({ path: raw, fullPage: true, animations: 'disabled' });

    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    const cropH = Math.max(VH, Math.min(h, MAX_SRC_H));

    const out = `${OUT_WEBP}/${slug}.webp`;
    execFileSync('cwebp', [
      '-quiet', '-q', '68', '-m', '6',
      '-crop', '0', '0', String(VW), String(cropH),
      '-resize', String(OUT_W), '0',
      raw, '-o', out,
    ]);

    const kb = Math.round(statSync(out).size / 1024);
    const outH = Math.round(cropH * (OUT_W / VW));
    results.push({ slug, url, pageH: h, out: `${OUT_W}x${outH}`, kb });
    console.log(`ok   ${slug.padEnd(12)} ${String(kb).padStart(4)}KB  ${OUT_W}x${outH}  (página ${h}px)`);
  } catch (e) {
    results.push({ slug, url, error: String(e).split('\n')[0].slice(0, 110) });
    console.log(`FALHA ${slug.padEnd(12)} ${String(e).split('\n')[0].slice(0, 110)}`);
  } finally {
    await page.close();
  }
}

await browser.close();
writeFileSync(OUT_RAW + '/results.json', JSON.stringify(results, null, 2));
const okCount = results.filter(r => !r.error).length;
console.log(`\n${okCount}/${SITES.length} capturados`);
