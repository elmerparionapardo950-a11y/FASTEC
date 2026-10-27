// Funciones generales de la página. El encabezado y menú se cargan desde header.js.

// Contadores animados
const statEls = document.querySelectorAll('.stat-num');

function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (prefersReducedMotion) {
          el.textContent = el.dataset.count + (el.dataset.suffix || '');
        } else {
          animateCount(el);
        }
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.4 });

  statEls.forEach(el => observer.observe(el));
} else {
  statEls.forEach(el => {
    el.textContent = el.dataset.count + (el.dataset.suffix || '');
  });
}

