import gsap from 'gsap';

const CARDS_CONFIG = [
  { rot: -18, x: -270, y: 36, z: 0, scale: 0.87 },
  { rot: -6,  x: -90,  y: 10, z: 1, scale: 0.94 },
  { rot:  6,  x:  90,  y: 10, z: 2, scale: 0.94 },
  { rot:  18, x:  270, y: 36, z: 3, scale: 0.87 },
];

const HOVER_CONFIG = [
  { rot: -26, x: -320, y: 24, scale: 0.84 },
  { rot: -9,  x: -105, y:  0, scale: 0.92 },
  { rot:  9,  x:  105, y:  0, scale: 0.92 },
  { rot:  26, x:  320, y: 24, scale: 0.84 },
];

export function initFanCarousel() {
  const wrap = document.getElementById('servicesFan');
  if (!wrap) return;

  const cards = Array.from(wrap.querySelectorAll('.svc-fan-card'));
  if (cards.length !== 4) return;

  const isMobile = window.innerWidth <= 900;

  if (isMobile) {
    // Mobile: Reset transforms and set initial side-to-side offsets
    cards.forEach((card, i) => {
      const isLeft = i % 2 === 0;
      gsap.set(card, {
        opacity: 0,
        x: isLeft ? -80 : 80,
        y: 0,
        rotation: 0,
        scale: 1
      });
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          gsap.to(entry.target, {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power3.out'
          });
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px -60px 0px'
    });

    cards.forEach(card => observer.observe(card));

    // Tactile press animation
    cards.forEach(card => {
      card.addEventListener('touchstart', () => {
        gsap.to(card, { scale: 0.97, duration: 0.25, ease: 'power2.out' });
      }, { passive: true });
      card.addEventListener('touchend', () => {
        gsap.to(card, { scale: 1, duration: 0.25, ease: 'power2.out' });
      }, { passive: true });
      card.addEventListener('touchcancel', () => {
        gsap.to(card, { scale: 1, duration: 0.25, ease: 'power2.out' });
      }, { passive: true });
    });

    return;
  }

  let activeIndex = null;
  let isAnimating = false;

  function applyFan(skipAnimation = false) {
    cards.forEach((card, i) => {
      const cfg = CARDS_CONFIG[i];
      const props = {
        rotation: cfg.rot,
        x: cfg.x,
        y: cfg.y,
        scale: cfg.scale,
        zIndex: i + 1,
        transformOrigin: '50% 110%',
      };
      if (skipAnimation) {
        gsap.set(card, props);
      } else {
        gsap.to(card, { ...props, duration: 0.55, ease: 'power3.out' });
      }
    });
  }

  function bringCardForward(index) {
    if (isAnimating) return;
    isAnimating = true;

    const card = cards[index];

    const tl = gsap.timeline({
      onComplete: () => { isAnimating = false; activeIndex = index; },
    });

    cards.forEach((c, i) => {
      if (i === index) return;
      const cfg = HOVER_CONFIG[i];
      tl.to(c, {
        rotation: cfg.rot,
        x: cfg.x,
        y: cfg.y,
        scale: cfg.scale,
        zIndex: i + 1,
        transformOrigin: '50% 110%',
        duration: 0.45,
        ease: 'power2.out',
      }, 0);
    });

    tl.to(card, {
      rotation: 0,
      x: 0,
      y: -24,
      scale: 1,
      zIndex: 10,
      transformOrigin: '50% 50%',
      duration: 0.55,
      ease: 'back.out(1.4)',
    }, 0);
  }

  function resetFan() {
    if (isAnimating) return;
    isAnimating = true;
    activeIndex = null;
    cards.forEach((card, i) => {
      const cfg = CARDS_CONFIG[i];
      gsap.to(card, {
        rotation: cfg.rot,
        x: cfg.x,
        y: cfg.y,
        scale: cfg.scale,
        zIndex: i + 1,
        transformOrigin: '50% 110%',
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: i === cards.length - 1 ? () => { isAnimating = false; } : undefined,
      });
    });
  }

  applyFan(true);

  cards.forEach((card, i) => {
    card.addEventListener('mouseenter', () => bringCardForward(i));
    card.addEventListener('focus', () => bringCardForward(i));
  });

  wrap.addEventListener('mouseleave', resetFan);
  wrap.addEventListener('focusout', (e) => {
    if (!wrap.contains(e.relatedTarget)) resetFan();
  });

  // touch: tap to expand, tap outside to reset
  cards.forEach((card, i) => {
    card.addEventListener('click', (e) => {
      if (activeIndex === i) return;
      e.stopPropagation();
      bringCardForward(i);
    });
  });
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target) && activeIndex !== null) resetFan();
  });
}
