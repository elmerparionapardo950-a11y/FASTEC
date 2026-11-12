/* FASTEC - Control de la pantalla de carga.
   - Se muestra una vez por visita (sessionStorage), al entrar a productos.html.
   - Dura como mínimo MIN_MS para que se vea la animación, y no se quita
     hasta que la página termine de cargar (o pasen MAX_MS).
   - Para que salga SIEMPRE, cambia ONCE_PER_SESSION a false. */
(function(){
  var MIN_MS = 2200;
  var MAX_MS = 7000;
  var ONCE_PER_SESSION = true;

  var el = document.getElementById('fxLoader');
  if (!el) return;
  var root = document.documentElement;

  if (root.classList.contains('fx-skip')) { el.remove(); return; }

  var fill = el.querySelector('.fx-fill');
  var runner = el.querySelector('.fx-runner');
  var bar = el.querySelector('.fx-bar');
  var pct = el.querySelector('.fx-pct');
  var start = performance.now();
  var last = start;
  var p = 0;
  var loaded = document.readyState === 'complete';
  var finished = false;

  if (!loaded) window.addEventListener('load', function(){ loaded = true; });

  function ease(t){ return 1 - Math.pow(1 - t, 2); }

  function paint(){
    var v = Math.min(100, Math.max(0, p));
    fill.style.width = v + '%';
    runner.style.left = v + '%';
    bar.setAttribute('aria-valuenow', String(Math.round(v)));
    if (pct) pct.textContent = Math.round(v) + '%';
  }

  function close(){
    el.classList.add('fx-done');
    root.classList.remove('fx-loading');
    if (ONCE_PER_SESSION) { try { sessionStorage.setItem('fastecLoader', '1'); } catch(e){} }
    setTimeout(function(){ el.remove(); }, 600);
  }

  function frame(now){
    var t = now - start;
    var dt = now - last; last = now;
    var ready = (loaded && t >= MIN_MS) || t >= MAX_MS;
    var target = ready ? 100 : 90 * ease(Math.min(t / MIN_MS, 1));
    p += (target - p) * (1 - Math.exp(-dt / (ready ? 70 : 110)));
    if (ready && p > 99.4) p = 100;
    paint();
    if (p >= 100 && !finished) {
      finished = true;
      setTimeout(close, 350);   /* deja ver la barra llena un instante */
      return;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
