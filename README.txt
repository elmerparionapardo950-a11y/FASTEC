FASTEC - Sitio web

Páginas: index, nosotros, productos, servicios, contacto.
Acceso al panel: login.html  (tudominio.com/login.html)  ->  admin.html
Datos publicados: data.js (productos, servicios, empresa). Lo genera el panel con el botón Publicar.
Compartidos: styles.css, admin.css, store.js, catalog.js, header.js, footer-data.js, script.js.


=== CONFIGURACIÓN ANTES DE PUBLICAR ===
1) DOMINIO: reemplaza "https://tudominio.com" por tu dominio real en todos los archivos
   (las páginas .html, robots.txt y sitemap.xml). En Linux/Mac:
     grep -rl "tudominio.com" . | xargs sed -i 's#https://tudominio.com#https://TU-DOMINIO-REAL#g'
   Sin esto, la imagen al compartir en WhatsApp/Facebook y el sitemap no funcionarán.
2) REDES Y HORARIO: edita el bloque SITE al inicio de site.js (Facebook, Instagram, TikTok, horario).
   Lo que dejes vacío no se muestra.
3) FORMULARIO DE CONTACTO: arma el mensaje y lo abre en WhatsApp o en el correo (no necesita servidor).
4) PANEL: sube .htaccess (Apache) o _headers (Netlify/Cloudflare) y activa la protección por
   contraseña del servidor para login.html/admin.html (instrucciones dentro de .htaccess).
   Borra generar-clave.html del hosting después de usarlo.
5) Envía sitemap.xml en Google Search Console.
