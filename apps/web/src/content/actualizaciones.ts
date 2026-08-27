import type { EntradaActualizacion } from './tipos';

/**
 * Bitácora de cambios normativos.
 *
 * Cada entrada registra un hecho con fecha de publicación oficial, qué cambia
 * en la práctica y qué páginas del sitio se movieron por ese cambio. Es lo que
 * permite decirle a alguien "esto lo sabíamos desde tal día" en lugar de
 * publicar una nota sin fecha.
 *
 * Se ordena por fecha del hecho normativo, no por fecha de redacción.
 */
const ENTRADAS: readonly EntradaActualizacion[] = [
  {
    id: 'corpus-32-viii-y-xii-d',
    fecha: '2026-08-24',
    tipo: 'sitio',
    titulo: 'Se resuelven dos supuestos que estaban publicados sin cifra',
    resumen:
      'Dos reglas que se publicaban declarando que no había respuesta pasan a tenerla, contrastadas contra el texto vigente de la ley (DOF 16-07-2025). Cambia lo que devuelven las herramientas en esos dos supuestos.',
    impacto: [
      'Artículo 32, fracción VIII (consignación de pago): antes se mostraban las dos lecturas oficiales sin elegir una y la herramienta no calculaba resultado. Ahora se aplica la más estricta —3,210 UMA— y se sigue informando la diferencia en cada resultado. El motivo es que el artículo 32 es una prohibición: quedarse por debajo del límite menor cumple con cualquiera de las dos lecturas, y rebasarlo es infracción bajo una de ellas.',
      'Artículo 17, fracción XII, Apartado D (personas facilitadoras): antes se publicaba sin umbral. El apartado remite expresamente a los supuestos del Apartado A «en los términos que se señalan», así que ahora toma los umbrales de notarios, citando esa remisión. La tabla del SAT todavía no desglosa este apartado.',
      'El Apartado C sigue SIN umbral publicado, y así se declara: la ley enuncia al sujeto obligado sin fijar monto. No se le asigna la cifra de otro apartado.',
    ],
    paginasAfectadas: [
      { etiqueta: 'Límites de efectivo', href: '/limites-efectivo' },
      { etiqueta: 'Umbrales', href: '/umbrales' },
      { etiqueta: 'Actividades vulnerables', href: '/actividades-vulnerables' },
    ],
  },
  {
    id: 'revision-2026-08-23',
    fecha: '2026-08-23',
    tipo: 'sitio',
    titulo: 'Revisión de fuentes: sin cambios normativos',
    resumen:
      'Se contrastaron las fuentes oficiales y no hay instrumento nuevo desde el Acuerdo 115/2026 (DOF 7 de agosto de 2026). El marco sigue siendo la Ley reformada en julio de 2025, el Reglamento de marzo de 2026 y ese Acuerdo, que entra en vigor el 30 de noviembre.',
    impacto: [
      'Ninguna cifra del sitio cambia. Los umbrales, los límites de efectivo y las multas siguen siendo los mismos.',
      'Se publica esta entrada porque una revisión que no encuentra cambios también es información: dice hasta qué día se comprobó, que es lo que permite confiar en la fecha de revisión de cada página.',
      'La versión del corpus legal no se mueve, porque numera el último cambio de dato y no la fecha de la revisión.',
    ],
    paginasAfectadas: [
      { etiqueta: 'Umbrales', href: '/umbrales' },
      { etiqueta: 'Calendario de cumplimiento', href: '/calendario-cumplimiento' },
      { etiqueta: 'Qué cambió para tu actividad', href: '/que-cambio' },
    ],
  },
  {
    id: 'acuerdo-115-2026',
    fecha: '2026-08-07',
    tipo: 'reglas',
    titulo: 'Se publica el Acuerdo 115/2026 que modifica las Reglas de Carácter General',
    resumen:
      'La Secretaría de Hacienda publicó el acuerdo que reforma, adiciona y deroga disposiciones de las Reglas de Carácter General de la LFPIORPI vigentes desde 2013. Adiciona once capítulos nuevos y tres anexos, y entra en vigor de forma escalonada a partir del 30 de noviembre de 2026.',
    impacto: [
      'Aparecen las obligaciones de gobierno del riesgo con desarrollo operativo: metodología de riesgos, clasificación de clientes, perfil transaccional, beneficiario controlador, manual, capacitación, mecanismos automatizados y auditoría.',
      'El acuerdo no crea ni modifica umbrales del art. 17: precisa cómo se aplican los existentes y cuándo se entiende realizado el acto u operación para efectos del plazo.',
      'El aviso de veinticuatro horas queda diferido hasta seis meses después de que se publiquen los formatos oficiales que lo identifiquen.',
    ],
    fuenteId: 'dof-acuerdo-115-2026',
    paginasAfectadas: [
      { etiqueta: 'Acuerdo 115/2026', href: '/acuerdo-115-2026' },
      { etiqueta: 'Calendario de cumplimiento', href: '/calendario-cumplimiento' },
      { etiqueta: 'Obligaciones', href: '/obligaciones' },
    ],
  },
  {
    id: 'reglamento-2026',
    fecha: '2026-03-27',
    tipo: 'reglamento',
    titulo: 'Reforma al Reglamento de la LFPIORPI, en vigor al día siguiente',
    resumen:
      'Decreto que reforma, adiciona y deroga disposiciones del reglamento. Entró en vigor el 28 de marzo de 2026. No toca los umbrales del art. 17, pero mueve reglas operativas de peso.',
    impacto: [
      'La conservación de información se amplía a diez años y se confirma para copias de avisos, informes y acuses.',
      'Se aclara que el aviso de veinticuatro horas procede aunque el acto u operación no se haya celebrado, con sólo los datos de quien intentó operar.',
      'La acumulación se precisa: periodo de hasta seis meses y aviso al momento de la operación con la que se alcanza el umbral, sin agotar el periodo.',
      'Se incorpora el procedimiento del reconocimiento expreso para acceder a los beneficios de autocorrección.',
      'Se fijan plazos cortos para atender requerimientos y para que la autoridad sancione su desatención.',
    ],
    fuenteId: 'dof-reglamento-2026',
    paginasAfectadas: [
      { etiqueta: 'Qué cambió con la reforma', href: '/reforma-ley-antilavado-2026' },
      { etiqueta: 'Multas y autocorrección', href: '/multas' },
      { etiqueta: 'Conservación por diez años', href: '/obligaciones/conservacion-diez-anios' },
    ],
  },
  {
    id: 'uma-2026',
    fecha: '2026-02-01',
    tipo: 'uma',
    titulo: 'Entra en vigor el valor de la UMA para 2026',
    resumen:
      'El nuevo valor diario de la UMA entró en vigor el 1 de febrero de 2026 y con él se recalculan todos los umbrales, límites de efectivo y multas expresados en veces la UMA.',
    impacto: [
      'Las operaciones de enero de 2026 se siguen midiendo con la UMA del año anterior: la nueva no aplica retroactivamente.',
      'Las tablas de umbrales publicadas antes del 1 de febrero quedaron desactualizadas.',
    ],
    fuenteId: 'inegi-uma',
    paginasAfectadas: [
      { etiqueta: 'Tabla de umbrales', href: '/umbrales' },
      { etiqueta: 'Límites de efectivo', href: '/limites-efectivo' },
      { etiqueta: 'Multas', href: '/multas' },
    ],
  },
  {
    id: 'ley-2025',
    fecha: '2025-07-16',
    tipo: 'ley',
    titulo: 'Reforma a la LFPIORPI: nuevas fracciones, nuevos umbrales y nuevas obligaciones',
    resumen:
      'Decreto que reforma la ley, publicado en el Diario Oficial el 16 de julio de 2025 y en vigor desde el 17. Es el único de los tres instrumentos con jerarquía para modificar el art. 17, y lo hizo.',
    impacto: [
      'Se adiciona la fracción V Bis de desarrollo inmobiliario y el apartado XII-D de personas facilitadoras.',
      'Baja el umbral de aviso de los notarios en inmuebles y en fideicomisos, y la constitución de personas morales pasa a generar aviso siempre.',
      'Se adicionan al art. 18 las obligaciones de enfoque basado en riesgos, manual, capacitación y selección de personal, mecanismos automatizados y auditoría anual.',
      'El art. 32 incorpora los metales preciosos como medio de pago prohibido y adiciona el supuesto de consignación de pago.',
      'Los montos de la ley pasan a expresarse en veces el valor diario de la UMA.',
    ],
    fuenteId: 'lfpiorpi-vigente',
    paginasAfectadas: [
      { etiqueta: 'Qué cambió con la reforma', href: '/reforma-ley-antilavado-2026' },
      { etiqueta: 'Actividades vulnerables', href: '/actividades-vulnerables' },
      { etiqueta: 'Límites de efectivo', href: '/limites-efectivo' },
    ],
  },
  {
    id: 'sitio-lanzamiento-contenido',
    fecha: '2026-08-11',
    tipo: 'sitio',
    titulo: 'Primera pasada editorial completa del sitio',
    resumen:
      'Se publican las páginas de actividades vulnerables, umbrales, obligaciones, límites de efectivo, multas, glosario, calendario y las dos páginas de la reforma, todas alimentadas por el motor de reglas.',
    impacto: [
      'Todas las cifras legales del sitio se leen del motor: cambiar un umbral es cambiar un dato, no editar páginas.',
      'Los apartados C y D de la fracción XII se publican sin cifras, indicando expresamente que la autoridad no ha publicado umbrales para ellos.',
      'La fracción VIII del art. 32 se publica mostrando las dos versiones oficiales que no coinciden, sin elegir una.',
    ],
    paginasAfectadas: [
      { etiqueta: 'Actividades vulnerables', href: '/actividades-vulnerables' },
      { etiqueta: 'Umbrales', href: '/umbrales' },
      { etiqueta: 'Glosario', href: '/glosario' },
    ],
  },
];

export const ACTUALIZACIONES: readonly EntradaActualizacion[] = [...ENTRADAS].sort((a, b) =>
  b.fecha.localeCompare(a.fecha),
);

export const ETIQUETA_TIPO_ACTUALIZACION: Record<EntradaActualizacion['tipo'], string> = {
  ley: 'Ley',
  reglamento: 'Reglamento',
  reglas: 'Reglas de carácter general',
  uma: 'Valor de la UMA',
  criterio: 'Criterio de autoridad',
  sitio: 'Cambio editorial del sitio',
};
