(function(){
  const data = getSiteData();
  const services = (data.services || []).filter(s => s.active !== false);
  const box = document.getElementById('liveServices');
  if(!box) return;

  function esc(s){
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }

  const WA = '51963925684';
  const svg = d => `<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ICON = {
    install: svg('<path d="M14.700 6.300a4 4 0 0 0-5 5L3 18l3 3 6.700-6.700a4 4 0 0 0 5-5l-2.500 2.500-2.500-.5-.5-2.500z"/>'),
    maint:   svg('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.900 4.900l2.100 2.100M17 17l2.100 2.100M4.900 19.100L7 17M17 7l2.100-2.100"/>'),
    repair:  svg('<path d="M4 20l7-7"/><path d="M13 5l6 6-3 3-6-6z"/><path d="M15 3l2 2M19 7l2 2"/>'),
    advice:  svg('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.500 10.900c.6.5 1 1.200 1 2.100h5c0-.9.4-1.600 1-2.100A6 6 0 0 0 12 3z"/>'),
    support: svg('<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.500"/><rect x="17" y="14" width="4" height="6" rx="1.500"/><path d="M19 20a4 4 0 0 1-4 2h-2"/>'),
    check:   svg('<circle cx="12" cy="12" r="9"/><path d="M8 12.500l2.700 2.700L16 9.500"/>')
  };
  const norm = t => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  function iconFor(s){
    const t = norm(s.name) || norm(s.category);
    if(/instal|puesta/.test(t)) return ICON.install;
    if(/repar|diagn/.test(t)) return ICON.repair;
    if(/mantenim|prevent/.test(t)) return ICON.maint;
    if(/asesor|orienta/.test(t)) return ICON.advice;
    if(/soporte|uso|ayuda/.test(t)) return ICON.support;
    const c = norm(s.category);
    if(/instal/.test(c)) return ICON.install;
    if(/mantenim|repar/.test(c)) return ICON.maint;
    if(/asesor|soporte/.test(c)) return ICON.support;
    return ICON.check;
  }
  const waLink = name => `https://wa.me/${WA}?text=${encodeURIComponent('Hola, quiero consultar por el servicio: ' + name)}`;

  const groups = {};
  services.forEach(s => (groups[s.category] ||= []).push(s));
  const categories = Object.keys(groups);

  box.innerHTML = `
    <div class="category-filters service-filters">
      <button type="button" class="category-filter active" data-category="all">Todos</button>
      ${categories.map(cat => `<button type="button" class="category-filter" data-category="${esc(cat)}">${esc(cat)}</button>`).join('')}
    </div>
    <div class="service-sections">
      ${Object.entries(groups).map(([cat, items]) => `
        <section class="service-category" data-category="${esc(cat)}">
          <div class="catalog-section-heading">
            <h2 class="catalog-section-title">${esc(cat)}</h2>
            <span class="catalog-count">${items.length} ${items.length === 1 ? 'servicio' : 'servicios'}</span>
          </div>
          <div class="svc-list">
            ${items.map((s, i) => `
              <article class="svc-row">
                <span class="svc-icon">${iconFor(s)}</span>
                <div class="svc-row-text">
                  <h3>${esc(s.name)}</h3>
                  <p>${esc(s.description)}</p>
                </div>
                <a class="svc-row-btn" href="${waLink(s.name)}" target="_blank" rel="noopener" aria-label="Consultar ${esc(s.name)} por WhatsApp"><span>WhatsApp</span><b aria-hidden="true">→</b></a>
              </article>
            `).join('')}
          </div>
        </section>
      `).join('')}
    </div>
  `;

  box.querySelectorAll('.category-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      box.querySelectorAll('.category-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const selected = btn.dataset.category;
      box.querySelectorAll('.service-category').forEach(section => {
        section.hidden = selected !== 'all' && section.dataset.category !== selected;
      });
    });
  });
})();
