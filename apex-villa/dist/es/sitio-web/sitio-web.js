/* Landing /es/sitio-web/ — Google Ads Venezuela (Black Friday US$ 113).
 *
 * GTM-MPS3TVJ6 + gtag AW-18589124461 estão no <head>.
 * Conversão no clique de WhatsApp: AW-18589124461/ehtECPbVi70dEO2O_p9F
 */

(() => {
  const SEND_TO = 'AW-18589124461/ehtECPbVi70dEO2O_p9F';

  function fireConversion(callback) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'whatsapp_click',
      event_category: 'contact',
      event_label: 'sitio-web',
    });

    let called = false;
    const done = () => {
      if (called) return;
      called = true;
      if (typeof callback === 'function') callback();
    };

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', { send_to: SEND_TO, event_callback: done });
      // Se o gtag não responder (bloqueador etc.), não prende o visitante.
      setTimeout(done, 2000);
      return;
    }
    done();
  }

  function onWaActivate(e) {
    const a = e.target instanceof Element && e.target.closest('a[href*="wa.me"], a[href*="whatsapp"]');
    if (!a) return;

    const url = a.href;
    const newTab =
      a.target === '_blank' ||
      e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ||
      e.button === 1;

    // Nova aba / botão do meio: dispara e deixa o navegador abrir o WhatsApp.
    if (newTab) {
      fireConversion();
      return;
    }

    // Mesma aba: só redireciona depois do event_callback (ou timeout).
    e.preventDefault();
    fireConversion(() => { window.location.href = url; });
  }

  document.addEventListener('click', onWaActivate);
  document.addEventListener('auxclick', (e) => { if (e.button === 1) onWaActivate(e); });
})();

/* Carrossel do hero: todos os sites reais, em loop, com crossfade. */
(() => {
  const stack = document.getElementById('hero-site-stack');
  const cap = document.getElementById('hero-site-cap');
  const dots = document.getElementById('hero-site-dots');
  const bar = document.getElementById('hero-site-bar');
  if (!stack || !cap || !dots) return;

  const layers = [...stack.querySelectorAll('img')];
  if (layers.length < 2) return;

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

  const HOLD = 2800;
  const FADE = 900;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i = 0;
  let front = 0;
  let timer = 0;
  let busy = false;

  const srcOf = (slug) => '/img/sitio-web/' + slug + '-640x480.webp';

  function caption(index) {
    const [, name, place] = SITES[index];
    return 'Sitio real: <strong>' + name + '</strong> · ' + place;
  }

  function setDots(index) {
    [...dots.children].forEach((b, n) => {
      b.setAttribute('aria-current', n === index ? 'true' : 'false');
    });
  }

  function restartBar() {
    if (!bar || reduce) return;
    bar.classList.remove('is-run');
    void bar.offsetWidth;
    bar.classList.add('is-run');
  }

  function load(img, src) {
    return new Promise((resolve) => {
      if (img.getAttribute('src') === src && img.complete) {
        resolve();
        return;
      }
      const done = () => {
        img.onload = null;
        img.onerror = null;
        resolve();
      };
      img.onload = done;
      img.onerror = done;
      img.src = src;
      if (img.complete) done();
    });
  }

  async function show(index, animate) {
    const [slug, name] = SITES[index];
    const nextSrc = srcOf(slug);
    const incoming = layers[1 - front];
    const outgoing = layers[front];

    busy = true;
    await load(incoming, nextSrc);
    incoming.alt = 'Sitio web de ' + name + ', hecho por ApexVilla';

    if (!animate || reduce) {
      incoming.classList.add('is-on');
      incoming.classList.remove('is-off');
      outgoing.classList.add('is-off');
      outgoing.classList.remove('is-on');
      front = 1 - front;
      cap.classList.remove('is-out');
      cap.innerHTML = caption(index);
      setDots(index);
      restartBar();
      busy = false;
      return;
    }

    cap.classList.add('is-out');
    incoming.classList.add('is-on');
    incoming.classList.remove('is-off');
    outgoing.classList.remove('is-on');
    outgoing.classList.add('is-off');
    front = 1 - front;

    window.setTimeout(() => {
      cap.innerHTML = caption(index);
      cap.classList.remove('is-out');
      setDots(index);
      restartBar();
      busy = false;
    }, Math.min(420, FADE));
  }

  function step() {
    if (busy) return;
    i = (i + 1) % SITES.length;
    show(i, true);
  }

  function arm() {
    window.clearInterval(timer);
    if (reduce) return;
    timer = window.setInterval(step, HOLD);
  }

  SITES.forEach((site, n) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Ver ' + site[1]);
    b.addEventListener('click', () => {
      if (busy || n === i) return;
      i = n;
      show(i, true);
      arm();
    });
    dots.appendChild(b);
    const warm = new Image();
    warm.src = srcOf(site[0]);
  });

  show(0, false).then(arm);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      window.clearInterval(timer);
      return;
    }
    restartBar();
    arm();
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
