/**
 * Script anti-parpadeo del tema.
 *
 * Vive en su propio archivo, y no incrustado en `layout.tsx`, porque
 * `next.config.mjs` necesita el MISMO texto para calcular su hash SHA-256 y
 * permitirlo en la Content Security Policy.
 *
 * Si editas este archivo, el hash se recalcula solo al arrancar. Si lo
 * duplicaras a mano en el layout, el hash dejaría de coincidir y el navegador
 * bloquearía el script sin decir por qué: el sitio cargaría en blanco durante
 * un instante en modo oscuro.
 */
export const SCRIPT_TEMA =
  "(function(){try{var t=localStorage.getItem('tema');var o=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='oscuro'||(!t&&o))document.documentElement.classList.add('oscuro');}catch(e){}})();";
