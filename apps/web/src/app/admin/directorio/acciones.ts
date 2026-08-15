'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requerirStaff, type ContextoApp } from '@/lib/auth/sesion';
import { repositorioDirectorio, type DecisionAlta } from '@/lib/directorio/repositorio';
import { esNivelAprobable } from './estados';

/* ────────────────────────────────────────────────────────────────────────────
 * Acciones de moderación de las altas del directorio.
 *
 * Cada una empieza por `requerirStaff()`. No es redundante con el layout de
 * /admin: una Server Action es un endpoint POST con identificador propio y se
 * puede invocar sin pasar por la página que dibuja el botón. Ése es el fallo
 * que documenta `frontera.test.ts` —el menú decidía quién veía el enlace y
 * nadie decidía quién ejecutaba la acción—, sólo que aquí no hay RLS debajo
 * que lo tape: estos registros viven en `.data`.
 *
 * Se comprueba `esStaff`, que sale de la fila de la base de datos, nunca de una
 * cookie ni del rol simulado por «ver como».
 * ────────────────────────────────────────────────────────────────────────── */

/** Máximo del motivo. Es una nota de moderación, no un oficio. */
const MOTIVO_MAXIMO = 2000;

function texto(datos: FormData, clave: string): string {
  const valor = datos.get(clave);
  return typeof valor === 'string' ? valor.trim() : '';
}

function ruta(id: string): string {
  return `/admin/directorio/solicitud/${encodeURIComponent(id)}`;
}

/** Escribe la decisión y devuelve a la ficha. Nunca retorna. */
async function registrar(
  contexto: ContextoApp,
  id: string,
  decision: Omit<DecisionAlta, 'actorId' | 'actor'>,
): Promise<never> {
  const alta = await repositorioDirectorio.moderarAlta(id, {
    ...decision,
    actorId: contexto.usuario.id,
    actor: contexto.usuario.correo,
  });

  if (!alta) redirect(`${ruta(id)}?error=no_encontrada`);

  revalidatePath('/admin/directorio', 'layout');
  // El perfil público cambia de nivel o deja de listarse: la ficha, su
  // categoría y el listado tienen que reflejarlo sin esperar a un redespliegue.
  revalidatePath('/directorio', 'layout');

  redirect(`${ruta(id)}?aviso=${decision.decision}`);
}

/**
 * Aprobar es «publicable con el nivel de verificación que corresponda».
 *
 * No es un aval. Ninguno de los niveles significa «certificado por
 * LeyAntilavado.org», y no existe ninguno que lo signifique.
 */
export async function aprobar(datos: FormData): Promise<void> {
  const contexto = await requerirStaff();

  const id = texto(datos, 'id');
  if (!id) redirect('/admin/directorio?error=sin_id');

  const nivel = texto(datos, 'nivel');
  if (!esNivelAprobable(nivel)) redirect(`${ruta(id)}?error=nivel`);

  const motivo = texto(datos, 'motivo').slice(0, MOTIVO_MAXIMO);
  await registrar(contexto, id, {
    decision: 'aprobada',
    nivelVerificacion: nivel,
    ...(motivo ? { motivo } : {}),
  });
}

/** Rechazar marca estado y despublica el perfil. No borra nada. */
export async function rechazar(datos: FormData): Promise<void> {
  const contexto = await requerirStaff();

  const id = texto(datos, 'id');
  if (!id) redirect('/admin/directorio?error=sin_id');

  const motivo = texto(datos, 'motivo').slice(0, MOTIVO_MAXIMO);
  if (!motivo) redirect(`${ruta(id)}?error=motivo`);

  await registrar(contexto, id, { decision: 'rechazada', motivo });
}

/** El perfil sigue publicado como «sin verificar» mientras se corrige. */
export async function pedirCorreccion(datos: FormData): Promise<void> {
  const contexto = await requerirStaff();

  const id = texto(datos, 'id');
  if (!id) redirect('/admin/directorio?error=sin_id');

  const motivo = texto(datos, 'motivo').slice(0, MOTIVO_MAXIMO);
  if (!motivo) redirect(`${ruta(id)}?error=motivo`);

  await registrar(contexto, id, { decision: 'correccion_solicitada', motivo });
}
