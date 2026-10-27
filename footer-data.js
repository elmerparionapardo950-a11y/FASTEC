
(function(){
  const d=getSiteData();
  const c=d.company||{};
  document.querySelectorAll('#footerEmail').forEach(x=>x.textContent=c.email||x.textContent);
  document.querySelectorAll('#footerPhone').forEach(x=>x.textContent=c.phone||x.textContent);
  document.querySelectorAll('.footer-address').forEach(x=>x.textContent=c.address||x.textContent);
})();
