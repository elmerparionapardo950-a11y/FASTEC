(function(){
  const $ = id => document.getElementById(id), esc = fastecEsc;
  let data = getSiteData(), published = getPublishedData(), editId = null, editSvc = null;
  $('hello').textContent = FASTEC_AUTH.user;

  /* ---------- utilidades ---------- */
  const dirty = () => JSON.stringify(data) !== JSON.stringify(published);
  function toast(m){ const t = document.createElement('div'); t.className = 'ad-toast'; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 2200); }
  function status(){ const d = dirty(), p = $('statePill'); p.textContent = d ? '● Cambios sin publicar' : '✓ Todo publicado'; p.classList.toggle('dirty', d); }
  function save(){ if(!saveSiteData(data)) alert('No se pudo guardar: el almacenamiento del navegador está lleno. Usa imágenes más pequeñas o rutas a la carpeta img/.'); status(); stats(); }
  const money = v => { const n = Number(String(v ?? '').replace(',', '.')); return n > 0 ? fastecMoney(n) : ''; };
  const cleanNum = v => String(v).trim().replace(',', '.').replace(/[^\d.]/g, '');

  /* ---------- navegación ---------- */
  function show(view){
    document.querySelectorAll('.ad-view').forEach(s => s.hidden = s.id !== 'v-' + view);
    document.querySelectorAll('#adNav button').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    if(view === 'publish') pubInfo();
    scrollTo(0, 0);
  }
  document.querySelectorAll('#adNav button').forEach(b => b.onclick = () => show(b.dataset.view));
  document.querySelectorAll('[data-goto]').forEach(b => b.onclick = () => show(b.dataset.goto));
  $('logoutBtn').onclick = () => { fastecClearSession(); location.href = 'login.html'; };

  /* ---------- escritorio ---------- */
  function stats(){
    const P = data.products, vis = P.filter(p => p.active !== false).length;
    $('stats').innerHTML = [
      [P.length, 'Productos'], [vis, 'Visibles'], [P.filter(p => !(Number(p.price) > 0)).length, 'Sin precio'],
      [P.filter(p => !p.image).length, 'Sin imagen'], [P.filter(p => p.featured).length, 'Destacados']
    ].map(([n, t]) => `<div class="ad-stat"><b>${n}</b><span>${t}</span></div>`).join('');
  }

  /* ---------- filtros ---------- */
  function fillCats(){
    const cats = [...new Set(data.products.map(p => p.category))].sort();
    const opts = cats.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
    ['pCat', 'prCat'].forEach(id => { const s = $(id), v = s.value; s.innerHTML = '<option value="">Todas las categorías</option>' + opts; s.value = v; });
    $('catList').innerHTML = opts;
  }
  const filt = (q, c, onlyNoPrice) => { q = q.toLowerCase().trim(); return data.products.filter(p =>
    (!c || p.category === c) && (!q || (p.name + ' ' + p.model + ' ' + p.category).toLowerCase().includes(q)) && (!onlyNoPrice || !(Number(p.price) > 0))); };

  /* ---------- lista de productos ---------- */
  function renderProducts(){
    const list = filt($('pSearch').value, $('pCat').value);
    $('pList').innerHTML = list.length ? list.map(p => {
      const vis = p.active !== false, pr = money(p.price);
      return `<div class="ad-row ${vis ? '' : 'off'}" data-id="${p.id}">
        <div class="ad-thumb">${p.image ? `<img src="${esc(p.image)}" alt="">` : 'FASTEC'}</div>
        <div><h3>${esc(p.name)}${vis ? '' : '<span class="ad-tag off">OCULTO</span>'}${p.featured ? '<span class="ad-tag">★ Destacado</span>' : ''}</h3>
          <p>${esc(p.category)} · ${esc(p.model)} · Stock: ${p.stock === '' || p.stock == null ? '—' : esc(p.stock)}</p></div>
        <div class="ad-price ${pr ? '' : 'none'}">${pr || 'Sin precio'}</div>
        <div class="ad-acts"><button class="ad-btn ad-btn-ghost ad-btn-sm" data-act="edit">Editar</button>
          <button class="ad-btn ad-btn-ghost ad-btn-sm" data-act="vis">${vis ? 'Ocultar' : 'Mostrar'}</button>
          <button class="ad-btn ad-btn-danger ad-btn-sm" data-act="del">Eliminar</button></div>
      </div>`; }).join('') : '<div class="ad-row"><p>No hay productos con ese filtro.</p></div>';
  }
  $('pList').addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if(!b) return;
    const id = Number(b.closest('.ad-row').dataset.id), p = data.products.find(x => x.id === id); if(!p) return;
    if(b.dataset.act === 'edit') openProduct(id);
    if(b.dataset.act === 'vis'){ p.active = p.active === false; save(); renderProducts(); }
    if(b.dataset.act === 'del' && confirm(`¿Eliminar "${p.name}"? Si solo quieres quitarlo de la página, usa Ocultar.`)){
      data.products = data.products.filter(x => x.id !== id); save(); fillCats(); renderProducts(); renderPrices(); toast('Producto eliminado');
    }
  });
  ['pSearch', 'pCat'].forEach(id => $(id).addEventListener('input', renderProducts));

  /* ---------- tabla de precios ---------- */
  function renderPrices(){
    const list = filt($('prSearch').value, $('prCat').value, $('prOnly').checked);
    $('prCount').textContent = list.length + ' de ' + data.products.length + ' productos';
    const inp = (id, f, v, ph) => `<input data-f="${f}" value="${esc(v ?? '')}" inputmode="decimal" placeholder="${ph}" aria-label="${f}">`;
    $('prBody').innerHTML = list.map(p => `<tr data-id="${p.id}" class="${Number(p.price) > 0 ? '' : 'no-price'}">
      <td>${esc(p.name)}<br><small>${esc(p.model)} · ${esc(p.category)}</small></td>
      <td>${inp(p.id, 'price', p.price, '0.00')}</td><td>${inp(p.id, 'oldPrice', p.oldPrice, '—')}</td>
      <td><input data-f="offer" value="${esc(p.offer || '')}" placeholder="auto"></td><td>${inp(p.id, 'stock', p.stock, '—')}</td></tr>`).join('');
  }
  $('prBody').addEventListener('change', e => {
    const i = e.target.closest('input[data-f]'); if(!i) return;
    const tr = i.closest('tr'), p = data.products.find(x => x.id === Number(tr.dataset.id)), f = i.dataset.f;
    let v = i.value.trim();
    if(f === 'price' || f === 'oldPrice'){ v = cleanNum(v); i.value = v; }
    if(f === 'stock'){ v = v === '' ? '' : (parseInt(v, 10) || 0); i.value = v; }
    p[f] = v; save();
    tr.classList.toggle('no-price', !(Number(p.price) > 0));
    tr.classList.add('saved'); setTimeout(() => tr.classList.remove('saved'), 800);
  });
  ['prSearch', 'prCat', 'prOnly'].forEach(id => $(id).addEventListener('input', renderPrices));

  /* ---------- modal de producto + vista previa ---------- */
  const pm = $('pModal'), pf = $('pForm');
  function formObj(){
    const f = pf.elements, st = f.stock.value.trim();
    return { name: f.name.value.trim() || 'Nombre del producto', category: f.category.value.trim(), model: f.model.value.trim() || 'Modelo',
      price: cleanNum(f.price.value), oldPrice: cleanNum(f.oldPrice.value), offer: f.offer.value.trim(), stock: st === '' ? '' : Number(st),
      image: f.image.value.trim(), featured: f.featured.checked, active: f.active.checked };
  }
  const preview = () => { $('pPreview').innerHTML = fastecProductCard(formObj()); };
  pf.addEventListener('input', preview);

  function openProduct(id = null){
    editId = id; pf.reset(); fillCats();
    $('pTitle').textContent = id ? 'Editar producto' : 'Añadir producto';
    if(id){
      const p = data.products.find(x => x.id === id), f = pf.elements;
      ['name', 'category', 'model', 'price', 'oldPrice', 'offer', 'stock', 'image'].forEach(k => f[k].value = p[k] ?? '');
      f.featured.checked = !!p.featured; f.active.checked = p.active !== false;
    }
    preview(); pm.hidden = false;
  }
  $('newProduct').onclick = () => openProduct();
  $('pClose').onclick = $('pCancel').onclick = () => pm.hidden = true;

  function resize(file, max = 800){
    return new Promise((ok, fail) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        ok(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => fail(); img.src = url;
    });
  }
  pf.elements.imageFile.addEventListener('change', async () => {
    const file = pf.elements.imageFile.files[0]; if(!file) return;
    try{ pf.elements.image.value = await resize(file); preview(); }catch(e){ alert('No se pudo leer esa imagen.'); }
  });

  pf.addEventListener('submit', e => {
    e.preventDefault();
    const o = formObj(), old = editId ? data.products.find(x => x.id === editId) : null;
    const item = Object.assign({}, old || {}, o, { id: editId || Date.now() });
    if(old) data.products = data.products.map(p => p.id === editId ? item : p); else data.products.unshift(item);
    save(); fillCats(); renderProducts(); renderPrices(); pm.hidden = true; toast('Producto guardado');
  });

  /* ---------- servicios ---------- */
  const sm = $('sModal'), sf = $('sForm');
  function renderServices(){
    const list = data.services || [];
    $('sList').innerHTML = list.length ? list.map(s => { const vis = s.active !== false;
      return `<div class="ad-row ${vis ? '' : 'off'}" data-id="${s.id}" style="grid-template-columns:56px 1fr auto">
        <div class="ad-thumb" style="font-size:24px">${esc(s.icon || '✓')}</div>
        <div><h3>${esc(s.name)}${vis ? '' : '<span class="ad-tag off">OCULTO</span>'}</h3><p>${esc(s.category)} — ${esc(s.description)}</p></div>
        <div class="ad-acts"><button class="ad-btn ad-btn-ghost ad-btn-sm" data-act="edit">Editar</button>
          <button class="ad-btn ad-btn-ghost ad-btn-sm" data-act="vis">${vis ? 'Ocultar' : 'Mostrar'}</button>
          <button class="ad-btn ad-btn-danger ad-btn-sm" data-act="del">Eliminar</button></div></div>`; }).join('')
      : '<div class="ad-row"><p>Aún no hay servicios.</p></div>';
  }
  $('sList').addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if(!b) return;
    const id = Number(b.closest('.ad-row').dataset.id), s = data.services.find(x => x.id === id); if(!s) return;
    if(b.dataset.act === 'edit') openService(id);
    if(b.dataset.act === 'vis'){ s.active = s.active === false; save(); renderServices(); }
    if(b.dataset.act === 'del' && confirm(`¿Eliminar el servicio "${s.name}"?`)){ data.services = data.services.filter(x => x.id !== id); save(); renderServices(); }
  });
  function openService(id = null){
    editSvc = id; sf.reset(); $('sTitle').textContent = id ? 'Editar servicio' : 'Añadir servicio';
    if(id){ const s = data.services.find(x => x.id === id); ['name', 'category', 'description', 'icon'].forEach(k => sf.elements[k].value = s[k] || ''); }
    sm.hidden = false;
  }
  $('newService').onclick = () => openService();
  $('sClose').onclick = $('sCancel').onclick = () => sm.hidden = true;
  sf.addEventListener('submit', e => {
    e.preventDefault(); const f = sf.elements; data.services = data.services || [];
    const old = editSvc ? data.services.find(x => x.id === editSvc) : null;
    const item = Object.assign({}, old || {active: true}, { id: editSvc || Date.now(), name: f.name.value.trim(), category: f.category.value.trim(), description: f.description.value.trim(), icon: f.icon.value.trim() || '✓' });
    if(old) data.services = data.services.map(s => s.id === editSvc ? item : s); else data.services.unshift(item);
    save(); renderServices(); sm.hidden = true; toast('Servicio guardado');
  });

  /* ---------- empresa ---------- */
  const cf = $('companyForm');
  Object.entries(data.company || {}).forEach(([k, v]) => { if(cf.elements[k]) cf.elements[k].value = v; });
  cf.addEventListener('submit', e => {
    e.preventDefault(); const f = cf.elements;
    data.company = { name: f.name.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim(), address: f.address.value.trim(), description: f.description.value.trim() };
    save(); toast('Datos guardados');
  });

  /* ---------- publicar / respaldo ---------- */
  function download(name, text, type){
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], {type})); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 500);
  }
  function pubInfo(){
    const emb = data.products.filter(p => (p.image || '').startsWith('data:')).length;
    $('pubInfo').innerHTML = dirty() ? 'Tienes cambios sin publicar.' : 'No hay cambios nuevos: lo que ves ya coincide con lo publicado.';
    if(emb) $('pubInfo').innerHTML += ` Hay <b>${emb}</b> imágenes incrustadas en el archivo (lo hacen más pesado); para un sitio más rápido súbelas a la carpeta <code>img/</code> y usa su ruta.`;
  }
  $('pubBtn').onclick = () => {
    download('data.js', `// FASTEC - datos publicados del sitio. Generado desde el panel el ${new Date().toLocaleString('es-PE')}\nconst FASTEC_DEFAULT_DATA = ${JSON.stringify(data, null, 2)};\n`, 'text/javascript');
    toast('data.js descargado: súbelo a tu hosting');
  };
  $('exportBtn').onclick = () => download('fastec-respaldo.json', JSON.stringify(data, null, 2), 'application/json');
  $('importFile').onchange = e => {
    const file = e.target.files[0]; if(!file) return; const r = new FileReader();
    r.onload = () => { try{
      const d = JSON.parse(r.result); if(!Array.isArray(d.products)) throw 0;
      data = { products: d.products, services: Array.isArray(d.services) ? d.services : published.services, company: d.company || published.company };
      save(); initAll(); toast('Respaldo importado');
    }catch(err){ alert('El archivo no tiene un formato válido.'); } };
    r.readAsText(file); e.target.value = '';
  };
  $('discardBtn').onclick = () => { if(confirm('Se perderán los cambios sin publicar y volverás a lo publicado. ¿Continuar?')){ discardDraft(); location.reload(); } };

  function initAll(){ fillCats(); renderProducts(); renderPrices(); renderServices(); stats(); status();
    Object.entries(data.company || {}).forEach(([k, v]) => { if(cf.elements[k]) cf.elements[k].value = v; }); }
  initAll();
})();
