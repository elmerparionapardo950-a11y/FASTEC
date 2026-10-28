// Acceso al panel. Solo se guarda el HASH de la contraseña, no la contraseña.
// Para cambiarla abre generar-clave.html y pega aquí la línea que te entrega.
const FASTEC_AUTH = {user:'FASTEC2026', salt:'27bc84778a1b250d', hash:'444da7d3f69b334c6bb4dfd95ef50ff46d352bac7ff20acca3c110b4d473f426', maxTries:5, lockMinutes:10, sessionHours:8, rememberDays:7};

async function fastecHash(user, pass, salt){
  if(!(window.crypto && crypto.subtle)) throw new Error('Abre el sitio con https:// para poder iniciar sesión.');
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({name:'PBKDF2', hash:'SHA-256', salt:enc.encode(salt+'|'+user.toLowerCase()), iterations:200000}, key, 256);
  return [...new Uint8Array(bits)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
