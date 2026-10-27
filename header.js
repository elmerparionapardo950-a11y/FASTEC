/* Encabezado único de FASTEC.
   Este archivo contiene una sola copia del logo y menú para las 5 páginas. */
(function(){
  const markup = `<header class="site-header">
  <div class="wrap header-inner">
    <a href="productos.html" class="brand" aria-label="FASTEC - Productos">
      <span class="brand-mark">
        <img src="img/logo2.png" alt="">
      </span>
      <span class="brand-name"></span>
    </a>

    <nav class="main-nav" id="mainNav" aria-label="Navegación principal">
      <a href="nosotros.html" data-page="nosotros.html">Nosotros</a>
      <a href="productos.html" data-page="productos.html">Productos</a>
      <a href="servicios.html" data-page="servicios.html">Servicios</a>
      <a href="contacto.html" data-page="contacto.html">Contacto</a>
    </nav>

    <button class="nav-toggle" id="navToggle" aria-label="Abrir menú" aria-expanded="false" type="button">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>
`;

  function cargarCabecera(){
    const contenedor = document.getElementById('sharedHeader');
    if (!contenedor) return;
    contenedor.outerHTML = markup;

    const actual = (location.pathname.split('/').pop() || 'productos.html').toLowerCase();
    document.querySelectorAll('.main-nav a[data-page]').forEach(link => {
      const activo = link.dataset.page.toLowerCase() === actual;
      link.classList.toggle('active', activo);
      if (activo) link.setAttribute('aria-current','page');
    });

    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('mainNav');
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        const abierto = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(abierto));
        toggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
      });
      nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
        toggle.setAttribute('aria-label','Abrir menú');
      }));
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', cargarCabecera);
  else cargarCabecera();
})();
