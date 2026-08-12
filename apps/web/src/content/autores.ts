import type { Autor, FirmaContenido } from './tipos';

/**
 * Sistema de autoría.
 *
 * Todavía no hay personas con nombre asignadas al contenido. En lugar de
 * inventar un autor con credenciales que no podemos acreditar, el contenido lo
 * firma el equipo editorial y se declara abiertamente el método de trabajo.
 *
 * El tipo `Autor` ya soporta persona con nombre y credenciales: cuando haya un
 * revisor real, se agrega aquí y se pasa como `revisor` en la firma de las
 * páginas que revise. No hay que tocar ninguna página para eso.
 */
export const EQUIPO_EDITORIAL: Autor = {
  id: 'equipo-editorial',
  nombre: 'Equipo editorial de LeyAntilavado.org',
  rol: 'Investigación normativa y redacción',
  credenciales: [],
  descripcion:
    'Equipo que investiga, redacta y mantiene el contenido de LeyAntilavado.org. No somos un despacho ni una autoridad: somos un proyecto editorial independiente que explica la LFPIORPI en español claro y cita siempre la disposición de la que sale cada afirmación.',
  metodologia: [
    'Cada cifra legal del sitio sale del motor de reglas, no de un texto escrito a mano. Si la ley cambia, cambia el dato en un solo lugar y con él todas las páginas.',
    'Cada afirmación jurídica lleva artículo y fracción. Si una afirmación no puede anclarse a una disposición, no se publica.',
    'Contrastamos contra fuente primaria: el texto vigente publicado por la Cámara de Diputados, el Diario Oficial de la Federación, el portal SPPLD del SAT y los comunicados del INEGI para la UMA.',
    'Cuando dos fuentes oficiales se contradicen, mostramos ambas y decimos que la autoridad no lo ha aclarado. No elegimos una en silencio.',
    'Cuando un dato no pudo verificarse, la página lo dice con el sello de procedencia en rojo en lugar de esconderlo.',
    'No emitimos constancias, dictámenes ni opiniones jurídicas, y nada de lo publicado sustituye la asesoría de un profesional sobre un caso concreto.',
  ],
  url: '/metodologia-editorial',
};

export const AUTORES: readonly Autor[] = [EQUIPO_EDITORIAL];

export const AUTORES_POR_ID: Record<string, Autor> = Object.fromEntries(
  AUTORES.map((a) => [a.id, a]),
);

/**
 * Fecha de la pasada editorial vigente. Coincide con `ultimaRevision` de los
 * datos del motor: si una se mueve sin la otra, hay que explicar por qué.
 */
export const REVISION_VIGENTE = '2026-08-11';

export const FIRMA_POR_DEFECTO: FirmaContenido = {
  autor: EQUIPO_EDITORIAL,
  publicadoEn: REVISION_VIGENTE,
  actualizadoEn: REVISION_VIGENTE,
};

/** Aviso legal que acompaña a toda página de contenido. */
export const AVISO_LEGAL_TEXTO = [
  'Esta página es información general sobre la LFPIORPI, no asesoría jurídica ni fiscal para un caso concreto. Aplicar una regla a tu operación exige revisar hechos que aquí no conocemos.',
  'LeyAntilavado.org es un proyecto privado e independiente. No pertenece ni está afiliado al SAT, a la UIF, a la SHCP ni a ninguna autoridad del gobierno de México, y no emite constancias ni certificaciones de cumplimiento.',
  'Antes de decidir sobre una operación real, verifica la disposición citada en su fuente oficial y consulta a un profesional.',
] as const;
