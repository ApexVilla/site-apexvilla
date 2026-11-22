/* Landing /es/sitio-web/ — Google Ads (Venezuela, Black Friday US$ 113).
 *
 * Troque os dois valores abaixo pelos do Google Ads e salve: o nginx serve este
 * arquivo com "no-cache", então vale na próxima visita (sem renomear, sem build).
 *   GOOGLE_ADS_ID          → Google Ads › Ferramentas › Conversões › Configuração da tag: "AW-123456789"
 *   GOOGLE_ADS_CONVERSION  → o "send_to" da ação de conversão:                         "AW-123456789/AbCdEfGh"
 * Enquanto algum dos dois for o placeholder, o gtag.js não é carregado e o clique
 * no WhatsApp só abre o WhatsApp — sem erro no console.
 */
/* Carrossel do hero: troca os sites reais o tempo todo (mobile e desktop). */
(() => {
  const img = document.getElementById('hero-site-img');
  const cap = document.getElementById('hero-site-cap');
  const dots = document.getElementById('hero-site-dots');
  if (!img || !cap || !dots) return;

  const SITES = [
    ['mitsujas', 'Mitsujas Guayana', 'Puerto Ordaz'],
    ['despacho', 'Despacho de Abogados AP', 'Abogacía'],
    ['wladimir', 'Wladimir Cova 360', 'Suministro industrial'],
    ['futuristas', 'Futuristas de la Radio', 'Academia de locución'],
    ['drasory', 'Dra. Sory', 'Pediatría y lactancia'],
    ['servidmed', 'Servid Med ELAM', 'Planes odontológicos'],
    ['beritolam', 'Berit Olam', 'Vestidos de novia'],
    ['elsangela', 'Elsângela Melo', 'Biomedicina estética'],
    ['fenix', 'Fênix Funerária', 'Planes funerarios'],
    ['carlyle', 'Renato Carlyle', 'Mentoría ejecutiva'],
    ['sfera', 'SFERA', 'Integración e IA'],
    ['infinity', 'Infinity.ai', 'Automatización B2B'],
  ];

  let i = 0;
  let timer = 0;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const srcOf = (slug) => '/img/sitio-web/' + slug + '-640x480.webp';

  function paint(index, animate) {
    const [slug, name, place] = SITES[index];
    const nextSrc = srcOf(slug);
    const apply = () => {
      img.src = nextSrc;
      img.alt = 'Sitio web de ' + name + ', hecho por ApexVilla';
      cap.innerHTML = 'Sitio real: <strong>' + name + '</strong> · ' + place;
      [...dots.children].forEach((b, n) => b.setAttribute('aria-current', n === index ? 'true' : 'false'));
      img.classList.remove('is-out');
      cap.classList.remove('is-out');
    };
    if (!animate) {
      apply();
      return;
    }
    img.classList.add('is-out');
    cap.classList.add('is-out');
    window.setTimeout(apply, 280);
  }

  function preload(index) {
    const a = new Image();
    a.src = srcOf(SITES[index][0]);
  }

  SITES.forEach((_, n) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Ver ' + SITES[n][1]);
    b.addEventListener('click', () => {
      i = n;
      paint(i, true);
      preload((i + 1) % SITES.length);
      arm();
    });
    dots.appendChild(b);
  });

  function step() {
    i = (i + 1) % SITES.length;
    paint(i, true);
    preload((i + 1) % SITES.length);
  }

  function arm() {
    if (reduce) return;
    window.clearInterval(timer);
    timer = window.setInterval(step, 3200);
  }

  paint(0, false);
  preload(1);
  arm();

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') window.clearInterval(timer);
    else arm();
  });
})();

/* Partículas douradas do hero — a mesma ideia da home, só dentro desta seção.
   Não depende do Google Ads: roda mesmo com o ID ainda em placeholder. */
(() => {
  const canvas = document.getElementById('particulas');
  if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const mobile = matchMedia('(max-width: 700px)').matches;
  const COUNT = mobile ? 26 : 58;
  const MAX = mobile ? 88 : 128;
  let w = 0;
  let h = 0;
  let particles = [];
  let running = true;

  function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = Math.max(1, r.width);
    h = Math.max(1, r.height);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn() {
    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.26,
      vy: (Math.random() - 0.5) * 0.26,
      r: Math.random() * 1.3 + 0.45,
      o: 0.28 + Math.random() * 0.4,
    }));
  }

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,175,55,${p.o})`;
      ctx.fill();
    }
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MAX) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(212,175,55,${(1 - dist / MAX) * 0.16})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(frame);
  }

  resize();
  spawn();
  addEventListener('resize', () => { resize(); spawn(); });
  document.addEventListener('visibilitychange', () => {
    const visible = document.visibilityState === 'visible';
    if (visible && !running) {
      running = true;
      frame();
      return;
    }
    running = visible;
  });
  frame();
})();

const GOOGLE_ADS_ID = 'AW-XXXXXXXXXX';
const GOOGLE_ADS_CONVERSION = 'AW-XXXXXXXXXX/YYYYYYYY';

(() => {
  const idOk = /^AW-\d+$/.test(GOOGLE_ADS_ID);
  const conversionOk = idOk && /^AW-\d+\/[\w-]+$/.test(GOOGLE_ADS_CONVERSION);
  if (!idOk) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag('js', new Date());
  gtag('config', GOOGLE_ADS_ID);

  // O gtag.js entra depois do load e com o navegador ocioso: não disputa a
  // renderização da página. Cliques feitos antes disso ficam na fila do
  // dataLayer e são enviados quando ele carregar (o WhatsApp abre em outra aba,
  // então esta página continua aberta).
  const load = () => {
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GOOGLE_ADS_ID);
    document.head.appendChild(s);
  };
  const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(load, { timeout: 2000 }) : setTimeout(load, 200));
  if (document.readyState === 'complete') idle();
  else addEventListener('load', idle, { once: true });

  if (!conversionOk) return;
  const onClick = (e) => {
    const a = e.target instanceof Element && e.target.closest('a[href^="https://wa.me/"]');
    if (a) gtag('event', 'conversion', { send_to: GOOGLE_ADS_CONVERSION });
  };
  document.addEventListener('click', onClick);
  // Clique com o botão do meio (abrir em nova aba) também é contato.
  document.addEventListener('auxclick', (e) => { if (e.button === 1) onClick(e); });
})();
