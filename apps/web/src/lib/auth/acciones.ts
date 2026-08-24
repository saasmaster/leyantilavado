'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { clienteServidor } from '@/lib/supabase/servidor';
import { destinoSeguro, esRolValido } from './permisos';
import { origenDeCabeceras } from './origen';
import { supabaseConfigurado } from '@/lib/supabase/configuracion';
import {
  CONTRASENA_MINIMA,
  CREDENCIALES_INVALIDAS,
  ERROR_GENERICO,
  RECUPERACION_ENVIADA,
  REGISTRO_ENVIADO,
  mensajeSeguroDeAuth,
} from './mensajes';
import { COOKIE_ORGANIZACION, COOKIE_VER_COMO } from './sesion';

export interface EstadoFormulario {
  ok: boolean;
  mensaje: string;
  /** true cuando el mensaje es informativo y no un error. */
  informativo?: boolean;
  /** Se pinta junto al campo correspondiente. */
  campo?: 'correo' | 'contrasena' | 'nombre' | 'codigo';
}

const SIN_CONFIGURAR: EstadoFormulario = {
  ok: false,
  mensaje:
    'La autenticación todavía no está configurada en este entorno. Falta conectar Supabase.',
};

function texto(datos: FormData, clave: string): string {
  const valor = datos.get(clave);
  return typeof valor === 'string' ? valor.trim() : '';
}

/**
 * Origen público del sitio, para los enlaces que viajan por correo.
 *
 * El respaldo es `SITIO.url` y no `localhost:5400`. Un respaldo a localhost
 * parece inofensivo porque en desarrollo es lo correcto, pero si en producción
 * faltara la cabecera —un proxy nuevo, un cambio de configuración— el sitio no
 * fallaría: mandaría correos de recuperación con enlaces a `localhost`, que
 * nadie puede abrir y que además no se puede corregir a posteriori porque el
 * correo ya salió. Cuando un respaldo va a acabar en la bandeja de alguien,
 * tiene que ser la URL real del sitio.
 */
async function origen(): Promise<string> {
  return origenDeCabeceras(await headers());
}

/* ── Entrar ──────────────────────────────────────────────────────────────── */

export async function entrar(
  _previo: EstadoFormulario | null,
  datos: FormData,
): Promise<EstadoFormulario> {
  if (!supabaseConfigurado) return SIN_CONFIGURAR;
  const supabase = await clienteServidor();
  if (!supabase) return SIN_CONFIGURAR;

  const correo = texto(datos, 'correo').toLowerCase();
  const contrasena = texto(datos, 'contrasena');

  // Validación de forma, no de existencia: nunca revela si la cuenta existe.
  if (!correo || !contrasena) {
    return { ok: false, mensaje: CREDENCIALES_INVALIDAS };
  }

  const { error } = await supabase.auth.signInWithPassword({ email: correo, password: contrasena });

  if (error) {
    return { ok: false, mensaje: mensajeSeguroDeAuth(error.code, error.message) };
  }

  const destino = destinoSeguro(texto(datos, 'destino'), '/panel');
  redirect(destino);
}

/* ── Registro ────────────────────────────────────────────────────────────── */

export async function registrar(
  _previo: EstadoFormulario | null,
  datos: FormData,
): Promise<EstadoFormulario> {
  if (!supabaseConfigurado) return SIN_CONFIGURAR;
  const supabase = await clienteServidor();
  if (!supabase) return SIN_CONFIGURAR;

  const correo = texto(datos, 'correo').toLowerCase();
  const contrasena = texto(datos, 'contrasena');
  const nombre = texto(datos, 'nombre');

  if (!nombre) return { ok: false, mensaje: 'Escribe tu nombre completo.', campo: 'nombre' };
  if (!correo.includes('@')) {
    return { ok: false, mensaje: 'Escribe un correo electrónico válido.', campo: 'correo' };
  }
  if (contrasena.length < CONTRASENA_MINIMA) {
    return {
      ok: false,
      mensaje: `La contraseña necesita al menos ${CONTRASENA_MINIMA} caracteres.`,
      campo: 'contrasena',
    };
  }

  const { error } = await supabase.auth.signUp({
    email: correo,
    password: contrasena,
    options: {
      data: { full_name: nombre },
      emailRedirectTo: `${await origen()}/api/auth/confirmar?destino=/panel`,
    },
  });

  // Respuesta idéntica exista o no la cuenta: Supabase ya devuelve un usuario
  // "ofuscado" cuando el correo está tomado, y aquí se refuerza colapsando
  // también los errores.
  if (error && error.code !== 'user_already_exists') {
    const mensaje = mensajeSeguroDeAuth(error.code, error.message);
    // Los errores de forma (contraseña débil, correo inválido) sí se muestran.
    if (error.code === 'weak_password' || error.code === 'validation_failed') {
      return { ok: false, mensaje, campo: error.code === 'weak_password' ? 'contrasena' : 'correo' };
    }
  }

  return { ok: true, informativo: true, mensaje: REGISTRO_ENVIADO };
}

/* ── Recuperación ────────────────────────────────────────────────────────── */

export async function recuperar(
  _previo: EstadoFormulario | null,
  datos: FormData,
): Promise<EstadoFormulario> {
  if (!supabaseConfigurado) return SIN_CONFIGURAR;
  const supabase = await clienteServidor();
  if (!supabase) return SIN_CONFIGURAR;

  const correo = texto(datos, 'correo').toLowerCase();

  if (correo.includes('@')) {
    await supabase.auth.resetPasswordForEmail(correo, {
      redirectTo: `${await origen()}/api/auth/confirmar?destino=/actualizar-contrasena`,
    });
  }

  // Respuesta SIEMPRE idéntica: exista el correo, no exista, o falle el envío.
  // Es la única forma de que el formulario no sirva como oráculo de cuentas.
  return { ok: true, informativo: true, mensaje: RECUPERACION_ENVIADA };
}

export async function actualizarContrasena(
  _previo: EstadoFormulario | null,
  datos: FormData,
): Promise<EstadoFormulario> {
  if (!supabaseConfigurado) return SIN_CONFIGURAR;
  const supabase = await clienteServidor();
  if (!supabase) return SIN_CONFIGURAR;

  const contrasena = texto(datos, 'contrasena');
  const confirmacion = texto(datos, 'confirmacion');

  if (contrasena.length < CONTRASENA_MINIMA) {
    return {
      ok: false,
      mensaje: `La contraseña necesita al menos ${CONTRASENA_MINIMA} caracteres.`,
      campo: 'contrasena',
    };
  }
  if (contrasena !== confirmacion) {
    return { ok: false, mensaje: 'Las dos contraseñas no coinciden.', campo: 'contrasena' };
  }

  const { error } = await supabase.auth.updateUser({ password: contrasena });
  if (error) {
    return { ok: false, mensaje: mensajeSeguroDeAuth(error.code, error.message) };
  }

  redirect('/panel?aviso=contrasena_actualizada');
}

/* ── Sesión ──────────────────────────────────────────────────────────────── */

export async function salir(): Promise<void> {
  const supabase = await clienteServidor();
  await supabase?.auth.signOut();
  const almacen = await cookies();
  almacen.delete(COOKIE_VER_COMO);
  almacen.delete(COOKIE_ORGANIZACION);
  redirect('/entrar');
}

export async function cambiarOrganizacion(datos: FormData): Promise<void> {
  const id = texto(datos, 'organizacionId');
  const almacen = await cookies();
  if (id) {
    almacen.set(COOKIE_ORGANIZACION, id, { httpOnly: true, sameSite: 'lax', path: '/' });
    // Cambiar de organización invalida cualquier simulación de rol en curso.
    almacen.delete(COOKIE_VER_COMO);
  }
  revalidatePath('/panel');
}

export async function cambiarVerComo(datos: FormData): Promise<void> {
  const rol = texto(datos, 'rol');
  const almacen = await cookies();
  // La validación de que el rol simulado NO amplía permisos se hace al leer la
  // cookie (`requerirContexto`), no al escribirla: así una cookie manipulada a
  // mano tampoco sirve de nada.
  if (esRolValido(rol)) {
    almacen.set(COOKIE_VER_COMO, rol, { httpOnly: true, sameSite: 'lax', path: '/' });
  } else {
    almacen.delete(COOKIE_VER_COMO);
  }
  revalidatePath('/panel');
}

/* ── MFA (TOTP) ──────────────────────────────────────────────────────────── */

export interface EstadoAltaMFA {
  ok: boolean;
  mensaje?: string;
  factorId?: string;
  /** URI otpauth:// para el código QR. Se dibuja en el cliente. */
  uri?: string;
  secreto?: string;
}

export async function iniciarAltaMFA(): Promise<EstadoAltaMFA> {
  const supabase = await clienteServidor();
  if (!supabase) return { ok: false, mensaje: SIN_CONFIGURAR.mensaje };

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: `LeyAntilavado ${new Date().toISOString().slice(0, 10)}`,
  });
  if (error || !data) return { ok: false, mensaje: ERROR_GENERICO };

  return { ok: true, factorId: data.id, uri: data.totp.uri, secreto: data.totp.secret };
}

export async function confirmarAltaMFA(
  _previo: EstadoFormulario | null,
  datos: FormData,
): Promise<EstadoFormulario> {
  const supabase = await clienteServidor();
  if (!supabase) return SIN_CONFIGURAR;

  const factorId = texto(datos, 'factorId');
  const codigo = texto(datos, 'codigo').replace(/\s/g, '');
  if (!factorId || codigo.length !== 6) {
    return { ok: false, mensaje: 'Escribe el código de seis dígitos de tu aplicación.', campo: 'codigo' };
  }

  const reto = await supabase.auth.mfa.challenge({ factorId });
  if (reto.error || !reto.data) {
    return { ok: false, mensaje: mensajeSeguroDeAuth(reto.error?.code, reto.error?.message ?? '') };
  }

  const { error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: reto.data.id,
    code: codigo,
  });
  if (error) {
    return { ok: false, mensaje: mensajeSeguroDeAuth(error.code, error.message), campo: 'codigo' };
  }

  revalidatePath('/panel/seguridad');
  return { ok: true, informativo: true, mensaje: 'Segundo factor activado.' };
}

export async function retirarMFA(datos: FormData): Promise<void> {
  const supabase = await clienteServidor();
  const factorId = texto(datos, 'factorId');
  if (supabase && factorId) await supabase.auth.mfa.unenroll({ factorId });
  revalidatePath('/panel/seguridad');
}

/** Verificación del segundo factor durante el inicio de sesión. */
export async function verificarMFA(
  _previo: EstadoFormulario | null,
  datos: FormData,
): Promise<EstadoFormulario> {
  const supabase = await clienteServidor();
  if (!supabase) return SIN_CONFIGURAR;

  const codigo = texto(datos, 'codigo').replace(/\s/g, '');
  const { data: factores, error: errorFactores } = await supabase.auth.mfa.listFactors();
  const totp = factores?.totp?.find((f) => f.status === 'verified');
  if (errorFactores || !totp) return { ok: false, mensaje: ERROR_GENERICO };

  const reto = await supabase.auth.mfa.challenge({ factorId: totp.id });
  if (reto.error || !reto.data) return { ok: false, mensaje: ERROR_GENERICO };

  const { error } = await supabase.auth.mfa.verify({
    factorId: totp.id,
    challengeId: reto.data.id,
    code: codigo,
  });
  if (error) {
    return { ok: false, mensaje: mensajeSeguroDeAuth(error.code, error.message), campo: 'codigo' };
  }

  redirect(destinoSeguro(texto(datos, 'destino'), '/panel'));
}
