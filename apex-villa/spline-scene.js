import { Application } from '@splinetool/runtime';

const SPLINE_URL = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';

export function initSplineSection() {
  const canvas = document.getElementById('splineCanvas');
  if (!canvas) return;

  // Lazy-init: only load when section enters viewport
  const section = document.getElementById('splineSection');
  if (!section) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        loadSpline(canvas);
      }
    },
    { threshold: 0.1 }
  );
  observer.observe(section);

  // Spotlight cursor follow
  const spotlight = section.querySelector('.spline-spotlight');
  if (spotlight) {
    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      spotlight.style.setProperty('--sx', `${x}%`);
      spotlight.style.setProperty('--sy', `${y}%`);
      spotlight.style.opacity = '1';
    });
    section.addEventListener('mouseleave', () => {
      spotlight.style.opacity = '0';
    });
  }
}

async function loadSpline(canvas) {
  try {
    const app = new Application(canvas);
    await app.load(SPLINE_URL);
  } catch (err) {
    // Silently hide canvas on load failure — fallback illustration shows
    const wrap = canvas.closest('.spline-canvas-wrap');
    if (wrap) wrap.classList.add('spline-error');
  }
}
