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
    /* Orden de categorías: primero cámaras/DVR (CCTV), luego teclados y mouse (accesorios), el resto A–Z */
    const CAT_FIRST = ['CCTV ANALÓGICO', 'CCTV IP / WIFI', 'DISCOS DUROS', 'MEMORIA RAM', 'REDES'];
    const catRank = c => { const i = CAT_FIRST.indexOf(c); return i < 0 ? CAT_FIRST.length : i; };
    const cats = [...new Set(products.map(p => p.category))].sort((a, b) => catRank(a) - catRank(b) || a.localeCompare(b, 'es'));
    /* Orden de productos: cámaras → DVR/NVR → teclados → mouse → lo demás */
    const typeRank = p => {
      const n = norm(p.name);
      if(/^soporte|^protector|^pad ?mouse|^mousepad|para laptop|numerico/.test(n)) return 9;
      if(/camara|camera|turret|bullet|^tubo|^pt |^cam |^sp\d/.test(n)) return 0;
      if(/\b(dvr|nvr)\b/.test(n)) return 1;
      if(/teclad/.test(n)) return 2;
      if(/^mouse/.test(n)) return 3;
      return 8;
    };
    /* Círculos "virtuales": filtran por tipo de producto sin ser una categoría (los productos siguen en su categoría).
       Aparecen justo después del círculo indicado en 'after'. */
    const VIRT = {
      '@dvr': {label: 'DVR / NVR', icon: '📼', img: 'img/cat/dvr.jpg', after: 'CCTV IP / WIFI', test: p => /\b(dvr|nvr)\b/.test(norm(p.name))}
    };
    const inCat = (p, c) => !c || (VIRT[c] ? VIRT[c].test(p) : p.category === c);
    const count = c => products.filter(p => inCat(p, c)).length;
    const chipOrder = cats.flatMap(c => [c, ...Object.keys(VIRT).filter(k => VIRT[k].after === c)]);
    const st = { cat: '', q: '', sort: 'rec', limit: PAGE };
    const price = p => { const n = Number(String(p.price || '').replace(',', '.')); return n > 0 ? n : null; };
    const sorters = {
      rec: (a, b) => typeRank(a) - typeRank(b) || a.name.localeCompare(b.name, 'es', {numeric: true}),
      az: (a, b) => a.name.localeCompare(b.name, 'es', {numeric: true}),
      pa: (a, b) => (price(a) ?? Infinity) - (price(b) ?? Infinity) || a.name.localeCompare(b.name, 'es'),
      pd: (a, b) => (price(b) ?? -1) - (price(a) ?? -1) || a.name.localeCompare(b.name, 'es')
    };

    root.innerHTML = `
      <div class="cat2-bar"><div class="wrap">
        <div class="cat2-tools">
          <input type="search" id="c2q" placeholder="Buscar por nombre o modelo…" aria-label="Buscar productos" autocomplete="off">
          <select id="c2sort" aria-label="Ordenar">
            <option value="rec">Recomendado</option><option value="az">Nombre A–Z</option><option value="pa">Precio: menor a mayor</option><option value="pd">Precio: mayor a menor</option>
          </select>
        </div>
        <div class="cat2-rail">
          <div class="cat2-railwrap" id="c2railwrap">
            <button type="button" class="cat2-arrow prev" id="c2prev" aria-label="Ver categorías anteriores" hidden>‹</button>
            <div class="cat2-chips" id="c2chips"></div>
            <button type="button" class="cat2-arrow next" id="c2next" aria-label="Ver más categorías">›</button>
          </div>
          <button type="button" class="cat2-toggle" id="c2toggle" aria-expanded="false"><span>Ver todas</span> <i aria-hidden="true">▾</i></button>
        </div>
      </div></div>
      <div class="wrap cat2-body"><div class="cat2-main"><div class="cat2-info" id="c2info"></div><div id="c2res"></div></div></div>`;
    const $ = id => document.getElementById(id);

    /* Nombre legible (de MAYÚSCULAS a "Tipo oración", respetando siglas) e icono por categoría */
    const ACRO = {cctv:'CCTV', ip:'IP', wifi:'WiFi', ram:'RAM', usb:'USB', hdmi:'HDMI', dvr:'DVR', nvr:'NVR', led:'LED'};
    const pretty = c => {
      if(c !== c.toUpperCase()) return c;
      const w = c.toLowerCase().replace(/[a-záéíóúñ]+/g, x => ACRO[x] || x);
      return w.charAt(0).toUpperCase() + w.slice(1);
    };
    const ICONS = [
      [/cctv.*anal/, '📹'], [/cctv|wifi|camara/, '📡'], [/audio|parlante/, '🔊'], [/electric.*ferre|ferre/, '🔧'],
      [/electric/, '🔌'], [/splitter|adaptador.*split/, '🔀'], [/cargador/, '🔋'], [/cable|adaptador/, '🔗'],
      [/red/, '🌐'], [/disco/, '🗄️'], [/ram/, '🧩'], [/memoria|almacen/, '💾'], [/manten|repar/, '🛠️'],
      [/asesor|soporte/, '💬'], [/instala/, '⚙️'], [/accesorio/, '🎧']
    ];
    const iconFor = c => { const n = norm(c); const m = ICONS.find(i => i[0].test(n)); return m ? m[1] : '📦'; };
    /* Foto de cada círculo: 1) data.categoryImages[cat]  2) img/cat/<slug>.jpg  3) imagen del primer producto  4) emoji.
       Para poner tus fotos solo copia el archivo a img/cat/ con el nombre del slug (ej. cctv-analogico.jpg). */
    const slug = c => norm(c).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const catImg = c => {
      if(VIRT[c]) return VIRT[c].img;
      const custom = (data.categoryImages || {})[c];
      if(custom) return custom;
      if(c === '') return 'img/cat/todas.jpg';
      return 'img/cat/' + slug(c) + '.jpg';
    };
    const fallbackImg = c => { const p = products.find(p => inCat(p, c) && p.image); return p ? p.image : ''; };
    const chip = (cat, label, icon, n) =>
      `<button type="button" class="cat2-chip${cat === '' ? ' active' : ''}" data-cat="${esc(cat)}" aria-pressed="${cat === ''}">` +
      `<span class="cat2-circle"><span class="cat2-ico" aria-hidden="true">${icon}</span>` +
      `<img src="${esc(catImg(cat))}" alt="" loading="lazy" data-fb="${esc(fallbackImg(cat))}" onerror="if(this.dataset.fb&&this.src.indexOf(this.dataset.fb)<0){this.src=this.dataset.fb}else{this.remove()}">` +
      `</span><span class="cat2-name">${esc(label)}</span></button>`;
    $('c2chips').innerHTML = chip('', 'Todas', '🛍️', products.length) + chipOrder.map(c => VIRT[c] ? chip(c, VIRT[c].label, VIRT[c].icon, count(c)) : chip(c, pretty(c), iconFor(c), count(c))).join('');

    /* Flechas, bordes difuminados y modo "ver todas" */
    const chipsEl = $('c2chips'), wrapEl = $('c2railwrap');
    function railState(){
      const open = wrapEl.classList.contains('is-open');
      const max = chipsEl.scrollWidth - chipsEl.clientWidth;
      const canL = !open && chipsEl.scrollLeft > 4, canR = !open && chipsEl.scrollLeft < max - 4;
      $('c2prev').hidden = !canL; $('c2next').hidden = !canR;
      wrapEl.classList.toggle('fade-l', canL); wrapEl.classList.toggle('fade-r', canR);
    }
    $('c2prev').addEventListener('click', () => chipsEl.scrollBy({left: -chipsEl.clientWidth * .7, behavior: 'smooth'}));
    $('c2next').addEventListener('click', () => chipsEl.scrollBy({left: chipsEl.clientWidth * .7, behavior: 'smooth'}));
    chipsEl.addEventListener('scroll', railState, {passive: true});
    addEventListener('resize', railState);
    function setOpen(v){
      wrapEl.classList.toggle('is-open', v);
      $('c2toggle').setAttribute('aria-expanded', v);
      $('c2toggle').querySelector('span').textContent = v ? 'Ocultar' : 'Ver todas';
      $('c2toggle').querySelector('i').textContent = v ? '▴' : '▾';
      railState();
    }
    $('c2toggle').addEventListener('click', () => setOpen(!wrapEl.classList.contains('is-open')));

    function render(){
      const q = norm(st.q), flat = st.cat || q;
      /* Los contadores siguen a la búsqueda: si escribes algo, cada categoría muestra cuántos coinciden */
      const matchQ = p => !q || norm(p.name + ' ' + p.model + ' ' + p.category).includes(q);
      document.querySelectorAll('.cat2-chip').forEach(b => {
        const on = b.dataset.cat === st.cat;
        const n = products.filter(p => inCat(p, b.dataset.cat) && matchQ(p)).length;
        b.classList.toggle('active', on); b.setAttribute('aria-pressed', on);
        b.classList.toggle('empty', n === 0 && !on);
      });
      const act = chipsEl.querySelector('.cat2-chip.active');
      if(act && !wrapEl.classList.contains('is-open')) chipsEl.scrollTo({left: act.offsetLeft - (chipsEl.clientWidth - act.offsetWidth) / 2, behavior: 'smooth'});
      const sorter = sorters[st.sort];
      let html = '';
      if(!flat){
        $('c2info').textContent = `${products.length} productos en ${cats.length} categorías`;
        html = cats.map(c => {
          const items = products.filter(p => p.category === c).sort(sorter);
          return `<section class="cat2-sec">
            <div class="cat2-sec-head"><h2>${esc(c)}</h2><span>${items.length} ${items.length === 1 ? 'producto' : 'productos'}</span>
</div>
            <div class="catalog-grid">${items.map(fastecProductCard).join('')}</div></section>`;
        }).join('');
      } else {
        const list = products.filter(p => inCat(p, st.cat) && (!q || norm(p.name + ' ' + p.model + ' ' + p.category).includes(q))).sort(sorter);
        const shown = list.slice(0, st.limit);
        $('c2info').innerHTML = (st.cat ? `<button type="button" class="cat2-back" data-cat="">← Todas las categorías</button> ` : '') +
          `${list.length} ${list.length === 1 ? 'resultado' : 'resultados'}${st.cat ? ' en <b>' + esc(VIRT[st.cat] ? VIRT[st.cat].label : st.cat) + '</b>' : ''}${q ? ' para “' + esc(st.q.trim()) + '”' : ''}`;
        html = list.length
          ? `<div class="catalog-grid">${shown.map(fastecProductCard).join('')}</div>` +
            (list.length > shown.length ? `<div class="cat2-loadmore"><button type="button" class="cat2-more" id="c2more">Mostrar más (${list.length - shown.length} restantes)</button></div>` : '')
          : `<div class="cat2-empty"><b>No encontramos productos con ese filtro.</b><p>Prueba con otra palabra o elige otra categoría.</p></div>`;
      }
      $('c2res').innerHTML = html;
    }

    bindCards(root);

    function top(){ const y = root.getBoundingClientRect().top + scrollY - 76; if(scrollY > y) scrollTo({top: y, behavior: 'smooth'}); }
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-cat]'); if(b){ st.cat = b.dataset.cat; st.limit = PAGE; setOpen(false); render(); top(); return; }
      if(e.target.id === 'c2more'){ st.limit += PAGE; render(); }
    });
    let t; $('c2q').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { st.q = e.target.value; st.limit = PAGE; render(); }, 150); });
    $('c2sort').addEventListener('change', e => { st.sort = e.target.value; render(); });
    $('c2chips').addEventListener('wheel', e => { if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){ $('c2chips').scrollLeft += e.deltaY; } }, {passive: true});
    render(); railState();
  }

  /* ===== Destacados (solo Inicio antiguo) ===== */
  const featured = document.getElementById('featuredProducts');
  if(featured){
    const list = products.filter(p => p.featured);
    if(list.length){ featured.innerHTML = list.map(fastecProductCard).join(''); bindCards(featured); }
    else { const sec = featured.closest('.featured-products'); if(sec) sec.hidden = true; }
  }
})();
