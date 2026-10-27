(function(){
  const data = getSiteData();
  const services = (data.services || []).filter(s => s.active !== false);
  const box = document.getElementById('liveServices');
  if(!box) return;

  function esc(s){
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }

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
          <div class="service-grid">
            ${items.map(s => `
              <article class="service-card">
                <span class="service-icon">${esc(s.icon || '✓')}</span>
                <h3>${esc(s.name)}</h3>
                <p>${esc(s.description)}</p>
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
