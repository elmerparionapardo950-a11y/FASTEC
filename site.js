/* FASTEC - funciones comunes del sitio público:
   botón flotante de WhatsApp, redes y horario en el pie, formulario de contacto,
   enlace "saltar al contenido".
   >>> EDITA AQUÍ los datos de redes sociales y horario. Lo que dejes vacío no se muestra. <<< */
(function(){
  const SITE = {
    whatsapp: '51963925684',                       // solo números, con código de país
    waMessage: 'Hola, quiero consultar por un equipo',
    hours: 'Lunes a sábado: 9:00 a. m. – 7:00 p. m.',   // ← confirma/ajusta tu horario real
    social: {
      facebook: '',    // ej: 'https://www.facebook.com/tu-pagina'
      instagram: '',   // ej: 'https://www.instagram.com/tu_usuario'
      tiktok: ''       // ej: 'https://www.tiktok.com/@tu_usuario'
    }
  };

  const company = (typeof getSiteData === 'function' ? (getSiteData().company || {}) : {});
  const digits = String(company.phone || '').replace(/\D/g, '') || SITE.whatsapp;
  const email = company.email || 'fastec0224@gmail.com';
  const wa = (txt) => `https://wa.me/${digits}?text=${encodeURIComponent(txt)}`;
  const esc = (typeof fastecEsc === 'function') ? fastecEsc : (s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])));

  const ICONS = {
    facebook: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.7V3.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.5V13h2.8v8z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M16.6 3c.3 2.3 1.6 3.7 3.9 3.9v3c-1.4.1-2.7-.3-3.9-1.1v5.6c0 3.6-2.5 5.9-5.6 5.9-3 0-5.4-2.4-5.4-5.4 0-3.4 2.9-5.8 6.3-5.3v3.1c-1.6-.5-3.2.5-3.2 2.2 0 1.3 1 2.3 2.3 2.3 1.4 0 2.4-.9 2.4-2.8V3z"/></svg>'
  };
  const NAMES = {facebook:'Facebook', instagram:'Instagram', tiktok:'TikTok'};

  function socialHtml(){
    const items = Object.keys(SITE.social).filter(k => SITE.social[k]);
    if(!items.length) return '';
    return `<div class="social-links">` + items.map(k =>
      `<a href="${esc(SITE.social[k])}" target="_blank" rel="noopener noreferrer" aria-label="FASTEC en ${NAMES[k]}">${ICONS[k]}</a>`).join('') + `</div>`;
  }

  function init(){
    /* Saltar al contenido (accesibilidad) */
    const main = document.querySelector('main');
    if(main){
      if(!main.id) main.id = 'contenido';
      const a = document.createElement('a');
      a.className = 'skip-link'; a.href = '#' + main.id; a.textContent = 'Saltar al contenido';
      document.body.insertBefore(a, document.body.firstChild);
    }

    /* Botón flotante de WhatsApp */
    const f = document.createElement('a');
    f.className = 'wa-float';
    f.href = wa(SITE.waMessage);
    f.target = '_blank'; f.rel = 'noopener noreferrer';
    f.setAttribute('aria-label', 'Escribir a FASTEC por WhatsApp');
    f.innerHTML = '<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path fill="#fff" d="M16 3C9 3 3.4 8.6 3.4 15.5c0 2.3.6 4.4 1.7 6.3L3 29l7.4-1.9c1.8 1 3.800 1.500 5.900 1.500 6.900 0 12.500-5.600 12.500-12.500C28.800 8.600 23 3 16 3zm0 22.800c-1.900 0-3.700-.5-5.300-1.500l-.4-.2-4.400 1.100 1.200-4.300-.3-.4c-1-1.600-1.600-3.500-1.600-5.500 0-5.700 4.600-10.300 10.300-10.300 5.700 0 10.300 4.600 10.300 10.300S21.700 25.800 16 25.800zm5.700-7.700c-.3-.2-1.900-.9-2.200-1-.3-.1-.5-.2-.7.200-.2.300-.8 1-1 1.200-.2.200-.4.200-.7.100-.3-.2-1.400-.5-2.600-1.600-1-.9-1.600-1.900-1.800-2.200-.2-.3 0-.5.100-.7l.5-.6c.2-.2.200-.3.300-.5.100-.2.100-.4 0-.5-.1-.2-.7-1.700-1-2.300-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.100-.8.400-.3.300-1.100 1.100-1.100 2.600s1.100 3 1.300 3.200c.2.200 2.200 3.400 5.400 4.700 3.200 1.300 3.200.9 3.800.8.600-.1 1.900-.8 2.200-1.500.3-.7.300-1.400.2-1.500-.1-.2-.3-.2-.6-.4z"/></svg>';
    document.body.appendChild(f);

    /* Pie de página: horario y redes */
    document.querySelectorAll('.footer-col').forEach(col => {
      const h = col.querySelector('h4');
      if(h && /contacto/i.test(h.textContent)){
        if(SITE.hours){ const s = document.createElement('span'); s.className = 'footer-hours'; s.textContent = 'Horario: ' + SITE.hours; col.appendChild(s); }
        const soc = socialHtml(); if(soc) col.insertAdjacentHTML('beforeend', soc);
      }
    });

    /* Página de contacto: horario y redes */
    const list = document.querySelector('.store-list');
    if(list && SITE.hours){
      const li = document.createElement('li'); li.innerHTML = '<strong>Horario</strong> — ' + esc(SITE.hours); list.appendChild(li);
    }
    const soc = socialHtml(), box = document.getElementById('contactSocial');
    if(box && soc) box.innerHTML = '<p class="kicker">Síguenos</p>' + soc;

    /* Formulario de contacto (abre WhatsApp o correo con el mensaje armado) */
    const form = document.getElementById('contactForm');
    if(form){
      const out = document.getElementById('cfStatus');
      const read = () => {
        const v = n => (form.elements[n].value || '').trim();
        const lines = [`Hola, soy ${v('nombre')}.`, `Motivo: ${v('motivo')}`, '', v('mensaje'), ''];
        if(v('telefono')) lines.push('Mi teléfono: ' + v('telefono'));
        if(v('correo')) lines.push('Mi correo: ' + v('correo'));
        return {text: lines.join('\n'), motivo: v('motivo')};
      };
      form.addEventListener('submit', e => {
        e.preventDefault();
        if(!form.reportValidity()) return;
        window.open(wa(read().text), '_blank', 'noopener');
        out.textContent = 'Se abrió WhatsApp con tu mensaje listo. Solo presiona enviar.';
      });
      document.getElementById('cfMail').addEventListener('click', () => {
        if(!form.reportValidity()) return;
        const r = read();
        location.href = `mailto:${email}?subject=${encodeURIComponent('Consulta web: ' + r.motivo)}&body=${encodeURIComponent(r.text)}`;
        out.textContent = 'Se abrió tu programa de correo con el mensaje listo.';
      });
    }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
