// Barra de vista previa: solo se carga cuando el administrador tiene la sesión iniciada.
(function(){
    const page = (location.pathname.split('/').pop() || '').toLowerCase();
    if(page === 'admin.html' || page === 'login.html') return;
    const add = () => {
    const bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#0f513a;color:#fff;font:600 14px Inter,system-ui,sans-serif;padding:10px 16px;display:flex;gap:14px;align-items:center;justify-content:center;flex-wrap:wrap;box-shadow:0 -4px 20px rgba(0,0,0,.25)';
    bar.innerHTML = '<span>👁 Vista previa de administrador: ves tus cambios aunque aún no estén publicados.</span><a href="admin.html" style="background:#fff;color:#0f513a;padding:6px 14px;border-radius:6px;text-decoration:none">Volver al panel</a><button type=\"button\" id=\"fastecExit\" style=\"background:transparent;color:#fff;border:1px solid #fff;padding:6px 14px;border-radius:6px;font:inherit;cursor:pointer\">Cerrar sesión</button>';
    document.body.appendChild(bar);
    bar.querySelector('#fastecExit').onclick = () => { fastecClearSession(); location.reload(); };
    document.body.style.paddingBottom = '52px';
    };
    if(document.body) add(); else document.addEventListener('DOMContentLoaded', add);
  })();
