/* Landing /es/sitio-web/ — Google Ads (Venezuela, Black Friday US$ 113).
 *
 * Troque os dois valores abaixo pelos do Google Ads e salve: o nginx serve este
 * arquivo com "no-cache", então vale na próxima visita (sem renomear, sem build).
 *   GOOGLE_ADS_ID          → Google Ads › Ferramentas › Conversões › Configuração da tag: "AW-123456789"
 *   GOOGLE_ADS_CONVERSION  → o "send_to" da ação de conversão:                         "AW-123456789/AbCdEfGh"
 * Enquanto algum dos dois for o placeholder, o gtag.js não é carregado e o clique
 * no WhatsApp só abre o WhatsApp — sem erro no console.
 */
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
