/* Carrusel automático del banner del catálogo (productos.html)
   - Cambia de imagen cada INTERVALO ms con fundido suave
   - Se pausa al pasar el mouse / tocar y cuando la pestaña no está visible
   - Respeta "reducir movimiento" del sistema
   Para añadir o quitar imágenes edita el atributo data-slides en productos.html */
(function () {
  var INTERVALO = 5000; // milisegundos entre imágenes
  var hero = document.querySelector('.cat-hero');
  if (!hero) return;
  var cont = hero.querySelector('.cat-hero-slides');
  var dotsBox = hero.querySelector('.cat-hero-dots');
  if (!cont) return;

  var urls = (cont.getAttribute('data-slides') || '').split(',')
    .map(function (s) { return s.trim(); }).filter(Boolean);
  if (!urls.length) return;

  var slides = urls.map(function (u, i) {
    var d = document.createElement('div');
    d.className = 'cat-hero-slide';
    d.style.backgroundImage = "url('" + u + "')";
    d.setAttribute('aria-hidden', 'true');
    cont.appendChild(d);
    return d;
  });

  var dots = [];
  var actual = 0, timer = null;

  function ir(n) {
    actual = (n + slides.length) % slides.length;
    slides.forEach(function (s, i) { s.classList.toggle('is-active', i === actual); });
    dots.forEach(function (d, i) {
      d.classList.toggle('is-active', i === actual);
      d.setAttribute('aria-current', i === actual ? 'true' : 'false');
    });
  }
  function iniciar() {
    if (timer || slides.length < 2) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timer = setInterval(function () { ir(actual + 1); }, INTERVALO);
  }
  function detener() { clearInterval(timer); timer = null; }

  if (dotsBox && slides.length > 1) {
    slides.forEach(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'cat-hero-dot';
      b.setAttribute('aria-label', 'Ver imagen ' + (i + 1));
      b.addEventListener('click', function () { detener(); ir(i); iniciar(); });
      dotsBox.appendChild(b);
      dots.push(b);
    });
  }

  hero.addEventListener('mouseenter', detener);
  hero.addEventListener('mouseleave', iniciar);
  hero.addEventListener('touchstart', detener, { passive: true });
  hero.addEventListener('touchend', iniciar, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) detener(); else iniciar();
  });

  ir(0);
  iniciar();
})();
