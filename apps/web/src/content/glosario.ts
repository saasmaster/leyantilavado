import type { TerminoGlosario } from './tipos';

/**
 * Glosario de la Ley Antilavado.
 *
 * Las definiciones son propias: explican el término en español de México y,
 * cuando el término se usa mal de forma sistemática en el mercado, el campo
 * `matiz` corrige el malentendido en lugar de repetirlo.
 *
 * Ningún umbral, límite ni multa se escribe aquí: para eso están /umbrales,
 * /limites-efectivo y /multas, que los toman del motor.
 */
export const GLOSARIO: readonly TerminoGlosario[] = [
  {
    slug: 'pld',
    termino: 'PLD',
    alterno: 'Prevención de Lavado de Dinero',
    definicion:
      'Conjunto de obligaciones, controles y procedimientos cuyo objetivo es impedir que recursos de origen ilícito entren a la economía formal usando negocios lícitos como puerta de entrada.',
    matiz:
      'PLD no es lo mismo que "cumplimiento fiscal". Un negocio puede estar al corriente con el SAT en materia de impuestos y aun así incumplir por completo la LFPIORPI.',
    disposicion: 'LFPIORPI, DOF 17-10-2012, con reformas al 16-07-2025',
    relacionados: ['ft', 'lfpiorpi', 'gafi'],
  },
  {
    slug: 'ft',
    termino: 'FT',
    alterno: 'Financiamiento al Terrorismo',
    definicion:
      'Canalización de recursos —lícitos o ilícitos— hacia actos terroristas o hacia quienes los cometen. Se regula junto con la prevención de lavado bajo el binomio PLD/FT.',
    matiz:
      'La diferencia práctica con el lavado es el origen: en lavado el dinero es sucio y se busca limpiarlo; en financiamiento al terrorismo el dinero puede ser perfectamente limpio y lo que importa es su destino.',
    disposicion: 'Código Penal Federal, arts. 139 Quáter y 139 Quinquies',
    relacionados: ['pld', 'gafi', 'listas-restrictivas'],
  },
  {
    slug: 'lfpiorpi',
    termino: 'LFPIORPI',
    alterno: 'Ley Antilavado',
    definicion:
      'Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita. Es la norma que crea el catálogo de actividades vulnerables, las obligaciones de identificación y aviso, los límites al uso de efectivo y el régimen sancionador.',
    matiz:
      'Su última reforma se publicó el 16 de julio de 2025 y entró en vigor al día siguiente. Casi todo el contenido en línea anterior a esa fecha tiene umbrales y artículos desactualizados.',
    disposicion: 'LFPIORPI, texto vigente con reforma DOF 16-07-2025',
    relacionados: ['actividad-vulnerable', 'sujeto-obligado', 'reforma-2026'],
    verTambien: { etiqueta: 'Qué cambió con la reforma', href: '/reforma-ley-antilavado-2026' },
  },
  {
    slug: 'uif',
    termino: 'UIF',
    alterno: 'Unidad de Inteligencia Financiera',
    definicion:
      'Unidad de la Secretaría de Hacienda que recibe, analiza y disemina los avisos, administra la lista de personas bloqueadas y emite guías, listas y criterios en materia PLD/FT.',
    matiz:
      'La UIF recibe los avisos, pero no es la ventanilla: los avisos se envían por el portal SPPLD del SAT, que actúa como conducto.',
    disposicion: 'Reglamento Interior de la SHCP',
    relacionados: ['sppld', 'aviso', 'lista-personas-bloqueadas'],
  },
  {
    slug: 'sppld',
    termino: 'SPPLD',
    alterno: 'Sistema del Portal de Prevención de Lavado de Dinero',
    definicion:
      'Plataforma del SAT donde quienes realizan actividades vulnerables se dan de alta en el padrón, presentan avisos, informes en ceros y avisos modificatorios, y tramitan su baja. Se entra con RFC y e.firma vigente.',
    matiz:
      'Es el único medio válido para presentar avisos e informes. Un correo, un escrito en ventanilla o un archivo entregado al contador no sustituyen el envío por el portal.',
    disposicion: 'Art. 24 LFPIORPI y Reglas de Carácter General',
    relacionados: ['aviso', 'informe-en-ceros', 'alta-y-registro'],
    verTambien: { etiqueta: 'Alta y registro en el SPPLD', href: '/obligaciones/alta-sppld' },
  },
  {
    slug: 'actividad-vulnerable',
    termino: 'Actividad vulnerable',
    definicion:
      'Actividad económica lícita que la ley lista en su art. 17 porque, por su naturaleza, puede usarse para introducir recursos de origen ilícito. Realizarla genera obligaciones de identificación, expediente, conservación y aviso.',
    matiz:
      'Ser actividad vulnerable no implica sospecha sobre el negocio. Es una clasificación de riesgo del sector, no una acusación.',
    disposicion: 'Art. 17 LFPIORPI',
    relacionados: ['sujeto-obligado', 'umbral-de-identificacion', 'umbral-de-aviso'],
    verTambien: { etiqueta: 'Catálogo de actividades', href: '/actividades-vulnerables' },
  },
  {
    slug: 'sujeto-obligado',
    termino: 'Sujeto obligado',
    definicion:
      'Persona física o moral que realiza una actividad vulnerable y por ello queda sujeta al padrón, a identificar a sus clientes, a integrar expedientes, a conservar información y a presentar avisos e informes.',
    matiz:
      'La obligación nace de la actividad, no del tamaño del negocio ni del régimen fiscal. Una persona física con actividad empresarial puede ser sujeto obligado igual que una sociedad grande.',
    disposicion: 'Arts. 17 y 18 LFPIORPI',
    relacionados: ['actividad-vulnerable', 'representante-encargado-de-cumplimiento'],
  },
  {
    slug: 'aviso',
    termino: 'Aviso',
    definicion:
      'Reporte que el sujeto obligado envía a la Secretaría de Hacienda, por conducto del SAT, cuando un acto u operación alcanza el umbral de aviso de su actividad. Contiene los datos de quien realiza la actividad, del cliente y, en su caso, del beneficiario controlador, y la descripción de la operación.',
    matiz:
      'El aviso no es una denuncia ni implica sospecha. Es un reporte de umbral: se presenta porque la operación rebasó una cifra, no porque haya algo irregular.',
    disposicion: 'Arts. 17, 23 y 24 LFPIORPI',
    relacionados: ['umbral-de-aviso', 'informe-en-ceros', 'aviso-24-horas'],
    verTambien: { etiqueta: 'Obligación de presentar avisos', href: '/obligaciones/avisos' },
  },
  {
    slug: 'informe-en-ceros',
    termino: 'Informe en ceros',
    definicion:
      'Informe mensual que se presenta cuando durante el mes no hubo actos u operaciones objeto de aviso. Se llena únicamente con la identificación de quien realiza la actividad, el periodo y la declaración de que no hubo operaciones reportables.',
    matiz:
      'No presentarlo porque "no hubo movimiento" es uno de los incumplimientos más frecuentes. Mientras no se tramite la baja del padrón, la obligación de informar sigue viva mes con mes.',
    disposicion: 'Art. 25 de las Reglas de Carácter General y art. 12 del Reglamento',
    relacionados: ['aviso', 'sppld', 'alta-y-registro'],
    verTambien: { etiqueta: 'Informes en ceros', href: '/obligaciones/informes-en-ceros' },
  },
  {
    slug: 'umbral-de-identificacion',
    termino: 'Umbral de identificación',
    definicion:
      'Monto a partir del cual nace la obligación de identificar al cliente e integrar su expediente. En varias fracciones no hay monto: la identificación procede desde el primer peso.',
    matiz:
      'Es el umbral más bajo de los dos y el que más se pasa por alto. Muchos negocios sólo miran el umbral de aviso y llegan a una verificación sin un solo expediente integrado.',
    disposicion: 'Art. 17 LFPIORPI',
    relacionados: ['umbral-de-aviso', 'expediente-unico-de-identificacion'],
    verTambien: { etiqueta: 'Tabla de umbrales', href: '/umbrales' },
  },
  {
    slug: 'umbral-de-aviso',
    termino: 'Umbral de aviso',
    definicion:
      'Monto a partir del cual, además de identificar, hay que reportar la operación mediante un aviso en el SPPLD.',
    matiz:
      'La comparación no siempre es la misma: hay fracciones donde la ley dice "igual o superior a" y otras donde dice "superior a". En el borde exacto, esa diferencia decide si hay obligación o no.',
    disposicion: 'Art. 17 LFPIORPI',
    relacionados: ['umbral-de-identificacion', 'aviso', 'mecanismo-de-acumulacion'],
    verTambien: { etiqueta: 'Tabla de umbrales', href: '/umbrales' },
  },
  {
    slug: 'uma',
    termino: 'UMA',
    alterno: 'Unidad de Medida y Actualización',
    definicion:
      'Unidad de referencia con la que la ley expresa umbrales, límites de efectivo y multas. El INEGI publica su valor diario, mensual y anual, y el nuevo valor entra en vigor el 1 de febrero de cada año.',
    matiz:
      'Que entre en vigor el 1 de febrero tiene una consecuencia que casi nadie aplica: una operación de enero se mide con la UMA del año anterior, no con la del año en curso.',
    disposicion: 'Ley para determinar el valor de la UMA; valores publicados por el INEGI',
    relacionados: ['umbral-de-aviso', 'restriccion-de-efectivo'],
    verTambien: { etiqueta: 'Umbrales por año de UMA', href: '/umbrales' },
  },
  {
    slug: 'mecanismo-de-acumulacion',
    termino: 'Mecanismo de acumulación',
    definicion:
      'Regla que obliga a sumar las operaciones de un mismo cliente por el mismo tipo de acto dentro de una ventana de seis meses. Si la suma alcanza el umbral de aviso, nace la obligación aunque ninguna operación individual llegara.',
    matiz:
      'El Reglamento precisa que el aviso se presenta en el momento de la operación con la que se alcanza el umbral, sin esperar a que se agoten los seis meses.',
    disposicion: 'Art. 17, último párrafo, LFPIORPI y art. 7 del Reglamento',
    relacionados: ['fraccionamiento-de-operaciones', 'umbral-de-aviso'],
    verTambien: { etiqueta: 'Calculadora de acumulación', href: '/herramientas/acumulacion-operaciones' },
  },
  {
    slug: 'fraccionamiento-de-operaciones',
    termino: 'Fraccionamiento de operaciones',
    definicion:
      'Partir artificialmente una operación en varias de menor monto para que ninguna alcance el umbral.',
    matiz:
      'No funciona y agrava: la acumulación de seis meses vuelve a juntar las partes, y la conducta es en sí misma una señal de alerta que puede detonar el aviso de veinticuatro horas.',
    disposicion: 'Art. 17, último párrafo, LFPIORPI',
    relacionados: ['mecanismo-de-acumulacion', 'aviso-24-horas'],
  },
  {
    slug: 'beneficiario-controlador',
    termino: 'Beneficiario controlador',
    definicion:
      'Persona física —o grupo de personas físicas— que en última instancia se beneficia de la operación o controla efectivamente al cliente, aunque no aparezca en la escritura ni en el registro de accionistas.',
    matiz:
      'Existen dos regímenes distintos con el mismo nombre: el de la Ley Antilavado y el fiscal del Código Fiscal de la Federación. Los umbrales de control y las sanciones no coinciden, y cumplir uno no cumple el otro.',
    disposicion: 'Art. 3, fracción III, LFPIORPI; arts. 32-B Ter y 32-B Quáter del CFF',
    relacionados: ['cadena-de-titularidad', 'cadena-de-control', 'dueno-beneficiario'],
    verTambien: { etiqueta: 'Obligación de identificarlo', href: '/obligaciones/beneficiario-controlador' },
  },
  {
    slug: 'cadena-de-titularidad',
    termino: 'Cadena de titularidad',
    definicion:
      'Secuencia de propietarios de las acciones o partes sociales que hay que recorrer, sociedad por sociedad, hasta llegar a las personas físicas que finalmente son dueñas.',
    disposicion: 'Reglas de Carácter General y Resolución Miscelánea Fiscal',
    relacionados: ['beneficiario-controlador', 'cadena-de-control'],
  },
  {
    slug: 'cadena-de-control',
    termino: 'Cadena de control',
    definicion:
      'Secuencia de relaciones de control —por voto, contrato, acuerdo o influencia de hecho— hasta llegar a la persona física que realmente decide, aunque no sea la accionista mayoritaria.',
    matiz:
      'Se recorre en paralelo a la cadena de titularidad, no en su lugar. Hay estructuras donde quien manda no aparece en el capital social.',
    disposicion: 'Art. 3, fracción III, LFPIORPI',
    relacionados: ['beneficiario-controlador', 'cadena-de-titularidad'],
  },
  {
    slug: 'expediente-unico-de-identificacion',
    termino: 'Expediente único de identificación',
    definicion:
      'Carpeta física o electrónica con los datos y documentos de cada cliente o usuario. Se integra antes o durante el acto, o al establecer la relación de negocios, y se mantiene actualizada mientras dure la relación.',
    matiz:
      'Es único por cliente, no por operación: si el mismo cliente vuelve, se actualiza el expediente existente en lugar de abrir otro.',
    disposicion: 'Art. 18 LFPIORPI y Capítulo III de las Reglas de Carácter General',
    relacionados: ['kyc', 'medidas-simplificadas', 'umbral-de-identificacion'],
    verTambien: { etiqueta: 'Cómo se integra', href: '/obligaciones/expedientes' },
  },
  {
    slug: 'kyc',
    termino: 'KYC',
    alterno: 'Conocimiento del cliente',
    definicion:
      'Proceso de identificar al cliente, verificar su identidad y entender su actividad, su origen de recursos y el propósito de la relación de negocios.',
    matiz:
      'Identificar y conocer no son lo mismo. Identificar es recabar y verificar datos; conocer es entender si lo que el cliente hace corresponde con lo que dice hacer.',
    disposicion: 'Art. 18, fracciones I y II, LFPIORPI',
    relacionados: ['expediente-unico-de-identificacion', 'perfil-transaccional', 'ddr'],
  },
  {
    slug: 'ddr',
    termino: 'DDR',
    alterno: 'Debida diligencia reforzada',
    definicion:
      'Nivel adicional de escrutinio para clientes de riesgo alto, personas políticamente expuestas y estructuras opacas. Incluye más información, aprobación de un nivel directivo y monitoreo más frecuente.',
    disposicion: 'Capítulo III Ter de las Reglas de Carácter General',
    relacionados: ['pep', 'clasificacion-de-riesgo', 'ebr'],
  },
  {
    slug: 'medidas-simplificadas',
    termino: 'Medidas simplificadas',
    definicion:
      'Régimen reducido de integración del expediente, reservado a clientes clasificados de riesgo bajo conforme a la metodología documentada del propio sujeto obligado.',
    matiz:
      'Simplificado no es opcional ni exento: sigue habiendo expediente, y los criterios que justifican el riesgo bajo tienen que estar escritos en el manual. El riesgo medio ya exige expediente completo.',
    disposicion: 'Art. 19 LFPIORPI y Capítulo III de las Reglas de Carácter General',
    relacionados: ['expediente-unico-de-identificacion', 'clasificacion-de-riesgo'],
  },
  {
    slug: 'ebr',
    termino: 'EBR',
    alterno: 'Enfoque basado en riesgos',
    definicion:
      'Metodología documentada que evalúa los riesgos del negocio —por operación, cliente, geografía y canal— y asigna controles proporcionales a cada nivel.',
    matiz:
      'Es una metodología escrita con método de medición y mitigantes identificados, no una frase en el manual. Debe revisarse cuando aparecen riesgos nuevos y, en todo caso, con periodicidad anual.',
    disposicion: 'Art. 18, fracción VII, LFPIORPI y Capítulo II Quáter de las Reglas',
    relacionados: ['clasificacion-de-riesgo', 'manual-de-cumplimiento'],
    verTambien: { etiqueta: 'La obligación en detalle', href: '/obligaciones/enfoque-basado-riesgos' },
  },
  {
    slug: 'clasificacion-de-riesgo',
    termino: 'Clasificación de riesgo del cliente',
    definicion:
      'Asignación de un grado de riesgo a cada cliente, con al menos tres niveles —bajo, medio y alto— derivados del modelo de evaluación previsto en el manual.',
    matiz:
      'La clasificación se reevalúa periódicamente, y a mayor riesgo, con mayor frecuencia. Un cliente clasificado una vez al darlo de alta y nunca más es un hallazgo de auditoría.',
    disposicion: 'Capítulo III Bis de las Reglas de Carácter General',
    relacionados: ['ebr', 'ddr', 'perfil-transaccional'],
    verTambien: { etiqueta: 'Cómo clasificar', href: '/obligaciones/clasificacion-clientes' },
  },
  {
    slug: 'perfil-transaccional',
    termino: 'Perfil transaccional',
    definicion:
      'Comportamiento esperado de un cliente en monto, número, frecuencia y tipo de operación, contra el cual se compara su comportamiento real para detectar desviaciones.',
    matiz:
      'Durante los primeros meses de la relación el perfil se arma con el monto máximo mensual que el propio cliente declara, y ese perfil inicial debe cargarse al sistema de alertas.',
    disposicion: 'Capítulo III Ter de las Reglas de Carácter General',
    relacionados: ['kyc', 'clasificacion-de-riesgo', 'mecanismos-automatizados'],
    verTambien: { etiqueta: 'Cómo construirlo', href: '/obligaciones/perfil-transaccional' },
  },
  {
    slug: 'operacion-inusual',
    termino: 'Operación inusual',
    definicion:
      'Acto u operación que no concuerda con el perfil transaccional del cliente o que carece de justificación económica o jurídica aparente.',
    matiz:
      'En actividades vulnerables la ley no usa las categorías "inusual, preocupante y relevante" del régimen de entidades financieras. Su equivalente funcional es el aviso de veinticuatro horas por sospecha o por hechos o indicios.',
    disposicion: 'Art. 18, fracción VI, segundo párrafo, LFPIORPI',
    relacionados: ['aviso-24-horas', 'operacion-preocupante', 'perfil-transaccional'],
  },
  {
    slug: 'operacion-preocupante',
    termino: 'Operación preocupante',
    definicion:
      'Conducta de un directivo, empleado o apoderado del propio sujeto obligado que pudiera favorecer o encubrir el lavado de dinero.',
    matiz:
      'Es una categoría del régimen de entidades financieras. En actividades vulnerables no existe con ese nombre, aunque la conducta sí es relevante para la investigación de personal y para el aviso por sospecha.',
    disposicion: 'Disposiciones de carácter general del sector financiero',
    relacionados: ['operacion-inusual', 'investigacion-de-personal'],
  },
  {
    slug: 'operacion-relevante',
    termino: 'Operación relevante',
    definicion:
      'Operación en efectivo o con instrumentos monetarios que alcanza el monto reportable definido para el sector financiero.',
    matiz:
      'No aplica a actividades vulnerables. Si alguien te pide "reportes de operaciones relevantes" bajo la LFPIORPI, está mezclando dos regímenes distintos.',
    disposicion: 'Disposiciones de carácter general por sector financiero',
    relacionados: ['operacion-inusual', 'restriccion-de-efectivo'],
  },
  {
    slug: 'aviso-24-horas',
    termino: 'Aviso de veinticuatro horas',
    definicion:
      'Aviso que se presenta dentro de las veinticuatro horas siguientes a que se genera la sospecha, se conocen hechos o indicios por otras fuentes, o se detecta que la contraparte aparece en un listado oficial de personas vinculadas a estos delitos.',
    matiz:
      'Procede aunque la operación no alcance ningún umbral e incluso si nunca llegó a celebrarse, siempre que existan datos para identificar a quien intentó operar. Su exigibilidad quedó diferida a que la autoridad publique los formatos correspondientes.',
    disposicion:
      'Art. 18, fracción VI, segundo párrafo, LFPIORPI; art. 7 Bis del Reglamento; arts. 26 Bis a 27 de las Reglas',
    relacionados: ['operacion-inusual', 'lista-personas-bloqueadas', 'listas-restrictivas'],
    verTambien: { etiqueta: 'Qué hacer y cuándo', href: '/obligaciones/operaciones-inusuales' },
  },
  {
    slug: 'lista-personas-bloqueadas',
    termino: 'Lista de personas bloqueadas',
    definicion:
      'Listado emitido por la UIF con personas y entidades respecto de las cuales no se puede operar y cuyos recursos deben inmovilizarse.',
    matiz:
      'No es la única lista que hay que revisar: las reglas remiten a listados de autoridades nacionales y de organismos internacionales, que se consultan en conjunto.',
    disposicion: 'Art. 38 de las Reglas de Carácter General',
    relacionados: ['listas-restrictivas', 'aviso-24-horas'],
  },
  {
    slug: 'pep',
    termino: 'PEP',
    alterno: 'Persona políticamente expuesta',
    definicion:
      'Quien desempeña o desempeñó funciones públicas relevantes —de gobierno, judiciales, militares, en empresas del Estado, en partidos o en organismos internacionales— y, por asimilación, su cónyuge, sus parientes cercanos y sus socios con vínculos patrimoniales.',
    matiz:
      'La condición de PEP no se apaga el día que la persona deja el cargo: la norma la conserva durante el año siguiente, y las PEP extranjeras se clasifican de riesgo alto en todos los casos.',
    disposicion: 'Art. 23 Quáter de las Reglas de Carácter General',
    relacionados: ['ddr', 'clasificacion-de-riesgo', 'consulta-pep'],
    verTambien: { etiqueta: 'Cómo detectarlas', href: '/obligaciones/personas-politicamente-expuestas' },
  },
  {
    slug: 'consulta-pep',
    termino: 'Consulta PEP 2.0',
    definicion:
      'Aplicación de la UIF, prevista en las reglas vigentes desde 2026, para consultar la Lista de Personas Políticamente Expuestas usando la e.firma con la que se hizo el alta y registro.',
    matiz:
      'No está disponible desde el día uno: su exigibilidad corre a los nueve meses de la entrada en vigor del Acuerdo 115/2026, y esa fecha es un cómputo de plazo, no una fecha publicada en el Diario Oficial.',
    disposicion: 'Art. 23 Quáter 1 de las Reglas de Carácter General',
    relacionados: ['pep', 'uif'],
    verTambien: { etiqueta: 'Calendario de exigibilidad', href: '/calendario-cumplimiento' },
  },
  {
    slug: 'listas-restrictivas',
    termino: 'Listas restrictivas',
    definicion:
      'Conjunto de listados que se consultan antes de operar: personas bloqueadas de la UIF, contribuyentes publicados por el SAT conforme al art. 69-B del Código Fiscal, sanciones internacionales y listas de personas políticamente expuestas.',
    disposicion: 'Art. 38 de las Reglas de Carácter General; art. 69-B del CFF',
    relacionados: ['lista-personas-bloqueadas', 'efos', 'pep'],
  },
  {
    slug: 'efos',
    termino: 'EFOS',
    alterno: 'Empresas que Facturan Operaciones Simuladas',
    definicion:
      'Contribuyentes publicados por el SAT como emisores de comprobantes fiscales sin sustancia económica real.',
    matiz:
      'Es una lista fiscal, no de la LFPIORPI. Operar con un contribuyente listado no genera por sí solo un aviso, pero sí es un factor de riesgo que debe pesar en la clasificación del cliente.',
    disposicion: 'Art. 69-B del Código Fiscal de la Federación',
    relacionados: ['listas-restrictivas', 'clasificacion-de-riesgo'],
  },
  {
    slug: 'gafi',
    termino: 'GAFI',
    alterno: 'Grupo de Acción Financiera Internacional',
    definicion:
      'Organismo intergubernamental que emite las cuarenta Recomendaciones que sirven de estándar mundial en PLD/FT y evalúa el cumplimiento de los países.',
    matiz:
      'Sus Recomendaciones no son derecho aplicable en México por sí solas: obligan cuando el legislador o la autoridad las incorporan a la ley, el reglamento o las reglas.',
    disposicion: 'Recomendaciones del GAFI',
    relacionados: ['gafilat', 'evaluacion-mutua', 'pld'],
  },
  {
    slug: 'gafilat',
    termino: 'GAFILAT',
    definicion:
      'Grupo de Acción Financiera de Latinoamérica: organismo regional de estilo GAFI que realiza las evaluaciones mutuas de los países de la región, México incluido.',
    disposicion: 'Estatutos del GAFILAT',
    relacionados: ['gafi', 'evaluacion-mutua'],
  },
  {
    slug: 'evaluacion-mutua',
    termino: 'Evaluación mutua',
    definicion:
      'Revisión periódica que GAFI y GAFILAT hacen del marco PLD/FT de un país y, sobre todo, de su efectividad real.',
    matiz:
      'Sus resultados explican buena parte del endurecimiento normativo mexicano de 2025 y 2026: cuando una evaluación señala deficiencias, la respuesta suele ser una reforma.',
    disposicion: 'Metodología de evaluación mutua del GAFI',
    relacionados: ['gafi', 'gafilat'],
  },
  {
    slug: 'representante-encargado-de-cumplimiento',
    termino: 'Representante encargado del cumplimiento',
    definicion:
      'Persona designada ante la Secretaría por las personas morales y por quienes actúan a través de fideicomisos u otras figuras jurídicas, encargada de atender los requerimientos en materia PLD.',
    matiz:
      'Mientras no exista designación aceptada, el cumplimiento recae en los integrantes del órgano de administración o en el administrador único. Las personas físicas cumplen personal y directamente.',
    disposicion: 'Art. 20 LFPIORPI',
    relacionados: ['sujeto-obligado', 'capacitacion'],
    verTambien: { etiqueta: 'Cómo designarlo', href: '/obligaciones/representante-cumplimiento' },
  },
  {
    slug: 'manual-de-cumplimiento',
    termino: 'Manual de políticas internas',
    definicion:
      'Documento interno que describe cómo la organización cumple: identificación, expedientes, clasificación de riesgo, perfil transaccional, PEP, avisos, conservación, capacitación, control interno y auditoría.',
    matiz:
      'Debe existir dentro de los noventa días naturales siguientes al alta y registro, e incorporar la metodología de riesgos. La autoridad puede ordenar modificaciones a su contenido.',
    disposicion: 'Art. 18, fracción VIII, LFPIORPI y Capítulo X de las Reglas',
    relacionados: ['ebr', 'auditoria-anual', 'capacitacion'],
    verTambien: { etiqueta: 'Qué debe contener', href: '/obligaciones/manual-cumplimiento' },
  },
  {
    slug: 'mecanismos-automatizados',
    termino: 'Mecanismos automatizados',
    definicion:
      'Sistemas que conservan el expediente único, consolidan las operaciones por cliente, alimentan la metodología de riesgos, ejecutan el modelo de clasificación, generan alertas y vigilan el uso de efectivo.',
    matiz:
      'La norma no exige un software comercial: admite expresamente procesos automatizados apoyados en hojas de cálculo o bases de datos, siempre que cumplan las funciones mínimas y sean verificables ante la autoridad.',
    disposicion: 'Art. 18, fracción X, LFPIORPI y Capítulo XIII de las Reglas',
    relacionados: ['perfil-transaccional', 'mecanismo-de-acumulacion'],
    verTambien: { etiqueta: 'Funciones mínimas', href: '/obligaciones/mecanismos-automatizados' },
  },
  {
    slug: 'capacitacion',
    termino: 'Capacitación anual',
    definicion:
      'Programa de cursos dirigido al órgano de administración, directivos, representante encargado del cumplimiento y personal con trato directo con clientes, con contenido mínimo definido en las reglas.',
    matiz:
      'Exige evaluación y constancia, y quien la imparte debe acreditar experiencia comprobable en la materia. Una plática grabada sin lista de asistencia ni evaluación no acredita nada.',
    disposicion: 'Art. 18, fracción IX, LFPIORPI y Capítulo XII de las Reglas',
    relacionados: ['manual-de-cumplimiento', 'investigacion-de-personal'],
    verTambien: { etiqueta: 'Programa y evidencia', href: '/obligaciones/capacitacion' },
  },
  {
    slug: 'investigacion-de-personal',
    termino: 'Investigación y selección de personal',
    definicion:
      'Procedimientos de contratación que garantizan calidad técnica, experiencia y honorabilidad, con declaración firmada de cada persona sobre sectores obligados en los que ha trabajado y sobre antecedentes patrimoniales o de inhabilitación.',
    disposicion: 'Art. 18, fracción IX, LFPIORPI y Capítulo XII de las Reglas',
    relacionados: ['capacitacion', 'manual-de-cumplimiento'],
    verTambien: { etiqueta: 'Cómo documentarla', href: '/obligaciones/investigacion-personal' },
  },
  {
    slug: 'auditoria-anual',
    termino: 'Auditoría anual y dictamen',
    definicion:
      'Revisión que evalúa y dictamina la efectividad del cumplimiento durante un año calendario. La realiza el área de auditoría interna cuando el riesgo es bajo o medio, y obligatoriamente un auditor externo independiente cuando el riesgo es alto.',
    matiz:
      'El dictamen califica cada obligación en una escala de cinco resultados e incluye una proyección económica de las multas en que se incurriría de no atender los hallazgos.',
    disposicion: 'Art. 18, fracción XI, LFPIORPI y Capítulo XIV de las Reglas',
    relacionados: ['manual-de-cumplimiento', 'visita-de-verificacion'],
    verTambien: { etiqueta: 'Alcance y plazos', href: '/obligaciones/auditoria-anual' },
  },
  {
    slug: 'visita-de-verificacion',
    termino: 'Visita de verificación',
    definicion:
      'Revisión del SAT para comprobar el cumplimiento de las obligaciones de la LFPIORPI. Se acredita con expedientes, acuses de avisos e informes, manual, evidencia de capacitación y bitácoras.',
    matiz:
      'La obligación de brindar facilidades para la visita es una obligación autónoma: negarlas es infracción por sí sola, con independencia del resultado de la revisión.',
    disposicion: 'Arts. 18, fracción V, y 22 Bis LFPIORPI',
    relacionados: ['auditoria-anual', 'multas'],
    verTambien: { etiqueta: 'Infracciones y multas', href: '/multas' },
  },
  {
    slug: 'restriccion-de-efectivo',
    termino: 'Restricción al uso de efectivo',
    definicion:
      'Prohibición de liquidar o pagar, y de aceptar el pago, con monedas y billetes, divisas o metales preciosos por encima de ciertos montos, en los supuestos que enumera el art. 32.',
    matiz:
      'No es un umbral de aviso sino una prohibición, y su base de comparación incluye el IVA, a diferencia de los umbrales de aviso del art. 17, que se miden sin IVA.',
    disposicion: 'Art. 32 LFPIORPI',
    relacionados: ['multas', 'operacion-relevante'],
    verTambien: { etiqueta: 'Los ocho supuestos', href: '/limites-efectivo' },
  },
  {
    slug: 'activo-virtual',
    termino: 'Activo virtual',
    definicion:
      'Representación de valor registrada electrónicamente y transferible por medios digitales, distinta de la moneda de curso legal y de las divisas.',
    matiz:
      'Su intercambio habitual y profesional es actividad vulnerable con los umbrales más bajos de la ley, y alcanza operaciones realizadas con personas mexicanas desde otra jurisdicción.',
    disposicion: 'Art. 17, fracción XVI, LFPIORPI',
    relacionados: ['actividad-vulnerable', 'umbral-de-aviso'],
    verTambien: { etiqueta: 'La fracción explicada', href: '/actividades-vulnerables/activos-virtuales' },
  },
  {
    slug: 'fe-publica',
    termino: 'Fe pública',
    definicion:
      'Función de notarios y corredores públicos —y de ciertos servidores públicos y personas facilitadoras— que otorga certeza jurídica a los actos que autorizan.',
    matiz:
      'Es la fracción con el régimen más granular: cada inciso tiene su propia regla, y varios generan aviso sin importar el monto.',
    disposicion: 'Art. 17, fracción XII, LFPIORPI',
    relacionados: ['actividad-vulnerable', 'beneficiario-controlador'],
    verTambien: { etiqueta: 'Notarios', href: '/actividades-vulnerables/fe-publica-notarios' },
  },
  {
    slug: 'cliente-o-usuario',
    termino: 'Cliente o usuario',
    definicion:
      'Persona que celebra actos u operaciones con quien realiza la actividad vulnerable. La distinción importa porque define de quién se integra expediente y a nombre de quién se presenta el aviso.',
    matiz:
      'En operaciones con varias partes —consignaciones, intermediación, comercio exterior— identificar mal quién es el cliente produce avisos correctos en el formato y equivocados en el fondo.',
    disposicion: 'Art. 3 LFPIORPI',
    relacionados: ['expediente-unico-de-identificacion', 'beneficiario-controlador'],
  },
  {
    slug: 'dueno-beneficiario',
    termino: 'Dueño beneficiario frente a propietario formal',
    definicion:
      'El propietario formal es quien aparece en el título, la escritura o el libro de registro; el dueño beneficiario es la persona física que realmente disfruta del bien o del recurso.',
    matiz:
      'Toda la lógica de la ley apunta al segundo. Documentar sólo al primero deja el expediente incompleto aunque tenga todas las copias en orden.',
    disposicion: 'Art. 3, fracción III, LFPIORPI',
    relacionados: ['beneficiario-controlador', 'cadena-de-control'],
  },
  {
    slug: 'alta-y-registro',
    termino: 'Alta y registro en el padrón',
    definicion:
      'Trámite por el que quien realiza una actividad vulnerable se inscribe en el padrón del SAT a través del portal SPPLD, con RFC y e.firma vigente, antes de presentar su primer aviso.',
    matiz:
      'La baja también es un trámite: mientras no se presente, la obligación de informar sigue corriendo aunque el negocio ya no realice la actividad.',
    disposicion: 'Art. 18, fracción IV Bis, LFPIORPI y art. 12 del Reglamento',
    relacionados: ['sppld', 'informe-en-ceros', 'sujeto-obligado'],
    verTambien: { etiqueta: 'Cómo darse de alta', href: '/obligaciones/alta-sppld' },
  },
  {
    slug: 'reforma-2026',
    termino: 'Reforma 2025-2026',
    definicion:
      'Conjunto de tres instrumentos escalonados: la reforma a la LFPIORPI en vigor desde el 17 de julio de 2025, la reforma a su Reglamento en vigor desde el 28 de marzo de 2026 y el Acuerdo 115/2026, que modifica las Reglas de Carácter General.',
    matiz:
      'No es una "ley nueva": la LFPIORPI sigue siendo la de 2012. Lo que cambió son sus reformas y las normas que la desarrollan.',
    disposicion: 'DOF 16-07-2025, DOF 27-03-2026 y DOF 07-08-2026',
    relacionados: ['lfpiorpi', 'ebr', 'auditoria-anual'],
    verTambien: { etiqueta: 'Qué cambió exactamente', href: '/reforma-ley-antilavado-2026' },
  },
  {
    slug: 'multas',
    termino: 'Multas administrativas',
    definicion:
      'Sanciones económicas por las infracciones de la ley. El art. 53 enumera las conductas infractoras y el art. 54 fija los rangos aplicables a cada grupo de fracciones.',
    matiz:
      'Son dos artículos distintos y la mayoría de los resúmenes los confunde. La autocorrección, por su parte, está en el art. 55, no en el 56: el 56 regula la revocación de permisos.',
    disposicion: 'Arts. 53, 54 y 55 LFPIORPI',
    relacionados: ['visita-de-verificacion', 'restriccion-de-efectivo'],
    verTambien: { etiqueta: 'Rangos y autocorrección', href: '/multas' },
  },
];

export const GLOSARIO_POR_SLUG: Record<string, TerminoGlosario> = Object.fromEntries(
  GLOSARIO.map((t) => [t.slug, t]),
);

/** Índice alfabético con la inicial normalizada (sin acentos). */
export function inicialDe(termino: string): string {
  const base = termino
    .normalize('NFD')
    // Elimina los diacríticos combinantes para que "Á" indexe bajo "A".
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
  return base.charAt(0);
}

export const GLOSARIO_ORDENADO = [...GLOSARIO].sort((a, b) =>
  a.termino.localeCompare(b.termino, 'es-MX'),
);

export const INICIALES_GLOSARIO: readonly string[] = [
  ...new Set(GLOSARIO_ORDENADO.map((t) => inicialDe(t.termino))),
];
