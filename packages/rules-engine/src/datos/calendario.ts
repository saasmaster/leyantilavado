import type { HitoCalendario, Procedencia } from '@leyantilavado/types';
import { SIN_CAMBIOS_DESDE, ULTIMA_REVISION } from './revision';

/** Día en que entraron al calendario las fechas de las resoluciones del 24-09-2026. */
const RESOLUCIONES_INCORPORADAS = '2026-10-04';

const P = (disposicion: string, verificado = true): Procedencia => ({
  fuentes: ['dof-acuerdo-115-2026'],
  disposicion,
  verificacion: verificado ? 'oficial_verificado' : 'no_verificado',
  ultimaRevision: ULTIMA_REVISION,
  ultimaModificacion: SIN_CAMBIOS_DESDE,
  notaEditorial: verificado
    ? 'Fecha tomada de los artículos transitorios del Acuerdo 115/2026 publicado en el DOF.'
    : 'Fecha estimada a partir de un plazo en meses. No hay una fecha calendario en el texto oficial.',
});

/**
 * Procedencia de las fechas que salen de las dos resoluciones de formatos de
 * la UIF (DOF 24-09-2026). Llevan su propia fecha de modificación para que el
 * sitemap anuncie como cambiadas las páginas del calendario y no el sitio.
 */
const R = (
  fuente: 'dof-resolucion-formatos-avisos-2026' | 'dof-resolucion-alta-registro-2026',
  disposicion: string,
): Procedencia => ({
  fuentes: [fuente],
  disposicion,
  verificacion: 'oficial_verificado',
  ultimaRevision: ULTIMA_REVISION,
  ultimaModificacion: RESOLUCIONES_INCORPORADAS,
  notaEditorial:
    'Fecha tomada de los artículos transitorios de la Resolución publicada en el DOF el 24 de septiembre de 2026.',
});

/**
 * Calendario de implementación.
 *
 * Regla firme: las fechas se guardan NOMINALES. No se recorren por fines de
 * semana ni días inhábiles salvo que la propia norma diga "día hábil" —
 * en ese caso queda registrado en `descripcion` que el cálculo depende del
 * calendario oficial de días inhábiles.
 */
/*
 * `obligaciones` NO es «temas relacionados»: /exigibilidad toma el primer hito
 * que nombra una obligación como el día en que ésta se vuelve exigible. Por eso
 * los hitos de formato —1-dic-2026, 1-feb-2027, 30-jun-2027— van con la lista
 * vacía: el alta y los avisos ordinarios ya corren por ley, y enlazarlos aquí
 * le diría al lector que no le obligan hasta 2027. Sólo el aviso de 24 horas
 * nace de verdad en su hito.
 */
export const CALENDARIO: readonly HitoCalendario[] = [
  {
    id: 'vigencia-general',
    fecha: '2026-11-30',
    titulo: 'Entrada en vigor del Acuerdo 115/2026',
    descripcion:
      'Fecha en que entran en vigor las reglas del Acuerdo 115/2026, que modifica las Reglas de Carácter General en materia de la LFPIORPI. A partir de aquí corren los plazos escalonados del resto del calendario.',
    obligaciones: ['manual-cumplimiento', 'enfoque-basado-riesgos'],
    confirmadoOficialmente: true,
    procedencia: P('Artículo Primero Transitorio, Acuerdo 115/2026'),
    estado: 'publicado',
  },
  {
    id: 'formatos-computo-24h',
    fecha: '2026-12-01',
    titulo: 'Arranca el cómputo del aviso de 24 horas',
    descripcion:
      'Para efectos del quinto transitorio del Acuerdo 115/2026, la Resolución de formatos de Avisos e Informes entra en vigor este día. De aquí se cuentan los seis meses que difieren el aviso de 24 horas, y la propia Resolución fija el resultado: 1 de junio de 2027.',
    obligaciones: [],
    confirmadoOficialmente: true,
    procedencia: R(
      'dof-resolucion-formatos-avisos-2026',
      'Quinto Transitorio, Resolución de formatos de Avisos e Informes (DOF 24-09-2026)',
    ),
    estado: 'publicado',
  },
  {
    id: 'capacitacion-2027',
    fecha: '2027-01-01',
    fechaFin: '2027-12-31',
    titulo: 'Primer periodo anual de capacitación',
    descripcion:
      'El ejercicio 2027 completo constituye el primer periodo anual de capacitación bajo las nuevas reglas. La evidencia de asistencia y evaluación debe quedar documentada dentro de este periodo.',
    obligaciones: ['capacitacion'],
    confirmadoOficialmente: true,
    procedencia: P('Artículos Transitorios, Acuerdo 115/2026'),
    estado: 'publicado',
  },
  {
    id: 'alta-registro-formato-2027',
    fecha: '2027-02-01',
    titulo: 'Nuevo formato de alta y registro',
    descripcion:
      'Entra en vigor la Resolución que reforma el formato de alta y registro (Anexos A y B). Quien se dio de alta antes de esta fecha como agencia aduanal, como quien promueve el despacho sin agente aduanal, o actuando por medio de un fideicomiso u otra figura jurídica, debe darse de baja y de inmediato darse de alta de nuevo, identificando el carácter con el que realiza sus actos u operaciones. Para las personas facilitadoras esta Resolución entra en vigor el 1 de junio de 2027.',
    obligaciones: [],
    confirmadoOficialmente: true,
    procedencia: R(
      'dof-resolucion-alta-registro-2026',
      'Transitorios Primero a Tercero, Resolución del formato de alta y registro (DOF 24-09-2026)',
    ),
    estado: 'publicado',
  },
  {
    id: 'ebr-manual-2027',
    fecha: '2027-03-01',
    titulo: 'Metodología de riesgos, manual y expedientes',
    descripcion:
      'A partir de esta fecha la metodología de enfoque basado en riesgos debe estar disponible para la autoridad, alimentada con datos del año anterior, y el manual debe incorporarla. También aplican en esta fecha las reglas sobre clasificación de clientes, expedientes, beneficiario controlador y los procedimientos de selección de personal para nuevas contrataciones.',
    obligaciones: [
      'enfoque-basado-riesgos',
      'manual-cumplimiento',
      'clasificacion-clientes',
      'expedientes',
      'beneficiario-controlador',
      'investigacion-personal',
    ],
    confirmadoOficialmente: true,
    procedencia: P('Artículos Transitorios, Acuerdo 115/2026'),
    estado: 'publicado',
  },
  {
    id: 'psav-actualizacion',
    fecha: '2027-05-30',
    titulo: 'Actualización de proveedores de servicios de activos virtuales',
    descripcion:
      'Plazo de seis meses contados desde la entrada en vigor. El texto oficial fija el plazo en meses, no una fecha calendario: esta fecha es un cálculo orientativo y debe confirmarse contra el transitorio aplicable.',
    obligaciones: [],
    confirmadoOficialmente: false,
    procedencia: P('Artículos Transitorios, Acuerdo 115/2026 (plazo en meses)', false),
    estado: 'revisado',
  },
  {
    id: 'mecanismos-automatizados-2027',
    fecha: '2027-06-01',
    titulo: 'Mecanismos automatizados en operación',
    descripcion:
      'Fecha a partir de la cual los mecanismos automatizados deben estar operando: detección de umbrales, acumulación, alertas y trazabilidad de las decisiones.',
    obligaciones: ['mecanismos-automatizados'],
    confirmadoOficialmente: true,
    procedencia: P('Artículos Transitorios, Acuerdo 115/2026'),
    estado: 'publicado',
  },
  {
    id: 'avisos-24h',
    fecha: '2027-06-01',
    titulo: 'Aviso de 24 horas y formatos nuevos de avisos e informes',
    descripcion:
      'A partir de este día los avisos de 24 horas (arts. 26 Bis, 26 Bis 1, 26 Bis 2 y 27 de las Reglas) se presentan con los formatos electrónicos nuevos, y todos los avisos e informes —también el informe en ceros— deben enviarse con ellos, aunque la operación o el periodo sean anteriores. Es también la fecha desde la que las personas facilitadoras hacen su alta y registro.',
    obligaciones: ['operaciones-inusuales'],
    confirmadoOficialmente: true,
    procedencia: R(
      'dof-resolucion-formatos-avisos-2026',
      'Transitorios Primero, Segundo y Quinto, Resolución de formatos de Avisos e Informes (DOF 24-09-2026)',
    ),
    estado: 'publicado',
  },
  {
    id: 'formatos-anteriores-fin',
    fecha: '2027-06-30',
    titulo: 'Último día para modificatorios con el formato anterior',
    descripcion:
      'Los avisos enviados con los formatos vigentes antes del 1 de junio de 2027 pueden corregirse con esos mismos formatos hasta este día, siempre dentro de los 30 días naturales que da el artículo 8 de la Resolución. Desde el 1 de julio de 2027 los formatos anteriores dejan de estar disponibles.',
    obligaciones: [],
    confirmadoOficialmente: true,
    procedencia: R(
      'dof-resolucion-formatos-avisos-2026',
      'Transitorios Tercero y Cuarto, Resolución de formatos de Avisos e Informes (DOF 24-09-2026)',
    ),
    estado: 'publicado',
  },
  {
    id: 'notificaciones-electronicas',
    fecha: '2027-07-30',
    titulo: 'Notificaciones electrónicas',
    descripcion:
      'Plazo de ocho meses desde la entrada en vigor para el esquema de notificaciones electrónicas. Fecha calculada a partir de un plazo en meses; requiere confirmación.',
    obligaciones: [],
    confirmadoOficialmente: false,
    procedencia: P('Artículos Transitorios, Acuerdo 115/2026 (plazo en meses)', false),
    estado: 'revisado',
  },
  {
    id: 'consulta-pep-2',
    fecha: '2027-08-30',
    titulo: 'Disponibilidad prevista de Consulta PEP 2.0',
    descripcion:
      'La herramienta Consulta PEP 2.0 está prevista en el art. 23 Quáter 1 y se ofrecerá en el portal de la UIF, con acceso mediante la e.firma registrada en el alta. El plazo oficial es de nueve meses desde la entrada en vigor; esta fecha es un cálculo orientativo y no una fecha publicada.',
    obligaciones: ['personas-politicamente-expuestas'],
    confirmadoOficialmente: false,
    procedencia: P('Art. 23 Quáter 1 y Transitorios, Acuerdo 115/2026 (plazo en meses)', false),
    estado: 'revisado',
  },
  {
    id: 'auditoria-2028',
    fecha: '2028-01-01',
    fechaFin: '2028-12-31',
    titulo: 'Primer periodo de auditoría anual',
    descripcion:
      'El ejercicio 2028 completo constituye el primer periodo sujeto a auditoría anual. La auditoría puede ser interna cuando el riesgo de la organización es bajo o medio; es obligatoriamente externa cuando el riesgo es alto.',
    obligaciones: ['auditoria-anual'],
    confirmadoOficialmente: true,
    procedencia: P('Artículos Transitorios, Acuerdo 115/2026'),
    estado: 'publicado',
  },
  {
    id: 'dictamen-2029',
    fecha: '2029-03-30',
    titulo: 'Entrega del primer dictamen (ejercicio 2028)',
    descripcion:
      'El primer dictamen, correspondiente al ejercicio 2028, se entrega a más tardar el último día hábil de marzo de 2029. La norma habla de "último día hábil": la fecha exacta depende del calendario oficial de días inhábiles de ese año y debe confirmarse antes de usarla como fecha límite operativa.',
    obligaciones: ['dictamen'],
    confirmadoOficialmente: true,
    procedencia: P('Artículos Transitorios, Acuerdo 115/2026'),
    estado: 'publicado',
  },
];

/** Una obligación prevista en la norma cuya fecha depende de un acto que no se ha publicado. */
export interface PendienteSinFecha {
  id: string;
  titulo: string;
  descripcion: string;
  obligaciones: readonly string[];
  procedencia: Procedencia;
  ultimaRevision: string;
  ultimaModificacion: string;
}

/**
 * Obligaciones sin fecha cierta. Hoy no hay ninguna.
 *
 * Aquí vivió el aviso de 24 horas mientras la Resolución de formatos de la UIF
 * no estaba publicada: ponerle fecha habría sido inventarla. La Resolución
 * salió en el DOF el 24 de septiembre de 2026 y fija el 1 de junio de 2027,
 * así que pasó al calendario como el hito `avisos-24h`.
 *
 * La lista se conserva —vacía y con tipo propio— porque la categoría sigue
 * siendo real: el día que otra obligación dependa de un acto sin publicar,
 * entra aquí en lugar de recibir una fecha estimada.
 */
export const PENDIENTES_SIN_FECHA: readonly PendienteSinFecha[] = [];
