# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-page marketing website for **ApexVilla** (agência digital em Goiânia, Brasil — sites, tráfego pago, automação IA, sistemas SaaS), live at https://apexvilla.com.br. Content is written in pt-BR with a Spanish translation layer.

The actual project lives in the `apex-villa/` subdirectory — the repo root only holds a stray `package-lock.json`. Run all commands from `apex-villa/`.

## ⚠️ Read this before touching the build

**`dist/` is AHEAD of the source files, not generated from them. `npm run build` would destroy the live site.**

Someone ran a large performance/SEO pass directly on `dist/` and never backported it. Verified July 2026 — present in `dist/index.html` but **absent from `index.html`**:

| | `dist/` | source |
|---|---|---|
| `<picture>` + AVIF/WebP responsive images (`dist/img/`) | 20 refs | 0 — uses `images/*.png` |
| FAQ JSON-LD questions | 11 (incl. entity Q&A) | 5 |
| Self-hosted fonts (`dist/fonts/*.woff2`) | 5 files | none — Google Fonts CDN |
| Inline critical CSS | yes | no |
| AdSense | lazy, 3s after load | render-blocking `<script async>` |
| JSON-LD email | `contato@apexvilla.com.br` | a personal address |
| LinkedIn in `sameAs` | yes | no |
| `#work` live-portfolio section + `assets/showcase-*.{css,js}` + `img/work/*.webp` | yes | absent |

Consequences for any change here:

- **Do not run `npm run build`** until the backport is done. It silently reverts every row above. (`node_modules` isn't even installed, so it would fail first anyway.)
- **Edit `dist/` for anything user-visible.** It is the deployed artifact and the effective source of truth.
- Mirror edits into the source file too when cheap, so the backlog doesn't grow.
- `dist.bkp-*` are manual backups; don't edit them.

The real fix is backporting `dist/` → source and configuring Vite (there is no `vite.config.*`) to reproduce AVIF, self-hosted fonts, and inline critical CSS. Until then the source tree is a stale ancestor.

## Commands

```bash
cd apex-villa
npm run build:static   # regenerate dist/es/ + the 6 landing pages — run after ANY dist/index.html,
                       # i18n.js or landings.content.mjs edit. Plain node, no deps, safe to run.
npm run build:es       # just dist/es/index.html
npm run build:landings # just the 6 landing pages
./optimize-images.sh   # optimize PNG/JPEG images before committing them
npm run dev            # Vite dev server — serves the STALE source, not what's live
npm run build          # ⚠️ see the warning above — do not run
```

To check the real output, serve `dist/` statically (`python3 -m http.server` from inside `dist/`) — note this gives real 404s, whereas production's SPA fallback returns 200 for missing paths.

There are no tests or linters. Git may complain about "dubious ownership"; fix with `git config --global --add safe.directory /root/apexvilla/sites/apexvilla`.

## Architecture

Vanilla HTML/CSS/JS bundled by Vite (no framework). Source files:

- `index.html` — the entire site: all sections, plus heavy SEO head (meta keywords pt+es, hreflang, Open Graph, JSON-LD: Organization, services, FAQ).
- `style.css` — single stylesheet.
- `script.js` — entry point; GSAP animations, imports `fan-carousel.js` and `spline-scene.js` (Spline 3D via `@splinetool/runtime`).
- `i18n.js` — pt→es dictionary + runtime translation for the ES button.
- `build-es.mjs` — generates the static `dist/es/` homepage (see below).
- `build-landings.mjs` + `landings.content.mjs` — generate the 6 service landing pages (see below).
- `components/ui/*.tsx` — React design references only; nothing imports them, not part of the build.

### `dist/links/` and `dist/es/links/` — hand-written, not generated

The link-in-bio hub (WhatsApp / Instagram / e-mail / endereço / serviços) lives **only in `dist/`**. It is not a Vite entry, not produced by `build-static`, and has no source-tree counterpart — a full `npm run build` would delete it. Both language versions are standalone single-file pages (inline CSS/JS, self-hosted fonts from `/fonts/`, zero external requests); the ES copy is a hand-translated duplicate, so **edit both** or they drift. Assets: `dist/img/ceo-avatar.webp` and `dist/links-og.jpg` (generated from `dist/images/ceoapexvilla.png` + `images/logo-gold.png`). Their hreflang cluster must keep matching `dist/sitemap.xml` (pt-BR, es, es-VE, es-419, x-default).

**The files that ship are `dist/sitemap.xml`, `dist/robots.txt`, `dist/llms.txt`** — the copies at `apex-villa/` root are stale and not deployed (the root `sitemap.xml` still lists 7 URLs that don't exist). **Never `cp` a root copy over the `dist/` one** — that swaps the live sitemap for the broken one; it happened on 2026-08-03 and there was no backup to restore from.

`dist/sitemap.xml` is now **generated**: `node tools-showcase/build-sitemap.mjs` (from `apex-villa/`). It skips any page whose directory is missing from `dist/` and copies each `hreflang` block straight out of the page's `<head>`, so the sitemap can't drift from the pages. Rerun it after publishing or removing a page. `robots.txt` and `llms.txt` are still hand-maintained.

## The two Spanish paths

Spanish exists twice, and both must stay in sync with `translations` in `i18n.js`:

1. **`dist/es/index.html`** — static, generated by `node build-es.mjs` from `dist/index.html`. This is what crawlers and `hreflang` see. Regenerate it after any change to `dist/index.html` or `i18n.js`, or `/es/` silently drifts out of date.
2. **The ES button** — `i18n.js` translates text nodes in place at runtime. Only relevant to users who click it.

**i18n constraint:** dictionary keys must match the rendered Portuguese *exactly* (including trailing spaces — some keys deliberately end with one, e.g. `"Tecnologia "`, because the text node ends mid-sentence before a `<span>`). Change visible Portuguese text and you must update the matching key.

`translateText()` is **exact-match only, by design.** It used to fall back to substring replacement, which mangled untranslated sentences into pt/es hybrids ("Planilhas y sistemas travam", "tráfico pagado triplicou") because short keys like `"com"` and `"e"` match inside any sentence. Do not reintroduce it. Unmatched text now stays Portuguese, which doubles as the signal that a key is missing.

Coverage is ~90% (366/401 visible strings). The rest are prices, client names, and tech stacks that correctly stay untranslated. To audit coverage, extract the `translations` object and diff it against the text nodes of `dist/index.html`.

`window.currentLang` and the `langChanged` event are what `script.js` listens to for language-dependent animated text.

## Deliberately absent — do not "restore" these

- **AdSense.** The script loaded on all 9 pages with **zero `<ins class="adsbygoogle">` slots**, so it earned nothing while pulling a `sodar` beacon (13 KB — ~90% of a landing page's weight) and exposing lead traffic to Google's ad network. Removed 2026-07-16. The landings now make **zero third-party requests**. If it ever returns it needs actual ad slots and an LGPD review — and consider that ads on a lead-gen page can show competitors to your leads.
- **LinkedIn.** `linkedin.com/company/apexvilla` **404s** (verified against a real profile, which returns 200). It was in the footer and, worse, in the JSON-LD `sameAs` — asserting a nonexistent profile to Google. That *weakens* brand-entity confidence, which is the same signal that makes LLMs confuse ApexVilla with the unrelated "Apex Engenharia". Re-add only if the profile is really created, in both the footer (`UI` in `landings.content.mjs`, `dist/index.html`) and `sameAs`.
- **`aggregateRating`.** Fabricated 4.9/237. See below.
- **The visit-counter badge.** Removed 2026-08-02. It rendered `500 + <real hits>` — the real number was **122**, so the badge inflated it 5×, the same fabricated-metric problem as `aggregateRating`. It also pulled `abacus.jasoncameron.dev` (a hobby service) on every load. The fetch lives in the hashed bundle but returns early when `#visit-count-text` is absent, so deleting the markup was enough — no bundle edit, no cache-contract risk.
- **The `#blog` section.** Removed 2026-08-02. Four article cards ("Como a IA está transformando vendas em 2026", etc.) that were never written — every CTA pointed at `#contact`. A visitor clicking an article headline landed on a contact form. Its nav entries are gone from `dist/index.html`, the source `index.html` and `landings.content.mjs` (`nav` arrays). If a real blog ever ships it needs actual post URLs, not anchors.
- **Filter counts on `#work` chips.** The chips deliberately show no item count: an exposed "15" tells the visitor exactly how small the portfolio is, where an uncounted reel reads as "keep scrolling".

## Editing `dist/assets/*` — the cache contract

**Never change a hashed asset's contents without renaming it.** `nginx/default.conf` serves `/assets/` as `immutable, max-age=31536000`. That header is a promise: *this filename's bytes never change*, so browsers cache it for a year and **never revalidate**. Patch a file in place and every returning visitor keeps the old code forever — the fix reaches only cold caches, and you'll "verify" it fine in a fresh browser while real users see the bug.

The full rename procedure (used on 2026-07-16 for the form patch):

1. Patch a **copy** in a scratch dir (hardlink the tree with `cp -al`, then break the link on the file you're editing — otherwise you're editing production, which is bind-mounted live).
2. Validate syntax by copying to a **`.mjs`** and running `node --check`. Checking the `.js` in place is **useless**: `package.json` says `"type": "commonjs"`, so node parses the ES module as CJS and dies on `import` regardless of correctness.
3. Test in a real browser against a local server on the scratch tree.
4. Rename with a fresh content hash and **grep the whole tree, not just HTML** — `assets/runtime-*.js` imports the main bundle by name, and a missed reference silently kills the Spline scene.
5. Swap with `cp` + `mv` (atomic), then re-verify in production.

`assets/index-7Unf1JtX.js` and `index-D7sbJuhl.js` are **orphans** from older builds — nothing references them. Left in place (harmless, and a rebuild would rewrite the directory anyway).

## Lead capture

The collector runs as uid 1000 with a read-only filesystem and no capabilities. `/root/apexvilla/leads` belongs to uid 1000 (dir 700, file 600): keep that ownership if you recreate the folder.

Every form submission is persisted on the VPS **before** the WhatsApp hand-off, so a visitor who abandons WhatsApp (or whose popup is blocked, or who has no WhatsApp) still leaves a record. Previously those leads vanished with no trace.

| Piece | Where |
|---|---|
| Collector (zero deps, ~100 lines) | `/root/apexvilla/deploy/lead-collector/server.mjs` → container `apexvilla-leads` |
| Stored leads | `/root/apexvilla/leads/leads.jsonl` (JSONL, append-only, `chmod 700`) |
| Route | `POST https://apexvilla.com.br/api/lead` (Traefik, `priority: 200`) |
| Reading them | `npm run leads` (last 20) · `npm run leads --all` · `npm run leads:csv > file.csv` |

Design constraints, each load-bearing:

- **Leads live outside `dist/`.** Inside it, nginx would serve your clients' names, phones and emails as a public file. Verified: `/leads.jsonl` and a `../` traversal both 404.
- **The client uses `navigator.sendBeacon`, not `fetch`.** The page navigates to WhatsApp immediately after; a pending `fetch` would be cancelled. sendBeacon is delivered during unload — that is its purpose.
- **A collector failure must never block the visitor.** The beacon is wrapped in `try/catch` and the WhatsApp hand-off runs regardless. Losing the record is bad; losing the sale is worse.
- **The Traefik router needs `priority: 200`.** The site's rule is a bare `Host(...)` which would otherwise swallow `/api/lead` and land the POST on nginx (405).
- **Rate limit: 5/min per IP, in memory**, plus an 8 KB body cap and required name+phone. It's a public endpoint; it will eventually be found by spam. The limiter resets on container restart, which is fine — it's anti-flood, not accounting.
- The hand-off fix (`window.open` inside the submit gesture, `location.href` fallback) is in **both** `dist/assets/index-*.js` and the source `script.js`, so a rebuild keeps it.

**LGPD:** this now stores personal data (name, phone, email, IP, user-agent) on the VPS indefinitely. There is no retention policy, no consent record, and no privacy notice on the form. That's a real gap to close before this scales.

## `#work` — the live portfolio (added 2026-08-02)

The section between `#portfolio` and `#testimonials` in `dist/index.html`. It shows **real screenshots of client sites that are actually up**, in a browser frame; hovering scrolls the page inside the frame. Built to beat a competitor's Divi/TileScroll portfolio.

- **Nothing here is a mockup.** `dist/img/work/<slug>.webp` is a real capture of the live site, all normalized to **640×1600** — the CSS hover (`translateY(-75%)`) depends on that exact ratio. Re-capture with the same pipeline or the scroll overshoots.
- Capture pipeline: headless Chromium (`playwright-core` borrowed from `/root/apex-erp/frontend/node_modules`) at 1440×900, full-page, scroll-primed for lazy images, then `cwebp -q 68 -crop 0 0 1440 <=3600 -resize 640 0`. ~40–70 KB each, all `loading="lazy"`.
- **The horizontal flow is CSS `position: sticky`, not GSAP** — deliberately, so it can't fight the existing GSAP/Spline animations. `.wk__flow` gets an inline height from JS (`distance + innerHeight`); `.wk__stage` sticks and the track is translated by scroll progress.
- **Never put `overflow: hidden` on `.wk`.** That makes the section a scroll container and silently kills the sticky pin — the cards fly off above the viewport. `.wk__stage` does the clipping.
- Under 1024px, or with `prefers-reduced-motion`, the flow degrades to a plain grid (CSS) and the JS skips all scroll math.
- Tooling lives in `apex-villa/tools-showcase/`: `capture.mjs` (screenshots), `build-showcase.mjs` (markup + injection; content is in its `SITES`/`SYS` arrays, **not** in the HTML), `rehash.mjs` (republish assets under a new hash), plus the `showcase.css`/`showcase.js` sources. `build-showcase.mjs` refuses to run if `#work` already exists — restore `dist/index.html` first, then re-inject.
- `assets/showcase-*.{css,js}` follow the same cache contract as the rest of `/assets/`: **rename on every edit** (`rehash.mjs` does it and deletes the old file).
- The 12 client names, 12 URLs and 15 card descriptions are all in `i18n.js`, so `/es/` translates them. Adding a card means adding its strings there and rerunning `npm run build:static`.

## Known debt
- **Logo intrinsic size is wrong.** `dist/index.html` declares `width="68" height="68"` for a 1024×682 (3:2) image. Measured CLS is currently 0 because CSS pins the height, so this is cosmetic correctness, not an active bug.
- **Stats in `landings.content.mjs` carry inline sources** (Sensor Tower, Airship) matching the homepage's Google/Stanford convention. If you change a number, change the source with it — and re-check it, don't trust the old citation.

## Routing and SEO invariants

- Never list a URL in `sitemap.xml` unless its directory exists in `dist/`. On the old host every unknown path returns 200 + the homepage, so a bogus sitemap entry becomes duplicate content rather than a visible 404.
- `hreflang` in `dist/index.html`, `dist/es/index.html`, each landing page and `dist/sitemap.xml` must agree exactly and be reciprocal, or Google discards the whole language cluster. The old sitemap said `/?lang=es` while the page said `/es/` — that contradiction alone voided it.
- Do not add `aggregateRating` to JSON-LD without real, verifiable reviews — it was removed for being fabricated (4.9/237) and risks a structured-data penalty.
- Keep `dist/llms.txt` anchors in sync with the real section ids (`#services`, `#about`, `#process` — *not* `#servicos`, `#sobre`, `#processo`, which is what it shipped with).

## Content-Security-Policy

The CSP lives in `/root/apexvilla/deploy/nginx/default.conf`, on the two locations that serve HTML (`add_header` in a location replaces the ones from `server`). `script-src` allows the inline scripts of `dist/` by SHA-256.

**After editing any inline `<script>` in `dist/`, run `python3 operations/csp-hashes.py`.** A missing hash means the browser blocks that script. Update the policy and run `docker exec apexvilla-web nginx -t && docker exec apexvilla-web nginx -s reload`.

Adding a new external host (script, API, frame) also needs an entry in the policy. A console violation for `eval` from the Spline runtime is expected: it probes `new Function` and falls back.

## Deployment

**This VPS (`144.91.103.224`) now serves apexvilla.com.br** — Traefik v3.5 (`apex-traefik`, file provider) → `apexvilla-web` (nginx:alpine) → `dist/`. Migrated from `144.91.120.89` on 2026-07-16; that old host is untouched and is the rollback target (point DNS back at it).

DNS is at **GoDaddy** (`ns17/ns18.domaincontrol.com`) — panel only, no API credentials here.

`dist/_redirects` (Netlify) and `dist/.htaccess` (Apache) are **dead files** — no host ever ran Netlify or Apache, so neither the www→apex 301 nor the old SPA fallback ever came from them. Don't edit them expecting an effect.

| Path | Role |
|---|---|
| `/root/apexvilla/deploy/docker-compose.yml` | `apexvilla-web`, mounts `dist/` read-only on network `apex_apex-edge` |
| `/root/apexvilla/deploy/nginx/default.conf` | serving rules: **no SPA catch-all**, legacy 301s, cache, gzip |
| `/root/apex-erp/deploy/traefik/dynamic/apexvilla.yml` | Traefik router, TLS (`le` resolver), www→apex 301 |

**Publishing = regenerating files.** The `dist/` mount is live; no restart, no rebuild.

### Three traps that already bit, in order of nastiness

1. **Never bind-mount a single config file.** The compose mounts the `nginx/` *directory* for a reason. With a single-file mount Docker pins the **inode**; any editor that saves by rename swaps the inode on the host and the container keeps reading the old file **forever**. The symptom is brutal: the file on disk is right, `nginx -t` passes, `nginx -s reload` succeeds, and the served behaviour never changes. Diagnose with `stat -c %i` on both sides.
2. **`absolute_redirect off` does not apply to `return`.** Traefik terminates TLS and speaks HTTP to nginx, so nginx builds `Location: http://…` and every legacy 301 costs a second hop. The legacy redirects therefore hardcode `https://apexvilla.com.br`. Single-domain server, so that's safe; if it ever serves a second domain, switch to a `$http_x_forwarded_proto` map.
3. **`dig` is not installed.** It returns empty, which reads as "no DNS record" — it already produced one wrong conclusion ("www doesn't resolve"). Use `getent hosts` or `host`.

Also: the healthcheck must use `127.0.0.1`, never `localhost` — `localhost` resolves to `::1` first and nginx's `listen 80` is IPv4-only, giving a false "unhealthy" while the site serves fine.

### If the cert ever needs reissuing

ACME uses an HTTP challenge, so the domain must already resolve here. Failed validations are rate-limited to **5 per hostname per hour** — if a router is left enabled while DNS points elsewhere, Traefik burns that quota and the cert is delayed exactly when you need it. Park the router as `apexvilla.yml.disabled` while DNS is wrong; the file provider hot-reloads on rename.

### Verifying

```bash
curl -sI https://apexvilla.com.br/es/ | head -1          # 200, and lang="es" in the body
curl -s -o /dev/null -w '%{http_code}' https://apexvilla.com.br/naoexiste/   # must be 404
curl -sI https://apexvilla.com.br/sobre | grep -i location                   # must be https://
C=$(docker inspect apexvilla-web --format '{{(index .NetworkSettings.Networks "apex_apex-edge").IPAddress}}')
```

Note the `index` in that template — `.Networks.apex_apex-edge` fails to parse because of the hyphen.

## Landing pages

Six generated service pages (3 pt + 3 es), one per keyword cluster, because anchors on a single-page site can't rank for specific terms:

| pt-BR | es-419 |
|---|---|
| `/criacao-de-sites/` | `/es/creacion-de-sitios-web/` |
| `/desenvolvimento-de-aplicativos/` | `/es/desarrollo-de-aplicaciones/` |
| `/sistemas-sob-medida/` | `/es/sistemas-a-medida/` |

- **Copy lives in `landings.content.mjs`**, not in HTML. Edit content there and rerun `npm run build:static`; never hand-edit `dist/<slug>/index.html`, it gets overwritten.
- The pt slugs are fixed by the footer links in `dist/index.html` — changing a slug means changing the footer, `PAIRS`, and the sitemap together.
- `PAIRS` in `landings.content.mjs` drives three things at once: hreflang pairing, the language switcher (which points at the *equivalent* page, not the homepage), and the ES homepage footer rewrite in `build-es.mjs`.
- `build-landings.mjs` reuses the critical CSS, fonts and CSS bundle by regex-matching `dist/index.html`. **If `dist/index.html`'s head changes shape, those `grab()` calls throw** — deliberately, so the landings can't silently render unstyled. Fix the pattern rather than deleting the guard.
- Landings intentionally don't load GSAP or the Spline scene — they're entry points and must open fast. They ship a ~10-line inline script for the mobile menu only.
- Adding a landing page: add it to `PAGES` + `PAIRS`, add both URLs to `dist/sitemap.xml`, and link it from the footer in `UI`.

### Landing `/es/sitio-web/` — Google Ads Venezuela (22/11/2026)

Página escrita à mão, isolada, só em espanhol. Não entra no `build-static` e não tem par em pt-BR. Campanha Black Friday, US$ 113, um único destino: WhatsApp.

| Arquivo | Papel |
|---|---|
| `dist/es/sitio-web/index.html` | a landing (CSS inline, fontes de `/fonts/`, sem menu) |
| `dist/es/sitio-web/sitio-web.js` | partículas do hero + `GOOGLE_ADS_ID` / `GOOGLE_ADS_CONVERSION` |
| `dist/es/privacidad/index.html` | política linkada no rodapé |
| `dist/img/sitio-web/*.webp` | recortes de sites reais de clientes |

Trocar o ID do Google Ads é editar as duas constantes no topo do `sitio-web.js` e salvar. Enquanto forem `AW-XXXXXXXXXX`, o gtag.js não carrega. O nginx serve `/es/sitio-web/` com `no-cache` e com uma CSP própria (`location ^~` em `deploy/nginx/default.conf`) que libera os hosts do Google **só nesta página**. Não há script inline aqui, então não há hash de CSP para manter.
