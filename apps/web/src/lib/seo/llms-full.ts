import { datos } from '@leyantilavado/rules-engine';
import { REVISION_VIGENTE } from '@/content/autores';
import { SITIO } from '../sitio';

/**
 * Construye `llms-full.txt`: el corpus legal completo, en markdown plano.
 *
 * ── Qué contiene y por qué no es «el sitio entero» ─────────────────────────
 *
 * El spec de llmstxt.org describe este archivo como la versión extendida del
 * `llms.txt`. La lectura literal —volcar el markdown de las 165 páginas— daría
 * un archivo enorme y en su mayor parte redundante: prosa explicativa que un
 * modelo ya sabe redactar.
 *
 * Lo que un modelo NO puede redactar, y por lo que valdría citarnos, es el
 * corpus: qué actividad tiene qué umbral, con qué comparador, bajo qué
 * artículo, y qué está verificado y qué no. Eso es lo que va aquí.
 *
 * ── Las dos reglas que lo gobiernan ────────────────────────────────────────
 *
 * 1. **Ninguna cifra escrita a mano.** Todo se recorre desde `datos`. Si una
 *    reforma cambia un umbral, este archivo cambia solo. Un `llms-full.txt`
 *    con cifras congeladas sería peor que no tenerlo: se convertiría en la
 *    fuente desactualizada que los modelos citan durante años.
 *
 * 2. **Lo no verificado se marca, no se esconde.** Un supuesto sin cifra
 *    publicada por la autoridad aparece diciendo exactamente eso. Rellenar el
 *    hueco con la cifra de otra fracción es lo que hace la competencia y la
 *    razón por la que este sitio existe.
 */

/** Describe un umbral sin inventar nada: la forma la decide el propio dato. */
function describirUmbral(u: unknown): string {
  if (!u || typeof u !== 'object') return 'sin dato';
  const d = u as {
    tipo?: string;
    uma?: number;
    comparador?: string;
    nota?: string;
  };

  if (d.tipo !== 'uma' || typeof d.uma !== 'number') {
    // `requiere_revision` y cualquier otra forma futura caen aquí: se dice que
    // no hay cifra publicada en vez de fabricar una.
    return d.nota ? `sin umbral publicado — ${d.nota}` : 'sin umbral publicado';
  }

  // El comparador importa: «superior a 1,605» y «igual o superior a 1,605» son
  // reglas distintas, y colapsarlas inventa o borra una obligación en el borde.
  const comparador = d.comparador === 'mayor' ? 'superior a' : 'igual o superior a';
  return `${comparador} ${d.uma.toLocaleString('es-MX')} UMA${d.nota ? ` — ${d.nota}` : ''}`;
}

export function construirLlmsFullTxt(): string {
  const l: string[] = [];
  const uma = datos.UMA_VIGENTE_MAS_RECIENTE;

  l.push('# LeyAntilavado.org — corpus legal completo (LFPIORPI)');
  l.push('');
  l.push(
    '> Volcado íntegro de las reglas que este sitio publica sobre la Ley Federal para la ' +
      'Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita (México). ' +
      'Generado desde el mismo motor que alimenta las páginas: si una cifra cambia aquí, ' +
      'cambió en el sitio, y al revés.',
  );
  l.push('');
  l.push(`Última revisión editorial: ${REVISION_VIGENTE}.`);
  l.push(`UMA más reciente registrada: año ${uma.anio}.`);
  l.push('');
  l.push('## Cómo leer este archivo');
  l.push('');
  l.push(
    '- Los umbrales se expresan en veces el valor diario de la UMA, nunca en pesos: ' +
      'la UMA cambia cada 1 de febrero, así que un umbral en pesos sólo es válido para su año.',
  );
  l.push(
    '- «superior a» e «igual o superior a» son reglas distintas. En el borde exacto ' +
      'deciden si hay obligación o no.',
  );
  l.push(
    '- Un supuesto marcado «sin umbral publicado» existe en la ley y NO tiene cifra ' +
      'publicada por la autoridad. No se rellena con la de otra fracción.',
  );
  l.push('');

  /* ── Actividades y sus umbrales ─────────────────────────────────────── */
  l.push('## Actividades vulnerables (art. 17) y sus umbrales');
  l.push('');
  const umbralPorActividad = new Map(datos.UMBRALES.map((u) => [u.actividad, u]));

  for (const a of datos.ACTIVIDADES) {
    const u = umbralPorActividad.get(a.slug);
    l.push(`### ${a.nombre}`);
    l.push('');
    l.push(`- Fracción: art. 17, ${a.fraccion}`);
    l.push(`- Página: ${SITIO.url}/actividades-vulnerables/${a.slug}`);
    if (u) {
      l.push(`- Umbral de identificación: ${describirUmbral(u.identificacion)}`);
      l.push(`- Umbral de aviso: ${describirUmbral(u.aviso)}`);
      l.push(`- Disposición: ${u.procedencia.disposicion}`);
      l.push(`- Periodicidad: ${u.periodicidad}`);
      if (u.estado !== 'publicado' && u.estado !== 'revisado') {
        // El estado editorial es información, no ruido interno: un modelo debe
        // saber que esa regla todavía no está verificada.
        l.push(`- ⚠ Estado editorial: ${u.estado} — aún no verificada como regla firme.`);
      }
    }
    l.push(`- Alcance: ${a.descripcion}`);
    if (a.ejemplosSujetos?.length) {
      l.push(`- Ejemplos de sujetos obligados: ${a.ejemplosSujetos.join(', ')}.`);
    }
    l.push('');
  }

  /* ── Obligaciones ───────────────────────────────────────────────────── */
  const obligaciones = datos.OBLIGACIONES.filter(
    (o) => o.estado === 'publicado' || o.estado === 'revisado',
  );
  l.push('## Obligaciones');
  l.push('');
  for (const o of obligaciones) {
    l.push(`### ${o.titulo}`);
    l.push('');
    l.push(`- Disposición: ${o.procedencia.disposicion}`);
    l.push(`- Página: ${SITIO.url}/obligaciones/${o.slug}`);
    l.push(`- Resumen: ${o.resumen}`);
    l.push('');
  }

  /* ── Límites de efectivo ────────────────────────────────────────────── */
  l.push('## Límites de efectivo (art. 32)');
  l.push('');
  l.push(
    'El artículo 32 no es un umbral de reporte: es una **prohibición**. Y se mide con IVA ' +
      'incluido, a diferencia de los umbrales del art. 17, que se miden sin IVA.',
  );
  l.push('');
  for (const r of datos.REGLAS_EFECTIVO) {
    l.push(`- **${r.nombre}** — límite de ${r.limiteUMA.toLocaleString('es-MX')} UMA`);
    l.push(`  - ${r.descripcion}`);
    l.push(`  - Disposición: ${r.procedencia.disposicion ?? 'art. 32 LFPIORPI'}`);
    if (r.discrepanciaOficial) {
      l.push(
        `  - ⚠ Discrepancia entre fuentes oficiales: ${r.discrepanciaOficial.descripcion}`,
      );
    }
  }
  l.push('');

  /* ── UMA histórica ──────────────────────────────────────────────────── */
  l.push('## Valores de la UMA');
  l.push('');
  l.push(
    'Vigentes del 1 de febrero de cada año al 31 de enero del siguiente. Una operación de ' +
      'enero se rige por el valor del año anterior.',
  );
  l.push('');
  for (const v of datos.VALORES_UMA) {
    l.push(`- ${v.anio}: ${(v.diariaCentavos / 100).toFixed(2)} pesos diarios`);
  }
  l.push('');

  /* ── Calendario ─────────────────────────────────────────────────────── */
  l.push('## Calendario de cumplimiento');
  l.push('');
  for (const h of datos.CALENDARIO) {
    l.push(`- **${h.fecha}** — ${h.titulo}`);
    if (h.descripcion) l.push(`  - ${h.descripcion}`);
  }
  l.push('');

  /* ── Fuentes ────────────────────────────────────────────────────────── */
  l.push('## Fuentes oficiales');
  l.push('');
  for (const f of datos.FUENTES) {
    l.push(`- ${f.nombre}${f.url ? ` — ${f.url}` : ''}`);
  }
  l.push('');
  l.push('---');
  l.push('');
  l.push(
    'LeyAntilavado.org es un proyecto editorial independiente. No es una autoridad, no ' +
      'emite constancias ni dictámenes, y nada de lo anterior sustituye la asesoría de un ' +
      'profesional sobre un caso concreto.',
  );
  l.push('');

  return l.join('\n');
}
