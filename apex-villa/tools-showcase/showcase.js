/* ============================================================
   ApexVilla — Portfólio ao vivo (#work)
   Zero dependências. Não usa GSAP: o palco horizontal é feito com
   position:sticky + uma única leitura de scroll por frame (rAF),
   então não briga com nenhuma animação já existente na página.
   ============================================================ */
(function () {
  'use strict';

  var root = document.getElementById('work');
  if (!root) return;

  var flow = root.querySelector('.wk__flow');
  var stage = root.querySelector('.wk__stage');
  var track = root.querySelector('.wk__track');
  var rail = root.querySelector('.wk__rail i');
  var cards = [].slice.call(root.querySelectorAll('.wk-card'));
  var chips = [].slice.call(root.querySelectorAll('.wk__chip'));

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var wide = window.matchMedia('(min-width: 1024px)');
  var finePointer = window.matchMedia('(pointer: fine)');

  function horizontalMode() { return wide.matches && !reduced.matches; }

  /* ── 1. Título letra a letra ───────────────────────────── */
  (function splitTitle() {
    var el = root.querySelector('.wk__title');
    if (!el || reduced.matches) return;
    var walk = function (node) {
      var kids = [].slice.call(node.childNodes);
      kids.forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.nodeValue.split('').forEach(function (ch, i) {
            var s = document.createElement('span');
            s.className = 'wk-ch';
            s.textContent = ch === ' ' ? ' ' : ch;
            s.style.transitionDelay = (i * 22) + 'ms';
            frag.appendChild(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) {
          walk(n);
        }
      });
    };
    walk(el);
  })();

  /* ── 2. Entrada da seção ───────────────────────────────── */
  /* Observa o CABEÇALHO, não a seção. A seção passa de 7000px de altura
     (o palco vira scroll), então um threshold em fração dela pode ser
     inatingível numa janela baixa — e aí título e cards nunca apareciam. */
  var trigger = root.querySelector('.wk__head') || root;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        root.classList.add('is-in');
        obs.unobserve(e.target);
      });
    }, { threshold: 0.25 }).observe(trigger);
  } else {
    root.classList.add('is-in');
  }

  /* escalona a entrada dos cards visíveis */
  function stagger() {
    var i = 0;
    cards.forEach(function (c) {
      if (c.hidden) { c.style.transitionDelay = ''; return; }
      c.style.transitionDelay = Math.min(i * 55, 660) + 'ms';
      i++;
    });
  }
  stagger();

  /* ── 3. Palco horizontal (sticky + scroll) ─────────────── */
  var distance = 0;
  var ticking = false;

  function layout() {
    if (!horizontalMode()) {
      flow.style.height = '';
      track.style.transform = '';
      if (rail) rail.style.width = '0%';
      return;
    }
    // quanto o trilho precisa andar para o último card encostar na borda
    distance = Math.max(0, track.scrollWidth - stage.clientWidth);
    flow.style.height = (distance + window.innerHeight) + 'px';
    onScroll();
  }

  function onScroll() {
    if (!horizontalMode() || distance <= 0) return;
    var box = flow.getBoundingClientRect();
    var travel = flow.offsetHeight - window.innerHeight;
    var p = travel > 0 ? (-box.top) / travel : 0;
    p = p < 0 ? 0 : (p > 1 ? 1 : p);
    track.style.transform = 'translate3d(' + (-p * distance).toFixed(2) + 'px,0,0)';
    if (rail) rail.style.width = (p * 100).toFixed(1) + '%';
  }

  function requestScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }

  window.addEventListener('scroll', requestScroll, { passive: true });

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(layout, 150);
  }, { passive: true });

  // os prints entram por lazy-load: recalcula quando terminarem
  [].slice.call(root.querySelectorAll('img')).forEach(function (img) {
    if (img.complete) return;
    img.addEventListener('load', layout, { once: true });
  });

  if (wide.addEventListener) wide.addEventListener('change', layout);

  /* ── 4. Filtros ────────────────────────────────────────── */
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var cat = chip.dataset.cat;
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      cards.forEach(function (card) {
        var tokens = (card.dataset.cat || '').split(' ');
        card.hidden = !(cat === 'all' || tokens.indexOf(cat) > -1);
      });
      stagger();
      if (horizontalMode()) {
        // offsetTop é relativo à seção (que é position:relative) — usar o rect
        var top = flow.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: top - 40, behavior: 'smooth' });
      }
      layout();
    });
  });

  /* ── 5. Sem mouse: o print rola sozinho quando o card
         está centralizado na tela ──────────────────────── */
  if (!finePointer.matches && !reduced.matches && 'IntersectionObserver' in window) {
    var play = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        e.target.classList.toggle('is-playing', e.isIntersecting);
      });
    }, { threshold: 0.6 });
    cards.forEach(function (c) { play.observe(c); });
  }

  layout();
  window.addEventListener('load', layout);
})();
