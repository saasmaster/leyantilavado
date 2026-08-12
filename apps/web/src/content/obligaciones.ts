import type { ContenidoObligacion } from './tipos';

/**
 * Contenido editorial por obligación.
 *
 * Los pasos accionables viven en `datos.OBLIGACIONES` del motor, junto con la
 * evidencia mínima de cada paso. Aquí va lo que el motor no puede saber: a
 * quién le aplica en la práctica, qué se equivoca la gente y qué documento
 * concreto pide un auditor cuando llega a revisar.
 */
const CONTENIDOS: readonly ContenidoObligacion[] = [
  {
    slug: 'alta-sppld',
    tituloSEO: 'Alta y registro en el padrón de actividades vulnerables (SPPLD)',
    descripcionSEO:
      'Cómo darse de alta en el padrón del SAT antes de presentar el primer aviso, qué se necesita, qué pasa si te registras en la fracción equivocada y por qué la baja también es un trámite.',
    respuestaDirecta:
      'Quien realiza una actividad vulnerable debe darse de alta en el padrón del SAT a través del portal SPPLD, con RFC y e.firma vigente, antes de presentar su primer aviso. El alta se hace por cada actividad que realizas y con la fecha en que empezaste a realizarla, no con la fecha del trámite.',
    aQuienAplica: [
      'Toda persona física o moral que realiza cualquiera de las actividades del art. 17, desde que empieza a realizarla.',
      'Quienes actúan por medio de fideicomisos u otras figuras jurídicas, que tienen además un régimen propio de alta y registro desde las reglas de 2026.',
      'Quien realiza varias actividades vulnerables: se registra cada una por separado.',
    ],
    erroresComunes: [
      'Registrarse hasta que aparece la primera operación grande, cuando la obligación nace con el inicio de la actividad.',
      'Dar de alta una sola fracción cuando el negocio realiza dos o más.',
      'Dejar de operar y no tramitar la baja: la obligación de informar sigue viva mientras el registro exista.',
      'Perder el control de la e.firma con la que se hizo el alta, que es la misma que se necesita para todo lo demás.',
    ],
    evidenciaEsperada: [
      'Acuse de alta y registro emitido por el portal, con folio y fecha.',
      'Acuse de designación del representante encargado del cumplimiento, cuando aplica.',
      'Constancia de e.firma vigente de la persona física o moral registrada.',
      'Acuses de las actualizaciones al registro cuando cambiaron datos o actividades.',
    ],
    faq: [
      {
        pregunta: '¿Hay costo por darse de alta?',
        respuesta:
          'El trámite en el portal no tiene costo. Lo que cuesta es todo lo que viene después: expediente, manual, capacitación, sistemas y, en su momento, auditoría.',
      },
      {
        pregunta: '¿Qué pasa si me di de alta en la fracción equivocada?',
        respuesta:
          'Hay que actualizar el registro. Las reglas de 2026 fijan un plazo corto para tramitar la actualización desde el hecho que la motiva, así que no es algo que convenga dejar pendiente.',
      },
      {
        pregunta: '¿Puedo darme de baja si dejé de rebasar los umbrales?',
        respuesta:
          'La baja procede cuando dejas de realizar la actividad vulnerable, no cuando bajan tus montos. Si sigues realizándola, sigues obligado aunque ninguna operación alcance el umbral, y entonces presentas informes en ceros.',
      },
    ],
  },
  {
    slug: 'representante-cumplimiento',
    tituloSEO: 'Representante encargado del cumplimiento: designación y responsabilidades',
    descripcionSEO:
      'Quién debe designarlo, qué pasa mientras no hay designación aceptada, por qué necesita capacitación anual y cómo se documenta el nombramiento.',
    respuestaDirecta:
      'Las personas morales y quienes actúan a través de fideicomisos u otras figuras jurídicas deben designar ante la Secretaría a un representante encargado del cumplimiento y mantener vigente esa designación. Las personas físicas cumplen personal y directamente, sin designar a nadie.',
    aQuienAplica: [
      'Personas morales que realizan actividades vulnerables.',
      'Quienes operan por medio de fideicomisos o cualquier otra figura jurídica.',
      'No aplica a personas físicas, salvo el supuesto de entidades colegiadas previsto en la ley.',
    ],
    erroresComunes: [
      'Designar a alguien sin facultades ni acceso a la información que tendría que revisar.',
      'No actualizar la designación cuando la persona deja el cargo o la empresa.',
      'Suponer que la designación traslada toda la responsabilidad: la organización sigue siendo la obligada.',
      'Olvidar que el representante debe recibir capacitación anual conforme a las reglas.',
    ],
    evidenciaEsperada: [
      'Acta del órgano de gobierno con la designación y las facultades otorgadas.',
      'Acuse de registro de la designación ante la autoridad.',
      'Constancia de la capacitación anual recibida por la persona designada.',
      'Documento que acredite la independencia entre quien cumple y quien audita, cuando la auditoría es interna.',
    ],
    faq: [
      {
        pregunta: '¿Puede ser el dueño del negocio?',
        respuesta:
          'Puede, si tiene las facultades y el tiempo para atender los requerimientos. Lo que no funciona es designar a alguien de forma nominal: la persona tiene que poder acceder a expedientes, avisos y sistemas.',
      },
      {
        pregunta: '¿Qué pasa mientras no hay designación aceptada?',
        respuesta:
          'La ley resuelve el vacío: el cumplimiento corresponde a los integrantes del órgano de administración o al administrador único, al fideicomitente o a quien funja como administrador en la figura de que se trate.',
      },
      {
        pregunta: '¿La identidad del representante es pública?',
        respuesta:
          'No. La ley ordena resguardar su identidad en los términos del régimen de reserva de información, precisamente por el riesgo que implica la función.',
      },
    ],
  },
  {
    slug: 'identificacion-cliente',
    tituloSEO: 'Identificar y conocer al cliente: la obligación que nace primero',
    descripcionSEO:
      'Cómo identificar de manera directa al cliente o usuario, verificar su identidad, preguntar por el beneficiario controlador y qué hacer si se niega a dar la información.',
    respuestaDirecta:
      'Hay que identificar de manera directa al cliente o usuario y verificar su identidad con documentos o medios de identificación con reconocimiento oficial, recabando copia. Se hace antes o durante el acto, o al establecer la relación de negocios, y en varias fracciones procede sin importar el monto.',
    aQuienAplica: [
      'Todo sujeto obligado, desde el umbral de identificación de su fracción; en varias fracciones ese umbral no existe y la obligación aplica desde el primer peso.',
      'Se extiende a preguntar por el beneficiario controlador y, cuando hay relación de negocios, por la actividad u ocupación del cliente.',
    ],
    erroresComunes: [
      'Mirar sólo el umbral de aviso y no integrar expediente en operaciones que sí alcanzan el de identificación.',
      'Guardar la copia de la identificación sin verificar que el documento esté vigente y corresponda a la persona.',
      'No preguntar si actúa por cuenta propia o de un tercero, que es la puerta de entrada al beneficiario controlador.',
      'Realizar la operación pese a la negativa del cliente a dar la información, cuando la ley ordena abstenerse.',
    ],
    evidenciaEsperada: [
      'Formato de identificación firmado, con los datos generales del cliente.',
      'Copia de la identificación oficial vigente y evidencia de su verificación.',
      'Manifestación escrita sobre si actúa por cuenta propia o de un tercero.',
      'Registro de la actividad u ocupación declarada cuando hay relación de negocios.',
    ],
    faq: [
      {
        pregunta: '¿Puedo identificar de forma remota?',
        respuesta:
          'Las reglas de 2026 admiten cuestionarios y medios remotos con firma electrónica en el contexto de la debida diligencia. Lo importante es que el procedimiento esté descrito en tu manual y deje evidencia verificable.',
      },
      {
        pregunta: '¿Qué hago si el cliente se niega a darme sus datos?',
        respuesta:
          'La ley es clara: debes abstenerte de celebrar la operación, y hacerlo no genera responsabilidad para ti. Deja constancia de la negativa y de la decisión.',
      },
      {
        pregunta: '¿Identificar y conocer al cliente son lo mismo?',
        respuesta:
          'No. Identificar es recabar y verificar datos; conocer es entender su actividad, el origen de sus recursos y el propósito de la relación. La segunda es la que sostiene el perfil transaccional.',
      },
    ],
  },
  {
    slug: 'expedientes',
    tituloSEO: 'Expediente único de identificación: cómo se integra y se actualiza',
    descripcionSEO:
      'Qué contiene el expediente único, cuándo se integra, con qué frecuencia se verifica y qué diferencia hay entre expediente simplificado y completo.',
    respuestaDirecta:
      'Cada cliente tiene un expediente único, integrado antes o durante el acto o al establecer la relación de negocios, con los datos y documentos que corresponden a su tipo de persona. Es único por cliente, no por operación, y se mantiene actualizado mientras dure la relación.',
    aQuienAplica: [
      'Todo sujeto obligado respecto de cada cliente que alcanza el umbral de identificación de su fracción.',
      'El régimen simplificado sólo procede para clientes clasificados de riesgo bajo conforme a la metodología documentada; el riesgo medio exige expediente completo.',
    ],
    erroresComunes: [
      'Abrir un expediente nuevo cada vez que el cliente vuelve, en lugar de actualizar el existente.',
      'Aplicar medidas simplificadas sin tener escritos en el manual los criterios de riesgo bajo que las justifican.',
      'Conservar comprobantes de domicilio con antigüedad mayor a la que admiten las reglas.',
      'No dejar rastro de quién actualizó el expediente y cuándo.',
    ],
    evidenciaEsperada: [
      'Expediente por cliente, con índice de documentos y fecha de integración.',
      'Bitácora de actualizaciones con responsable y fecha.',
      'Evidencia de la verificación periódica de expedientes.',
      'Documentación soporte de cada operación vinculada al cliente.',
    ],
    faq: [
      {
        pregunta: '¿Cada cuánto se revisan los expedientes?',
        respuesta:
          'Las reglas prevén una verificación al menos una vez al año, y fijan una antigüedad máxima para el comprobante de domicilio. Un expediente integrado una vez y nunca revisado es un hallazgo seguro.',
      },
      {
        pregunta: '¿Puedo tenerlo sólo en digital?',
        respuesta:
          'Sí. La conservación puede ser física o electrónica. Lo que importa es que sea íntegro, recuperable y que puedas ponerlo a disposición de la autoridad cuando lo requiera.',
      },
      {
        pregunta: '¿Qué documentos van en cada expediente?',
        respuesta:
          'Depende del tipo de cliente y de la actividad: las reglas remiten a anexos específicos. Toma el listado del anexo que te corresponde, no de una plantilla genérica.',
      },
    ],
  },
  {
    slug: 'beneficiario-controlador',
    tituloSEO: 'Identificar al beneficiario controlador: orden de prelación y excepciones',
    descripcionSEO:
      'Cómo se identifica a la persona física que se beneficia o controla al cliente, el orden de prelación que fijan las reglas, los fideicomisos y la diferencia con el régimen fiscal.',
    respuestaDirecta:
      'Hay que identificar a la persona física que en última instancia se beneficia de la operación o controla al cliente. Cuando el cliente es persona moral, las reglas de 2026 fijan un orden de prelación: primero quien tiene una participación relevante en el capital, luego quien controla por otros medios y, si no hay nadie, el funcionario administrativo de mayor jerarquía.',
    aQuienAplica: [
      'Todo sujeto obligado, respecto de clientes personas morales, fideicomisos y otras figuras jurídicas.',
      'También respecto de personas físicas, mediante la declaración sobre si existe un beneficiario controlador distinto.',
      'Las reglas prevén excepciones acotadas, como los clientes que cotizan en bolsa reconocida.',
    ],
    erroresComunes: [
      'Documentar al accionista mayoritario y detenerse ahí, sin subir por la cadena hasta una persona física.',
      'Ignorar el control de hecho: hay estructuras donde quien decide no aparece en el capital social.',
      'Usar el expediente fiscal de beneficiario controlador como si sirviera para la Ley Antilavado: son regímenes con umbrales y autoridades distintos.',
      'No dejar constancia de los casos en que no fue posible determinarlo y de las medidas que se tomaron.',
    ],
    evidenciaEsperada: [
      'Manifestación firmada del cliente sobre su beneficiario controlador.',
      'Organigrama corporativo con la cadena de titularidad y la de control.',
      'Documentación de respaldo de cada eslabón de la cadena.',
      'Constancia del procedimiento aplicado y del resultado, incluidos los casos no concluyentes.',
    ],
    faq: [
      {
        pregunta: '¿Desde qué porcentaje alguien es beneficiario controlador?',
        respuesta:
          'La Ley Antilavado y el Código Fiscal usan porcentajes de control distintos, y por eso los dos expedientes no son intercambiables. Consulta la cifra vigente de cada régimen antes de armar la matriz de tu cliente.',
      },
      {
        pregunta: '¿Cómo lo identifico en un fideicomiso?',
        respuesta:
          'Las reglas señalan que lo es quien ejerce el control efectivo: fiduciario, fideicomitente, fideicomisario, personas protectoras o miembros del comité técnico. Si esos son personas morales, hay que seguir subiendo hasta la persona física.',
      },
      {
        pregunta: '¿Cuándo debo tenerlo identificado?',
        respuesta:
          'Antes del acto u operación o, a más tardar, al establecer la relación de negocios. Dejarlo para después de operar invierte el orden que la norma exige.',
      },
    ],
  },
  {
    slug: 'conservacion-diez-anios',
    tituloSEO: 'Conservación de información por diez años',
    descripcionSEO:
      'Qué hay que conservar, desde cuándo corre el plazo, qué lo interrumpe y cómo demostrar que la información sigue siendo íntegra y recuperable.',
    respuestaDirecta:
      'La información y documentación soporte de la identificación y de las operaciones se conserva por al menos diez años contados desde la realización de la actividad vulnerable. La reforma de 2025 amplió ese plazo, que antes era menor, y el Reglamento lo confirmó para avisos, informes y acuses.',
    aQuienAplica: [
      'Todo sujeto obligado respecto de expedientes, documentación soporte, correspondencia comercial y resultados de los análisis realizados.',
      'También respecto de copias de avisos e informes y de sus acuses.',
      'Con reglas propias de conservación adicionales para evidencia de capacitación, histórico de riesgo y dictámenes de auditoría.',
    ],
    erroresComunes: [
      'Computar el plazo desde la fecha del aviso y no desde la realización de la actividad.',
      'Conservar el archivo sin poder recuperarlo: respaldos que nadie ha probado a restaurar.',
      'Depurar información al cambiar de sistema o de proveedor, sin migrar el histórico.',
      'Olvidar que el plazo se interrumpe si hay recurso o juicio y se reinicia cuando la resolución queda firme.',
    ],
    evidenciaEsperada: [
      'Política de conservación con el criterio de cómputo del plazo escrito.',
      'Evidencia de respaldos y de pruebas de restauración.',
      'Bitácora de accesos y de control de la información resguardada.',
      'Inventario del acervo con su ubicación física o electrónica.',
    ],
    faq: [
      {
        pregunta: '¿Diez años desde cuándo exactamente?',
        respuesta:
          'Desde la realización de la actividad vulnerable, no desde el envío del aviso ni desde el cierre del ejercicio. Deja el criterio de cómputo escrito en tu política.',
      },
      {
        pregunta: '¿Puedo conservar todo en la nube?',
        respuesta:
          'Sí, siempre que la información esté disponible en el domicilio registrado ante la autoridad cuando te la requieran, y que puedas acreditar su integridad y su recuperabilidad.',
      },
      {
        pregunta: '¿Qué pasa si el plazo estaba corriendo cuando cambió la ley?',
        respuesta:
          'Los transitorios de la reforma al Reglamento vinculan el cómputo ampliado a los actos realizados a partir de la entrada en vigor de la reforma legal. Documenta qué regla aplicaste a cada tramo de tu acervo.',
      },
    ],
  },
  {
    slug: 'avisos',
    tituloSEO: 'Presentación de avisos: el plazo del día 17 y sus trampas',
    descripcionSEO:
      'Cuándo se presenta un aviso, qué pasa si el día 17 cae en día inhábil, la facilidad por sexto dígito del RFC y qué contiene el aviso.',
    respuestaDirecta:
      'Los avisos se presentan a más tardar el día 17 del mes inmediato siguiente a aquel en que se realizó la operación. Si ese día es inhábil, la fecha límite se recorre al día hábil siguiente, y existe además una facilidad administrativa que permite presentar en días posteriores según el sexto dígito del RFC.',
    aQuienAplica: [
      'Todo sujeto obligado por cada acto u operación que alcanza el umbral de aviso, individualmente o por acumulación.',
      'Las reglas de 2026 precisaron cuándo se entiende realizado el acto u operación en cada fracción, que es lo que hace correr el plazo.',
    ],
    erroresComunes: [
      'Contar el plazo desde la firma del contrato cuando la regla de la fracción fija otro momento.',
      'Usar la facilidad del sexto dígito sin presentar precisamente en el día que corresponde, con lo que se pierde el beneficio.',
      'Presentar un solo aviso agrupando varias operaciones que debían reportarse por separado.',
      'No revisar la acumulación de seis meses antes de concluir que no hay obligación.',
    ],
    evidenciaEsperada: [
      'Acuse de recepción de cada aviso, con folio y fecha.',
      'Archivo enviado y su documentación soporte, vinculados al expediente del cliente.',
      'Registro de la revisión y aprobación interna previa al envío.',
      'Conciliación entre operaciones del periodo y avisos presentados.',
    ],
    faq: [
      {
        pregunta: '¿Un aviso por operación o uno por mes?',
        respuesta:
          'Como regla, uno por cada acto u operación que alcanza el umbral. Hay excepciones expresas, como el consumo mensual acumulado en tarjetas y la posibilidad de un aviso mensual en desarrollo inmobiliario cuando los recursos se aplican al mismo proyecto.',
      },
      {
        pregunta: '¿Qué pasa si presento fuera de tiempo?',
        respuesta:
          'La extemporaneidad es una infracción distinta de la omisión, con un rango de multa distinto. La ley acota la extemporaneidad a un plazo corto después de la fecha límite; pasado ese plazo, el tratamiento cambia.',
      },
      {
        pregunta: '¿Puedo corregir un aviso ya presentado?',
        respuesta:
          'El portal contempla avisos modificatorios. Lo que no admite modificación ni eliminación, según las reglas de 2026, es el informe en ceros una vez enviado.',
      },
    ],
  },
  {
    slug: 'informes-en-ceros',
    tituloSEO: 'Informes en ceros: obligatorios aunque no haya operaciones',
    descripcionSEO:
      'Qué es el informe en ceros, cuándo se presenta, por qué no puede modificarse una vez enviado y cómo dejar de presentarlo legítimamente.',
    respuestaDirecta:
      'Cuando durante el mes no hubo actos u operaciones objeto de aviso, hay que presentar un informe en ceros dentro del mismo plazo del día 17. Se llena únicamente con la identificación de quien realiza la actividad, el periodo y la declaración de que no hubo operaciones reportables.',
    aQuienAplica: [
      'Todo sujeto obligado dado de alta en el padrón, mes con mes, mientras el registro exista.',
      'También a quienes presentan avisos por las vías especiales que prevé el Reglamento.',
    ],
    erroresComunes: [
      'Dejar de presentarlo porque el negocio está inactivo, sin tramitar la baja del padrón.',
      'Presentarlo cuando sí hubo una operación reportable que no se detectó a tiempo.',
      'Suponer que puede corregirse después: las reglas de 2026 lo declaran no modificable ni eliminable una vez enviado.',
      'No conservar el acuse, que es la única prueba de haberlo presentado.',
    ],
    evidenciaEsperada: [
      'Acuse de cada informe en ceros del periodo revisado, sin meses faltantes.',
      'Conciliación que muestre que en esos meses no hubo operaciones reportables.',
      'Acuse de baja del padrón, si se dejó de realizar la actividad.',
    ],
    faq: [
      {
        pregunta: '¿Puedo dejar de presentarlos si ya no opero?',
        respuesta:
          'Sólo después de tramitar la baja del padrón. Mientras el registro siga vivo, la obligación de informar continúa aunque el negocio esté detenido.',
      },
      {
        pregunta: '¿Qué pasa si después detecto una operación que sí era reportable?',
        respuesta:
          'Debes presentar el aviso correspondiente. El informe en ceros ya enviado no se modifica, y la autoridad valorará el cumplimiento respecto del plazo legal.',
      },
      {
        pregunta: '¿El informe en ceros me protege en una verificación?',
        respuesta:
          'Acredita que informaste, no que no había nada que reportar. Si la revisión encuentra operaciones que sí alcanzaban el umbral, el informe en ceros no las cubre.',
      },
    ],
  },
  {
    slug: 'operaciones-inusuales',
    tituloSEO: 'Aviso de veinticuatro horas por sospecha, hechos o indicios',
    descripcionSEO:
      'Cuándo corre el plazo de veinticuatro horas, por qué procede aunque la operación no se haya celebrado y por qué su exigibilidad está diferida.',
    respuestaDirecta:
      'Cuando hay sospecha, o información basada en hechos o indicios, de que los recursos pudieran provenir o destinarse a los delitos de operaciones con recursos de procedencia ilícita, el aviso se presenta dentro de las veinticuatro horas siguientes. Procede aunque el acto no alcance ningún umbral e incluso si nunca llegó a celebrarse.',
    aQuienAplica: [
      'Todo sujeto obligado, en tres supuestos: sospecha, hechos o indicios obtenidos por otras fuentes, y contraparte que aparece en los listados oficiales.',
      'También respecto de quien sólo intentó operar, siempre que existan datos para identificarlo.',
    ],
    erroresComunes: [
      'Esperar a que la operación se concrete para decidir si se avisa.',
      'No dejar constancia del análisis cuando se concluye que no procede el aviso: sin registro, no hay forma de acreditar que hubo criterio.',
      'Confundir estas categorías con las de operación inusual, preocupante y relevante del régimen financiero, que no aplican a actividades vulnerables.',
      'No tener definido quién decide ni en cuánto tiempo, para un plazo que se mide en horas.',
    ],
    evidenciaEsperada: [
      'Expediente del caso con la alerta, el análisis y la decisión, firmados y fechados.',
      'Evidencia del escalamiento al representante encargado del cumplimiento.',
      'Acuse del aviso, cuando procedió.',
      'Registro de las decisiones de no avisar, con su motivación.',
    ],
    faq: [
      {
        pregunta: '¿Ya es exigible este aviso?',
        respuesta:
          'Su envío quedó diferido hasta seis meses después de que entre en vigor la resolución que actualice los formatos oficiales identificando expresamente este tipo de aviso. Esa resolución no aparece publicada a la fecha de nuestra última revisión, por lo que no hay una fecha cierta.',
      },
      {
        pregunta: '¿Debo avisar si el cliente aparece en una lista oficial?',
        respuesta:
          'Sí, en el mismo plazo de veinticuatro horas, cuando la contraparte —real o intentada— aparece en los listados a que remiten las reglas.',
      },
      {
        pregunta: '¿Y mientras no sea exigible, no hago nada?',
        respuesta:
          'Al contrario: el procedimiento interno de detección, escalamiento y decisión sí debe existir, porque es parte del manual y de los mecanismos de monitoreo. Lo diferido es el envío por el formato oficial, no el deber de vigilar.',
      },
    ],
  },
  {
    slug: 'enfoque-basado-riesgos',
    tituloSEO: 'Metodología de enfoque basado en riesgos (EBR)',
    descripcionSEO:
      'Qué debe contener la metodología de riesgos, con qué información se alimenta, cada cuánto se revisa y desde cuándo la autoridad puede requerirla.',
    respuestaDirecta:
      'Hay que diseñar e implementar una metodología documentada que evalúe los riesgos de las operaciones, de los clientes, de sus transacciones y de los canales, tomando en cuenta la evaluación nacional de riesgos. Debe constar por escrito, en el manual o en documento propio, y revisarse al menos cada doce meses.',
    aQuienAplica: [
      'Todo sujeto obligado, conforme al art. 18 fracción VII de la ley y al capítulo correspondiente de las reglas.',
      'La autoridad puede requerirla a partir de la fecha que fijan los transitorios del Acuerdo 115/2026.',
    ],
    erroresComunes: [
      'Confundir la metodología con la matriz: la matriz es el resultado, la metodología es el método que la produce.',
      'No incluir indicadores específicos para los delitos que la norma menciona expresamente.',
      'Alimentarla con datos de un solo mes cuando la regla pide información de al menos doce.',
      'Dejarla sin revisar cuando cambia la evaluación nacional de riesgos o aparece un producto nuevo.',
    ],
    evidenciaEsperada: [
      'Documento de metodología con factores, método de medición y mitigantes identificados.',
      'Evidencia de la información usada: número de clientes, número de operaciones y monto operado.',
      'Actas de revisión anual y de las revisiones extraordinarias.',
      'Evaluación previa documentada antes de lanzar un producto, canal o segmento nuevo.',
    ],
    faq: [
      {
        pregunta: '¿Y si mi negocio acaba de empezar y no tengo doce meses de datos?',
        respuesta:
          'Las reglas prevén una metodología inicial con datos proyectados, que se actualiza al cumplir los primeros doce meses de operación.',
      },
      {
        pregunta: '¿La autoridad puede pedirme que la cambie?',
        respuesta:
          'Sí. Las reglas facultan al SAT para ordenar ajustes a la metodología o a los mitigantes y para solicitar un plan de acción con medidas reforzadas.',
      },
      {
        pregunta: '¿Cuánto tiempo debo conservar la información que la sustenta?',
        respuesta:
          'Las reglas fijan una conservación de al menos diez años para la información de la metodología, en línea con el resto del régimen documental.',
      },
    ],
  },
  {
    slug: 'clasificacion-clientes',
    tituloSEO: 'Clasificación de clientes por grado de riesgo',
    descripcionSEO:
      'Los tres grados mínimos, cada cuánto se reevalúan, qué factores se consideran y en qué casos el riesgo alto es obligatorio.',
    respuestaDirecta:
      'Cada cliente debe quedar clasificado con un grado de riesgo, con al menos tres niveles —bajo, medio y alto—, derivado de un modelo de evaluación establecido en el manual y coherente con la metodología general. La clasificación se reevalúa periódicamente y con mayor frecuencia cuanto mayor es el riesgo.',
    aQuienAplica: [
      'Todo sujeto obligado, respecto de todos sus clientes, conforme al capítulo correspondiente de las reglas.',
      'Aplicable a los actos u operaciones realizados a partir de la fecha que fijan los transitorios del Acuerdo 115/2026.',
    ],
    erroresComunes: [
      'Clasificar al alta y no volver a mirar el expediente nunca más.',
      'Usar sólo factores del cliente y omitir los transaccionales: tipo, volumen, frecuencia, contrapartes y origen de los recursos.',
      'No tener escritos los criterios de riesgo bajo que justifican el expediente simplificado.',
      'Clasificar de riesgo medio o bajo a personas para las que la norma exige riesgo alto de manera obligatoria.',
    ],
    evidenciaEsperada: [
      'Modelo de evaluación descrito en el manual, con factores y ponderaciones.',
      'Ficha de riesgo por cliente con el nivel asignado y su justificación.',
      'Bitácora de reevaluaciones con fecha y responsable.',
      'Evidencia de la debida diligencia reforzada aplicada a los clientes de riesgo alto.',
    ],
    faq: [
      {
        pregunta: '¿Cada cuánto reevalúo el grado de riesgo?',
        respuesta:
          'Las reglas fijan una reevaluación al menos semestral, con mayor frecuencia a mayor grado de riesgo. Un cliente de riesgo alto revisado una vez al año no cumple.',
      },
      {
        pregunta: '¿Hay clientes que deban ser de riesgo alto por regla?',
        respuesta:
          'Sí. Las reglas señalan supuestos de riesgo alto obligatorio, entre ellos las personas políticamente expuestas extranjeras y los no residentes vinculados a jurisdicciones señaladas por la autoridad.',
      },
      {
        pregunta: '¿Puedo tener más de tres niveles?',
        respuesta:
          'Sí. Tres es el mínimo; puedes agregar grados intermedios si tu modelo lo justifica y queda descrito en el manual.',
      },
    ],
  },
  {
    slug: 'perfil-transaccional',
    tituloSEO: 'Perfil transaccional del cliente y detección de desviaciones',
    descripcionSEO:
      'Cómo se construye el perfil transaccional, qué se usa durante los primeros meses de la relación, cada cuánto se reevalúa y cómo se conecta con el sistema de alertas.',
    respuestaDirecta:
      'El perfil transaccional es el comportamiento esperado del cliente en monto, número y frecuencia de operaciones, y en origen y destino de los recursos. Durante los primeros meses de la relación se arma con el monto máximo mensual que el propio cliente declara, y ese perfil inicial debe cargarse al sistema de alertas.',
    aQuienAplica: [
      'Todo sujeto obligado, como parte de la política de conocimiento del cliente integrada al manual.',
      'Con reevaluación periódica y con supuestos de desviación definidos por escrito.',
    ],
    erroresComunes: [
      'Definir el perfil y no compararlo nunca contra el comportamiento real.',
      'No cargar el perfil inicial declarado al sistema de alertas, con lo que la alerta nunca se dispara.',
      'Registrar la desviación sin analizarla ni documentar la conclusión.',
      'Confundir la desviación del perfil con el aviso por umbral: son controles distintos con consecuencias distintas.',
    ],
    evidenciaEsperada: [
      'Perfil declarado por el cliente y su carga en el sistema.',
      'Reportes periódicos de comparación entre perfil y comportamiento real.',
      'Análisis documentado de las desviaciones relevantes y su conclusión.',
      'Evidencia de la reevaluación periódica del perfil.',
    ],
    faq: [
      {
        pregunta: '¿Cada cuánto se reevalúa el perfil?',
        respuesta:
          'Las reglas prevén una reevaluación al menos semestral, en línea con la reevaluación del grado de riesgo del cliente.',
      },
      {
        pregunta: '¿Qué hago cuando el cliente se desvía de su perfil?',
        respuesta:
          'Analizar la desviación, documentar la conclusión y, si el análisis lleva a sospecha, escalar al procedimiento del aviso de veinticuatro horas. No toda desviación es un aviso, pero toda desviación exige registro.',
      },
      {
        pregunta: '¿Sirve para clientes con una sola operación?',
        respuesta:
          'El perfil cobra sentido en relaciones de negocio. En operaciones aisladas, el control relevante es la identificación y el análisis de la operación concreta.',
      },
    ],
  },
  {
    slug: 'personas-politicamente-expuestas',
    tituloSEO: 'Personas políticamente expuestas: detección y medidas reforzadas',
    descripcionSEO:
      'Quién es PEP, hasta dónde llega la asimilación a familiares y socios, cuánto dura la condición y qué medidas reforzadas exige la norma.',
    respuestaDirecta:
      'Hay que determinar si el cliente, su beneficiario controlador o sus allegados son personas políticamente expuestas y, en su caso, aplicar debida diligencia reforzada. La condición no se apaga al dejar el cargo: la norma la conserva durante el año siguiente, y las PEP extranjeras se clasifican de riesgo alto en todos los casos.',
    aQuienAplica: [
      'Todo sujeto obligado, como parte de la política de conocimiento del cliente.',
      'La asimilación alcanza al cónyuge, a la concubina o concubinario, al parentesco cercano y a los socios con vínculos patrimoniales.',
    ],
    erroresComunes: [
      'Preguntar sólo por el cliente y no extender la revisión a familiares y socios.',
      'Tratar por igual a las PEP nacionales y a las extranjeras, cuando la norma les da tratamiento distinto.',
      'Operar con una PEP de riesgo alto sin la aprobación de nivel directivo que exige la norma.',
      'Confiar únicamente en la declaración del cliente, sin contrastar contra fuentes.',
    ],
    evidenciaEsperada: [
      'Cuestionario o declaración del cliente sobre su condición de PEP y la de sus allegados.',
      'Evidencia de la consulta contra fuentes y de su fecha.',
      'Aprobación documentada del nivel directivo para iniciar o continuar la relación, cuando aplica.',
      'Registro del monitoreo reforzado aplicado.',
    ],
    faq: [
      {
        pregunta: '¿Cómo detecto a una PEP si no hay una lista pública completa?',
        respuesta:
          'Con la declaración del cliente, la revisión de fuentes disponibles y, cuando esté operativa, la consulta que las reglas prevén ante la UIF con la e.firma del alta. Documenta qué fuentes usaste y cuándo.',
      },
      {
        pregunta: '¿Cuánto tiempo sigue siendo PEP quien dejó el cargo?',
        respuesta:
          'Las reglas conservan la condición durante el año siguiente a dejar el cargo, con una regla adicional cuando la persona dejó de serlo dentro del año anterior a la operación.',
      },
      {
        pregunta: '¿Puedo negarme a operar con una PEP?',
        respuesta:
          'Ser PEP no prohíbe operar: obliga a reforzar la diligencia y a obtener aprobación de nivel directivo cuando además es de riesgo alto. La decisión comercial es tuya, pero debe quedar documentada.',
      },
    ],
  },
  {
    slug: 'manual-cumplimiento',
    tituloSEO: 'Manual de políticas internas: contenido mínimo y plazos',
    descripcionSEO:
      'Qué debe contener el manual, en qué plazo desde el alta debe existir, quién lo aprueba y por qué la autoridad puede ordenar modificarlo.',
    respuestaDirecta:
      'El manual documenta cómo la organización cumple: identificación, conocimiento del cliente, clasificación de riesgo, perfil transaccional, PEP, avisos e informes, conservación, acumulación, capacitación, control interno y auditoría. Las reglas exigen que exista dentro de los noventa días naturales siguientes al alta y registro.',
    aQuienAplica: [
      'Todo sujeto obligado, conforme al art. 18 fracción VIII de la ley y al capítulo correspondiente de las reglas.',
      'En grupos empresariales, con políticas centralizadas aplicables a sucursales y filiales de propiedad mayoritaria, incluidas las extranjeras.',
    ],
    erroresComunes: [
      'Descargar una plantilla genérica que no describe los procesos reales del negocio.',
      'No incorporar la metodología de riesgos, que las reglas exigen que forme parte del manual o de documento asociado.',
      'No versionar el manual ni conservar las versiones anteriores.',
      'Omitir una política porque el negocio no realiza ese acto, sin hacerlo constar expresamente como permiten las reglas.',
    ],
    evidenciaEsperada: [
      'Manual vigente con fecha, versión y aprobación del órgano de gobierno.',
      'Control de versiones con el histórico completo.',
      'Constancia de difusión al personal alcanzado.',
      'Anexos con formatos, criterios de riesgo bajo y procedimientos operativos.',
    ],
    faq: [
      {
        pregunta: '¿Cuándo debe estar listo el manual?',
        respuesta:
          'Las reglas fijan noventa días naturales desde el alta y registro. Para quienes ya estaban dados de alta antes de la reforma, los transitorios del Acuerdo 115/2026 fijan una fecha específica para tenerlo con la metodología incorporada.',
      },
      {
        pregunta: '¿La autoridad puede ordenarme modificarlo?',
        respuesta:
          'Sí. Las reglas facultan al SAT para ordenar modificaciones al manual, lo que convierte su calidad en un asunto práctico y no sólo formal.',
      },
      {
        pregunta: '¿Puedo omitir políticas de actos que no realizo?',
        respuesta:
          'Puedes, siempre que lo hagas constar en el propio manual. La exención cesa en el momento en que decidas realizar esos actos.',
      },
    ],
  },
  {
    slug: 'mecanismos-automatizados',
    tituloSEO: 'Mecanismos automatizados: funciones mínimas obligatorias',
    descripcionSEO:
      'Qué debe hacer un mecanismo automatizado, por qué una hoja de cálculo puede bastar y qué histórico hay que conservar.',
    respuestaDirecta:
      'Los mecanismos automatizados deben conservar y permitir consultar el expediente único, consolidar las operaciones por cliente para detectar desviaciones y acumulación, alimentar la metodología de riesgos, ejecutar el modelo de clasificación, generar alertas y monitorear el uso de efectivo. La norma no exige un software comercial: admite procesos apoyados en hojas de cálculo o bases de datos, si cumplen esas funciones y son verificables.',
    aQuienAplica: [
      'Todo sujeto obligado, conforme al art. 18 fracción X de la ley y al capítulo correspondiente de las reglas.',
      'Deben ser razonablemente adecuados al volumen, naturaleza, complejidad y riesgo de la operación.',
    ],
    erroresComunes: [
      'Comprar un sistema que no cubre la acumulación por cliente, que es justo la función más difícil de hacer a mano.',
      'Generar alertas que nadie resuelve ni documenta.',
      'No conservar el histórico de cambios de grado de riesgo y de perfil transaccional.',
      'Tener el sistema desalineado con la metodología de riesgos, cuando las reglas exigen que no haya inconsistencias entre ambos.',
    ],
    evidenciaEsperada: [
      'Descripción funcional del mecanismo y su alineación con el manual.',
      'Base consolidada por cliente y evidencia de la acumulación calculada.',
      'Bitácora de alertas con su resolución y responsable.',
      'Histórico de cambios de riesgo y de perfil, con la antigüedad que exigen las reglas.',
      'Control de versiones de las reglas configuradas, con autor, fecha y motivo.',
    ],
    faq: [
      {
        pregunta: '¿Me obliga a comprar software?',
        respuesta:
          'No. La definición de las reglas admite expresamente procesos automatizados apoyados en hojas de cálculo o bases de datos. Lo que no admite es un control manual sin trazabilidad.',
      },
      {
        pregunta: '¿Desde cuándo deben estar operando?',
        respuesta:
          'Los transitorios del Acuerdo 115/2026 fijan una fecha límite para tenerlos operando, con la información de los actos realizados a partir de esa fecha.',
      },
      {
        pregunta: '¿Qué histórico tengo que conservar?',
        respuesta:
          'Las reglas piden conservar el histórico de cambios de grado de riesgo y de perfil transaccional por un periodo largo, alineado con la conservación general del régimen.',
      },
    ],
  },
  {
    slug: 'capacitacion',
    tituloSEO: 'Capacitación anual del personal en materia PLD',
    descripcionSEO:
      'A quién alcanza el programa anual, qué contenido mínimo exige la norma, qué requisitos debe cumplir quien la imparte y qué evidencia conservar.',
    respuestaDirecta:
      'Debe existir un programa anual de capacitación dirigido al órgano de administración, a los directivos, al representante encargado del cumplimiento y al personal con trato directo con clientes o involucrado en identificación, avisos y auditoría. Los cursos se imparten al menos una vez al año, con evaluación y constancia.',
    aQuienAplica: [
      'Todo sujeto obligado, conforme al art. 18 fracción IX de la ley y al capítulo correspondiente de las reglas.',
      'El personal de atención al público o que administra recursos debe capacitarse de forma previa o simultánea a su ingreso.',
    ],
    erroresComunes: [
      'Impartir una plática sin evaluación ni constancia, que no acredita nada frente a una revisión.',
      'Dejar fuera al órgano de administración, que la norma incluye expresamente.',
      'Contratar a un instructor que no puede acreditar la experiencia que exigen las reglas.',
      'No prever en el manual qué se hace con quien no aprueba la evaluación.',
    ],
    evidenciaEsperada: [
      'Programa anual con temario, alcance y calendario.',
      'Materiales impartidos y listas de asistencia firmadas.',
      'Resultados de las evaluaciones y constancias expedidas.',
      'Acreditación de la experiencia de quien impartió la capacitación.',
    ],
    faq: [
      {
        pregunta: '¿Cuál es el primer periodo anual bajo las nuevas reglas?',
        respuesta:
          'Los transitorios del Acuerdo 115/2026 fijan un ejercicio completo como primer periodo anual de capacitación. Puedes consultarlo en el calendario de cumplimiento del sitio.',
      },
      {
        pregunta: '¿Qué temas debe cubrir como mínimo?',
        respuesta:
          'La ley, el reglamento, las reglas y las resoluciones de formatos; el propio manual; los actos u operaciones del art. 17; y los riesgos concretos a los que está expuesta la organización, coherentes con los resultados de su metodología.',
      },
      {
        pregunta: '¿Cuánto conservo la evidencia?',
        respuesta:
          'Las reglas fijan una conservación larga para programas, materiales, listas, evaluaciones y constancias, en línea con el resto del régimen documental.',
      },
    ],
  },
  {
    slug: 'investigacion-personal',
    tituloSEO: 'Selección e investigación del personal',
    descripcionSEO:
      'Qué exige el procedimiento de selección, qué debe declarar cada persona por escrito y desde cuándo aplica a nuevas contrataciones.',
    respuestaDirecta:
      'Hay que contar con procedimientos de selección que garanticen calidad técnica, experiencia y honorabilidad del personal, y obtener de cada funcionario o empleado una declaración firmada sobre los sectores obligados en los que ha trabajado y sobre la ausencia de sentencias por delitos patrimoniales o de inhabilitaciones.',
    aQuienAplica: [
      'Todo sujeto obligado, conforme al art. 18 fracción IX de la ley y al capítulo correspondiente de las reglas.',
      'Aplicable a las nuevas contrataciones a partir de la fecha que fijan los transitorios del Acuerdo 115/2026.',
    ],
    erroresComunes: [
      'Aplicar el procedimiento sólo al área de cumplimiento y no al personal con trato directo con clientes.',
      'Guardar el currículum sin verificar nada de lo que declara.',
      'No recabar la declaración firmada, que es el documento que la norma menciona de forma expresa.',
      'No prever medidas correctivas en el manual para los casos en que la investigación arroja hallazgos.',
    ],
    evidenciaEsperada: [
      'Procedimiento de selección descrito en el manual.',
      'Declaración firmada por cada persona, con fecha.',
      'Evidencia de la verificación de antecedentes y referencias.',
      'Registro de la decisión de contratación y de sus fundamentos.',
    ],
    faq: [
      {
        pregunta: '¿Aplica al personal que ya estaba contratado?',
        respuesta:
          'Los transitorios lo hacen aplicable a las nuevas contrataciones a partir de una fecha determinada. Extenderlo al personal actual es una decisión de la organización, y conviene documentarla.',
      },
      {
        pregunta: '¿Puedo pedir una carta de no antecedentes penales?',
        respuesta:
          'La norma habla de una declaración firmada por la persona. Cualquier verificación adicional debe respetar la normativa de datos personales y quedar justificada en el procedimiento.',
      },
      {
        pregunta: '¿Qué hago si encuentro un hallazgo?',
        respuesta:
          'Aplicar las medidas correctivas que tu manual prevea. Lo que la norma exige es que esas medidas existan por escrito antes de que aparezca el caso.',
      },
    ],
  },
  {
    slug: 'auditoria-anual',
    tituloSEO: 'Auditoría anual de cumplimiento: quién puede auditar y con qué alcance',
    descripcionSEO:
      'Auditoría interna frente a auditor externo independiente, requisitos del auditor, alcance de la revisión y primer periodo auditable.',
    respuestaDirecta:
      'El cumplimiento debe someterse a una revisión anual que evalúe y dictamine su efectividad durante un año calendario. Puede hacerla el área de auditoría o control interno cuando el riesgo de la organización es bajo o medio, y debe hacerla un auditor externo independiente cuando el riesgo es alto.',
    aQuienAplica: [
      'Todo sujeto obligado, conforme al art. 18 fracción XI de la ley y al capítulo correspondiente de las reglas.',
      'El primer periodo auditable lo fijan los transitorios del Acuerdo 115/2026.',
    ],
    erroresComunes: [
      'Encargar la auditoría interna a la misma persona que ejerce el cumplimiento, cuando la norma exige independencia.',
      'Contratar a un auditor externo sin verificar los requisitos de experiencia y certificación que exigen las reglas.',
      'Auditar sólo la existencia de documentos y no la efectividad del cumplimiento, que es lo que la norma pide evaluar.',
      'No dar seguimiento a los hallazgos del dictamen anterior, que la norma exige revisar expresamente.',
    ],
    evidenciaEsperada: [
      'Carta de alcance y plan de trabajo de la auditoría.',
      'Documentación del muestreo: número de operaciones revisadas y porcentaje del total.',
      'Informe con hallazgos, severidad, responsables y plazos.',
      'Acreditación de los requisitos del auditor y de su independencia.',
    ],
    faq: [
      {
        pregunta: '¿Puedo auditarme con mi propio equipo?',
        respuesta:
          'Si tu riesgo es bajo o medio conforme a tu metodología, sí, con personal independiente del representante encargado del cumplimiento y con acreditación del programa anual de capacitación. Con riesgo alto, la auditoría externa es obligatoria.',
      },
      {
        pregunta: '¿Qué requisitos debe cumplir el auditor externo?',
        respuesta:
          'Las reglas exigen título y cédula en disciplinas afines, experiencia comprobable en la materia, certificación vigente de la autoridad al firmar el dictamen, ausencia de sentencias por delitos patrimoniales y ausencia de conflictos de interés con el auditado.',
      },
      {
        pregunta: '¿Cuál es el primer año que debo auditar?',
        respuesta:
          'Lo fijan los transitorios del Acuerdo 115/2026. Consulta la fecha exacta en el calendario de cumplimiento, donde está tomada del texto oficial.',
      },
    ],
  },
  {
    slug: 'dictamen',
    tituloSEO: 'Dictamen de auditoría: estructura, calificación y plazos',
    descripcionSEO:
      'Las secciones obligatorias del dictamen, la escala de cinco resultados, la proyección de multas en los hallazgos y el plazo de entrega.',
    respuestaDirecta:
      'El resultado de la auditoría se formaliza en un dictamen con estructura obligatoria y se presenta al órgano de gobierno o directamente a la persona física obligada. Las reglas fijan una escala de cinco resultados por obligación y exigen que los hallazgos incluyan plazos, responsables y una proyección económica de las multas en que se incurriría de no atenderlos.',
    aQuienAplica: [
      'Todo sujeto obligado, como consecuencia de la auditoría anual.',
      'Debe obtenerse, conservarse y proporcionarse al SAT cuando lo requiera, junto con el soporte de la regularización de observaciones.',
    ],
    erroresComunes: [
      'Entregar un informe libre en lugar del dictamen con las secciones que exigen las reglas.',
      'Omitir el volumen de información y el muestreo, que es una sección obligatoria.',
      'No incluir la proyección económica de multas, que es lo que convierte el hallazgo en una decisión de negocio.',
      'Guardar el dictamen y no atender las acciones correctivas antes del siguiente periodo de revisión.',
    ],
    evidenciaEsperada: [
      'Dictamen firmado con todas sus secciones y la manifestación bajo protesta de decir verdad.',
      'Calificación por obligación conforme a la escala de cinco resultados.',
      'Plan de acciones correctivas con responsables y fechas, y evidencia de su cierre.',
      'Seguimiento documentado de los hallazgos del dictamen del año anterior.',
    ],
    faq: [
      {
        pregunta: '¿Cuál es el plazo para emitirlo?',
        respuesta:
          'Las reglas fijan su emisión dentro de los primeros meses siguientes al cierre del año auditado, con entrega al auditado a más tardar el último día hábil de marzo.',
      },
      {
        pregunta: '¿Debo enviarlo a la autoridad?',
        respuesta:
          'El Reglamento obliga a obtenerlo, conservarlo y proporcionarlo al SAT cuando lo requiera. No es un envío automático mensual, sino una obligación de tenerlo disponible.',
      },
      {
        pregunta: '¿Puedo corregir lo que el dictamen encuentre?',
        respuesta:
          'Sí. Las reglas admiten subsanar de manera espontánea los incumplimientos detectados, previo al inicio de la revisión del periodo siguiente o dentro de los plazos que señale el auditor.',
      },
    ],
  },
];

export const CONTENIDO_OBLIGACIONES: Record<string, ContenidoObligacion> = Object.fromEntries(
  CONTENIDOS.map((c) => [c.slug, c]),
);

export { CONTENIDOS as LISTA_CONTENIDO_OBLIGACIONES };
