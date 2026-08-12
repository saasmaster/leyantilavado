import type { CategoriaObligacion } from '@leyantilavado/types';
import { datos } from '@leyantilavado/rules-engine';
import type { ItemChecklist, SeccionChecklist } from '@/components/herramientas/Checklist';

/**
 * Catálogos de las listas de verificación.
 *
 * Todo lo que se puede derivar del corpus legal se deriva: los pasos y la
 * evidencia de cada obligación viven en `@leyantilavado/rules-engine` y aquí
 * sólo se agrupan. Lo que se agrega encima es operativo —preguntas prácticas
 * de implementación— y va marcado como propuesta editorial, nunca como
 * requisito legal citado.
 */

const TITULO_CATEGORIA: Record<CategoriaObligacion, string> = {
  registro: 'Alta y registro',
  identificacion: 'Identificación de clientes',
  expediente: 'Expedientes',
  avisos: 'Avisos e informes',
  riesgos: 'Enfoque basado en riesgos',
  gobierno: 'Gobierno interno',
  capacitacion: 'Capacitación',
  tecnologia: 'Tecnología',
  auditoria: 'Auditoría y dictamen',
  conservacion: 'Conservación',
};

/** Categorías cuya ausencia se reporta como brecha crítica. */
const CRITICAS: ReadonlySet<CategoriaObligacion> = new Set([
  'registro',
  'identificacion',
  'avisos',
  'expediente',
]);

const itemsDeObligacion = (slug: string, critico?: boolean): ItemChecklist[] => {
  const o = datos.OBLIGACIONES_POR_SLUG[slug];
  if (!o) return [];
  return o.pasos.map((p) => ({
    id: p.id,
    texto: p.texto,
    ...(p.evidencia ? { evidencia: p.evidencia } : {}),
    ...(critico ? { critico: true } : {}),
  }));
};

/* ────────────────────────────────────────────────────────────────────────────
 * Preparación para auditoría: el catálogo completo de obligaciones, agrupado
 * por categoría. Cien por ciento derivado del corpus legal.
 * ────────────────────────────────────────────────────────────────────────── */

export function seccionesAuditoria(): SeccionChecklist[] {
  const porCategoria = new Map<CategoriaObligacion, SeccionChecklist>();

  for (const o of datos.OBLIGACIONES) {
    const seccion = porCategoria.get(o.categoria) ?? {
      id: o.categoria,
      titulo: TITULO_CATEGORIA[o.categoria],
      descripcion: '',
      items: [],
    };
    seccion.items.push(
      ...o.pasos.map((p) => ({
        id: p.id,
        texto: `${o.titulo}: ${p.texto}`,
        ...(p.evidencia ? { evidencia: p.evidencia } : {}),
        ...(CRITICAS.has(o.categoria) ? { critico: true } : {}),
      })),
    );
    porCategoria.set(o.categoria, seccion);
  }

  return [...porCategoria.values()];
}

/* ────────────────────────────────────────────────────────────────────────────
 * Mecanismos automatizados
 * ────────────────────────────────────────────────────────────────────────── */

export function seccionesMecanismos(): SeccionChecklist[] {
  return [
    {
      id: 'norma',
      titulo: 'Lo que pide la norma',
      descripcion:
        'Derivado del catálogo de obligaciones del motor. Es el mínimo que la autoridad va a buscar.',
      items: itemsDeObligacion('mecanismos-automatizados', true),
    },
    {
      id: 'deteccion',
      titulo: 'Detección de umbrales',
      descripcion: 'Propuesta editorial: preguntas prácticas para saber si tu sistema aguanta.',
      items: [
        {
          id: 'mec-uma-fecha',
          texto:
            'El sistema aplica el valor de UMA vigente en la fecha de la operación, no el del año en curso.',
          evidencia: 'Prueba con una operación de enero contra una de febrero del mismo año',
          critico: true,
        },
        {
          id: 'mec-inciso',
          texto:
            'Distingue los umbrales por inciso en las actividades que los tienen: fe pública, servicios profesionales, comercio exterior y activos virtuales.',
          evidencia: 'Configuración de reglas por subtipo',
        },
        {
          id: 'mec-comparador',
          texto:
            'Respeta el comparador de cada regla: “superior a” no es lo mismo que “igual o superior a”.',
          evidencia: 'Caso de prueba en el borde exacto del umbral',
        },
        {
          id: 'mec-iva',
          texto:
            'Guarda por separado la base con IVA y la base sin IVA, porque el artículo 32 y el artículo 17 se miden distinto.',
          evidencia: 'Modelo de datos de la operación',
          critico: true,
        },
      ],
    },
    {
      id: 'acumulacion',
      titulo: 'Acumulación y alertas',
      items: [
        {
          id: 'mec-ventana',
          texto:
            'Acumula por cliente y tipo de acto en una ventana móvil de seis meses, no en semestres naturales.',
          evidencia: 'Caso de prueba con operaciones en los bordes de la ventana',
          critico: true,
        },
        {
          id: 'mec-disparo',
          texto: 'Identifica en qué operación exacta se cruzó el umbral, para fijar el periodo a reportar.',
          evidencia: 'Reporte de acumulación con la operación marcada',
        },
        {
          id: 'mec-efectivo',
          texto: 'Alerta cuando una operación se acerca o rebasa el límite de efectivo del artículo 32.',
          evidencia: 'Bitácora de alertas',
        },
        {
          id: 'mec-resolucion',
          texto: 'Cada alerta se cierra con una decisión registrada, incluso cuando se concluye que no procede aviso.',
          evidencia: 'Bitácora de alertas con resolución y responsable',
          critico: true,
        },
      ],
    },
    {
      id: 'trazabilidad',
      titulo: 'Trazabilidad y continuidad',
      items: [
        {
          id: 'mec-versiones',
          texto:
            'Conserva el historial de cambios de las reglas con autor, fecha y motivo, y permite reproducir un cálculo antiguo.',
          evidencia: 'Control de versiones de reglas',
          critico: true,
        },
        {
          id: 'mec-accesos',
          texto: 'Controla quién puede ver y modificar la información, y registra las consultas.',
          evidencia: 'Matriz de accesos y bitácora',
        },
        {
          id: 'mec-respaldo',
          texto: 'Tiene respaldo y procedimiento de recuperación probado para el plazo de diez años.',
          evidencia: 'Política de respaldo y prueba de restauración',
        },
        {
          id: 'mec-exportar',
          texto:
            'Puede exportar la información en el formato que la autoridad requiera, sin depender del proveedor.',
          evidencia: 'Exportación de prueba',
        },
      ],
    },
  ];
}

/* ────────────────────────────────────────────────────────────────────────────
 * Capacitación anual
 * ────────────────────────────────────────────────────────────────────────── */

export function seccionesCapacitacion(): SeccionChecklist[] {
  return [
    {
      id: 'norma',
      titulo: 'Lo que pide la norma',
      descripcion: 'Derivado del catálogo de obligaciones del motor.',
      items: itemsDeObligacion('capacitacion', true),
    },
    {
      id: 'programa',
      titulo: 'Contenido del programa',
      descripcion:
        'Propuesta editorial. La norma no lista temas obligatorios: son los que un auditor espera encontrar.',
      items: [
        {
          id: 'cap-marco',
          texto: 'Marco legal aplicable a tu actividad vulnerable en concreto, no una charla genérica.',
          evidencia: 'Temario firmado',
        },
        {
          id: 'cap-umbrales',
          texto: 'Los umbrales de identificación y aviso de tu actividad, con ejemplos numéricos.',
          evidencia: 'Material del curso',
        },
        {
          id: 'cap-efectivo',
          texto: 'Los límites de efectivo del artículo 32 y por qué son una prohibición, no un umbral.',
          evidencia: 'Material del curso',
        },
        {
          id: 'cap-inusuales',
          texto: 'Cómo detectar y escalar una operación inusual o preocupante.',
          evidencia: 'Material del curso y casos prácticos',
        },
        {
          id: 'cap-expediente',
          texto: 'Integración del expediente y del beneficiario controlador.',
          evidencia: 'Material del curso',
        },
      ],
    },
    {
      id: 'evidencia',
      titulo: 'Evidencia del periodo',
      items: [
        {
          id: 'cap-alcance',
          texto: 'Está definido qué personal queda alcanzado y por qué, incluidos los de nuevo ingreso.',
          evidencia: 'Matriz de puestos alcanzados',
          critico: true,
        },
        {
          id: 'cap-asistencia',
          texto: 'Hay lista de asistencia firmada o registro digital verificable de cada sesión.',
          evidencia: 'Lista de asistencia',
          critico: true,
        },
        {
          id: 'cap-evaluacion',
          texto: 'Se evaluó la comprensión y se conservan los resultados individuales.',
          evidencia: 'Resultados de evaluación',
          critico: true,
        },
        {
          id: 'cap-constancias',
          texto: 'Se emitieron y resguardaron las constancias por el plazo aplicable.',
          evidencia: 'Constancias',
        },
        {
          id: 'cap-remediacion',
          texto: 'Quien no aprobó volvió a tomarla, y eso también quedó registrado.',
          evidencia: 'Bitácora de reprogramación',
        },
      ],
    },
  ];
}

/* ────────────────────────────────────────────────────────────────────────────
 * Expediente de identificación (KYC)
 *
 * OJO: la lista exacta de documentos por tipo de persona vive en el Reglamento
 * y en las Disposiciones de Carácter General, que NO están en nuestro corpus
 * verificado. Lo derivado del motor va en la sección "norma"; el resto es
 * propuesta editorial y así se etiqueta en la página.
 * ────────────────────────────────────────────────────────────────────────── */

export type TipoExpediente = 'persona_fisica' | 'persona_moral' | 'fideicomiso';

const COMUNES: SeccionChecklist = {
  id: 'comunes',
  titulo: 'Obligaciones del motor',
  descripcion:
    'Pasos y evidencia derivados del catálogo de obligaciones: identificación del cliente, integración del expediente y beneficiario controlador.',
  items: [
    ...itemsDeObligacion('identificacion-cliente', true),
    ...itemsDeObligacion('expedientes'),
    ...itemsDeObligacion('beneficiario-controlador'),
  ],
};

const POR_TIPO: Record<TipoExpediente, SeccionChecklist> = {
  persona_fisica: {
    id: 'fisica',
    titulo: 'Documentos de persona física',
    descripcion: 'Propuesta editorial: lo que un expediente de persona física suele integrar.',
    items: [
      { id: 'pf-id', texto: 'Identificación oficial vigente con fotografía y firma.', evidencia: 'Copia legible', critico: true },
      { id: 'pf-curp', texto: 'CURP.', evidencia: 'Constancia o dato validado' },
      { id: 'pf-rfc', texto: 'RFC, cuando la persona esté obligada a tenerlo.', evidencia: 'Constancia de situación fiscal' },
      { id: 'pf-domicilio', texto: 'Comprobante de domicilio reciente.', evidencia: 'Recibo o estado de cuenta' },
      { id: 'pf-ocupacion', texto: 'Actividad u ocupación declarada.', evidencia: 'Formato de identificación firmado' },
      { id: 'pf-terceros', texto: 'Manifestación escrita de si actúa por cuenta propia o de un tercero.', evidencia: 'Manifestación firmada', critico: true },
      { id: 'pf-origen', texto: 'Origen de los recursos, cuando el nivel de riesgo lo amerite.', evidencia: 'Documentación soporte' },
      { id: 'pf-pep', texto: 'Manifestación y verificación sobre la condición de persona políticamente expuesta.', evidencia: 'Consulta documentada' },
    ],
  },
  persona_moral: {
    id: 'moral',
    titulo: 'Documentos de persona moral',
    descripcion: 'Propuesta editorial: lo que un expediente de persona moral suele integrar.',
    items: [
      { id: 'pm-acta', texto: 'Acta constitutiva con datos de inscripción en el registro público.', evidencia: 'Copia certificada', critico: true },
      { id: 'pm-rfc', texto: 'RFC y constancia de situación fiscal.', evidencia: 'Constancia vigente' },
      { id: 'pm-domicilio', texto: 'Comprobante de domicilio fiscal reciente.', evidencia: 'Recibo o estado de cuenta' },
      { id: 'pm-poder', texto: 'Poder del representante legal con facultades suficientes.', evidencia: 'Instrumento notarial', critico: true },
      { id: 'pm-id-rep', texto: 'Identificación oficial del representante legal.', evidencia: 'Copia legible', critico: true },
      { id: 'pm-estructura', texto: 'Estructura accionaria y cadena de propiedad hasta personas físicas.', evidencia: 'Organigrama corporativo', critico: true },
      { id: 'pm-bc', texto: 'Manifestación del beneficiario controlador y su documentación soporte.', evidencia: 'Manifestación firmada', critico: true },
      { id: 'pm-giro', texto: 'Giro o actividad económica real, no sólo el objeto social.', evidencia: 'Descripción documentada' },
      { id: 'pm-pep', texto: 'Verificación de PEP sobre representantes y beneficiarios controladores.', evidencia: 'Consulta documentada' },
    ],
  },
  fideicomiso: {
    id: 'fideicomiso',
    titulo: 'Documentos de fideicomiso u otra figura',
    descripcion:
      'Propuesta editorial: lo que un expediente de fideicomiso o vehículo similar suele integrar.',
    items: [
      { id: 'fid-contrato', texto: 'Contrato de fideicomiso y sus convenios modificatorios.', evidencia: 'Copia del contrato', critico: true },
      { id: 'fid-partes', texto: 'Identificación de fideicomitente, fiduciario y fideicomisarios.', evidencia: 'Expedientes individuales', critico: true },
      { id: 'fid-comite', texto: 'Integrantes del comité técnico y sus facultades, si existe.', evidencia: 'Acta de designación' },
      { id: 'fid-patrimonio', texto: 'Descripción del patrimonio fideicomitido y su origen.', evidencia: 'Inventario y soporte' },
      { id: 'fid-bc', texto: 'Persona física que controla o se beneficia del fideicomiso.', evidencia: 'Manifestación firmada', critico: true },
      { id: 'fid-fines', texto: 'Fines del fideicomiso y su congruencia con la operación.', evidencia: 'Análisis documentado' },
    ],
  },
};

const RIESGO_ALTO: SeccionChecklist = {
  id: 'reforzada',
  titulo: 'Debida diligencia reforzada',
  descripcion:
    'Aplica cuando el cliente quedó en riesgo alto o es persona políticamente expuesta. Propuesta editorial.',
  items: [
    { id: 'ddr-aprobacion', texto: 'Aprobación de un nivel jerárquico superior para iniciar o continuar la relación.', evidencia: 'Aprobación documentada', critico: true },
    { id: 'ddr-origen', texto: 'Verificación reforzada del origen de los recursos y del patrimonio.', evidencia: 'Documentación soporte', critico: true },
    { id: 'ddr-monitoreo', texto: 'Monitoreo transaccional con periodicidad más corta que la ordinaria.', evidencia: 'Bitácora de monitoreo' },
    { id: 'ddr-revision', texto: 'Revisión de la clasificación en plazos más cortos, con acta de la revisión.', evidencia: 'Bitácora de revisión' },
  ],
};

export function seccionesExpediente(
  tipo: TipoExpediente,
  riesgoAlto: boolean,
): SeccionChecklist[] {
  const base = [COMUNES, POR_TIPO[tipo]];
  return riesgoAlto ? [...base, RIESGO_ALTO] : base;
}
