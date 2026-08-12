import type { HitoCalendario, Procedencia } from '@leyantilavado/types';

const P = (disposicion: string, verificado = true): Procedencia => ({
  fuentes: ['dof-acuerdo-115-2026'],
  disposicion,
  verificacion: verificado ? 'oficial_verificado' : 'no_verificado',
  ultimaRevision: '2026-08-11',
  notaEditorial: verificado
    ? 'Fecha tomada de los artículos transitorios del Acuerdo 115/2026 publicado en el DOF.'
    : 'Fecha estimada a partir de un plazo en meses. No hay una fecha calendario en el texto oficial.',
});

/**
 * Calendario de implementación.
 *
 * Regla firme: las fechas se guardan NOMINALES. No se recorren por fines de
 * semana ni días inhábiles salvo que la propia norma diga "día hábil" —
 * en ese caso queda registrado en `descripcion` que el cálculo depende del
 * calendario oficial de días inhábiles.
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

/**
 * Avisos de 24 horas: existen en la norma (arts. 26 Bis, 26 Bis 1, 26 Bis 2 y
 * 27) y proceden aunque no se alcance el umbral e incluso cuando la operación
 * no llegó a celebrarse. PERO su exigibilidad está diferida hasta seis meses
 * después de que la UIF publique una Resolución de formatos que, a la fecha de
 * la última revisión, no aparece publicada.
 *
 * Por eso NO tiene fecha en el calendario: publicar una sería inventarla.
 */
export const PENDIENTES_SIN_FECHA = [
  {
    id: 'avisos-24h',
    titulo: 'Avisos de operaciones inusuales en 24 horas',
    descripcion:
      'La obligación está prevista en la norma, pero su exigibilidad corre a partir de seis meses después de que la UIF publique la Resolución con los formatos oficiales. Esa Resolución no aparece publicada a la fecha de la última revisión, por lo que no existe una fecha cierta.',
    obligaciones: ['operaciones-inusuales'],
    procedencia: P('Arts. 26 Bis, 26 Bis 1, 26 Bis 2 y 27, Acuerdo 115/2026'),
    ultimaRevision: '2026-08-11',
  },
] as const;
