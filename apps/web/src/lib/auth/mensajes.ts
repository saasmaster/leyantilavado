/**
 * Mensajes de autenticación.
 *
 * PROTECCIÓN CONTRA ENUMERACIÓN DE USUARIOS: "este correo no existe" y
 * "contraseña incorrecta" son EXACTAMENTE el mismo texto. Si difirieran, un
 * atacante podría averiguar qué correos tienen cuenta en el sitio probando uno
 * por uno. Lo mismo aplica a la recuperación y al registro: la respuesta es
 * idéntica exista o no la cuenta.
 *
 * No cambies estos textos por unos "más útiles". La utilidad de distinguir los
 * dos casos se la queda el atacante, no la persona usuaria legítima.
 */

export const CREDENCIALES_INVALIDAS =
  'El correo o la contraseña no coinciden. Revisa los datos e inténtalo de nuevo.';

export const RECUPERACION_ENVIADA =
  'Si ese correo tiene una cuenta, te enviamos las instrucciones para restablecer la contraseña. Revisa también la carpeta de correo no deseado.';

export const REGISTRO_ENVIADO =
  'Si ese correo puede registrarse, te enviamos un enlace de confirmación. Revisa también la carpeta de correo no deseado.';

export const SESION_EXPIRADA = 'Tu sesión expiró. Vuelve a entrar para continuar.';

export const ERROR_GENERICO =
  'No pudimos completar la operación. Inténtalo de nuevo en unos minutos.';

export const MFA_CODIGO_INVALIDO = 'El código de seis dígitos no es válido o ya expiró.';

export const CONTRASENA_MINIMA = 12;

export const AYUDA_CONTRASENA = `Mínimo ${CONTRASENA_MINIMA} caracteres. Usa una frase larga que sólo tú conozcas; es más segura que una palabra corta con símbolos.`;

/**
 * Normaliza cualquier error de Supabase Auth a un mensaje que no revela si la
 * cuenta existe. Los errores que SÍ podemos mostrar tal cual (límite de
 * intentos, correo mal formado) se mapean explícitamente.
 */
export function mensajeSeguroDeAuth(codigo: string | undefined, mensaje: string): string {
  switch (codigo) {
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'Hiciste demasiados intentos seguidos. Espera unos minutos antes de volver a intentarlo.';
    case 'validation_failed':
      return 'Revisa el formato del correo electrónico.';
    case 'weak_password':
      return `La contraseña es demasiado débil. ${AYUDA_CONTRASENA}`;
    case 'same_password':
      return 'La nueva contraseña debe ser distinta de la anterior.';
    case 'mfa_verification_failed':
    case 'mfa_challenge_expired':
      return MFA_CODIGO_INVALIDO;
    case 'invalid_credentials':
    case 'user_not_found':
    case 'email_not_confirmed':
      return CREDENCIALES_INVALIDAS;
    default:
      // Cualquier otro error se colapsa al mensaje genérico. Nunca se devuelve
      // el texto crudo de Supabase: puede filtrar la existencia de la cuenta.
      return mensaje.toLowerCase().includes('password') ||
        mensaje.toLowerCase().includes('credential')
        ? CREDENCIALES_INVALIDAS
        : ERROR_GENERICO;
  }
}
