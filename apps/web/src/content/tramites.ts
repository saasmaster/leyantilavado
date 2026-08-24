import type { Procedencia } from '@leyantilavado/types';
import { datos } from '@leyantilavado/rules-engine';
import type { PreguntaFrecuente } from './tipos';

/* ────────────────────────────────────────────────────────────────────────────
 * Trámites del portal SPPLD.
 *
 * Este fichero cubre el hueco entre «la ley te obliga a darte de alta» y «estás
 * frente a la pantalla del SAT con la e.firma en la mano». Todo lo que aquí se
 * afirma sobre un trámite sale de una de estas cuatro fuentes, y cada afirmación
 * lleva la suya:
 *
 *   1. LFPIORPI (texto vigente, Cámara de Diputados, última reforma DOF 16-07-2025)
 *   2. Reglamento de la LFPIORPI (compilado 16-08-2013 con reforma DOF 27-03-2026)
 *   3. Reglas de Carácter General (compilado con reforma DOF 30-11-2020)
 *   4. Resolución que expide el formato oficial de alta y registro
 *      (DOF 30-08-2013, reformas 24-07-2014 y 17-08-2016)
 *   5. Fichas de trámite del SAT 85869 (alta) y 42254 (baja), y las preguntas
 *      frecuentes y criterios del portal SPPLD.
 *
 * REGLA QUE MANDA SOBRE TODO LO DEMÁS: no se inventa un paso, una pantalla, un
 * nombre de menú ni un código de error. Lo que la autoridad no publica se
 * declara en `huecos` y se enseña en la página. Un hueco declarado vale más que
 * una instrucción inventada, y una instrucción falsa sobre un trámite fiscal
 * hace daño real.
 *
 * SOBRE LAS CIFRAS: los plazos de estos trámites —seis días hábiles para
 * actualizar, tres para el acuse, diez para la notificación— NO están en el
 * motor de reglas, que hoy sólo modela umbrales, UMA, efectivo y sanciones. Por
 * eso viven en `plazos`, con su disposición y su fuente, y cada uno lleva
 * `subirAlMotor: true` como recordatorio de que su sitio definitivo es
 * `packages/rules-engine/src/datos/`. Ninguno se escribe suelto en un .tsx.
 * ────────────────────────────────────────────────────────────────────────── */

/** Fecha en que se consultaron las fuentes de este fichero. ISO date. */
export const CONSULTADO_EL = datos.ULTIMA_REVISION;

export interface FuenteConsultada {
  etiqueta: string;
  url: string;
  /** ISO date. */
  consultadaEl: string;
  /** Por qué esta fuente respalda lo que dice la página. */
  respalda: string;
  /**
   * Cuando la fuente oficial no se pudo leer en su servidor y se consultó una
   * copia archivada. Se dice, no se esconde.
   */
  advertencia?: string;
}

export interface PasoTramite {
  texto: string;
  /** Precisión que el texto oficial trae y que cambia el resultado. */
  detalle?: string;
  /** Documento con el que se acredita el paso. */
  evidencia?: string;
  /** Disposición o ficha de la que sale el paso. Siempre visible. */
  disposicion: string;
}

export interface PlazoTramite {
  clave: string;
  etiqueta: string;
  /** El plazo tal como lo dice la norma. Texto, no número suelto. */
  valor: string;
  /** Desde cuándo se cuenta. */
  cuentaDesde: string;
  disposicion: string;
  /**
   * Marca los plazos que deberían vivir en el motor de reglas y todavía no
   * viven ahí. Ninguno se escribe a mano en un componente.
   */
  subirAlMotor: true;
  nota?: string;
}

export interface HuecoDeclarado {
  titulo: string;
  descripcion: string;
  /** Qué hacer mientras la autoridad no lo publique. */
  queHacerMientras: string;
}

export interface Fundamento {
  disposicion: string;
  texto: string;
}

export interface Tramite {
  slug: string;
  titulo: string;
  tituloSEO: string;
  descripcionSEO: string;
  /** Una línea para las tarjetas del índice. */
  resumen: string;
  respuestaDirecta: string;
  entradilla: string;
  /** Etiqueta corta del bloque al que pertenece en el índice. */
  bloque: 'entrar' | 'mantener' | 'salir' | 'atorado';
  quienLoPresenta: string;
  cuandoSePresenta: string;
  cuandoDisposicion: string;
  requisitos: readonly string[];
  pasos: readonly PasoTramite[];
  documentoQueObtienes: string | null;
  plazos: readonly PlazoTramite[];
  fundamento: readonly Fundamento[];
  huecos: readonly HuecoDeclarado[];
  erroresComunes: readonly string[];
  faq: readonly PreguntaFrecuente[];
  fuentes: readonly FuenteConsultada[];
  procedencia: Procedencia;
  /** Slugs de otros trámites que casi siempre se hacen junto a éste. */
  relacionados: readonly string[];
}

/* ── Fuentes reutilizadas ─────────────────────────────────────────────────── */

const F_LEY: FuenteConsultada = {
  etiqueta: 'LFPIORPI, texto vigente (Cámara de Diputados, última reforma DOF 16-07-2025)',
  url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPIORPI.pdf',
  consultadaEl: CONSULTADO_EL,
  respalda:
    'El art. 18, fracción IV Bis —adicionado por el DOF 16-07-2025— es el que crea la obligación de dar de alta, modificar o dar de baja el Padrón. El art. 20 es el del representante encargado del cumplimiento.',
};

const F_REGLAMENTO: FuenteConsultada = {
  etiqueta: 'Reglamento de la LFPIORPI, compilado 16-08-2013 con la reforma DOF 27-03-2026',
  url: 'https://www.pld.hacienda.gob.mx/work/models/PLD/documentos/CompiladoRLFPIORPI160813y270326.pdf',
  consultadaEl: CONSULTADO_EL,
  respalda:
    'El art. 12 exige RFC y certificado vigente de e.firma para el alta, obliga a las personas morales a usar la e.firma asociada a su propio RFC y, en su párrafo reformado en 2026, regula la baja del Padrón y su efecto.',
};

const F_RCG: FuenteConsultada = {
  etiqueta: 'Reglas de Carácter General de la LFPIORPI, compilado con la reforma DOF 30-11-2020',
  url: 'https://www.pld.hacienda.gob.mx/work/models/PLD/documentos/compilado_rcg_reforma30nov2020.pdf',
  consultadaEl: CONSULTADO_EL,
  respalda:
    'Los arts. 4 a 10 son el procedimiento del alta, la actualización, la baja, el requerimiento de información y la aceptación del representante, con sus plazos en días hábiles.',
};

const F_FORMATO: FuenteConsultada = {
  etiqueta:
    'Resolución que expide el formato oficial para el alta y registro (DOF 30-08-2013, reformas 24-07-2014 y 17-08-2016)',
  url: 'https://www.pld.hacienda.gob.mx/work/models/PLD/documentos/compilado_formatoaltaregistro_reforma2016.pdf',
  consultadaEl: CONSULTADO_EL,
  respalda:
    'Fija la dirección del portal, el Anexo «A» que captura quien realiza la actividad, el Anexo «B» que captura el representante y el plazo del SAT para generar el acuse.',
};

const F_SPPLD_OBLIGACIONES: FuenteConsultada = {
  etiqueta: 'Obligaciones contempladas en la LFPIORPI — portal SPPLD del SAT',
  url: 'https://sppld.sat.gob.mx/pld/interiores/obligaciones.html',
  consultadaEl: CONSULTADO_EL,
  respalda:
    'El SAT describe el alta como trámite previo a la presentación del primer aviso y repite los dos requisitos: RFC y certificado vigente de e.firma.',
};

const F_SPPLD_PREGUNTAS: FuenteConsultada = {
  etiqueta: 'Preguntas frecuentes y criterios — portal SPPLD del SAT',
  url: 'https://sppld.sat.gob.mx/pld/interiores/preguntas.html',
  consultadaEl: CONSULTADO_EL,
  respalda:
    'Confirma ante qué autoridad y en qué dirección electrónica se presenta el alta, y qué se requiere para presentarla.',
};

const F_SPPLD_CRITERIOS: FuenteConsultada = {
  etiqueta: 'Criterios por la reforma DOF 16/07/2025 — portal SPPLD del SAT',
  url: 'https://sppld.sat.gob.mx/pld/interiores/criterios.html',
  consultadaEl: CONSULTADO_EL,
  respalda:
    'Es la propia autoridad diciendo qué sujetos nuevos todavía no pueden darse de alta porque el formato oficial no los identifica.',
};

const F_FICHA_ALTA: FuenteConsultada = {
  etiqueta:
    'Ficha de trámite 85869 del SAT — Requisitos para Alta y Registro de Actividades Vulnerables',
  url: 'https://www.sat.gob.mx/tramites/85869/date-de-alta-en-el-portal-de-lavado-de-dinero',
  consultadaEl: CONSULTADO_EL,
  respalda:
    'Es la ficha operativa del alta: quién lo presenta, cuándo, con qué requisitos, qué acuse se obtiene y los tres pasos en línea que el SAT publica.',
  advertencia:
    'El servidor del SAT rechaza las consultas automatizadas de este sitio (HTTP 403), así que el texto se leyó en la copia archivada del 20 de enero de 2025 en el Internet Archive. Verifica la ficha en el portal del SAT antes de actuar: puede haber cambiado.',
};

const F_FICHA_BAJA: FuenteConsultada = {
  etiqueta:
    'Ficha de trámite 42254 del SAT — Si ya no realizas alguna actividad vulnerable, presenta la Baja en el Portal de Prevención de lavado de dinero',
  url: 'https://www.sat.gob.mx/tramites/42254/si-ya-no-realizas-alguna-actividad-vulnerable,-presenta-la-baja-en-el-portal-de-prevencion-de-lavado-de-dinero-',
  consultadaEl: CONSULTADO_EL,
  respalda:
    'Es la ficha operativa de la baja: cuándo se presenta, su fundamento, los tres pasos en línea, el acuse que entrega y el procedimiento por defunción.',
  advertencia:
    'El servidor del SAT rechaza las consultas automatizadas de este sitio (HTTP 403), así que el texto se leyó en la copia archivada del 12 de noviembre de 2024 en el Internet Archive. Verifica la ficha en el portal del SAT antes de actuar: puede haber cambiado.',
};

const F_PORTAL: FuenteConsultada = {
  etiqueta: 'Portal de Prevención de Lavado de Dinero (SPPLD)',
  url: 'https://sppld.sat.gob.mx/sppld/',
  consultadaEl: CONSULTADO_EL,
  respalda:
    'Es la dirección que el propio formato oficial señala en su art. 2. Al abrirla, redirige al servicio de autenticación del SAT con e.firma: no ofrece entrada por contraseña.',
};

const F_CFF: FuenteConsultada = {
  etiqueta: 'Código Fiscal de la Federación, art. 17-D (Cámara de Diputados)',
  url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/CFF.pdf',
  consultadaEl: CONSULTADO_EL,
  respalda:
    'Es donde está la vigencia máxima de cuatro años del certificado de e.firma, que es la causa habitual de quedarse fuera del portal.',
};

const F_FICHA_EFIRMA: FuenteConsultada = {
  etiqueta: 'Ficha de trámite 63992 del SAT — Renueva el certificado de tu e.firma',
  url: 'https://www.sat.gob.mx/tramites/63992/renueva-el-certificado-de-tu-e.firma-(antes-firma-electronica)',
  consultadaEl: CONSULTADO_EL,
  respalda:
    'Es el trámite al que remiten las dos fichas de PLD cuando la e.firma dejó de estar vigente.',
  advertencia:
    'No pudimos abrir esta ficha desde este sitio (el SAT responde HTTP 403 a consultas automatizadas) y no reproducimos su contenido: sólo enlazamos la dirección oficial para que la leas en el portal del SAT.',
};

/* ── Procedencia ──────────────────────────────────────────────────────────── */

const P = (disposicion: string, notaEditorial: string): Procedencia => ({
  fuentes: ['lfpiorpi-vigente', 'sat-marco-normativo', 'sppld-portal'],
  disposicion,
  verificacion: 'oficial_verificado',
  ultimaRevision: datos.ULTIMA_REVISION,
  ultimaModificacion: datos.ULTIMA_REVISION,
  notaEditorial,
});

/* ── Plazos reutilizados ──────────────────────────────────────────────────── */

const PLAZO_ACTUALIZACION: PlazoTramite = {
  clave: 'actualizacion-6-dias',
  etiqueta: 'Plazo para actualizar el registro',
  valor: 'Seis días hábiles',
  cuentaDesde:
    'El día siguiente a que se presenta la situación o el hecho que motiva la actualización de la información.',
  disposicion: 'Art. 7 de las Reglas de Carácter General',
  subirAlMotor: true,
  nota: 'La ficha 85869 del SAT repite el mismo plazo con otras palabras: «Debes mantener tu información de registro debidamente actualizada a más tardar dentro de los 6 días hábiles siguientes a que se presente la situación o hecho que motive la actualización».',
};

const PLAZO_ACUSE: PlazoTramite = {
  clave: 'acuse-3-dias',
  etiqueta: 'Plazo del SAT para generar el acuse electrónico',
  valor: 'Tres días hábiles como máximo',
  cuentaDesde: 'El día siguiente a aquel en que se realizó el trámite.',
  disposicion:
    'Art. 3 de la Resolución que expide el formato oficial de alta y registro (reformado el 17-08-2016)',
  subirAlMotor: true,
  nota: 'El acuse lleva sello digital, número de folio y fecha de envío. Es el documento que acredita el trámite: guárdalo.',
};

const PLAZO_REQUERIMIENTO: PlazoTramite = {
  clave: 'requerimiento-5-dias',
  etiqueta: 'Plazo para atender un requerimiento del SAT sobre tu registro',
  valor: 'Cinco días hábiles, prorrogables hasta tres más a solicitud del interesado',
  cuentaDesde: 'El día siguiente a que se notifica el requerimiento.',
  disposicion: 'Art. 9 de las Reglas de Carácter General',
  subirAlMotor: true,
  nota: 'El SAT puede pedir, en cualquier momento y por los medios electrónicos del portal, documentación que corrobore la información con la que te diste de alta.',
};

const PLAZO_CONSULTA_BUZON: PlazoTramite = {
  clave: 'consulta-medios-electronicos',
  etiqueta: 'Frecuencia obligatoria de consulta de tus notificaciones',
  valor: 'Al menos los días 15 y último de cada mes, o el día hábil siguiente si alguno es inhábil',
  cuentaDesde:
    'Desde que firmas el alta con tu e.firma y aceptas ser notificado por medios electrónicos.',
  disposicion: 'Art. 6 de las Reglas de Carácter General',
  subirAlMotor: true,
  nota: 'Si no consultas, la notificación se tiene por realizada de todas formas el día hábil que corresponda. El correo de alerta es una cortesía, no la notificación.',
};

/* ── Trámites ─────────────────────────────────────────────────────────────── */

export const TRAMITES: readonly Tramite[] = [
  {
    slug: 'alta-y-registro',
    titulo: 'Alta y registro en el Padrón de Actividades Vulnerables',
    tituloSEO: 'Alta en el Padrón de Actividades Vulnerables: cómo se hace',
    descripcionSEO:
      'Cómo darte de alta en el Padrón de Actividades Vulnerables: requisitos, los pasos que publica la ficha 85869 del SAT, el acuse y lo que no documenta.',
    resumen:
      'El trámite con el que entras al padrón del SAT y obtienes acceso al portal para presentar avisos. Requiere RFC y e.firma vigente.',
    bloque: 'entrar',
    respuestaDirecta:
      'El alta se presenta ante el SAT en el Portal de Prevención de Lavado de Dinero (https://sppld.sat.gob.mx/sppld/), firmada con la e.firma de quien realiza la actividad. Necesitas dos cosas y nada más: estar inscrito en el RFC y tener el certificado de e.firma vigente. El SAT publica el momento —«en el momento que se inicie el desarrollo de la actividad vulnerable»— pero no publica las pantallas del portal, así que aquí no vas a encontrar nombres de menú inventados.',
    entradilla:
      'Es el primer trámite de todos: sin registro no hay acceso al portal, y sin acceso no se puede presentar un aviso ni un informe en ceros.',
    quienLoPresenta:
      'Las personas físicas o morales que por su ocupación, profesión, actividad, giro u objeto social sean susceptibles de realizar una o más actividades vulnerables del art. 17 de la LFPIORPI (ficha 85869 del SAT).',
    cuandoSePresenta:
      'En el momento en que se inicia el desarrollo de la actividad vulnerable. El art. 13 del Reglamento —reformado el 27-03-2026— permite además enviar la información de manera anticipada, antes de realizar la actividad.',
    cuandoDisposicion: 'Ficha 85869 del SAT; art. 13 del Reglamento',
    requisitos: [
      'Estar inscrito en el Registro Federal de Contribuyentes (art. 12 del Reglamento; ficha 85869).',
      'Contar con el certificado de e.firma vigente (art. 12 del Reglamento; ficha 85869).',
      'Si eres persona moral, fideicomiso u otra figura jurídica: usar la e.firma asociada a tu propio RFC. El art. 4 de las Reglas prohíbe expresamente usar la e.firma del representante legal.',
      'Tener a la mano el documento que ampara la actividad vulnerable —número o folio, fecha de emisión y periodo que ampara—: el Anexo «A» del formato oficial lo pide como campo obligatorio (campo 3.1.5).',
      'Si eres persona moral: tener elegida a la persona que será representante encargado del cumplimiento, con su RFC. El Anexo «A» captura sus datos y su fecha de designación (campo 5).',
    ],
    pasos: [
      {
        texto: 'Entra a la ficha 85869 del SAT y usa su botón «Iniciar».',
        detalle:
          'La ficha describe el trámite como «en línea» y su primer paso es literalmente «Da clic en el botón Iniciar de esta página». Ese botón lleva al portal SPPLD.',
        disposicion: 'Ficha 85869 del SAT',
      },
      {
        texto: 'Autentícate con tu e.firma.',
        detalle:
          'El segundo paso de la ficha es «Incorpora los datos de e.firma». Al abrir https://sppld.sat.gob.mx/sppld/ el portal redirige al servicio de autenticación del SAT y pide e.firma; no ofrece entrada con contraseña.',
        disposicion: 'Ficha 85869 del SAT; art. 2 de la Resolución del formato oficial',
      },
      {
        texto: 'Captura los datos que pide el Anexo «A» del formato oficial.',
        detalle:
          'Datos de identificación de la persona física o moral, datos de contacto (teléfono y correo electrónico son obligatorios), una entrada por cada actividad vulnerable con su clave y su fecha de inicio, el documento que la ampara, el domicilio donde se realiza cada actividad y —si eres persona moral— los datos del representante encargado del cumplimiento.',
        evidencia: 'Anexo «A» del formato oficial, vigente con la reforma del 17-08-2016',
        disposicion: 'Arts. 2 y 5 de la Resolución del formato oficial; art. 4 de las Reglas',
      },
      {
        texto: 'Envía el trámite firmado con tu e.firma, bajo protesta de decir verdad.',
        detalle:
          'El art. 4 de las Reglas exige las dos cosas: que la información se envíe bajo protesta de decir verdad y que el envío se firme con la e.firma de quien realiza la actividad vulnerable.',
        disposicion: 'Art. 4 de las Reglas de Carácter General',
      },
      {
        texto: 'Descarga y resguarda el acuse de alta.',
        detalle:
          'El SAT expide el «Acuse de Registro de actividades vulnerables. Alta», con sello digital, número de folio y fecha de envío, y con él te otorga el acceso a los medios electrónicos del portal por los que después enviarás avisos y recibirás notificaciones.',
        evidencia: 'Acuse de Registro de actividades vulnerables. Alta',
        disposicion:
          'Art. 5 de las Reglas; art. 3 de la Resolución del formato oficial; ficha 85869',
      },
      {
        texto:
          'Si eres persona moral, avisa a la persona designada: la designación no está completa hasta que ella la acepta en el portal, con su propia e.firma.',
        detalle:
          'Es un trámite aparte, con su propio formato (Anexo «B»). Mientras no lo haga, el cumplimiento corresponde a los integrantes del órgano de administración o al administrador único.',
        evidencia: 'Acuse de aceptación de la designación',
        disposicion:
          'Art. 20 de la Ley; art. 10 de las Reglas; art. 2 Bis de la Resolución del formato oficial',
      },
    ],
    documentoQueObtienes: 'Acuse de Registro de actividades vulnerables. Alta',
    plazos: [PLAZO_ACUSE, PLAZO_ACTUALIZACION, PLAZO_CONSULTA_BUZON, PLAZO_REQUERIMIENTO],
    fundamento: [
      {
        disposicion: 'Art. 18, fracción IV Bis de la LFPIORPI',
        texto:
          'Obliga a «realizar su alta y registro o, en su caso, modificación o baja del Padrón de personas que realizan Actividades Vulnerables, a través del Portal en Internet». Fracción adicionada por el DOF 16-07-2025.',
      },
      {
        disposicion: 'Art. 12 del Reglamento de la LFPIORPI',
        texto:
          'Exige estar inscrito en el RFC y contar con el certificado vigente de e.firma, y obliga a las personas morales, fideicomisos y entidades colegiadas a usar la e.firma asociada a su propio RFC.',
      },
      {
        disposicion: 'Arts. 4, 5 y 6 de las Reglas de Carácter General',
        texto:
          'Fijan qué información se envía (Anexo 1 para persona física, Anexo 2 para persona moral), que el envío se firma con e.firma, que el SAT expide el acuse y otorga el acceso al portal, y que firmar el alta implica aceptar la notificación por medios electrónicos.',
      },
      {
        disposicion: 'Art. 20 de la LFPIORPI',
        texto:
          'Es el fundamento que la propia ficha 85869 cita para el alta de personas morales: obliga a designar representante encargado del cumplimiento y a mantener vigente la designación.',
      },
    ],
    huecos: [
      {
        titulo: 'El SAT no publica las pantallas del portal',
        descripcion:
          'La ficha 85869 resume el trámite en tres pasos —clic en Iniciar, e.firma, capturar los datos— y ahí se detiene. No hay un instructivo oficial con nombres de menú, orden de pestañas ni capturas de pantalla del SPPLD una vez autenticado, y tampoco un catálogo público de mensajes de error del portal.',
        queHacerMientras:
          'Confírmalo al entrar. Lo que sí sabes de antemano es qué campos te van a pedir: son los del Anexo «A», que sí está publicado en el DOF, y están listados arriba en los pasos.',
      },
      {
        titulo: 'Hay sujetos obligados que todavía no pueden darse de alta',
        descripcion:
          'En sus criterios por la reforma del 16-07-2025 el SAT sostiene que quienes realicen actividades vulnerables a partir de esa fecha pueden usar el Anexo «A» vigente —el reformado el 17-08-2016—, salvo tres grupos: quienes actúen por medio de fideicomisos o cualquier otra figura jurídica, quienes realicen actos u operaciones de la fracción XII, apartado D, y las personas físicas y morales que promuevan el despacho aduanal de su propia mercancía o lo realicen como agencia aduanal (fracción XIV). Para esos tres grupos el criterio dice que la obligación se cumple «hasta que ese formato se modifique y los identifique expresamente».',
        queHacerMientras:
          'Documenta la fecha en que empezaste la actividad y guarda el criterio del SAT impreso con su fecha de consulta. El Acuerdo 115/2026 incorpora un Capítulo II Ter sobre el alta de quienes actúan por fideicomisos y otras figuras; su entrada en vigor está en el calendario de cumplimiento de este sitio.',
      },
    ],
    erroresComunes: [
      'Firmar el alta de una persona moral con la e.firma del representante legal. El art. 4 de las Reglas lo prohíbe expresamente: debe usarse la e.firma asociada al RFC de la persona moral.',
      'Dar de alta una sola actividad cuando se realizan varias. El Anexo «A» pide una entrada por actividad vulnerable, con su clave, su fecha de inicio y su domicilio.',
      'Suponer que el alta depende del volumen: el SAT responde en la ficha 85869 que «el alta y registro no está sujeta al número de operaciones», sino a la actividad del art. 17. No superar el umbral de aviso no exime del registro.',
      'Darse de alta y no volver a entrar al portal. El art. 6 de las Reglas obliga a consultar los medios electrónicos al menos los días 15 y último de cada mes; si no se consultan, la notificación se tiene por hecha igual.',
      'Cerrar el trámite sin descargar el acuse. Es el único documento que acredita la fecha del alta, y una revisión lo pide por folio.',
    ],
    faq: [
      {
        pregunta: '¿Puedo darme de alta si mi e.firma o mi contraseña no están vigentes?',
        respuesta:
          'No. El SAT responde en la ficha 85869 que «tienen que estar vigentes para poder ingresar al Portal de Prevención de Lavado de Dinero». Primero renuevas el certificado y después haces el alta.',
      },
      {
        pregunta: '¿Debo darme de alta aunque no tenga operaciones o no rebase los umbrales?',
        respuesta:
          'Sí. En la ficha 85869 el SAT contesta que «el alta y registro no está sujeta al número de operaciones»: se determina por la actividad que se realiza conforme al art. 17 de la LFPIORPI. Los umbrales deciden qué se avisa, no si te registras.',
      },
      {
        pregunta: '¿Puedo darme de alta antes de empezar a realizar la actividad?',
        respuesta:
          'Sí. El art. 13 del Reglamento, reformado el 27-03-2026, permite a quienes por su ocupación, profesión, actividad, giro u objeto social sean susceptibles de realizar una actividad vulnerable enviar la información al SAT de manera anticipada, por los medios y formatos que expida la UIF.',
      },
      {
        pregunta: '¿Qué pasa si presento el alta tarde?',
        respuesta:
          'El art. 5 de las Reglas prevé el caso: los trámites de alta y de actualización presentados de forma extemporánea que impliquen la realización de una actividad vulnerable «surtirán sus efectos en la fecha señalada en el trámite respectivo». Es decir, el registro se retrotrae a la fecha que declaraste, con las obligaciones de aviso que eso arrastra hacia atrás. Eso no borra la extemporaneidad como posible infracción del art. 53, fracción II de la ley.',
      },
      {
        pregunta: '¿Cuánto tarda el acuse?',
        respuesta:
          'El art. 3 de la Resolución del formato oficial obliga al SAT a generar el acuse electrónico con sello digital, folio y fecha de envío «a más tardar dentro de los tres días hábiles siguientes» al trámite.',
      },
    ],
    fuentes: [
      F_LEY,
      F_REGLAMENTO,
      F_RCG,
      F_FORMATO,
      F_FICHA_ALTA,
      F_SPPLD_OBLIGACIONES,
      F_SPPLD_PREGUNTAS,
      F_SPPLD_CRITERIOS,
      F_PORTAL,
    ],
    procedencia: P(
      'Art. 18, fracción IV Bis LFPIORPI; art. 12 del Reglamento; arts. 4 a 6 de las Reglas',
      'Los pasos operativos salen de la ficha 85869 del SAT, leída en copia archivada porque el portal del SAT bloquea las consultas automatizadas de este sitio. Lo que la ficha no publica se declara como hueco en la propia página.',
    ),
    relacionados: ['representante-de-cumplimiento', 'modificacion-de-datos', 'problemas-de-acceso'],
  },

  {
    slug: 'baja-del-padron',
    titulo: 'Baja del Padrón de Actividades Vulnerables',
    tituloSEO: 'Baja del Padrón de Actividades Vulnerables: cómo y cuándo',
    descripcionSEO:
      'Cómo dar de baja una actividad vulnerable en el portal del SAT: requisitos, efecto inmediato, el caso de defunción y los dos plazos que no coinciden.',
    resumen:
      'Dejar de realizar la actividad no te saca del padrón. Mientras no presentes la baja, sigues obligado a presentar avisos o informes en ceros.',
    bloque: 'salir',
    respuestaDirecta:
      'Dejar de realizar la actividad y darse de baja son dos cosas distintas: el art. 12 del Reglamento —reformado el 27-03-2026— dice que la baja «surtirá sus efectos a partir de la fecha en que sea presentada; en caso contrario, quienes se encuentren registrados deberán continuar presentando los Avisos o Informes correspondientes». La baja se hace en el mismo portal, con e.firma vigente, y el acuse se genera en el momento.',
    entradilla:
      'Es el trámite que más caro sale ignorar: el registro sigue vivo aunque el negocio ya no, y con él la obligación mensual de informar.',
    quienLoPresenta:
      'Quien esté inscrito en el Padrón de Actividades Vulnerables y haya dejado de realizar una o más de las actividades registradas. La ficha 42254 lo dice sin rodeos: «es necesario que las des de baja […] para concluir tus obligaciones pues en caso contrario deberás seguir cumpliéndolas».',
    cuandoSePresenta:
      'Aquí conviven dos textos oficiales que no dicen lo mismo, y este sitio no elige uno en silencio. La ficha 42254 responde «al momento de presentar el último aviso de la actividad vulnerable». El art. 8 de las Reglas encauza la baja por el trámite de actualización del art. 7, que corre a más tardar dentro de los seis días hábiles siguientes al hecho que lo motiva. El art. 12 del Reglamento no fija plazo: sólo regula el efecto. Lo prudente es lo que ocurra primero.',
    cuandoDisposicion: 'Ficha 42254 del SAT; arts. 7 y 8 de las Reglas; art. 12 del Reglamento',
    requisitos: [
      'Estar inscrito en el Padrón de Actividades Vulnerables (ficha 42254).',
      'Contar con e.firma vigente. La ficha 42254 responde expresamente que con la e.firma vencida no se puede hacer la baja: hay que renovarla primero.',
      'Haber presentado los avisos o informes en ceros de los periodos anteriores a la baja: el art. 7 de las Reglas advierte que la obligación de avisar subsiste «sin perjuicio del trámite de actualización correspondiente».',
    ],
    pasos: [
      {
        texto: 'Entra a la ficha 42254 del SAT y usa su botón «Iniciar».',
        detalle: 'La ficha describe el trámite como «en línea» y ese es su primer paso publicado.',
        disposicion: 'Ficha 42254 del SAT',
      },
      {
        texto: 'Autentícate con tu e.firma vigente.',
        detalle: 'Segundo paso de la ficha: «Ingresa los datos de e.firma».',
        disposicion: 'Ficha 42254 del SAT',
      },
      {
        texto: 'Actualiza los datos para dar de baja la actividad en el Padrón.',
        detalle:
          'Tercer paso de la ficha: «Actualiza los datos para la baja del Padrón de Actividades Vulnerables». La baja no es un trámite propio: el art. 8 de las Reglas la canaliza por el trámite de actualización del art. 7, y por eso el acuse que entrega el portal dice «Actualización» y no «Baja».',
        disposicion: 'Ficha 42254 del SAT; arts. 7 y 8 de las Reglas',
      },
      {
        texto:
          'Da de baja todas y cada una de las actividades registradas si vas a cerrar del todo.',
        detalle:
          'El SAT responde en la ficha 42254, a la pregunta sobre liquidación, fusión o escisión, que debe tramitarse «primero la baja en el Portal de Prevención de Lavado de Dinero de todas y cada una de las actividades vulnerables que se tengan registradas», antes del trámite ante el SAT.',
        disposicion: 'Ficha 42254 del SAT',
      },
      {
        texto: 'Descarga el acuse: la baja surte efectos en ese momento.',
        detalle:
          'La ficha 42254 responde que «en el momento de hacer el trámite se genera un acuse, en consecuencia, se restringe el acceso al portal de Prevención de Lavado de Dinero y surte efectos en ese momento». Descárgalo antes de perder el acceso.',
        evidencia: 'Acuse. Registro de actividades vulnerables. Actualización',
        disposicion: 'Ficha 42254 del SAT; art. 8 de las Reglas; art. 12 del Reglamento',
      },
    ],
    documentoQueObtienes: 'Acuse. Registro de actividades vulnerables. Actualización',
    plazos: [
      {
        clave: 'baja-efecto',
        etiqueta: 'Cuándo surte efectos la baja',
        valor: 'En la fecha en que se presenta el trámite',
        cuentaDesde: 'La presentación del trámite de actualización en el portal.',
        disposicion: 'Art. 12 del Reglamento (reformado el 27-03-2026) y art. 8 de las Reglas',
        subirAlMotor: true,
        nota: 'No hay efecto retroactivo. Los meses que pasaron entre que dejaste la actividad y que presentaste la baja siguen siendo meses en los que estabas obligado a informar.',
      },
      PLAZO_ACTUALIZACION,
      {
        clave: 'baja-defuncion',
        etiqueta: 'Plazo para pedir la baja por defunción',
        valor: 'Dentro del mes siguiente al fallecimiento',
        cuentaDesde: 'La fecha del fallecimiento de la persona registrada.',
        disposicion: 'Ficha 42254 del SAT, apartado «Información adicional»',
        subirAlMotor: true,
      },
    ],
    fundamento: [
      {
        disposicion: 'Art. 18, fracción IV Bis de la LFPIORPI',
        texto:
          'La baja del Padrón es una de las tres actuaciones que esta fracción obliga a realizar por el Portal en Internet, junto con el alta y la modificación. Fracción adicionada por el DOF 16-07-2025.',
      },
      {
        disposicion: 'Art. 12, último párrafo del Reglamento (reformado el 27-03-2026)',
        texto:
          '«Quienes se hayan dado de alta en términos de lo establecido en el presente artículo y ya no realicen Actividades Vulnerables, deberán realizar su baja del padrón […]. Dicha solicitud surtirá sus efectos a partir de la fecha en que sea presentada; en caso contrario, quienes se encuentren registrados deberán continuar presentando los Avisos o Informes correspondientes».',
      },
      {
        disposicion: 'Art. 8 de las Reglas de Carácter General',
        texto:
          'Manda dar de baja las actividades «mediante el trámite de actualización» del art. 7, con la finalidad de que el SAT restrinja el acceso a los medios electrónicos, y repite que la baja surte efectos a partir de la fecha de presentación.',
      },
    ],
    huecos: [
      {
        titulo: 'Los dos plazos oficiales no coinciden y la autoridad no lo ha aclarado',
        descripcion:
          'La ficha 42254 ata la baja al último aviso; el art. 8 de las Reglas la ata al trámite de actualización del art. 7, que corre en seis días hábiles desde el hecho que lo motiva; el art. 12 del Reglamento no fija plazo alguno. No conocemos un criterio publicado que reconcilie los tres.',
        queHacerMientras:
          'Presenta la baja en cuanto dejes la actividad y, de todos modos, presenta el informe en ceros del periodo si el corte cae a mitad de mes. Lo que no admite discusión en ninguno de los tres textos es que, mientras no presentes la baja, sigues obligado.',
      },
      {
        titulo: 'La respuesta del SAT sobre liquidación, fusión o escisión menciona una «sucesión»',
        descripcion:
          'En la ficha 42254, la respuesta a la pregunta sobre liquidación, fusión o escisión de una persona moral termina diciendo que el trámite «deberá ser realizado dentro del mes siguiente en que haya finalizado la sucesión». La palabra «sucesión» no aparece en la pregunta ni se define en la respuesta. Lo transcribimos como está porque así está publicado.',
        queHacerMientras:
          'Si vas a liquidar, fusionar o escindir, presenta la baja de todas las actividades registradas antes del trámite corporativo ante el SAT, que es la parte de la respuesta que sí es inequívoca.',
      },
      {
        titulo: 'No hay pantallas publicadas para la baja',
        descripcion:
          'Igual que en el alta, la ficha se detiene en «actualiza los datos». El SAT no publica el nombre del apartado dentro del portal ni el flujo de confirmación.',
        queHacerMientras:
          'Confírmalo al entrar. Lo que sí puedes verificar después es el resultado: el acuse de actualización y la pérdida de acceso al portal.',
      },
    ],
    erroresComunes: [
      'Cerrar el negocio y no dar de baja el registro. El art. 12 del Reglamento es explícito: quien sigue registrado sigue obligado a presentar avisos o informes en ceros.',
      'Dar de baja una actividad y dejar otras vivas creyendo que se cerró todo. La baja es por actividad; la ficha 42254 pide bajar «todas y cada una» cuando se cierra la operación.',
      'Dejar la baja para cuando venza la e.firma. Con el certificado vencido el portal no deja entrar, y el trámite se atora hasta que lo renuevas.',
      'Dar de baja antes de presentar el último aviso o el informe en ceros del periodo. Al presentarse la baja se restringe el acceso al portal, y con él la vía para presentarlos.',
      'No descargar el acuse de actualización. Es lo único que acredita la fecha en que dejaste de estar obligado.',
    ],
    faq: [
      {
        pregunta: '¿Puedo realizar el trámite de baja si mi e.firma ya no está vigente?',
        respuesta:
          'No. La ficha 42254 responde: «No, se debe de renovar la e.firma y una vez vigente podrás realizar la baja en el Portal de Prevención de Lavado de Dinero».',
      },
      {
        pregunta: '¿Cuánto tarda en surtir efecto la baja?',
        respuesta:
          'Es inmediata. La ficha 42254 responde que «en el momento de hacer el trámite se genera un acuse, en consecuencia, se restringe el acceso al portal de Prevención de Lavado de Dinero y surte efectos en ese momento». El art. 12 del Reglamento lo confirma: surte efectos a partir de la fecha de presentación.',
      },
      {
        pregunta: '¿Y si la persona registrada falleció?',
        respuesta:
          'La ficha 42254 prevé que cualquier familiar o tercero interesado solicite la baja ante la autoridad entregando: escrito libre bajo protesta de decir verdad pidiendo la baja por defunción, copia del acta de defunción, copia de identificación oficial con fotografía del sujeto obligado, el «Acuse de movimientos de actualización de situación fiscal» del RFC donde se observe el estatus de suspensión por defunción y, tratándose de agentes aduanales, copia de la patente. La solicitud debe hacerse dentro del mes siguiente al fallecimiento.',
      },
      {
        pregunta:
          'Voy a liquidar la sociedad. ¿Primero la baja en el portal o primero el trámite ante el SAT?',
        respuesta:
          'Primero la baja en el portal. La ficha 42254 responde que debe tramitarse «primero la baja en el Portal de Prevención de Lavado de Dinero de todas y cada una de las actividades vulnerables que se tengan registradas», y que para ello se requiere e.firma vigente.',
      },
      {
        pregunta:
          'Suspendí actividades en el RFC. ¿Con eso queda dada de baja mi actividad vulnerable?',
        respuesta:
          'No hay ninguna disposición que lo diga, y el art. 12 del Reglamento apunta en sentido contrario: la baja del Padrón es un trámite propio, se presenta en el portal y surte efectos desde su presentación. La suspensión en el RFC es un movimiento distinto, en un padrón distinto.',
      },
    ],
    fuentes: [F_LEY, F_REGLAMENTO, F_RCG, F_FICHA_BAJA, F_SPPLD_OBLIGACIONES, F_PORTAL],
    procedencia: P(
      'Art. 18, fracción IV Bis LFPIORPI; art. 12 del Reglamento; arts. 7 y 8 de las Reglas',
      'Los pasos y el caso de defunción salen de la ficha 42254 del SAT, leída en copia archivada porque el portal del SAT bloquea las consultas automatizadas de este sitio. La discrepancia de plazos entre la ficha y las Reglas se muestra, no se resuelve.',
    ),
    relacionados: ['modificacion-de-datos', 'alta-y-registro', 'problemas-de-acceso'],
  },

  {
    slug: 'modificacion-de-datos',
    titulo: 'Modificar tus datos o agregar otra actividad vulnerable',
    tituloSEO: 'Modificar tus datos o agregar otra actividad vulnerable',
    descripcionSEO:
      'El trámite de actualización del art. 7 de las Reglas: seis días hábiles para eliminar, modificar o agregar información de tu registro, o sumar una actividad.',
    resumen:
      'Un solo trámite —el de actualización— sirve para corregir datos, cambiar domicilio, cambiar de representante y agregar una actividad nueva. Corre en seis días hábiles.',
    bloque: 'mantener',
    respuestaDirecta:
      'Eliminar, modificar o agregar información de tu registro es siempre el mismo trámite: el de actualización del art. 7 de las Reglas de Carácter General, que debe presentarse a más tardar dentro de los seis días hábiles siguientes al hecho que lo motiva. Agregar una segunda actividad vulnerable no es un alta nueva: es una actualización sobre el mismo registro, con los mismos medios y el mismo formato.',
    entradilla:
      'Es el trámite invisible: nadie lo tiene en el calendario y su plazo es el más corto de todos los del padrón.',
    quienLoPresenta:
      'Quien ya esté registrado y necesite eliminar, modificar o agregar información de su registro. También el representante encargado del cumplimiento respecto de sus propios datos (art. 4 de la Resolución del formato oficial).',
    cuandoSePresenta:
      'A más tardar dentro de los seis días hábiles siguientes a que se presente la situación o el hecho que motive la actualización (art. 7 de las Reglas). La ficha 85869 del SAT repite el mismo plazo.',
    cuandoDisposicion: 'Art. 7 de las Reglas de Carácter General; ficha 85869 del SAT',
    requisitos: [
      'Estar registrado en el Padrón de Actividades Vulnerables.',
      'Contar con e.firma vigente: la actualización se envía por el mismo procedimiento del alta, que exige firmarla (art. 4 de las Reglas, por remisión del art. 7).',
      'Tener identificada la fecha del hecho que motiva la actualización: de ahí corren los seis días hábiles.',
    ],
    pasos: [
      {
        texto: 'Identifica la fecha del hecho que obliga a actualizar.',
        detalle:
          'Un cambio de domicilio, un cambio de correo o teléfono de contacto, el inicio de una segunda actividad vulnerable, el relevo del representante encargado del cumplimiento o la corrección de un dato mal capturado. El plazo de seis días hábiles se cuenta desde ahí, no desde que alguien se acuerda.',
        disposicion: 'Art. 7 de las Reglas de Carácter General',
      },
      {
        texto: 'Entra al portal SPPLD con tu e.firma.',
        detalle:
          'El art. 7 remite al procedimiento del art. 4: mismos medios, mismo portal, mismo requisito de firma. Y el art. 4 de la Resolución del formato oficial confirma que para eliminar, modificar o agregar información se usan «los medios y el Formato Electrónico» del alta.',
        disposicion: 'Art. 7 de las Reglas; art. 4 de la Resolución del formato oficial',
      },
      {
        texto: 'Modifica los campos del Anexo «A» que cambiaron.',
        detalle:
          'Si lo que agregas es otra actividad vulnerable, lo que se añade es un bloque completo: clave de la actividad, fecha de inicio de su prestación, documento que la ampara con folio y periodo, y el domicilio donde se realiza. El Anexo «A» pide el domicilio por cada actividad.',
        disposicion: 'Anexo «A» de la Resolución del formato oficial, campos 3.1 y 4.1',
      },
      {
        texto: 'Envía y guarda el acuse de actualización.',
        detalle:
          'Es el mismo acuse que entrega la baja —«Acuse. Registro de actividades vulnerables. Actualización»— porque para las Reglas los tres movimientos son el mismo trámite.',
        evidencia: 'Acuse. Registro de actividades vulnerables. Actualización',
        disposicion: 'Art. 3 de la Resolución del formato oficial; ficha 42254 del SAT',
      },
      {
        texto: 'Sigue presentando tus avisos mientras el trámite se procesa.',
        detalle:
          'El art. 7 de las Reglas cierra con una advertencia expresa: quienes lleven a cabo actos u operaciones objeto de aviso «deberán presentar los mismos sin perjuicio del trámite de actualización correspondiente».',
        disposicion: 'Art. 7, último párrafo de las Reglas',
      },
    ],
    documentoQueObtienes: 'Acuse. Registro de actividades vulnerables. Actualización',
    plazos: [
      PLAZO_ACTUALIZACION,
      PLAZO_ACUSE,
      {
        clave: 'actualizacion-oficio-10-dias',
        etiqueta: 'Plazo del SAT para notificarte una actualización hecha de oficio',
        valor: 'Diez días hábiles',
        cuentaDesde: 'La fecha en que el SAT realizó la actualización.',
        disposicion: 'Art. 7, tercer párrafo de las Reglas',
        subirAlMotor: true,
        nota: 'El SAT puede actualizar tu registro por su cuenta con la información que tenga o que le den otras dependencias. Te lo notifica por los medios electrónicos del portal.',
      },
      PLAZO_CONSULTA_BUZON,
      {
        clave: 'activos-virtuales-6-dias',
        etiqueta: 'Actualización de la documentación física de activos virtuales',
        valor: 'Seis días hábiles, y la documentación se envía de forma física al SAT',
        cuentaDesde: 'El hecho que motiva la actualización.',
        disposicion: 'Art. 10 Quinquies de las Reglas',
        subirAlMotor: true,
        nota: 'Sólo aplica a quienes realizan la actividad de la fracción XVI del art. 17 —activos virtuales—, cuyo alta exige entregar documentación física antes del trámite electrónico.',
      },
    ],
    fundamento: [
      {
        disposicion: 'Art. 18, fracción IV Bis de la LFPIORPI',
        texto:
          'Incluye expresamente la «modificación» del Padrón entre lo que debe realizarse a través del Portal en Internet. Fracción adicionada por el DOF 16-07-2025.',
      },
      {
        disposicion: 'Art. 7 de las Reglas de Carácter General',
        texto:
          '«Cuando quien realice las Actividades Vulnerables deba eliminar, modificar o agregar información de su registro, efectuará el trámite de actualización correspondiente […] a más tardar dentro de los seis días hábiles siguientes a que se presente la situación o hecho que motive la actualización de la información respectiva».',
      },
      {
        disposicion: 'Art. 4 de la Resolución que expide el formato oficial de alta y registro',
        texto:
          'Confirma que para eliminar, modificar o agregar información al registro se usan los mismos medios y el mismo Formato Electrónico del alta, tanto para quien realiza la actividad como para el representante encargado del cumplimiento.',
      },
    ],
    huecos: [
      {
        titulo: 'No hay una ficha de trámite propia para la modificación',
        descripcion:
          'El SAT publica fichas para el alta (85869) y para la baja (42254). No encontramos una ficha independiente para la modificación de datos o para agregar una actividad: la ficha 85869 sólo menciona el deber de mantener la información actualizada en seis días hábiles, dentro de su apartado de información adicional.',
        queHacerMientras:
          'El fundamento sí está publicado y es el art. 7 de las Reglas. Los pasos de esta página se derivan de ese artículo y del art. 4 de la Resolución del formato oficial, no de una ficha operativa que no existe.',
      },
      {
        titulo: 'El SAT no publica si agregar una actividad genera acuse propio',
        descripcion:
          'Las Reglas tratan la modificación como un trámite de actualización y el acuse publicado se llama «Acuse. Registro de actividades vulnerables. Actualización», pero no hay documento oficial que diga si el portal emite un acuse por cada actividad agregada o uno solo por el envío.',
        queHacerMientras:
          'Descarga y archiva todo lo que el portal genere en la sesión, y anota la fecha. En una revisión lo que se pide es el folio y la fecha.',
      },
    ],
    erroresComunes: [
      'Contar los seis días hábiles desde que alguien se enteró, y no desde el hecho. El art. 7 los cuenta desde que se presenta la situación o el hecho.',
      'Dar de alta un registro nuevo para una segunda actividad. La segunda actividad se agrega al registro existente por la vía de la actualización.',
      'Cambiar de representante encargado del cumplimiento y no actualizar el registro. Mientras la designación no esté actualizada, el art. 20 de la ley traslada el cumplimiento a los integrantes del órgano de administración o al administrador único.',
      'Suspender los avisos mientras se procesa la actualización. El art. 7 obliga a presentarlos «sin perjuicio» del trámite.',
      'Cambiar el correo de contacto en el RFC y no en el registro de actividades vulnerables: son padrones distintos, y las alertas del portal viajan al correo que declaraste aquí.',
    ],
    faq: [
      {
        pregunta: 'Empecé una segunda actividad vulnerable. ¿Me doy de alta otra vez?',
        respuesta:
          'No. El art. 7 de las Reglas trata «agregar información de su registro» como trámite de actualización sobre el registro que ya tienes, y el art. 4 de la Resolución del formato oficial confirma que se usan los mismos medios y el mismo formato. Corren seis días hábiles desde que inicia la nueva actividad.',
      },
      {
        pregunta: '¿El SAT puede cambiar mi registro sin que yo se lo pida?',
        respuesta:
          'Sí. El art. 7 de las Reglas lo faculta a actualizar la información del registro con la que tenga, con la que le proporcionen dependencias y entidades de los tres órdenes de gobierno u organismos públicos autónomos, o con la que obtenga por cualquier otro medio. Debe notificártelo por los medios electrónicos del portal dentro de los diez días hábiles siguientes.',
      },
      {
        pregunta: '¿Cambié de domicilio y sigo con la misma actividad: hay que actualizar?',
        respuesta:
          'Sí. El Anexo «A» del formato oficial pide el domicilio por cada actividad vulnerable que se realice, con código postal, entidad, municipio, colonia, vialidad y números. Un cambio de domicilio es un hecho que motiva la actualización en los términos del art. 7.',
      },
      {
        pregunta: '¿Qué pasa si presento la actualización fuera de los seis días hábiles?',
        respuesta:
          'El art. 5 de las Reglas prevé que los trámites de actualización presentados de forma extemporánea que impliquen la realización de una actividad vulnerable surten efectos en la fecha señalada en el propio trámite. Eso ordena los efectos, no borra la extemporaneidad: el incumplimiento de cualquiera de las obligaciones del art. 18 es infracción del art. 53, fracción II de la ley.',
      },
    ],
    fuentes: [F_LEY, F_RCG, F_FORMATO, F_FICHA_ALTA, F_FICHA_BAJA, F_PORTAL],
    procedencia: P(
      'Art. 18, fracción IV Bis LFPIORPI; art. 7 de las Reglas; art. 4 de la Resolución del formato oficial',
      'No existe ficha de trámite del SAT específica para la modificación. Los pasos se derivan del art. 7 de las Reglas y del art. 4 de la Resolución del formato oficial, y la página lo declara.',
    ),
    relacionados: ['representante-de-cumplimiento', 'alta-y-registro', 'baja-del-padron'],
  },

  {
    slug: 'representante-de-cumplimiento',
    titulo: 'Designar al representante encargado del cumplimiento y que acepte',
    tituloSEO: 'Representante de cumplimiento: designación y aceptación',
    descripcionSEO:
      'Cómo designa una persona moral a su representante de cumplimiento en el portal del SAT, cómo acepta él con su propia e.firma y qué pasa si lo rechaza.',
    resumen:
      'La designación se captura en el alta de la persona moral, pero no queda completa hasta que la persona designada la acepta en el portal con su propia e.firma.',
    bloque: 'entrar',
    respuestaDirecta:
      'Son dos actos, no uno. La persona moral designa al representante dentro de su propio trámite de alta o de actualización (Anexo «A», campo 5). La persona designada entra después al portal con su propio RFC y su propia e.firma y acepta o rechaza (Anexo «B»). Mientras la designación no esté completa y vigente, el art. 20 de la ley traslada el cumplimiento a los integrantes del órgano de administración o al administrador único.',
    entradilla:
      'Es el trámite que más veces queda a medias: la empresa lo captura, nadie avisa a la persona designada y el registro se queda sin representante aceptado.',
    quienLoPresenta:
      'La designación, la persona moral, el fideicomiso o la figura jurídica que realiza la actividad vulnerable. La aceptación o el rechazo, la persona designada, en su propio nombre.',
    cuandoSePresenta:
      'La designación, dentro del trámite de alta y registro; si cambia la persona, dentro de los seis días hábiles siguientes al cambio, por la vía del trámite de actualización. La aceptación no tiene plazo publicado en las Reglas.',
    cuandoDisposicion: 'Art. 20 de la Ley; arts. 4, 7 y 10 de las Reglas',
    requisitos: [
      'Que la persona designada esté inscrita en el RFC. Si no lo está, el art. 10 de las Reglas la autoriza a inscribirse sin obligaciones fiscales para poder tramitar su e.firma; la ficha 85869 lo confirma.',
      'Que la persona designada cuente con certificado vigente de e.firma propio: entra al portal con su RFC y su e.firma, no con los de la empresa.',
      'Que la persona moral haya capturado sus datos en el campo 5 del Anexo «A»: nombre, apellidos, RFC, clave de país de nacionalidad y fecha de designación.',
    ],
    pasos: [
      {
        texto: 'La persona moral captura la designación en su trámite de alta o de actualización.',
        detalle:
          'El campo 5 del Anexo «A» pide nombre y apellidos, RFC, clave de país de nacionalidad y fecha de designación como datos obligatorios; la fecha de nacimiento y la CURP son opcionales.',
        evidencia: 'Anexo «A», campo 5, dentro del acuse de alta o de actualización',
        disposicion: 'Art. 4 de las Reglas; Anexo «A» de la Resolución del formato oficial',
      },
      {
        texto: 'La persona designada entra al portal con su propio RFC y su propia e.firma.',
        detalle:
          'El art. 10 de las Reglas es literal: el representante «deberá ingresar al Portal en Internet, utilizando su clave del Registro Federal de Contribuyentes y su certificado vigente de la FIEL, a fin de aceptar o rechazar la designación de que se trate».',
        disposicion: 'Art. 10 de las Reglas de Carácter General',
      },
      {
        texto: 'Acepta o rechaza, y si acepta completa sus datos de contacto y su domicilio.',
        detalle:
          'El Anexo «B» del formato oficial tiene tres bloques: la aceptación o el rechazo (obligatorio), los datos de contacto —teléfono y correo electrónico obligatorios— y el domicilio, ambos obligatorios sólo cuando se acepta.',
        evidencia: 'Anexo «B» del formato oficial',
        disposicion: 'Art. 2 Bis de la Resolución del formato oficial',
      },
      {
        texto: 'La persona moral recibe la notificación de la aceptación o del rechazo.',
        detalle:
          'El SAT notifica a la persona moral por los medios electrónicos del portal dentro de los diez días hábiles siguientes a que recibe la aceptación o el rechazo.',
        disposicion: 'Art. 10, tercer párrafo de las Reglas',
      },
      {
        texto:
          'Si hubo rechazo, designa a otra persona: la obligación no se traslada al designado.',
        detalle:
          'El art. 10 de las Reglas lo dice y la ficha 85869 lo repite: «el rechazo de la designación no libera a la persona moral del cumplimiento de las obligaciones establecidas en la Ley, el Reglamento, las Reglas de Carácter General y demás disposiciones aplicables».',
        disposicion: 'Art. 10, último párrafo de las Reglas; ficha 85869 del SAT',
      },
    ],
    documentoQueObtienes:
      'Acuse electrónico del trámite, con sello digital, número de folio y fecha de envío (art. 3 de la Resolución del formato oficial)',
    plazos: [
      {
        clave: 'notificacion-aceptacion-10-dias',
        etiqueta: 'Plazo del SAT para notificar a la persona moral la aceptación o el rechazo',
        valor: 'Diez días hábiles',
        cuentaDesde: 'La recepción de la aceptación o del rechazo.',
        disposicion: 'Art. 10, tercer párrafo de las Reglas',
        subirAlMotor: true,
      },
      PLAZO_ACUSE,
      PLAZO_ACTUALIZACION,
    ],
    fundamento: [
      {
        disposicion: 'Art. 20 de la LFPIORPI',
        texto:
          'Obliga a las personas morales que realizan actividades vulnerables a designar ante la Secretaría a un representante encargado del cumplimiento «y mantener vigente dicha designación». Añade que «en tanto no haya un representante o la designación no esté actualizada, el cumplimiento de las obligaciones que esta Ley señala, corresponderá a los integrantes del órgano de administración o al administrador único de la persona moral».',
      },
      {
        disposicion: 'Art. 10 de las Reglas de Carácter General',
        texto:
          'Establece que la designación se completa cuando la persona designada ingresa al portal con su RFC y su e.firma vigente y acepta o rechaza; que si no está inscrita en el RFC puede inscribirse sin obligaciones fiscales para tramitar su e.firma; que el SAT notifica a la persona moral en diez días hábiles; y que el rechazo no libera a la persona moral.',
      },
      {
        disposicion:
          'Art. 2 Bis de la Resolución que expide el formato oficial (adicionado el 24-07-2014)',
        texto:
          'Crea el Anexo «B»: el formato electrónico propio con el que el representante envía la información para completar su designación.',
      },
    ],
    huecos: [
      {
        titulo: 'No hay plazo publicado para que la persona designada acepte',
        descripcion:
          'Las Reglas fijan el plazo del SAT para notificar el resultado (diez días hábiles), pero no encontramos disposición ni ficha que fije un plazo para que la persona designada entre a aceptar o rechazar.',
        queHacerMientras:
          'Trátalo como urgente aunque no tenga plazo: mientras la designación no esté completa, el art. 20 de la ley pone el cumplimiento —y por tanto la responsabilidad— sobre el órgano de administración o el administrador único.',
      },
      {
        titulo: 'La ley pide «mantener vigente» la designación y no dice cada cuándo se refrenda',
        descripcion:
          'El art. 20 exige mantener vigente la designación, pero ni el Reglamento ni las Reglas publican una periodicidad de refrendo. Lo único con plazo cierto es la actualización cuando el hecho cambia: seis días hábiles (art. 7 de las Reglas).',
        queHacerMientras:
          'Actualiza el registro cada vez que la persona designada cambie de puesto, de datos de contacto o deje la empresa, y guarda el acta de designación con su fecha.',
      },
      {
        titulo:
          'La identidad del representante se resguarda, y el alcance no está detallado en el portal',
        descripcion:
          'El art. 20 de la ley remite al art. 38 para el resguardo de la identidad del representante. Ni la ficha 85869 ni el portal SPPLD explican cómo opera ese resguardo en la práctica del trámite.',
        queHacerMientras:
          'No publiques ni difundas los datos de la persona designada más allá de lo que el trámite exige.',
      },
    ],
    erroresComunes: [
      'Capturar la designación y dar por hecho el trámite. Sin la aceptación de la persona designada, la designación no está completa.',
      'Intentar que el representante acepte con la e.firma de la empresa. El art. 10 exige que use su propio RFC y su propio certificado.',
      'Designar a alguien sin RFC y quedarse esperando. Debe inscribirse en el RFC —puede ser sin obligaciones fiscales— y tramitar su e.firma antes de poder aceptar.',
      'Creer que designar traslada la responsabilidad. El art. 20 mantiene la obligación en la persona moral, y el rechazo tampoco la libera.',
      'Cambiar de representante en el organigrama y no en el padrón. Con la designación desactualizada, el cumplimiento recae en el órgano de administración o en el administrador único.',
    ],
    faq: [
      {
        pregunta: '¿Qué pasa si la persona designada no está inscrita en el RFC?',
        respuesta:
          'No puede asumir el encargo hasta que lo esté. El art. 10 de las Reglas la autoriza a inscribirse en el RFC sin obligaciones fiscales para estar en aptitud de tramitar su e.firma, y la ficha 85869 del SAT responde lo mismo.',
      },
      {
        pregunta: '¿Qué pasa si rechaza la designación?',
        respuesta:
          'Hay que designar a otra persona. La ficha 85869 responde que «se deberá asignar a otra persona, ya que el rechazo de la designación no libera a la persona moral del cumplimiento de las obligaciones establecidas en la Ley, el Reglamento, las Reglas de Carácter general y demás disposiciones aplicables».',
      },
      {
        pregunta: '¿Las personas físicas también designan representante?',
        respuesta:
          'No. El art. 20 de la ley reserva la obligación a las personas morales y añade que «las personas físicas tendrán que cumplir, en todos los casos, personal y directamente con las obligaciones que esta Ley establece», salvo el supuesto de las entidades colegiadas de la Sección Tercera del Capítulo III.',
      },
      {
        pregunta: '¿Quién responde mientras no hay representante aceptado?',
        respuesta:
          'Los integrantes del órgano de administración o el administrador único de la persona moral. Lo dice el segundo párrafo del art. 20 de la ley, y aplica tanto cuando no hay representante como cuando la designación no está actualizada.',
      },
    ],
    fuentes: [F_LEY, F_RCG, F_FORMATO, F_FICHA_ALTA, F_PORTAL],
    procedencia: P(
      'Art. 20 LFPIORPI; art. 10 de las Reglas; art. 2 Bis de la Resolución del formato oficial',
      'La secuencia de designación y aceptación está publicada en el DOF. Lo que no está publicado —el plazo para aceptar y la periodicidad del refrendo— se declara como hueco en la página.',
    ),
    relacionados: ['alta-y-registro', 'modificacion-de-datos', 'problemas-de-acceso'],
  },

  {
    slug: 'problemas-de-acceso',
    titulo: 'No puedo entrar al portal: e.firma vencida, RFC y otros bloqueos',
    tituloSEO: 'No puedo entrar al portal SPPLD: e.firma, RFC y bloqueos',
    descripcionSEO:
      'Qué hacer cuando el portal de Prevención de Lavado de Dinero no te deja entrar: e.firma vencida, RFC, la e.firma equivocada y plazos que corren igual.',
    resumen:
      'El portal sólo autentica con e.firma. Casi todos los bloqueos se reducen a tres causas, y ninguna suspende el plazo de tus obligaciones.',
    bloque: 'atorado',
    respuestaDirecta:
      'El acceso al portal depende de dos cosas que el SAT repite en las dos fichas de PLD: estar inscrito en el RFC y tener el certificado de e.firma vigente. Si el certificado venció, no hay trámite posible hasta renovarlo, y ni el alta, ni la baja, ni la actualización pueden hacerse mientras tanto. Lo que sí sigue corriendo son tus plazos: nada en la ley, el Reglamento o las Reglas suspende la obligación de informar porque no puedas entrar.',
    entradilla:
      'Estar atorado no es una causa de exclusión: el registro sigue vivo, los avisos siguen venciendo y las notificaciones se tienen por hechas.',
    quienLoPresenta:
      'Cualquiera que ya esté registrado o que quiera registrarse y no consiga autenticarse en el portal.',
    cuandoSePresenta:
      'En cuanto lo detectes. La renovación del certificado no es instantánea y el plazo de seis días hábiles del art. 7 de las Reglas no se suspende mientras la resuelves.',
    cuandoDisposicion: 'Art. 7 de las Reglas; art. 12 del Reglamento',
    requisitos: [
      'Estar inscrito en el Registro Federal de Contribuyentes (art. 12 del Reglamento).',
      'Tener el certificado de e.firma vigente. El art. 17-D del Código Fiscal de la Federación fija que «los certificados tendrán una vigencia máxima de cuatro años, contados a partir de la fecha en que se hayan expedido».',
      'Si eres persona moral: usar la e.firma asociada a tu propio RFC, no la del representante legal (art. 4 de las Reglas).',
    ],
    pasos: [
      {
        texto: 'Comprueba primero cuál de los dos requisitos te falta: RFC o e.firma.',
        detalle:
          'Son los dos únicos que exigen el art. 12 del Reglamento, la ficha 85869 y la ficha 42254. Todo lo demás que falle en el portal es un problema técnico, no de requisitos.',
        disposicion: 'Art. 12 del Reglamento; fichas 85869 y 42254 del SAT',
      },
      {
        texto:
          'Si el certificado de e.firma venció, renuévalo antes de intentar cualquier trámite del padrón.',
        detalle:
          'Las dos fichas de PLD son terminantes. La 85869: «tienen que estar vigentes para poder ingresar al Portal de Prevención de Lavado de Dinero». La 42254: «se debe de renovar la e.firma y una vez vigente podrás realizar la baja en el Portal de Prevención de Lavado de Dinero». La renovación es un trámite del SAT distinto al de PLD.',
        disposicion: 'Fichas 85869 y 42254 del SAT; art. 17-D del CFF',
      },
      {
        texto: 'Si eres persona moral y te rechaza la firma, revisa cuál e.firma estás usando.',
        detalle:
          'El art. 4 de las Reglas ordena a las personas morales usar la e.firma asociada a su RFC y añade que «no podrán utilizar la FIEL de su representante legal». El art. 12 del Reglamento repite la regla para personas morales, fideicomisos, otras figuras jurídicas y entidades colegiadas.',
        disposicion: 'Art. 4 de las Reglas; art. 12 del Reglamento',
      },
      {
        texto:
          'Si el designado como representante no puede entrar, revisa si está inscrito en el RFC.',
        detalle:
          'El art. 10 de las Reglas prevé exactamente ese caso y permite la inscripción sin obligaciones fiscales para poder tramitar la e.firma.',
        disposicion: 'Art. 10 de las Reglas',
      },
      {
        texto:
          'Si el impedimento es del lado de la autoridad, avísalo dentro de los tres días hábiles siguientes.',
        detalle:
          'El art. 6 de las Reglas contempla el supuesto: cuando por causas imputables a la Secretaría, la UIF o el SAT no puedas consultar los medios electrónicos o abrir los documentos depositados en ellos, debes hacerlo del conocimiento del SAT dentro de los tres días hábiles siguientes, por el correo o la dirección electrónica que el propio SAT señale en el portal, para que te notifiquen por alguna otra de las formas de la Ley Federal de Procedimiento Administrativo mientras se resuelve.',
        evidencia: 'Copia del aviso enviado, con fecha',
        disposicion: 'Art. 6, cuarto párrafo de las Reglas',
      },
      {
        texto: 'Mientras resuelves, documenta. El plazo no se detiene.',
        detalle:
          'Guarda capturas con fecha, folios de atención y el acuse de la renovación. Si el retraso termina en una revisión, la diferencia entre un incumplimiento y una incidencia documentada es esa carpeta.',
        disposicion: 'Art. 7 de las Reglas',
      },
    ],
    documentoQueObtienes: null,
    plazos: [
      {
        clave: 'vigencia-efirma',
        etiqueta: 'Vigencia del certificado de e.firma',
        valor: 'Cuatro años como máximo',
        cuentaDesde: 'La fecha en que se expidió el certificado.',
        disposicion: 'Art. 17-D del Código Fiscal de la Federación',
        subirAlMotor: true,
        nota: 'Es la causa más común de quedarse fuera del portal, y es predecible: la fecha de expiración está en el propio certificado.',
      },
      {
        clave: 'impedimento-3-dias',
        etiqueta: 'Plazo para avisar al SAT de un impedimento imputable a la autoridad',
        valor: 'Tres días hábiles',
        cuentaDesde: 'El día en que ocurre el impedimento para consultar los medios electrónicos.',
        disposicion: 'Art. 6, cuarto párrafo de las Reglas',
        subirAlMotor: true,
      },
      PLAZO_CONSULTA_BUZON,
      PLAZO_ACTUALIZACION,
    ],
    fundamento: [
      {
        disposicion: 'Art. 12 del Reglamento de la LFPIORPI',
        texto:
          'Es la norma que condiciona todo el acceso: para realizar el trámite de alta y registro hay que estar inscrito en el RFC y contar con el certificado vigente de la Firma Electrónica Avanzada.',
      },
      {
        disposicion: 'Art. 4 de las Reglas de Carácter General',
        texto:
          'Obliga a firmar el envío con la e.firma de quien realiza la actividad vulnerable y prohíbe a las personas morales usar la de su representante legal.',
      },
      {
        disposicion: 'Art. 6 de las Reglas de Carácter General',
        texto:
          'Regula las notificaciones electrónicas: se consideran efectuadas el día en que consultas el medio electrónico, obliga a consultarlo al menos los días 15 y último de cada mes, y establece que si no consultas «las notificaciones […] se considerarán realizadas el día hábil que corresponda».',
      },
      {
        disposicion: 'Art. 17-D del Código Fiscal de la Federación',
        texto:
          '«Para los efectos fiscales, los certificados tendrán una vigencia máxima de cuatro años, contados a partir de la fecha en que se hayan expedido».',
      },
    ],
    huecos: [
      {
        titulo: 'El SAT no publica un catálogo de errores del portal SPPLD',
        descripcion:
          'No encontramos documento oficial que liste los mensajes de error del portal, sus códigos ni su significado. Cualquier página que te ofrezca una tabla de códigos de error del SPPLD no la está tomando de una fuente publicada.',
        queHacerMientras:
          'Captura la pantalla con la hora, guarda el mensaje literal y repórtalo por los canales de atención del SAT. Ese registro es tu evidencia de que intentaste.',
      },
      {
        titulo: 'No hay disposición que suspenda tus plazos porque no puedas entrar',
        descripcion:
          'La única previsión sobre impedimentos es el art. 6 de las Reglas, y sólo cubre las notificaciones cuando la causa es imputable a la autoridad. No hay norma que prorrogue el plazo de aviso, el de actualización ni el de baja por un problema de acceso.',
        queHacerMientras:
          'Documenta cada intento con fecha. Si el retraso deriva en una revisión, la evidencia del impedimento y del aviso oportuno al SAT es lo que puede sostener una autocorrección.',
      },
      {
        titulo: 'Qué ocurre con el registro si el RFC queda suspendido, no está publicado',
        descripcion:
          'Ni la ley, ni el Reglamento, ni las Reglas, ni las fichas 85869 y 42254 explican qué pasa con el registro en el Padrón cuando el RFC del sujeto obligado pasa a suspensión de actividades. Lo que sí dice el art. 12 del Reglamento es que la salida del padrón se produce por la baja, presentada en el portal.',
        queHacerMientras:
          'No supongas que la suspensión en el RFC te dio de baja del Padrón. Si dejaste la actividad, presenta la baja; si sólo pausaste, sigue presentando el informe en ceros.',
      },
    ],
    erroresComunes: [
      'Esperar a la fecha límite del aviso para descubrir que la e.firma venció. La vigencia máxima es de cuatro años y la fecha está en el propio certificado.',
      'Intentar el trámite de una persona moral con la e.firma del representante legal: el art. 4 de las Reglas lo prohíbe expresamente.',
      'Dar por notificado sólo lo que llega al correo. El correo del portal es una alerta; la notificación es el documento depositado en el medio electrónico, y se tiene por hecha aunque no lo consultes.',
      'No consultar el portal los días 15 y último de cada mes, que es la periodicidad que impone el art. 6 de las Reglas.',
      'Creer que un problema técnico suspende la obligación. Ninguna disposición lo dice.',
    ],
    faq: [
      {
        pregunta: '¿Puedo entrar al portal SPPLD con mi contraseña del SAT?',
        respuesta:
          'La ficha 85869 responde que la contraseña y la e.firma «tienen que estar vigentes para poder ingresar al Portal de Prevención de Lavado de Dinero», y los pasos publicados de las dos fichas de PLD hablan siempre de e.firma. Al abrir la dirección del portal que señala el art. 2 de la Resolución del formato oficial, la sesión se deriva al servicio de autenticación del SAT con e.firma. No conocemos documento oficial que describa un acceso alterno.',
      },
      {
        pregunta: 'Se me venció la e.firma y este mes vence un aviso. ¿Se me prorroga el plazo?',
        respuesta:
          'No hay disposición que lo prevea. El único supuesto de impedimento regulado es el del art. 6 de las Reglas, y sólo cubre las notificaciones cuando la causa es imputable a la autoridad, no un certificado vencido del propio sujeto obligado. Renueva y documenta el retraso.',
      },
      {
        pregunta: 'Soy persona moral y el portal rechaza mi firma. ¿Qué reviso primero?',
        respuesta:
          'Cuál e.firma estás usando. El art. 4 de las Reglas obliga a usar la asociada al RFC de la persona moral y prohíbe usar la del representante legal; el art. 12 del Reglamento repite la regla para personas morales, fideicomisos, otras figuras jurídicas y entidades colegiadas.',
      },
      {
        pregunta: 'El portal no me deja abrir un documento notificado. ¿Tengo que hacer algo?',
        respuesta:
          'Sí, y con plazo. El art. 6 de las Reglas obliga a informarlo al SAT dentro de los tres días hábiles siguientes, por el correo o la dirección electrónica que el propio SAT señale en el portal, para que te notifiquen por otra de las formas previstas en la Ley Federal de Procedimiento Administrativo mientras se resuelve el impedimento.',
      },
    ],
    fuentes: [F_REGLAMENTO, F_RCG, F_FICHA_ALTA, F_FICHA_BAJA, F_CFF, F_FICHA_EFIRMA, F_PORTAL],
    procedencia: P(
      'Art. 12 del Reglamento; arts. 4, 6 y 10 de las Reglas; art. 17-D del CFF',
      'No existe documentación oficial de los mensajes de error del portal SPPLD. Esta página se limita a los requisitos y supuestos que sí están publicados, y declara lo demás como hueco.',
    ),
    relacionados: ['alta-y-registro', 'baja-del-padron', 'representante-de-cumplimiento'],
  },
];

export const TRAMITES_POR_SLUG: Record<string, Tramite> = Object.fromEntries(
  TRAMITES.map((t) => [t.slug, t]),
);

export const ETIQUETA_BLOQUE: Record<Tramite['bloque'], string> = {
  entrar: 'Entrar al padrón',
  mantener: 'Mantener el registro al día',
  salir: 'Salir del padrón',
  atorado: 'Cuando el portal no te deja',
};

export const ORDEN_BLOQUES: readonly Tramite['bloque'][] = [
  'entrar',
  'mantener',
  'salir',
  'atorado',
];

/**
 * Plazos que este contenido guarda y que deberían vivir en el motor.
 *
 * Se derivan de los trámites en lugar de mantenerse en una lista aparte: una
 * segunda lista escrita a mano es exactamente el tipo de duplicado que se
 * desincroniza. Se deduplica por `clave` porque varios trámites comparten el
 * mismo plazo.
 */
export const PLAZOS_PENDIENTES_DE_MOTOR: readonly PlazoTramite[] = Object.values(
  Object.fromEntries(TRAMITES.flatMap((t) => t.plazos).map((p) => [p.clave, p])),
);
