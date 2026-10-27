(function(){
  const data = getSiteData();
  const products = (data.products || []).filter(p => p.active !== false);
  const esc = fastecEsc;
  const digits = String((data.company || {}).phone || '').replace(/\D/g, '');
  const WHATSAPP_NUMBER = digits || '51963925684';
  const PREVIEW = 8, PAGE = 24;

  function openWhatsApp(name){
    const msg = `Hola, quiero consultar por este producto: ${name}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  }
  function bindCards(root){
    root.addEventListener('click', e => { const c = e.target.closest('.live-product-card'); if(c) openWhatsApp(c.dataset.productName || ''); });
    root.addEventListener('keydown', e => {
      const c = e.target.closest('.live-product-card');
      if(c && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); openWhatsApp(c.dataset.productName || ''); }
    });
  }

  /* ===== Catálogo ordenado ===== */
  const root = document.getElementById('liveCatalog');
  if(root){
    const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
    const cats = [...new Set(products.map(p => p.category))].sort((a, b) => a.localeCompare(b, 'es'));
    const count = c => products.filter(p => p.category === c).length;
    const st = { cat: '', q: '', sort: 'az', limit: PAGE };
    const price = p => { const n = Number(String(p.price || '').replace(',', '.')); return n > 0 ? n : null; };
    const sorters = {
      az: (a, b) => a.name.localeCompare(b.name, 'es', {numeric: true}),
      pa: (a, b) => (price(a) ?? Infinity) - (price(b) ?? Infinity) || a.name.localeCompare(b.name, 'es'),
      pd: (a, b) => (price(b) ?? -1) - (price(a) ?? -1) || a.name.localeCompare(b.name, 'es')
    };

    root.innerHTML = `
      <div class="cat2-bar"><div class="wrap">
        <div class="cat2-tools">
          <input type="search" id="c2q" placeholder="Buscar por nombre o modelo…" aria-label="Buscar productos" autocomplete="off">
          <select id="c2sort" aria-label="Ordenar">
            <option value="az">Nombre A–Z</option><option value="pa">Precio: menor a mayor</option><option value="pd">Precio: mayor a menor</option>
          </select>
        </div>
        <div class="cat2-chips" id="c2chips"></div>
      </div></div>
      <div class="wrap cat2-body"><div class="cat2-info" id="c2info"></div><div id="c2res"></div></div>`;
    const $ = id => document.getElementById(id);

    $('c2chips').innerHTML = `<button type="button" class="cat2-chip active" data-cat="">Todas <b>${products.length}</b></button>` +
      cats.map(c => `<button type="button" class="cat2-chip" data-cat="${esc(c)}">${esc(c)} <b>${count(c)}</b></button>`).join('');

    function render(){
      const q = norm(st.q), flat = st.cat || q;
      document.querySelectorAll('.cat2-chip').forEach(b => b.classList.toggle('active', b.dataset.cat === st.cat));
      const sorter = sorters[st.sort];
      let html = '';
      if(!flat){
        $('c2info').textContent = `${products.length} productos en ${cats.length} categorías`;
        html = cats.map(c => {
          const items = products.filter(p => p.category === c).sort(sorter);
          return `<section class="cat2-sec">
            <div class="cat2-sec-head"><h2>${esc(c)}</h2><span>${items.length} ${items.length === 1 ? 'producto' : 'productos'}</span>
              ${items.length > PREVIEW ? `<button type="button" class="cat2-more" data-cat="${esc(c)}">Ver los ${items.length} →</button>` : ''}</div>
            <div class="catalog-grid">${items.slice(0, PREVIEW).map(fastecProductCard).join('')}</div></section>`;
        }).join('');
      } else {
        const list = products.filter(p => (!st.cat || p.category === st.cat) && (!q || norm(p.name + ' ' + p.model + ' ' + p.category).includes(q))).sort(sorter);
        const shown = list.slice(0, st.limit);
        $('c2info').innerHTML = (st.cat ? `<button type="button" class="cat2-back" data-cat="">← Todas las categorías</button> ` : '') +
          `${list.length} ${list.length === 1 ? 'resultado' : 'resultados'}${st.cat ? ' en <b>' + esc(st.cat) + '</b>' : ''}${q ? ' para “' + esc(st.q.trim()) + '”' : ''}`;
        html = list.length
          ? `<div class="catalog-grid">${shown.map(fastecProductCard).join('')}</div>` +
            (list.length > shown.length ? `<div class="cat2-loadmore"><button type="button" class="cat2-more" id="c2more">Mostrar más (${list.length - shown.length} restantes)</button></div>` : '')
          : `<div class="cat2-empty"><b>No encontramos productos con ese filtro.</b><p>Prueba con otra palabra o elige otra categoría.</p></div>`;
      }
      $('c2res').innerHTML = html;
    }

    function top(){ const y = root.getBoundingClientRect().top + scrollY - 76; if(scrollY > y) scrollTo({top: y, behavior: 'smooth'}); }
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-cat]'); if(b){ st.cat = b.dataset.cat; st.limit = PAGE; render(); top(); return; }
      if(e.target.id === 'c2more'){ st.limit += PAGE; render(); }
    });
    let t; $('c2q').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { st.q = e.target.value; st.limit = PAGE; render(); }, 150); });
    $('c2sort').addEventListener('change', e => { st.sort = e.target.value; render(); });
    $('c2chips').addEventListener('wheel', e => { if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){ $('c2chips').scrollLeft += e.deltaY; } }, {passive: true});
    bindCards(root);
    render();
  }

  /* ===== Destacados (solo Inicio antiguo) ===== */
  const featured = document.getElementById('featuredProducts');
  if(featured){
    const list = products.filter(p => p.featured);
    if(list.length){ featured.innerHTML = list.map(fastecProductCard).join(''); bindCards(featured); }
    else { const sec = featured.closest('.featured-products'); if(sec) sec.hidden = true; }
  }
})();
