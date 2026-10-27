PANEL DE ADMINISTRACIÓN FASTEC

Entrar:  tudominio.com/login.html   (usuario y contraseña, como WordPress)
La contraseña NO está escrita en ningún archivo: auth.js guarda solo su huella (hash).
Para cambiar usuario/contraseña: abre generar-clave.html, copia la línea que genera
y pégala en auth.js reemplazando la línea "const FASTEC_AUTH = ...". Luego borra generar-clave.html del hosting.

Qué puedes hacer: agregar/editar/ocultar/eliminar productos con vista previa en vivo,
cambiar precios y stock en una tabla, editar servicios y datos de la empresa.

Publicar: los cambios quedan como borrador en tu navegador (tú los ves en todo el sitio).
Para que los vean los visitantes: panel > Publicar > Descargar data.js y súbelo al hosting
reemplazando el data.js anterior.

Seguridad: sin servidor, el login protege el panel pero no es seguridad total (cualquiera
podría saltarlo desde el navegador, aunque no podría publicar nada: solo tú subes data.js al hosting).
Usa contraseña larga y no la compartas.
