
(function(){
  const d=getSiteData();
  const c=d.company||{};
  document.querySelectorAll('#footerEmail, .ct-email').forEach(x=>x.textContent=c.email||x.textContent);
  document.querySelectorAll('#footerPhone, .ct-phone').forEach(x=>x.textContent=c.phone||x.textContent);
  document.querySelectorAll('.footer-address').forEach(x=>x.textContent=c.address||x.textContent);
})();
