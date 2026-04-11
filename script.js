// ============================================
// APEXVILLA — DARK LUXURY TECH INTERACTIONS
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // CUSTOM CURSOR
  // ============================================
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  const isMobile = window.innerWidth <= 768;

  if (!isMobile && cursorDot && cursorRing) {
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });

    // Ring follows with delay
    function animateRing() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover expansion
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, .service-card, .case-card, .process-step');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseout', (e) => {
      if (!e.relatedTarget) {
        cursorDot.style.opacity = '0';
        cursorRing.style.opacity = '0';
      }
    });
    document.addEventListener('mouseover', () => {
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
    });
  }

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
        // Mouse repel effect
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

        // Varying opacity
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

      // Draw connections between particles
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
  // NAVBAR SCROLL EFFECT
  // ============================================
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

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
  // SCROLL REVEAL (Intersection Observer)
  // ============================================
  const revealElements = document.querySelectorAll('.reveal');

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
  // COUNTER ANIMATION (requestAnimationFrame)
  // ============================================
  const counters = document.querySelectorAll('.counter');

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(element) {
    const target = parseInt(element.dataset.target, 10);
    const suffix = element.dataset.suffix || '';
    const prefix = element.dataset.prefix || '';
    const duration = 2000;
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
  // SMOOTH SCROLL
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);

      if (targetEl) {
        const headerOffset = 80;
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

      const serviceName = form.querySelector('select[name="service"] option:checked')?.text || data.service;

      const message = `*Novo Lead — ApexVilla*

*Nome:* ${data.name}
*Telefone:* ${data.phone}
*Email:* ${data.email}
*Cidade:* ${data.city || 'Não informada'}
*Serviço:* ${serviceName}

*Mensagem:*
${data.message || 'Sem mensagem adicional'}`;

      const encoded = encodeURIComponent(message);

      if (submitBtn) {
        const originalHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Redirecionando...</span>';
        submitBtn.disabled = true;

        setTimeout(() => {
          window.open(`https://wa.me/5562981254228?text=${encoded}`, '_blank');
          submitBtn.innerHTML = originalHTML;
          submitBtn.disabled = false;
          form.reset();
        }, 800);
      }
    });
  }

});
