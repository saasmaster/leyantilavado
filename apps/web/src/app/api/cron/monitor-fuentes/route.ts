import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { datos } from '@leyantilavado/rules-engine';
import { clienteAdministrador } from '@/lib/supabase/administrador';

/**
 * Monitor regulatorio.
 *
 * Descarga cada URL de `datos.FUENTES`, guarda la fecha, el estado HTTP y el
 * hash SHA-256 del contenido, y cuando el hash cambia levanta una ALERTA para
 * revisión humana.
 *
 * LO QUE ESTE MONITOR NO HACE, Y NO DEBE HACER NUNCA: publicar una
 * interpretación legal por su cuenta. Que el PDF de la ley cambie de bytes
 * puede significar una reforma, una fe de erratas o que la Cámara recompiló el
 * archivo. Distinguirlo es trabajo de una persona; el monitor sólo dice "esto
 * se movió, ve a verlo".
 *
 * Se ejecuta con `Authorization: Bearer $CRON_SECRET`. Sin el secreto correcto
 * responde 401 sin decir por qué.
 */
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SECRETO = process.env['CRON_SECRET'] ?? '';

function secretoValido(peticion: NextRequest): boolean {
  if (!SECRETO) return false;

  const cabecera =
    peticion.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
    peticion.headers.get('x-cron-secret') ??
    '';

  // Comparación de tiempo constante: un `===` filtra por cuánto tarda en
  // fallar cuántos caracteres iniciales acertó quien lo intenta.
  const a = Buffer.from(cabecera);
  const b = Buffer.from(SECRETO);
  return a.length === b.length && timingSafeEqual(a, b);
}

interface Revision {
  fuenteId: string;
  url: string;
  estadoHttp: number | null;
  hash: string | null;
  cambio: boolean;
  error?: string;
  duracionMs: number;
}

async function revisarFuente(id: string, url: string, hashPrevio: string | null): Promise<Revision> {
  const inicio = Date.now();
  try {
    const respuesta = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(20_000),
      headers: { 'user-agent': 'LeyAntilavado.org monitor regulatorio (+https://leyantilavado.org)' },
      cache: 'no-store',
    });

    const cuerpo = Buffer.from(await respuesta.arrayBuffer());
    const hash = createHash('sha256').update(cuerpo).digest('hex');

    return {
      fuenteId: id,
      url,
      estadoHttp: respuesta.status,
      hash,
      cambio: hashPrevio !== null && hashPrevio !== hash,
      duracionMs: Date.now() - inicio,
    };
  } catch (e) {
    return {
      fuenteId: id,
      url,
      estadoHttp: null,
      hash: null,
      cambio: false,
      error: e instanceof Error ? e.message : 'Error desconocido al descargar la fuente.',
      duracionMs: Date.now() - inicio,
    };
  }
}

export async function GET(peticion: NextRequest) {
  if (!secretoValido(peticion)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const supabase = clienteAdministrador();
  if (!supabase) {
    return NextResponse.json(
      {
        error:
          'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY: el monitor no tiene dónde guardar el resultado.',
      },
      { status: 503 },
    );
  }

  // Hashes previos. Si la tabla todavía no existe, se sigue adelante tratando
  // todo como primera revisión en lugar de reventar la tarea programada.
  const { data: previas } = await supabase
    .from('legal_sources')
    .select('id, content_hash, monitor_enabled');

  const hashPrevio = new Map<string, string | null>();
  const deshabilitadas = new Set<string>();
  for (const fila of (previas ?? []) as { id: string; content_hash: string | null; monitor_enabled: boolean }[]) {
    hashPrevio.set(fila.id, fila.content_hash);
    if (!fila.monitor_enabled) deshabilitadas.add(fila.id);
  }

  const porRevisar = datos.FUENTES.filter((f) => !deshabilitadas.has(f.id));

  const revisiones = await Promise.all(
    porRevisar.map((f) => revisarFuente(f.id, f.url, hashPrevio.get(f.id) ?? null)),
  );

  const ahora = new Date().toISOString();

  for (const r of revisiones) {
    await supabase.from('source_checks').insert({
      source_id: r.fuenteId,
      http_status: r.estadoHttp,
      content_hash: r.hash,
      changed: r.cambio,
      error: r.error ?? null,
      duration_ms: r.duracionMs,
      checked_at: ahora,
    });

    await supabase
      .from('legal_sources')
      .update({
        last_checked_at: ahora,
        http_status: r.estadoHttp,
        ...(r.hash ? { content_hash: r.hash } : {}),
        ...(r.cambio ? { last_change_at: ahora } : {}),
      })
      .eq('id', r.fuenteId);
  }

  // Alertas. Nunca un cambio en el corpus legal: sólo trabajo para una persona.
  const alertas = revisiones
    .filter((r) => r.cambio || (r.estadoHttp !== null && r.estadoHttp >= 400) || r.error)
    .map((r) => ({
      kind: r.cambio ? 'fuente_cambio' : 'discrepancia',
      severity: r.cambio ? 'alta' : 'media',
      entity: 'legal_sources',
      entity_id: r.fuenteId,
      source_id: r.fuenteId,
      title: r.cambio
        ? `Cambió el contenido de la fuente ${r.fuenteId}`
        : `No se pudo leer la fuente ${r.fuenteId}`,
      detail: r.cambio
        ? 'El hash SHA-256 del documento oficial cambió respecto a la última revisión. Hay que leer el documento y decidir a mano si alguna regla del motor debe actualizarse. Esta alerta NO modifica ninguna regla.'
        : (r.error ?? `El servidor respondió con estado HTTP ${r.estadoHttp}.`),
      evidence: {
        url: r.url,
        hash_anterior: hashPrevio.get(r.fuenteId) ?? null,
        hash_nuevo: r.hash,
        estado_http: r.estadoHttp,
        revisado_en: ahora,
      },
      status: 'abierta',
    }));

  if (alertas.length > 0) {
    await supabase.from('content_alerts').insert(alertas);
  }

  return NextResponse.json({
    revisadas: revisiones.length,
    cambios: revisiones.filter((r) => r.cambio).length,
    errores: revisiones.filter((r) => r.error || (r.estadoHttp ?? 0) >= 400).length,
    alertasCreadas: alertas.length,
    revisadoEn: ahora,
    nota: 'El monitor nunca publica una interpretación legal: crea alertas para revisión humana.',
  });
}
