#!/usr/bin/env node
/**
 * Extrae el texto vigente de la LFPIORPI desde la fuente oficial.
 *
 * Por qué existe este script y no un archivo escrito a mano: el texto de la
 * ley es la única parte del sitio que NO puede redactarse. Una cita mal
 * transcrita en una página que se llama «Artículo 18» es peor que no tener la
 * página, y la memoria —humana o de un modelo— falla en ambos sentidos: omite
 * fracciones y añade otras que no existen. Aquí el texto sólo puede venir del
 * .doc que publica la Cámara de Diputados.
 *
 * Se usa el .doc y no el PDF a propósito: el PDF trae kerning por carácter y
 * al extraerlo se pierden los espacios entre palabras («Lapresente Ley es»),
 * lo que obligaría a reconstruir la frase a mano —justo lo que este script
 * evita—. `textutil` viene con macOS y lee .doc sin instalar nada.
 *
 *     node scripts/extraer-ley.mjs
 *
 * Vuelve a correrse cuando el DOF publique una reforma. El archivo generado se
 * versiona: el diff muestra exactamente qué cambió la reforma, artículo por
 * artículo, que es la revisión que hay que hacer antes de publicar.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ORIGEN = 'https://www.diputados.gob.mx/LeyesBiblio/doc/LFPIORPI.doc';
const DESTINO = fileURLToPath(new URL('../src/content/ley-texto.generado.ts', import.meta.url));

/** `Artículo 33 Bis.` abre un precepto; `artículo 33 Bis de esta Ley` no. */
const ENCABEZADO = /^Artículo\s+(\d{1,3})(?:\s+(Bis|Ter|Quáter|Quinquies))?\s*[.\-]/;
/** Pie de página del DOF que se repite en cada salto de hoja del .doc. */
const RUIDO = /^(LEY FEDERAL PARA LA PREVENCIÓN|CÁMARA DE DIPUTADOS|Secretaría General|Secretaría de Servicios|Última Reforma DOF|\d+ de \d+)/;
const REFORMA = /^(Artículo|Fracción|Párrafo|Inciso|Apartado|Subinciso|Denominación|Capítulo|Sección)[^\n]*DOF\s+(\d{2}-\d{2}-\d{4})/;
/**
 * Un `Capítulo VII` cierra el artículo anterior: sin esto, el último precepto
 * de cada capítulo se llevaba dentro el encabezado del siguiente —51 Ter
 * terminaba con «Capítulo VII / De las Sanciones Administrativas» como si
 * fueran parte de su texto—.
 */
const DIVISION = /^(Título|Capítulo|Sección)\s+[IVXLC]+(\s+Bis)?$|^(Sección)\s+(Primera|Segunda|Tercera|Cuarta|Quinta|Sexta)$/;

const dir = mkdtempSync(join(tmpdir(), 'lfpiorpi-'));
const doc = join(dir, 'ley.doc');
const txt = join(dir, 'ley.txt');

execFileSync('curl', ['-sL', '--fail', '--max-time', '60', '-o', doc, ORIGEN]);
execFileSync('textutil', ['-convert', 'txt', '-encoding', 'UTF-8', '-output', txt, doc]);

const crudo = readFileSync(txt, 'utf8');
const sha = createHash('sha256').update(readFileSync(doc)).digest('hex').slice(0, 16);

const reformaVigente = crudo.match(/Última Reforma DOF\s+(\d{2}-\d{2}-\d{4})/)?.[1];
if (!reformaVigente) throw new Error('No se encontró la fecha de última reforma en el documento.');

const lineas = crudo.split('\n').map((l) => l.replace(/\s+$/, ''));

// Índice de aperturas. Se conserva SÓLO la primera de cada precepto: el .doc
// repite el encabezado cuando el artículo cruza una página.
const aperturas = [];
const vistos = new Set();
let division = '';
let rubro = '';
for (let i = 0; i < lineas.length; i++) {
  const t = lineas[i].trim();
  if (DIVISION.test(t)) {
    division = t;
    // El renglón siguiente al encabezado es el nombre del capítulo.
    rubro = (lineas[i + 1] ?? '').trim();
    if (DIVISION.test(rubro) || ENCABEZADO.test(rubro)) rubro = '';
    continue;
  }
  const m = ENCABEZADO.exec(t);
  if (!m) continue;
  const id = m[1] + (m[2] ? ` ${m[2]}` : '');
  if (vistos.has(id)) continue;
  vistos.add(id);
  aperturas.push({ id, numero: Number(m[1]), sufijo: m[2] ?? '', linea: i, division, rubro });
}

const articulos = aperturas.map((a, k) => {
  const fin = k + 1 < aperturas.length ? aperturas[k + 1].linea : lineas.length;
  const bruto = lineas.slice(a.linea, fin);

  const parrafos = [];
  const reformas = new Set();
  for (const linea of bruto) {
    const t = linea.trim();
    // Una división cierra el precepto: lo que sigue ya es del capítulo nuevo.
    if (DIVISION.test(t)) break;
    if (!t || RUIDO.test(t)) continue;
    const r = REFORMA.exec(t);
    if (r) {
      // Las notas de reforma son metadatos del DOF, no texto del artículo.
      reformas.add(r[2]);
      continue;
    }
    parrafos.push(t);
  }

  return {
    id: a.id,
    numero: a.numero,
    sufijo: a.sufijo,
    slug: `articulo-${a.numero}${a.sufijo ? `-${a.sufijo.toLowerCase().replace('á', 'a')}` : ''}`,
    division: a.division,
    rubro: a.rubro,
    parrafos,
    reformas: [...reformas].sort(),
  };
});

if (articulos.length < 70) {
  throw new Error(`Sólo se extrajeron ${articulos.length} artículos; se esperaban 73 o más.`);
}
const sinTexto = articulos.filter((a) => a.parrafos.length === 0);
if (sinTexto.length) {
  throw new Error(`Artículos sin texto: ${sinTexto.map((a) => a.id).join(', ')}`);
}

const cabecera = `// GENERADO POR scripts/extraer-ley.mjs — NO EDITAR A MANO.
//
// Fuente:  ${ORIGEN}
// Reforma: DOF ${reformaVigente}
// sha256:  ${sha} (del .doc descargado)
// Extraído: ${new Date().toISOString().slice(0, 10)}
//
// Para actualizar tras una reforma: node scripts/extraer-ley.mjs
// El diff de este archivo ES la lista de cambios que hay que revisar.

export interface PreceptoOficial {
  /** «17», «33 Bis». Como lo nombra el DOF. */
  readonly id: string;
  readonly numero: number;
  readonly sufijo: string;
  /** \`articulo-33-bis\` */
  readonly slug: string;
  /** «Capítulo III» — la división de la ley donde vive el precepto. */
  readonly division: string;
  /** Nombre de esa división: «De las Actividades Vulnerables». */
  readonly rubro: string;
  /** Texto vigente, párrafo a párrafo, sin las notas de reforma del DOF. */
  readonly parrafos: readonly string[];
  /** Fechas DOF que tocaron alguna parte del precepto, ascendente. */
  readonly reformas: readonly string[];
}

/** Fecha de la reforma más reciente que recoge el texto extraído. */
export const REFORMA_VIGENTE = '${reformaVigente}';
export const FUENTE_LEY = '${ORIGEN}';

export const PRECEPTOS: readonly PreceptoOficial[] = ${JSON.stringify(articulos, null, 2)};

export const PRECEPTO_POR_SLUG: Readonly<Record<string, PreceptoOficial>> = Object.fromEntries(
  PRECEPTOS.map((p) => [p.slug, p]),
);
`;

writeFileSync(DESTINO, cabecera);
console.log(`${articulos.length} preceptos → ${DESTINO}`);
console.log(`reforma vigente: DOF ${reformaVigente}`);
const tocados = articulos.filter((a) => a.reformas.includes('16-07-2025'));
console.log(`tocados por 16-07-2025: ${tocados.length} (${tocados.map((a) => a.id).join(', ')})`);
