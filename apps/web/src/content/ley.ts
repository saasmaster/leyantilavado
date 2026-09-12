import { PRECEPTOS, PRECEPTO_POR_SLUG, REFORMA_VIGENTE, type PreceptoOficial } from './ley-texto.generado';

/* ────────────────────────────────────────────────────────────────────────────
 * La capa de referencia: la ley artículo por artículo.
 *
 * Dos capas separadas a propósito:
 *
 *   ley-texto.generado.ts  el texto vigente, extraído del .doc de la Cámara
 *                          de Diputados por `scripts/extraer-ley.mjs`. Nadie
 *                          lo escribe: se regenera y el diff es la reforma.
 *   este archivo           lo que sí es nuestro: la explicación en español
 *                          llano, el malentendido que corrige y los enlaces.
 *
 * Por qué importa la separación: una cita mal transcrita en una página
 * titulada «Artículo 18» es peor que no tener la página. Si el texto oficial
 * viviera aquí, cualquier pasada editorial podría tocarlo sin que nada avise.
 *
 * ── Por qué ocho artículos y no treinta ────────────────────────────────────
 *
 * Search Console reporta 43 páginas «rastreadas, sin indexar» y 39
 * «descubiertas» que Google no ha descargado nunca. Con esa señal, publicar
 * treinta páginas nuevas de golpe alimenta la misma cubeta. Estos ocho son
 * los preceptos que el sitio ya explica en sus páginas prácticas, así que
 * cada uno nace con destino interno al que mandar al lector.
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * La capa /ley se publicó este día. No es `PUBLICADO_DESDE` (12-ago): estas
 * páginas no existían entonces, y declararles esa antigüedad sería la misma
 * clase de fecha falsa que `fechas-articulo.test.ts` ya persigue.
 *
 * Tampoco es la fecha de la reforma: el texto de la ley cambió en 2025, pero
 * lo que cambió en ESTA URL fue que empezó a existir.
 */
export const LEY_PUBLICADA_EN = '2026-09-12';

export interface ArticuloEditorial {
  /** Coincide con el `slug` del precepto generado. */
  slug: string;
  /** ≤ 60 caracteres; lo verifica `sitio.test.ts`. */
  tituloSEO: string;
  /** ≤ 160 caracteres. */
  descripcionSEO: string;
  /** El H1. */
  titulo: string;
  respuestaDirecta: string;
  /** Qué dice el artículo, en español llano. Nuestro, no del DOF. */
  explicacion: readonly string[];
  /** Sólo cuando la reforma de 2025 cambió algo de fondo en ESTE precepto. */
  cambio2025?: readonly string[];
  /** El malentendido concreto de este artículo, no una advertencia genérica. */
  confusion: { titulo: string; texto: string };
  relacionados: readonly {
    titulo: string;
    enlaces: readonly { etiqueta: string; href: string; descripcion?: string }[];
  }[];
}

export const ARTICULOS: readonly ArticuloEditorial[] = [
  /* ── 17 ────────────────────────────────────────────────────────────────── */
  {
    slug: 'articulo-17',
    tituloSEO: 'Artículo 17 LFPIORPI: actividades vulnerables',
    descripcionSEO:
      'Texto vigente del artículo 17 de la Ley Antilavado: qué actividades son vulnerables, sus umbrales en UMA y la regla de acumulación de seis meses.',
    titulo: 'Artículo 17 de la LFPIORPI',
    respuestaDirecta:
      'El artículo 17 es la lista: enumera las actividades que la ley considera vulnerables y, en cada una, el monto a partir del cual nace la obligación de identificar y el monto a partir del cual nace la de avisar. No dice qué hay que hacer —eso es el artículo 18—, dice a quién le toca hacerlo.',
    explicacion: [
      'El artículo abre con una frase que decide su alcance: estas actividades son «objeto de identificación en términos del artículo siguiente». El 17 reparte el universo; el 18 reparte el trabajo. Quien busca la lista de obligaciones en el 17 no la va a encontrar.',
      'Cada fracción sigue el mismo patrón: describe la actividad y después fija uno o dos umbrales en veces el valor diario de la UMA. Un umbral de identificación obliga a integrar el expediente del cliente; uno de aviso obliga además a reportar la operación. Hay fracciones con los dos y fracciones donde la identificación es siempre, sin monto mínimo.',
      'El penúltimo párrafo contiene la regla que más consultas genera. Dice que las operaciones por debajo de los montos «no darán lugar a obligación alguna», pero que si una misma persona acumula en seis meses una suma que supere el umbral de aviso, esa suma podrá considerarse operación sujeta a aviso. Es la regla antifraccionamiento: impide que partir una operación en pedazos la saque del radar.',
      'El último párrafo reconoce dos extensiones: quien actúa por medio de fideicomisos o cualquier otra figura jurídica también realiza actividades vulnerables, y la Secretaría puede excluir por reglas generales las actividades hechas por conducto del sistema financiero.',
    ],
    cambio2025: [
      'La reforma del 16 de julio de 2025 tocó el artículo en varios niveles a la vez: reformó fracciones e incisos, adicionó fracciones y apartados nuevos, y añadió párrafos. No fue un retoque de montos.',
      'El detalle de qué cambió para cada giro —y qué obligación nueva trae— está resuelto actividad por actividad en las páginas de cada fracción, no aquí.',
    ],
    confusion: {
      titulo: 'Estar en el artículo 17 no significa tener que presentar avisos',
      texto:
        'Aparecer en una fracción del 17 significa que realizas una actividad vulnerable. A partir de ahí, cada operación se mide contra dos umbrales distintos: si sólo supera el de identificación, hay expediente pero no aviso. Muchos negocios se dan de alta y presentan informes en ceros durante años precisamente porque nunca cruzan el umbral de aviso.',
    },
    relacionados: [
      {
        titulo: 'Aplicarlo a tu caso',
        enlaces: [
          { etiqueta: 'Las 17 fracciones, una por una', href: '/actividades-vulnerables', descripcion: 'Qué alcanza cada fracción y a quién' },
          { etiqueta: 'Tabla completa de umbrales', href: '/umbrales', descripcion: 'Identificación y aviso, en UMA y en pesos' },
          { etiqueta: 'Busca tu giro', href: '/para', descripcion: 'Notaría, inmobiliaria, joyería, casa de empeño…' },
        ],
      },
      {
        titulo: 'Calcularlo',
        enlaces: [
          { etiqueta: 'Calculadora de umbrales', href: '/herramientas/calculadora-umbrales', descripcion: 'Con la UMA de la fecha de tu operación' },
          { etiqueta: 'Acumulación de seis meses', href: '/herramientas/acumulacion-operaciones', descripcion: 'La regla del penúltimo párrafo' },
        ],
      },
      {
        titulo: 'La ley',
        enlaces: [
          { etiqueta: 'Artículo 18: las obligaciones', href: '/ley/articulo-18' },
          { etiqueta: 'Artículo 23: el plazo del aviso', href: '/ley/articulo-23' },
          { etiqueta: 'Índice de la LFPIORPI', href: '/ley' },
        ],
      },
    ],
  },

  /* ── 18 ────────────────────────────────────────────────────────────────── */
  {
    slug: 'articulo-18',
    tituloSEO: 'Artículo 18 LFPIORPI: obligaciones 2026',
    descripcionSEO:
      'Texto vigente del artículo 18 de la Ley Antilavado y sus doce obligaciones: expediente, avisos, enfoque de riesgos, manual, capacitación, monitoreo y auditoría.',
    titulo: 'Artículo 18 de la LFPIORPI',
    respuestaDirecta:
      'El artículo 18 es la lista de obligaciones de quien realiza una actividad vulnerable. Tras la reforma de 2025 son doce fracciones —de la I a la XI, más una IV Bis— y ya no se agotan en identificar al cliente y presentar avisos: incluyen evaluación de riesgos, manual de políticas internas, capacitación anual, monitoreo automatizado y auditoría.',
    explicacion: [
      'Las primeras fracciones son las de siempre, con más detalle. Identificar y conocer «de manera directa» al cliente y verificar su identidad (I). Pedirle su actividad u ocupación cuando hay relación de negocios (II). Identificar al beneficiario controlador si es persona moral, fideicomiso u otra figura jurídica; y si es persona física, recabar su declaración sobre si lo tiene (III).',
      'La fracción IV es la de resguardo, y trae el plazo que más se cita: la información debe conservarse, física o electrónicamente, en el domicilio registrado ante la Secretaría, por al menos diez años desde la operación. Si hubo recurso o juicio, el plazo se interrumpe al presentarlo y se reinicia cuando la resolución quede firme.',
      'La IV Bis es el alta y registro en el Padrón por el Portal en Internet, con sus modificaciones y bajas. La V obliga a dar facilidades para las visitas de verificación.',
      'La VI son los avisos e informes. Su segundo párrafo es el aviso de veinticuatro horas: ante sospecha o información basada en hechos o indicios de que los recursos provienen o se destinan a delitos de operaciones con recursos de procedencia ilícita, hay que avisar dentro de las 24 horas siguientes a que se tuvo la información o se generó la sospecha, «incluso si el acto u operación no se celebró».',
      'De la VII a la XI está el bloque de cumplimiento estructural: evaluación con enfoque basado en riesgos (VII); manual de políticas internas, que debe incluir cómo identificar y dar seguimiento a personas políticamente expuestas (VIII); selección de personal y programas de capacitación anuales (IX); mecanismos automatizados de monitoreo permanente, para detectar lo que se sale del perfil transaccional o lo que debe acumularse conforme al artículo 17 (X); y revisión anual por auditoría interna o auditor externo independiente, según el riesgo propio sea bajo, medio o alto (XI).',
    ],
    cambio2025: [
      'El artículo pasó de un catálogo centrado en el expediente y el aviso a un régimen de cumplimiento completo. Las fracciones VII a XI —riesgos, manual, capacitación, monitoreo automatizado y auditoría— son la parte adicionada, y con ellas la fracción IV Bis del padrón.',
      'Casi todas remiten a las reglas de carácter general para su detalle operativo, que es donde entra el Acuerdo 115/2026.',
      'La fracción XI gradúa el esfuerzo según el riesgo: con riesgo bajo o medio basta auditoría interna o externa; con riesgo alto tiene que ser auditor externo independiente. Y el riesgo propio no se elige: sale de la evaluación de la fracción VII.',
    ],
    confusion: {
      titulo: 'El aviso de 24 horas no sustituye al aviso mensual ni depende de un umbral',
      texto:
        'Es un supuesto distinto, dentro de la fracción VI: se dispara por sospecha, no por monto, y corre desde que se tuvo la información, no desde el cierre del mes. La ley dice expresamente que procede aunque la operación no se haya celebrado — es decir, el cliente que se retira cuando le piden documentación puede ser exactamente el caso que hay que avisar.',
    },
    relacionados: [
      {
        titulo: 'Cumplir cada fracción',
        enlaces: [
          { etiqueta: 'Todas las obligaciones, con su evidencia', href: '/obligaciones' },
          { etiqueta: 'Enfoque basado en riesgos', href: '/obligaciones/enfoque-basado-riesgos', descripcion: 'Fracción VII' },
          { etiqueta: 'Manual de cumplimiento', href: '/obligaciones/manual-cumplimiento', descripcion: 'Fracción VIII' },
          { etiqueta: 'Mecanismos automatizados', href: '/obligaciones/mecanismos-automatizados', descripcion: 'Fracción X' },
        ],
      },
      {
        titulo: 'Herramientas',
        enlaces: [
          { etiqueta: 'Plan de cumplimiento', href: '/herramientas/plan-cumplimiento' },
          { etiqueta: 'Checklist de expediente', href: '/herramientas/checklist-expediente', descripcion: 'Fracciones I a IV' },
          { etiqueta: 'Capacitación anual', href: '/herramientas/capacitacion-anual', descripcion: 'Fracción IX' },
          { etiqueta: 'Preparación de auditoría', href: '/herramientas/preparacion-auditoria', descripcion: 'Fracción XI' },
        ],
      },
      {
        titulo: 'La ley',
        enlaces: [
          { etiqueta: 'Artículo 17: a quién alcanza', href: '/ley/articulo-17' },
          { etiqueta: 'Artículo 53: qué se sanciona', href: '/ley/articulo-53' },
          { etiqueta: 'Acuerdo 115/2026', href: '/acuerdo-115-2026', descripcion: 'Las reglas que lo desarrollan' },
        ],
      },
    ],
  },

  /* ── 23 ────────────────────────────────────────────────────────────────── */
  {
    slug: 'articulo-23',
    tituloSEO: 'Artículo 23 LFPIORPI: plazo del aviso',
    descripcionSEO:
      'Texto vigente del artículo 23 de la Ley Antilavado: los avisos se presentan a más tardar el día 17 del mes inmediato siguiente al de la operación.',
    titulo: 'Artículo 23 de la LFPIORPI',
    respuestaDirecta:
      'El artículo 23 fija el plazo: los avisos se presentan a más tardar el día 17 del mes inmediato siguiente a aquel en que se llevó a cabo la operación. Es el artículo más corto de los que importan a diario y el que marca el calendario de todo el año.',
    explicacion: [
      'Dos datos y nada más. El plazo vence el día 17, y el mes de referencia es el inmediato siguiente al de la operación que da origen al aviso. Una operación del 2 de marzo y una del 30 de marzo comparten fecha límite: el 17 de abril.',
      'El segundo párrafo reserva a la Secretaría la facultad de establecer excepciones a estos plazos mediante acuerdo publicado en el Diario Oficial de la Federación. Es la vía por la que se han diferido plazos en el pasado, y la razón por la que conviene revisar el DOF antes de dar por perdida una fecha.',
      'El artículo no regula qué pasa si el 17 cae en fin de semana o día inhábil; esa precisión vive en las reglas de carácter general y en el Reglamento, no aquí.',
    ],
    confusion: {
      titulo: 'El plazo es del mes siguiente, no de 17 días',
      texto:
        'No son diecisiete días desde la operación ni diecisiete días hábiles: es un día del calendario, el 17, del mes inmediato siguiente. Una operación del 1 de marzo tiene 47 días de margen y una del 31 de marzo tiene 17. Es la misma fecha límite para las dos.',
    },
    relacionados: [
      {
        titulo: 'Calcular tu fecha',
        enlaces: [
          { etiqueta: 'Calculadora de fecha límite', href: '/herramientas/fecha-limite-aviso', descripcion: 'Desde la fecha de tu operación' },
          { etiqueta: 'Calendario de cumplimiento', href: '/calendario-cumplimiento', descripcion: 'Todas las fechas del año' },
        ],
      },
      {
        titulo: 'Presentarlo',
        enlaces: [
          { etiqueta: 'Cómo presentar un aviso', href: '/guia-aviso', descripcion: 'De la plantilla al acuse' },
          { etiqueta: 'Alta y registro en el SPPLD', href: '/obligaciones/alta-sppld' },
        ],
      },
      {
        titulo: 'Si ya se te pasó',
        enlaces: [
          { etiqueta: 'Artículo 53: qué se sanciona', href: '/ley/articulo-53', descripcion: 'La extemporaneidad y sus 30 días' },
          { etiqueta: 'Multas y autocorrección', href: '/multas' },
          { etiqueta: 'Me llegó un requerimiento', href: '/requerimiento-sat' },
        ],
      },
    ],
  },

  /* ── 32 ────────────────────────────────────────────────────────────────── */
  {
    slug: 'articulo-32',
    tituloSEO: 'Artículo 32 LFPIORPI: límites al efectivo',
    descripcionSEO:
      'Texto vigente del artículo 32 de la Ley Antilavado: las ocho operaciones en que se prohíbe pagar o aceptar pago en efectivo y metales, con montos en UMA.',
    titulo: 'Artículo 32 de la LFPIORPI',
    respuestaDirecta:
      'El artículo 32 no fija un umbral de aviso: prohíbe. Enumera ocho operaciones en las que, a partir de cierto monto, queda prohibido pagar —y también aceptar el pago— con billetes, monedas o metales preciosos. La prohibición alcanza a las dos partes y no se salva pagando en efectivo por conducto de un banco.',
    explicacion: [
      'El primer párrafo es el que hace el trabajo. Prohíbe «dar cumplimiento a obligaciones y, en general, liquidar o pagar, así como aceptar la liquidación o el pago» en efectivo o metales preciosos, «aun cuando la liquidación o el pago se realice en efectivo por conducto de una Entidad Financiera».',
      'Después vienen los ocho supuestos, cada uno con su monto en veces el valor diario de la UMA del día en que se realice el pago: inmuebles (I), vehículos aéreos, marítimos o terrestres (II), relojes, joyería, metales y piedras preciosas y obras de arte (III), boletos y premios de juegos con apuesta, concursos o sorteos (IV), blindaje de vehículos o inmuebles (V), partes sociales y acciones (VI), uso o goce de los bienes de las fracciones I, II y V (VII) y la consignación de pago relacionada con cualquiera de las anteriores (VIII).',
      'El inmueble tiene su propio umbral, más alto que el resto. La fracción VII se mide en términos mensuales. Y la fracción VIII cierra la puerta de la consignación: no se puede usar el depósito judicial para hacer en efectivo lo que no se podía hacer directamente.',
      'El último párrafo deja abierto que la Secretaría, por reglas de carácter general, extienda la prohibición a bienes fungibles según el riesgo que representen.',
    ],
    cambio2025: [
      'La reforma del 16 de julio de 2025 tocó el artículo. El sitio mantiene los montos vigentes y su fecha de entrada en vigor en la tabla del motor, no en el texto de esta página.',
    ],
    confusion: {
      titulo: 'No te alcanza sólo si realizas una actividad vulnerable',
      texto:
        'El artículo 32 no empieza diciendo «quienes realicen Actividades Vulnerables». Prohíbe la operación en sí, a quien paga y a quien cobra. Un particular que vende su coche y acepta el pago en efectivo por encima del monto de la fracción II está en el supuesto, aunque no esté dado de alta en ningún padrón y nunca haya presentado un aviso.',
    },
    relacionados: [
      {
        titulo: 'Los montos de hoy',
        enlaces: [
          { etiqueta: 'Límites de efectivo', href: '/limites-efectivo', descripcion: 'Las ocho prohibiciones, en pesos' },
          { etiqueta: 'Calculadora de límites', href: '/herramientas/limites-efectivo', descripcion: 'Con la UMA del día del pago' },
          { etiqueta: 'Conversor de UMA', href: '/herramientas/calculadora-uma', descripcion: 'Histórico 2016-2026' },
        ],
      },
      {
        titulo: 'Si ya ocurrió',
        enlaces: [
          { etiqueta: 'Artículo 53: qué se sanciona', href: '/ley/articulo-53' },
          { etiqueta: 'Artículo 54: cuánto cuesta', href: '/ley/articulo-54', descripcion: 'El rango más alto de la ley' },
          { etiqueta: 'Calculadora de multas', href: '/herramientas/calculadora-multas' },
        ],
      },
      {
        titulo: 'La ley',
        enlaces: [
          { etiqueta: 'Índice de la LFPIORPI', href: '/ley' },
          { etiqueta: 'Artículo 17: actividades vulnerables', href: '/ley/articulo-17' },
        ],
      },
    ],
  },

  /* ── 33 Bis ────────────────────────────────────────────────────────────── */
  {
    slug: 'articulo-33-bis',
    tituloSEO: 'Artículo 33 Bis LFPIORPI: beneficiario',
    descripcionSEO:
      'Texto vigente del artículo 33 Bis de la Ley Antilavado: las sociedades mercantiles deben poder determinar a su beneficiario controlador y conservar el soporte.',
    titulo: 'Artículo 33 Bis de la LFPIORPI',
    respuestaDirecta:
      'El artículo 33 Bis obliga a las sociedades mercantiles —a todas, realicen o no una actividad vulnerable— a poder determinar claramente quién es su beneficiario controlador, conservar la información que lo soporta y atender los requerimientos de la autoridad sobre ello. Es un artículo adicionado por la reforma de 2025.',
    explicacion: [
      'El sujeto obligado aquí no es quien realiza la actividad vulnerable: son las sociedades mercantiles. El artículo abre el Capítulo IV Bis, «Del Beneficiario Controlador», que la reforma de 2025 añadió completo.',
      'La obligación tiene dos mitades. Una sustantiva: determinar claramente a quién sea su beneficiario controlador y conservar la información que lo soporte. Otra procedimental: atender los requerimientos que hagan las autoridades competentes conforme a esta ley.',
      'El segundo párrafo añade un aviso concreto. Cuando se transmita el dominio o se constituyan derechos de cualquier naturaleza sobre partes sociales o acciones, la sociedad debe presentar aviso de la inscripción en su libro de registro, en el sistema electrónico que determine y opere la Secretaría de Economía conforme al artículo 34, fracción XXXI, de la Ley Orgánica de la Administración Pública Federal.',
    ],
    cambio2025: [
      'El artículo es nuevo: fue adicionado por el decreto publicado en el DOF el 16 de julio de 2025, junto con el 33 Ter y el 33 Quáter y el capítulo que los contiene.',
    ],
    confusion: {
      titulo: 'No es el beneficiario controlador del Código Fiscal',
      texto:
        'Hay dos regímenes distintos con el mismo nombre. El del Código Fiscal de la Federación se rinde ante el SAT y tiene sus propios criterios y sanciones. Éste vive en la LFPIORPI, se apoya en el sistema electrónico de la Secretaría de Economía para el aviso de partes sociales, y su incumplimiento se sanciona por el artículo 53, fracción V. Cumplir uno no cumple el otro.',
    },
    relacionados: [
      {
        titulo: 'Determinarlo',
        enlaces: [
          { etiqueta: 'Herramienta de beneficiario controlador', href: '/herramientas/beneficiario-controlador', descripcion: 'El orden de prelación, paso a paso' },
          { etiqueta: 'Identificación del cliente', href: '/obligaciones/identificacion-cliente' },
        ],
      },
      {
        titulo: 'Qué cambió',
        enlaces: [
          { etiqueta: 'Acuerdo 115/2026', href: '/acuerdo-115-2026', descripcion: 'El capítulo de beneficiario controlador' },
          { etiqueta: 'La reforma, por actividad', href: '/que-cambio' },
        ],
      },
      {
        titulo: 'La ley',
        enlaces: [
          { etiqueta: 'Artículo 18: las obligaciones', href: '/ley/articulo-18', descripcion: 'Fracción III' },
          { etiqueta: 'Artículo 53: qué se sanciona', href: '/ley/articulo-53' },
          { etiqueta: 'Índice de la LFPIORPI', href: '/ley' },
        ],
      },
    ],
  },

  /* ── 51 Ter ────────────────────────────────────────────────────────────── */
  {
    slug: 'articulo-51-ter',
    tituloSEO: 'Artículo 51 Ter LFPIORPI: listado de PEP',
    descripcionSEO:
      'Texto vigente del artículo 51 Ter de la Ley Antilavado: el listado de cargos considerados personas políticamente expuestas y la consulta a la Secretaría.',
    titulo: 'Artículo 51 Ter de la LFPIORPI',
    respuestaDirecta:
      'El artículo 51 Ter ordena a la Secretaría elaborar y mantener actualizado un listado nominativo de cargos de personas servidoras públicas que serán consideradas políticamente expuestas, obliga a los entes públicos a remitir su listado específico, y abre la posibilidad de consultar a la Secretaría cuando, tras identificar al cliente, no se pueda determinar si es PEP.',
    explicacion: [
      'Lo primero que fija es la naturaleza del listado: es de cargos, no de personas. La Secretaría lo elabora y lo mantiene actualizado, y su criterio es el puesto público que hace que quien lo ocupa sea considerado políticamente expuesto.',
      'El segundo párrafo reparte la carga de alimentarlo. Los Poderes Legislativo y Judicial, los órganos constitucionales autónomos, las dependencias y entidades de la Administración Pública Federal y sus homólogos estatales, municipales y de las demarcaciones de la Ciudad de México, la Fiscalía General de la República y las fiscalías locales, los órganos jurisdiccionales fuera de los poderes judiciales, las empresas públicas del Estado y cualquier organismo bajo control de esos poderes remiten a la Secretaría su listado específico, con los datos de identificación del formato que ella emita.',
      'El tercer párrafo es el que interesa a quien está frente a un cliente. Si después de identificar y verificar la identidad del cliente o usuario no se puede determinar si es persona políticamente expuesta, las entidades financieras y quienes realizan actividades vulnerables «podrán consultar a la Secretaría» para cumplir con sus obligaciones, entre ellas la fracción VIII del artículo 18.',
      'La ley no nombra ninguna aplicación. La Consulta PEP 2.0 de la UIF es el desarrollo operativo que prevén las Reglas de Carácter General, en su artículo 23 Quáter 1: el artículo 51 Ter es de donde sale el listado; la aplicación es cómo se consulta.',
    ],
    cambio2025: [
      'El artículo es nuevo: lo adicionó el decreto del 16 de julio de 2025. Antes de él no existía en la ley un mandato expreso de listado de cargos PEP ni la vía de consulta a la Secretaría.',
    ],
    confusion: {
      titulo: 'La consulta es una facultad, no un trámite obligatorio',
      texto:
        'La ley dice «podrán consultar», y sólo para el caso en que, ya hecha la identificación, siga sin poder determinarse la condición de PEP. No sustituye la identificación previa ni el seguimiento que exige el manual de políticas internas: es el recurso para la duda que queda después de haber hecho el trabajo.',
    },
    relacionados: [
      {
        titulo: 'Qué hacer con una PEP',
        enlaces: [
          { etiqueta: 'Personas políticamente expuestas', href: '/obligaciones/personas-politicamente-expuestas' },
          { etiqueta: 'Clasificación de clientes', href: '/herramientas/clasificacion-clientes' },
          { etiqueta: 'Matriz de riesgos', href: '/herramientas/matriz-riesgos' },
        ],
      },
      {
        titulo: 'De dónde sale la obligación',
        enlaces: [
          { etiqueta: 'Artículo 18, fracción VIII', href: '/ley/articulo-18', descripcion: 'El manual y el seguimiento a PEP' },
          { etiqueta: 'Manual de cumplimiento', href: '/obligaciones/manual-cumplimiento' },
        ],
      },
      {
        titulo: 'La ley',
        enlaces: [
          { etiqueta: 'Índice de la LFPIORPI', href: '/ley' },
          { etiqueta: 'Consulta PEP 2.0', href: '/glosario#consulta-pep', descripcion: 'La aplicación de la UIF y cuándo es exigible' },
        ],
      },
    ],
  },

  /* ── 53 ────────────────────────────────────────────────────────────────── */
  {
    slug: 'articulo-53',
    tituloSEO: 'Artículo 53 LFPIORPI: infracciones',
    descripcionSEO:
      'Texto vigente del artículo 53 de la Ley Antilavado: las siete conductas que se sancionan con multa, incluida la regla de los 30 días para el aviso extemporáneo.',
    titulo: 'Artículo 53 de la LFPIORPI',
    respuestaDirecta:
      'El artículo 53 dice qué se sanciona; el 54 dice cuánto cuesta. Son siete fracciones, y hay que leerlas en pareja con el 54, porque cada una cae en un rango de multa distinto: no todas las infracciones valen lo mismo.',
    explicacion: [
      'Las cuatro primeras son el grupo de menor rango: no atender los requerimientos de la Secretaría (I), incumplir cualquiera de las obligaciones del artículo 18 (II), no presentar en tiempo los avisos (III) y presentarlos sin reunir los requisitos del artículo 24 (IV).',
      'La fracción II merece atención por lo que arrastra: remite al artículo 18 completo, que tras la reforma tiene doce fracciones. No tener manual de políticas internas o no haber hecho la evaluación de riesgos entra aquí igual que no integrar un expediente.',
      'La fracción III trae una regla de tiempo propia, en su segundo párrafo: la sanción de esta fracción aplica cuando el aviso se presenta a más tardar dentro de los treinta días siguientes a la fecha en que debió presentarse. Si la extemporaneidad excede ese plazo, el propio texto remite a la sanción prevista para la omisión en el artículo 54, fracción II.',
      'Las tres últimas son las graves: incumplir los artículos 33, 33 Bis y 33 Ter, de fe pública y beneficiario controlador (V); omitir los avisos (VI); y participar en cualquiera de los actos u operaciones prohibidos por el artículo 32 (VII).',
    ],
    confusion: {
      titulo: 'Treinta días separan un rango de multa del siguiente',
      texto:
        'Un aviso presentado el día 25 después del vencimiento y otro presentado el día 35 no están en el mismo lugar de la ley. El primero sigue en la fracción III; el segundo cae en la remisión que hace el propio texto a la sanción de omisión. Es la diferencia práctica más cara del artículo, y la razón por la que regularizar pronto importa más que regularizar perfecto.',
    },
    relacionados: [
      {
        titulo: 'Cuánto cuesta',
        enlaces: [
          { etiqueta: 'Artículo 54: los tres rangos', href: '/ley/articulo-54' },
          { etiqueta: 'Multas y sanciones', href: '/multas', descripcion: 'Cada supuesto, con su rango en pesos' },
          { etiqueta: 'Calculadora de multas', href: '/herramientas/calculadora-multas' },
        ],
      },
      {
        titulo: 'Cómo reducirla',
        enlaces: [
          { etiqueta: 'Autocorrección del artículo 55', href: '/multas' },
          { etiqueta: 'Me llegó un requerimiento', href: '/requerimiento-sat', descripcion: 'Los plazos reales' },
        ],
      },
      {
        titulo: 'Qué se incumplió',
        enlaces: [
          { etiqueta: 'Artículo 18: las obligaciones', href: '/ley/articulo-18' },
          { etiqueta: 'Artículo 23: el plazo', href: '/ley/articulo-23' },
          { etiqueta: 'Artículo 32: el efectivo', href: '/ley/articulo-32' },
        ],
      },
    ],
  },

  /* ── 54 ────────────────────────────────────────────────────────────────── */
  {
    slug: 'articulo-54',
    tituloSEO: 'Artículo 54 LFPIORPI: multas y sanciones',
    descripcionSEO:
      'Texto vigente del artículo 54 de la Ley Antilavado: los tres rangos de multa en UMA y el porcentaje del valor de la operación cuando resulte mayor.',
    titulo: 'Artículo 54 de la LFPIORPI',
    respuestaDirecta:
      'El artículo 54 pone precio a las infracciones del 53, en tres rangos medidos en veces el valor diario de la UMA: de 200 a 2 000, de 2 000 a 10 000, y de 10 000 a 65 000. En el rango más alto hay además una alternativa del 10 al 100 % del valor del acto, y se aplica la que resulte mayor.',
    explicacion: [
      'La fracción I cubre las cuatro primeras infracciones del artículo 53 —requerimientos, obligaciones del artículo 18, avisos fuera de plazo y avisos sin los requisitos del 24— con multa de doscientas a dos mil veces el valor diario de la UMA.',
      'La fracción II corresponde a la fracción V del 53, la de los artículos 33, 33 Bis y 33 Ter, con multa de dos mil a diez mil veces la UMA.',
      'La fracción III es la más alta y cubre las dos infracciones más graves: omitir avisos y participar en operaciones prohibidas por el artículo 32. Va de diez mil a sesenta y cinco mil veces la UMA, «o del diez al cien por ciento del valor del acto u operación, cuando sean cuantificables en dinero, la que resulte mayor».',
      'Esa última frase es la que cambia el orden de magnitud. En una operación grande, el porcentaje supera con holgura el tope en UMA, y entonces el tope deja de ser tope.',
    ],
    confusion: {
      titulo: 'El rango en UMA no es el techo de la multa',
      texto:
        'En la fracción III, el rango de 10 000 a 65 000 UMA y el 10-100 % del valor de la operación no se eligen: se comparan, y se aplica el mayor. Una operación en efectivo de varios millones puede generar una multa muy por encima del equivalente a 65 000 UMA. El porcentaje sólo queda fuera cuando el acto no es cuantificable en dinero.',
    },
    relacionados: [
      {
        titulo: 'Calcularlo',
        enlaces: [
          { etiqueta: 'Calculadora de multas', href: '/herramientas/calculadora-multas', descripcion: 'Con la UMA del año que corresponda' },
          { etiqueta: 'Multas y sanciones', href: '/multas' },
          { etiqueta: 'Conversor de UMA', href: '/herramientas/calculadora-uma' },
        ],
      },
      {
        titulo: 'Reducirla',
        enlaces: [
          { etiqueta: 'Me llegó un requerimiento', href: '/requerimiento-sat' },
          { etiqueta: 'Plan de cumplimiento', href: '/herramientas/plan-cumplimiento' },
        ],
      },
      {
        titulo: 'La ley',
        enlaces: [
          { etiqueta: 'Artículo 53: qué se sanciona', href: '/ley/articulo-53' },
          { etiqueta: 'Artículo 32: el efectivo', href: '/ley/articulo-32' },
          { etiqueta: 'Índice de la LFPIORPI', href: '/ley' },
        ],
      },
    ],
  },
];

export const ARTICULO_POR_SLUG: Readonly<Record<string, ArticuloEditorial>> = Object.fromEntries(
  ARTICULOS.map((a) => [a.slug, a]),
);

/** Los preceptos que tienen página propia, en el orden de la ley. */
export const CON_PAGINA: ReadonlySet<string> = new Set(ARTICULOS.map((a) => a.slug));

/**
 * Primeras palabras del texto vigente, para el índice.
 *
 * Es una sumilla verbatim y no un resumen nuestro a propósito: escribir 73
 * resúmenes cortos es escribir 73 oportunidades de describir mal un artículo
 * que nadie va a verificar. Las primeras palabras de la ley describen bien
 * casi siempre, y cuando no, al menos no mienten.
 */
export function sumilla(p: PreceptoOficial, limite = 120): string {
  const cuerpo = (p.parrafos[0] ?? '').replace(/^Artículo\s+\d+(?:\s+(?:Bis|Ter|Quáter|Quinquies))?\.\s*/, '');
  if (cuerpo.length <= limite) return cuerpo;
  const corte = cuerpo.slice(0, limite);
  return `${corte.slice(0, corte.lastIndexOf(' '))}…`;
}

/** Agrupa los preceptos por la división de la ley donde viven, en orden. */
export function porDivision(): readonly { division: string; rubro: string; preceptos: readonly PreceptoOficial[] }[] {
  const grupos: { division: string; rubro: string; preceptos: PreceptoOficial[] }[] = [];
  for (const p of PRECEPTOS) {
    const ultimo = grupos.at(-1);
    if (ultimo && ultimo.division === p.division) ultimo.preceptos.push(p);
    else grupos.push({ division: p.division, rubro: p.rubro, preceptos: [p] });
  }
  return grupos;
}

/** Rótulo de fracción al inicio de un párrafo del DOF: «III.», «XII Ter.». */
const ROTULO = /^([IVXL]+(?:\s+(?:Bis|Ter|Quáter))?)\.\s/;

/**
 * Texto vigente de una fracción del art. 3 —la de definiciones—, con sus
 * incisos. La fracción III (beneficiario controlador) ocupa varios párrafos:
 * se toma todo hasta el siguiente rótulo de fracción.
 */
export function definicionLegal(fraccion: string): readonly string[] {
  const parrafos = PRECEPTO_POR_SLUG['articulo-3']?.parrafos ?? [];
  const inicio = parrafos.findIndex((t) => ROTULO.exec(t)?.[1]?.replace(/\s+/g, ' ') === fraccion);
  if (inicio < 0) return [];
  const fin = parrafos.findIndex((t, i) => i > inicio && ROTULO.test(t));
  return parrafos.slice(inicio, fin < 0 ? undefined : fin);
}

export { PRECEPTOS, PRECEPTO_POR_SLUG, REFORMA_VIGENTE };
export type { PreceptoOficial };
