// ============================================
// APEXVILLA — PREMIUM INTERACTIONS ENGINE
// ============================================

import { initFanCarousel } from './fan-carousel.js';
import { initSplineSection } from './spline-scene.js';
import { gsap } from 'gsap';

document.addEventListener('DOMContentLoaded', () => {

  initFanCarousel();
  initSplineSection();

  const isMobile = window.innerWidth <= 768;

  // ============================================
  // HERO GSAP ENTRANCE ANIMATION
  // ============================================
  const heroTl = gsap.timeline({
    defaults: { ease: 'power4.out', duration: 1.4 }
  });

  // Start with elements invisible or translated
  gsap.set('.hero-tag', { opacity: 0, y: 30 });
  gsap.set('.hero-headline .hero-line', { y: '105%', rotate: 1.5, skewY: 1.5 });
  gsap.set('.hero-sub', { opacity: 0, y: 30 });
  gsap.set('.hero-buttons', { opacity: 0, y: 30 });
  gsap.set('.hero-stat', { opacity: 0, y: 30 });

  heroTl.to('.hero-tag', { opacity: 1, y: 0, duration: 1.0 })
    .to('.hero-headline .hero-line', {
      y: '0%',
      rotate: 0,
      skewY: 0,
      stagger: 0.15,
      duration: 1.6
    }, '-=0.7')
    .to('.hero-sub', { opacity: 1, y: 0, duration: 1.2 }, '-=1.2')
    .to('.hero-buttons', { opacity: 1, y: 0, duration: 1.2 }, '-=1.0')
    .to('.hero-stat', { opacity: 1, y: 0, stagger: 0.15, duration: 1.2 }, '-=1.0');

  // ============================================
  // SCROLL PROGRESS BAR
  // ============================================
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.prepend(progressBar);



  // ============================================
  // PARTICLE CANVAS
  // ============================================
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w, h;
    let particles = [];
    let mouse = { x: -9999, y: -9999 };
    const PARTICLE_COUNT = isMobile ? 40 : 100;
    const MAX_DIST = 150;
    const MOUSE_REPEL = 120;

    function resizeCanvas() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    document.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    class Particle {
      constructor() {
        this.reset();
        this.baseOpacity = 0.2 + Math.random() * 0.5;
        this.opacitySpeed = 0.002 + Math.random() * 0.005;
        this.opacityPhase = Math.random() * Math.PI * 2;
      }

      reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.r = Math.random() * 1.5 + 0.5;
      }

      update(time) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_REPEL && dist > 0) {
          const force = (MOUSE_REPEL - dist) / MOUSE_REPEL * 0.5;
          this.x += (dx / dist) * force;
          this.y += (dy / dist) * force;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = w;
        if (this.x > w) this.x = 0;
        if (this.y < 0) this.y = h;
        if (this.y > h) this.y = 0;

        this.opacity = this.baseOpacity + Math.sin(time * this.opacitySpeed + this.opacityPhase) * 0.2;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    let startTime = performance.now();

    function animate() {
      const time = performance.now() - startTime;
      ctx.clearRect(0, 0, w, h);

      particles.forEach(p => {
        p.update(time);
        p.draw();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }
    animate();
  }

  // ============================================
  // NAVBAR SCROLL + PROGRESS BAR
  // ============================================
  const navbar = document.getElementById('navbar');

  let scrollScheduled = false;
  function onScroll() {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;

      // Navbar effect
      if (navbar) navbar.classList.toggle('scrolled', scrollTop > 60);

      // Progress bar
      if (progressBar) progressBar.style.transform = `scaleX(${progress})`;

      scrollScheduled = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // ============================================
  // MOBILE MENU
  // ============================================
  const hamburger = document.getElementById('navHamburger');
  const mobileMenu = document.getElementById('navMobile');
  const closeBtn = document.getElementById('navClose');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  if (closeBtn && mobileMenu) {
    closeBtn.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  window.closeMobile = function () {
    if (mobileMenu) {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  // ============================================
  // SCROLL REVEAL (Enhanced with stagger)
  // ============================================
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ============================================
  // COUNTER ANIMATION
  // ============================================
  const counters = document.querySelectorAll('.counter');

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(element) {
    const target = parseInt(element.dataset.target, 10);
    const suffix = element.dataset.suffix || '';
    const prefix = element.dataset.prefix || '';
    const duration = 2200;
    let start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      const current = Math.floor(eased * target);

      element.textContent = prefix + current + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = prefix + target + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        entry.target.classList.add('counted');
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.5
  });

  counters.forEach(c => counterObserver.observe(c));

  // ============================================
  // 3D TILT EFFECT (uiverse.io inspired)
  // ============================================
  if (!isMobile) {
    const tiltCards = document.querySelectorAll('[data-tilt]');

    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ============================================
  // TEXT ROTATION EFFECT (Hero)
  // ============================================
  const heroLineItalic = document.querySelector('.hero-line-italic');
  if (heroLineItalic) {
    let phraseIndex = 0;
    let fadeTimeout;

    function getPhrases() {
      const phrasesPt = ['ROI Comprovado.', 'Resultados Reais.', 'Impacto Real.'];
      const phrasesEs = ['ROI Comprobado.', 'Resultados Reales.', 'Impacto Real.'];
      return (window.currentLang === 'es') ? phrasesEs : phrasesPt;
    }

    function rotateTextEffect() {
      const phrases = getPhrases();
      phraseIndex = (phraseIndex + 1) % phrases.length;
      const nextPhrase = phrases[phraseIndex];

      // Smooth fade out and slide up
      gsap.to(heroLineItalic, {
        opacity: 0,
        y: -10,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => {
          heroLineItalic.textContent = nextPhrase;
          // Set starting position for the fade in
          gsap.set(heroLineItalic, { y: 10 });
          // Smooth fade in and slide to 0
          gsap.to(heroLineItalic, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out'
          });
        }
      });

      fadeTimeout = setTimeout(rotateTextEffect, 3500); // rotate every 3.5 seconds
    }

    // Start after hero reveal timeline has completed
    setTimeout(() => {
      fadeTimeout = setTimeout(rotateTextEffect, 3000);
    }, 2000);

    // Dynamic reset when language changes
    window.addEventListener('langChanged', () => {
      clearTimeout(fadeTimeout);
      const phrases = getPhrases();
      phraseIndex = 0;
      heroLineItalic.textContent = phrases[0];
      gsap.set(heroLineItalic, { opacity: 1, y: 0 });
      fadeTimeout = setTimeout(rotateTextEffect, 3000);
    });
  }

  // ============================================
  // SMOOTH SCROLL
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);

      if (targetEl) {
        const headerOffset = 85;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============================================
  // CONTACT FORM → WHATSAPP
  // ============================================
  const form = document.getElementById('contact-form');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      const submitBtn = document.getElementById('formSubmitBtn');

      const isEs = window.currentLang === 'es';
      const serviceName = form.querySelector('select[name="service"] option:checked')?.text || data.service;

      let message;
      if (isEs) {
        message = `*Nuevo Lead — ApexVilla*

*Nombre:* ${data.name}
*Teléfono:* ${data.phone}
*Email:* ${data.email}
*Ciudad:* ${data.city || 'No informada'}
*Servicio:* ${serviceName}

*Mensaje:*
${data.message || 'Sin mensaje adicional'}`;
      } else {
        message = `*Novo Lead — ApexVilla*

*Nome:* ${data.name}
*Telefone:* ${data.phone}
*Email:* ${data.email}
*Cidade:* ${data.city || 'Não informada'}
*Serviço:* ${serviceName}

*Mensagem:*
${data.message || 'Sem mensagem adicional'}`;
      }

      const encoded = encodeURIComponent(message);

      // Grava o lead na VPS ANTES de mandar para o WhatsApp. Sem isto, lead que
      // não conclui lá (desistiu, fechou, popup bloqueado, WhatsApp ausente)
      // sumia sem deixar rastro — ninguém sabia sequer que existiu.
      //
      // sendBeacon e não fetch: em seguida navegamos para fora, e o browser
      // cancelaria um fetch pendente. sendBeacon é entregue mesmo com a página
      // sendo descarregada — é o caso de uso para o qual ele foi criado.
      try {
        const payload = JSON.stringify({
          name: data.name, phone: data.phone, email: data.email,
          city: data.city, service: serviceName, message: data.message,
          lang: isEs ? 'es' : 'pt', page: location.pathname,
        });
        navigator.sendBeacon('/api/lead', new Blob([payload], { type: 'application/json' }));
      } catch (_) {
        // Falha aqui NUNCA pode travar o visitante: o WhatsApp abre igual.
        // Perder o registro é ruim; perder a venda é pior.
      }

      if (submitBtn) {
        const originalHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = `<span>${isEs ? 'Redireccionando…' : 'Redirecionando…'}</span>`;
        submitBtn.disabled = true;

        // O window.open PRECISA rodar aqui, síncrono, ainda dentro do gesto do
        // clique. Antes ele ficava dentro do setTimeout abaixo: 800ms depois o
        // gesto já expirou e o bloqueador de popup (Safari/iOS principalmente)
        // pode engolir a chamada — o visitante preenche tudo, clica, e nada
        // acontece. Lead perdido em silêncio, sem ninguém ficar sabendo.
        const waUrl = `https://wa.me/5562981254228?text=${encoded}`;
        const win = window.open(waUrl, '_blank');
        // Se mesmo assim bloqueou, navega na mesma aba: perder a aba vale menos
        // que perder o lead. Navegação de topo nunca é bloqueada.
        if (!win) location.href = waUrl;

        // O timeout agora só devolve o botão ao normal e limpa o formulário —
        // não tem mais nada a ver com a entrega do lead.
        setTimeout(() => {
          submitBtn.innerHTML = originalHTML;
          submitBtn.disabled = false;
          form.reset();
        }, 800);
      }
    });
  }

  // ============================================
  // PAGE VIEW COUNTER (localStorage)
  // ============================================
  function initPageViews() {
    const viewTextEl = document.getElementById('visit-count-text');
    if (!viewTextEl) return;

    let views = parseInt(localStorage.getItem('apex_villa_visits'), 10);
    if (isNaN(views)) {
      views = 500;
    }
    
    views++;
    localStorage.setItem('apex_villa_visits', views);

    const duration = 2000;
    let start = null;

    function getLabel() {
      const isEs = window.currentLang === 'es';
      return isEs ? 'visitas' : 'visitas';
    }

    function step(timestamp) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
      const current = Math.floor(eased * views);

      viewTextEl.textContent = `${current} ${getLabel()}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        viewTextEl.textContent = `${views} ${getLabel()}`;
      }
    }

    requestAnimationFrame(step);

    // Listen for language changes from i18n
    window.addEventListener('langChanged', () => {
      viewTextEl.textContent = `${views} ${getLabel()}`;
    });
  }

  initPageViews();

  // ============================================
  // 3D SCROLL ANIMATION (Aceternity inspired)
  // ============================================
  const scrollContainer3d = document.querySelector('.scroll-container-3d');
  const scrollHeader3d = document.querySelector('.scroll-header-3d');
  const scrollCard3d = document.querySelector('.scroll-card-3d');

  if (scrollContainer3d && scrollCard3d) {
    let scrollScheduled3d = false;

    function update3dScroll() {
      if (scrollScheduled3d) return;
      scrollScheduled3d = true;

      requestAnimationFrame(() => {
        const rect = scrollContainer3d.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const containerHeight = rect.height;

        // Progress calculates how much the container has entered/moved through the viewport
        let progress = (windowHeight - rect.top) / (windowHeight + containerHeight);
        progress = Math.max(0, Math.min(1, progress));

        const isMobileDevice = window.innerWidth <= 768;
        const startScale = isMobileDevice ? 0.9 : 1.05;
        const endScale = 1.0;
        
        const rotateX = 20 * (1 - progress);
        const scaleVal = startScale + progress * (endScale - startScale);
        const translateValY = (1 - progress) * -100;

        scrollCard3d.style.transform = `rotateX(${rotateX}deg) scale(${scaleVal})`;
        
        if (scrollHeader3d) {
          scrollHeader3d.style.transform = `translateY(${translateValY}px)`;
        }

        scrollScheduled3d = false;
      });
    }

    window.addEventListener('scroll', update3dScroll, { passive: true });
    window.addEventListener('resize', update3dScroll);
    update3dScroll();
  }

  // ============================================
  // HERO 3D TILT EFFECT
  // ============================================
  const heroVisual = document.querySelector('.hero-visual');
  const heroVisualInner = document.querySelector('.hero-visual-inner');

  if (heroVisual && heroVisualInner && !isMobile) {
    heroVisual.addEventListener('mousemove', (e) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = e.clientX - rect.left; 
      const y = e.clientY - rect.top;  
      
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      
      const rotateY = ((x - xc) / xc) * 12;
      const rotateX = -((y - yc) / yc) * 12;

      gsap.to(heroVisualInner, {
        rotateX: rotateX,
        rotateY: rotateY,
        x: ((x - xc) / xc) * 8, 
        y: ((y - yc) / yc) * 8,
        duration: 0.5,
        ease: 'power2.out',
        transformPerspective: 1000,
        overwrite: 'auto'
      });
    });

    heroVisual.addEventListener('mouseleave', () => {
      gsap.to(heroVisualInner, {
        rotateX: 0,
        rotateY: 0,
        x: 0,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });
  }

});
