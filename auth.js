// Acceso al panel. Solo se guarda el HASH de la contraseña, no la contraseña.
// Para cambiarla abre generar-clave.html y pega aquí la línea que te entrega.
const FASTEC_AUTH = {user:'admin_fastec', salt:'9f1ba3cf8f6915fc', hash:'aa9c0b7e59a92faeada017d49583913763abe2eed6e58e5c765d8e7958dccf48', maxTries:5, lockMinutes:10, sessionHours:8, rememberDays:7};

async function fastecHash(user, pass, salt){
  if(!(window.crypto && crypto.subtle)) throw new Error('Abre el sitio con https:// para poder iniciar sesión.');
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({name:'PBKDF2', hash:'SHA-256', salt:enc.encode(salt+'|'+user.toLowerCase()), iterations:200000}, key, 256);
  return [...new Uint8Array(bits)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
