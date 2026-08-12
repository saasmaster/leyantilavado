import type { PerfilProveedor } from '@leyantilavado/types';

/* ────────────────────────────────────────────────────────────────────────────
 * PERFILES DE DEMOSTRACIÓN
 *
 * Ninguna de estas fichas corresponde a un despacho, una empresa o una persona
 * real. Son perfiles construidos para que el directorio se pueda probar antes
 * de abrirse a registros reales: ejercitan las 10 categorías, los 5 niveles de
 * verificación, los 3 planes y todos los filtros.
 *
 * Los nombres son deliberadamente obvios ("Demostración", "Ejemplo",
 * "Ficticio") y los datos de contacto no existen. El flag `esDemo` lo hereda
 * toda la UI: la tarjeta, el perfil y el buscador lo muestran de forma visible.
 *
 * Cuando el directorio se abra a registros reales, este archivo se vacía y
 * `repositorioDirectorio` deja de concatenarlo.
 * ────────────────────────────────────────────────────────────────────────── */

export interface PerfilDemo extends PerfilProveedor {
  readonly esDemo: true;
}

const REVISADO = '2026-08-11';

export const PERFILES_DEMO: readonly PerfilDemo[] = [
  {
    esDemo: true,
    id: 'demo-01',
    slug: 'despacho-demostracion-norte',
    nombre: 'Despacho Demostración Norte',
    categorias: ['despachos-multidisciplinarios', 'consultores-pld', 'abogados'],
    actividadesAtendidas: [
      'inmuebles-construccion-intermediacion',
      'desarrollo-inmobiliario',
      'vehiculos',
      'metales-joyeria',
      'prestamos-creditos',
    ],
    biografia:
      'Perfil de demostración. Representa a un despacho integral que combina el área contable, la jurídica y la de cumplimiento bajo un mismo equipo, orientado a empresas medianas y grandes del noreste con operaciones inmobiliarias y automotrices.',
    servicios: [
      'alta-padron',
      'manual-politicas',
      'evaluacion-riesgos',
      'expedientes',
      'envio-avisos',
      'capacitacion',
      'defensa',
      'beneficiario-controlador',
    ],
    industrias: ['Inmobiliario', 'Automotriz', 'Manufactura', 'Joyería'],
    ubicaciones: [
      {
        estado: 'Nuevo León',
        ciudad: 'Monterrey',
        coberturaNacional: true,
        atencionRemota: true,
        atencionPresencial: true,
      },
    ],
    idiomas: ['Español', 'Inglés'],
    aniosExperiencia: 18,
    tamanosCliente: ['mediana', 'grande'],
    sitioWeb: undefined,
    credenciales: [
      {
        id: 'demo-01-c1',
        tipo: 'certificacion_uif',
        nombre: 'Certificación de auditor en materia PLD (dato de demostración)',
        emisor: 'Autoridad certificadora (ejemplo)',
        vigenteHasta: '2028-12-31',
        revisadoEn: REVISADO,
      },
      {
        id: 'demo-01-c2',
        tipo: 'cedula_profesional',
        nombre: 'Cédula profesional de contador público (dato de demostración)',
        emisor: 'Dirección General de Profesiones (ejemplo)',
        revisadoEn: REVISADO,
      },
    ],
    verificacion: 'certificacion_externa_revisada',
    plan: 'destacado',
    patrocinado: true,
    aceptaNuevosClientes: true,
    publicado: true,
    creadoEn: '2026-07-01',
    actualizadoEn: REVISADO,
  },

  {
    esDemo: true,
    id: 'demo-02',
    slug: 'consultoria-ejemplo-pld',
    nombre: 'Consultoría Ejemplo PLD',
    categorias: ['consultores-pld'],
    actividadesAtendidas: [
      'activos-virtuales',
      'servicios-profesionales',
      'donativos',
      'arrendamiento-inmuebles',
    ],
    biografia:
      'Perfil de demostración. Representa a una consultoría pequeña, totalmente remota, especializada en montar el programa de cumplimiento desde cero: metodología de riesgos, manual, expedientes y calendario de obligaciones.',
    servicios: [
      'manual-politicas',
      'evaluacion-riesgos',
      'expedientes',
      'alta-padron',
      'capacitacion',
    ],
    industrias: ['Activos virtuales', 'Servicios profesionales', 'Tercer sector'],
    ubicaciones: [
      {
        estado: 'Ciudad de México',
        ciudad: 'Ciudad de México',
        coberturaNacional: true,
        atencionRemota: true,
        atencionPresencial: false,
      },
    ],
    idiomas: ['Español', 'Inglés'],
    aniosExperiencia: 11,
    tamanosCliente: ['micro', 'pequena', 'mediana'],
    credenciales: [
      {
        id: 'demo-02-c1',
        tipo: 'titulo',
        nombre: 'Título en derecho (dato de demostración)',
        emisor: 'Universidad de ejemplo',
        revisadoEn: REVISADO,
      },
    ],
    verificacion: 'documentacion_revisada',
    plan: 'profesional',
    patrocinado: false,
    aceptaNuevosClientes: true,
    publicado: true,
    creadoEn: '2026-07-03',
    actualizadoEn: REVISADO,
  },

  {
    esDemo: true,
    id: 'demo-03',
    slug: 'contadores-de-muestra-bajio',
    nombre: 'Contadores de Muestra del Bajío',
    categorias: ['contadores'],
    actividadesAtendidas: [
      'arrendamiento-inmuebles',
      'metales-joyeria',
      'vehiculos',
      'prestamos-creditos',
    ],
    biografia:
      'Perfil de demostración. Representa a un despacho contable local que atiende principalmente a personas físicas con actividad empresarial y a negocios familiares, con trato presencial y operación mensual de avisos.',
    servicios: ['alta-padron', 'expedientes', 'envio-avisos'],
    industrias: ['Comercio local', 'Arrendamiento', 'Joyería'],
    ubicaciones: [
      {
        estado: 'Guanajuato',
        ciudad: 'León',
        coberturaNacional: false,
        atencionRemota: false,
        atencionPresencial: true,
      },
    ],
    idiomas: ['Español'],
    aniosExperiencia: 7,
    tamanosCliente: ['micro', 'pequena'],
    credenciales: [
      {
        id: 'demo-03-c1',
        tipo: 'cedula_profesional',
        nombre: 'Cédula profesional de contador público (dato de demostración)',
        emisor: 'Dirección General de Profesiones (ejemplo)',
        revisadoEn: REVISADO,
      },
    ],
    verificacion: 'identidad_verificada',
    plan: 'gratuito',
    patrocinado: false,
    aceptaNuevosClientes: true,
    publicado: true,
    creadoEn: '2026-07-05',
    actualizadoEn: REVISADO,
  },

  {
    esDemo: true,
    id: 'demo-04',
    slug: 'bufete-ficticio-costa',
    nombre: 'Bufete Ficticio Costa',
    categorias: ['abogados'],
    actividadesAtendidas: [
      'inmuebles-construccion-intermediacion',
      'desarrollo-inmobiliario',
      'juegos-sorteos',
      'fe-publica-notarios',
    ],
    biografia:
      'Perfil de demostración. Representa a un bufete litigante enfocado en defensa ante requerimientos y procedimientos sancionadores, con clientela de desarrollo inmobiliario turístico y operación en inglés.',
    servicios: ['defensa', 'manual-politicas', 'beneficiario-controlador'],
    industrias: ['Inmobiliario turístico', 'Hotelería', 'Juegos y sorteos'],
    ubicaciones: [
      {
        estado: 'Quintana Roo',
        ciudad: 'Cancún',
        coberturaNacional: false,
        atencionRemota: true,
        atencionPresencial: true,
      },
      {
        estado: 'Yucatán',
        ciudad: 'Mérida',
        coberturaNacional: false,
        atencionRemota: true,
        atencionPresencial: true,
      },
    ],
    idiomas: ['Español', 'Inglés', 'Francés'],
    aniosExperiencia: 14,
    tamanosCliente: ['pequena', 'mediana', 'grande'],
    credenciales: [
      {
        id: 'demo-04-c1',
        tipo: 'cedula_profesional',
        nombre: 'Cédula profesional de licenciado en derecho (dato de demostración)',
        emisor: 'Dirección General de Profesiones (ejemplo)',
        revisadoEn: REVISADO,
      },
    ],
    verificacion: 'identidad_verificada',
    plan: 'profesional',
    patrocinado: true,
    aceptaNuevosClientes: true,
    publicado: true,
    creadoEn: '2026-07-06',
    actualizadoEn: REVISADO,
  },

  {
    esDemo: true,
    id: 'demo-05',
    slug: 'auditoria-demostrativa-independiente',
    nombre: 'Auditoría Demostrativa Independiente',
    categorias: ['auditores-externos'],
    actividadesAtendidas: [
      'inmuebles-construccion-intermediacion',
      'vehiculos',
      'traslado-custodia-valores',
      'comercio-exterior',
    ],
    biografia:
      'Perfil de demostración. Representa a una firma dedicada exclusivamente a la revisión independiente: no implanta programas de cumplimiento para no comprometer su independencia como auditor.',
    servicios: ['auditoria'],
    industrias: ['Inmobiliario', 'Automotriz', 'Logística', 'Comercio exterior'],
    ubicaciones: [
      {
        estado: 'Jalisco',
        ciudad: 'Guadalajara',
        coberturaNacional: true,
        atencionRemota: true,
        atencionPresencial: true,
      },
    ],
    idiomas: ['Español'],
    aniosExperiencia: 9,
    tamanosCliente: ['mediana', 'grande'],
    credenciales: [
      {
        id: 'demo-05-c1',
        tipo: 'certificacion_uif',
        nombre: 'Certificación de auditor en materia PLD (dato de demostración)',
        emisor: 'Autoridad certificadora (ejemplo)',
        vigenteHasta: '2027-06-30',
        revisadoEn: REVISADO,
      },
    ],
    verificacion: 'certificacion_externa_revisada',
    plan: 'profesional',
    patrocinado: false,
    // Ejercita el filtro de disponibilidad: hay perfiles con agenda cerrada.
    aceptaNuevosClientes: false,
    publicado: true,
    creadoEn: '2026-07-08',
    actualizadoEn: REVISADO,
  },

  {
    esDemo: true,
    id: 'demo-06',
    slug: 'control-interno-ejemplo',
    nombre: 'Control Interno Ejemplo',
    categorias: ['auditores-internos'],
    actividadesAtendidas: ['donativos', 'arrendamiento-inmuebles', 'servicios-profesionales'],
    biografia:
      'Perfil de demostración. Representa a un equipo que presta la función de auditoría interna por horas a empresas que no tienen un área propia de control.',
    servicios: ['auditoria', 'expedientes'],
    industrias: ['Tercer sector', 'Arrendamiento', 'Servicios'],
    ubicaciones: [
      {
        estado: 'Puebla',
        ciudad: 'Puebla',
        coberturaNacional: false,
        atencionRemota: true,
        atencionPresencial: false,
      },
    ],
    idiomas: ['Español'],
    aniosExperiencia: 5,
    tamanosCliente: ['micro', 'pequena'],
    credenciales: [],
    verificacion: 'correo_verificado',
    plan: 'gratuito',
    patrocinado: false,
    aceptaNuevosClientes: true,
    publicado: true,
    creadoEn: '2026-07-09',
    actualizadoEn: REVISADO,
  },

  {
    esDemo: true,
    id: 'demo-07',
    slug: 'aula-demostracion-cumplimiento',
    nombre: 'Aula Demostración Cumplimiento',
    categorias: ['capacitadores'],
    actividadesAtendidas: [
      'metales-joyeria',
      'vehiculos',
      'inmuebles-construccion-intermediacion',
      'juegos-sorteos',
      'donativos',
    ],
    biografia:
      'Perfil de demostración. Representa a un proveedor de capacitación que imparte el programa anual por área —mostrador, contabilidad y dirección— y entrega constancias individuales con evaluación.',
    servicios: ['capacitacion'],
    industrias: ['Retail', 'Automotriz', 'Inmobiliario', 'Casinos'],
    ubicaciones: [
      {
        estado: 'Ciudad de México',
        ciudad: 'Ciudad de México',
        coberturaNacional: true,
        atencionRemota: true,
        atencionPresencial: true,
      },
    ],
    idiomas: ['Español', 'Inglés', 'Lengua de señas mexicana'],
    aniosExperiencia: 6,
    tamanosCliente: ['micro', 'pequena', 'mediana', 'grande'],
    credenciales: [
      {
        id: 'demo-07-c1',
        tipo: 'otro',
        nombre: 'Registro como agente capacitador (dato de demostración)',
        emisor: 'Autoridad laboral (ejemplo)',
        revisadoEn: REVISADO,
      },
    ],
    verificacion: 'documentacion_revisada',
    plan: 'profesional',
    patrocinado: false,
    aceptaNuevosClientes: true,
    publicado: true,
    creadoEn: '2026-07-10',
    actualizadoEn: REVISADO,
  },

  {
    esDemo: true,
    id: 'demo-08',
    slug: 'identifika-ejemplo',
    nombre: 'Identifika Ejemplo (proveedor ficticio)',
    categorias: ['proveedores-kyc'],
    actividadesAtendidas: [
      'activos-virtuales',
      'prestamos-creditos',
      'tarjetas-prepagadas',
      'vales-cupones-monederos',
    ],
    biografia:
      'Perfil de demostración. Representa a un proveedor de identificación de clientes con validación de identificación oficial, cotejo biométrico y expediente digital exportable.',
    servicios: ['expedientes', 'implementacion-software'],
    industrias: ['Fintech', 'Activos virtuales', 'Crédito'],
    ubicaciones: [
      {
        estado: 'Ciudad de México',
        coberturaNacional: true,
        atencionRemota: true,
        atencionPresencial: false,
      },
    ],
    idiomas: ['Español', 'Inglés', 'Portugués'],
    aniosExperiencia: 4,
    tamanosCliente: ['pequena', 'mediana', 'grande'],
    credenciales: [],
    verificacion: 'identidad_verificada',
    plan: 'destacado',
    patrocinado: true,
    aceptaNuevosClientes: true,
    publicado: true,
    creadoEn: '2026-07-12',
    actualizadoEn: REVISADO,
  },

  {
    esDemo: true,
    id: 'demo-09',
    slug: 'listas-demo-mexico',
    nombre: 'Listas Demo México',
    categorias: ['consulta-pep-listas'],
    actividadesAtendidas: ['activos-virtuales', 'donativos', 'juegos-sorteos', 'prestamos-creditos'],
    biografia:
      'Perfil de demostración. Representa a un servicio de consulta de personas políticamente expuestas y listas restrictivas que entrega constancia descargable de cada consulta, incluidas las que no arrojan coincidencias.',
    servicios: ['expedientes'],
    industrias: ['Fintech', 'Tercer sector', 'Juegos y sorteos'],
    ubicaciones: [
      {
        estado: 'Nuevo León',
        coberturaNacional: true,
        atencionRemota: true,
        atencionPresencial: false,
      },
    ],
    idiomas: ['Español', 'Inglés'],
    aniosExperiencia: 3,
    tamanosCliente: ['micro', 'pequena', 'mediana'],
    credenciales: [],
    // Ejercita el nivel más bajo: un perfil recién creado, sin comprobación.
    verificacion: 'sin_verificar',
    plan: 'gratuito',
    patrocinado: false,
    aceptaNuevosClientes: true,
    publicado: true,
    creadoEn: '2026-08-01',
    actualizadoEn: REVISADO,
  },

  {
    esDemo: true,
    id: 'demo-10',
    slug: 'plataforma-ejemplo-cumplimiento',
    nombre: 'Plataforma Ejemplo Cumplimiento',
    categorias: ['software-cumplimiento'],
    actividadesAtendidas: [
      'inmuebles-construccion-intermediacion',
      'vehiculos',
      'metales-joyeria',
      'arrendamiento-inmuebles',
      'comercio-exterior',
      'fe-publica-notarios',
    ],
    biografia:
      'Perfil de demostración. Representa a una plataforma que concentra clientes, operaciones, alertas por acumulación y generación del archivo de aviso, con bitácora de usuario y exportación completa de datos.',
    servicios: ['implementacion-software', 'envio-avisos', 'evaluacion-riesgos'],
    industrias: ['Inmobiliario', 'Automotriz', 'Notarías', 'Comercio exterior'],
    ubicaciones: [
      {
        estado: 'Jalisco',
        coberturaNacional: true,
        atencionRemota: true,
        atencionPresencial: false,
      },
    ],
    idiomas: ['Español', 'Inglés'],
    aniosExperiencia: 8,
    tamanosCliente: ['pequena', 'mediana', 'grande'],
    credenciales: [],
    verificacion: 'correo_verificado',
    plan: 'profesional',
    patrocinado: false,
    aceptaNuevosClientes: true,
    publicado: true,
    creadoEn: '2026-07-15',
    actualizadoEn: REVISADO,
  },

  {
    esDemo: true,
    id: 'demo-11',
    slug: 'contaduria-ficticia-sureste',
    nombre: 'Contaduría Ficticia del Sureste',
    categorias: ['contadores', 'capacitadores'],
    actividadesAtendidas: [
      'arrendamiento-inmuebles',
      'donativos',
      'servicios-profesionales',
      'obras-arte',
    ],
    biografia:
      'Perfil de demostración. Representa a una contadora con práctica individual que atiende arrendadores, asociaciones civiles y galerías, con acompañamiento presencial y capacitación básica al personal del cliente.',
    servicios: ['alta-padron', 'expedientes', 'envio-avisos', 'capacitacion'],
    industrias: ['Arrendamiento', 'Tercer sector', 'Arte y galerías'],
    ubicaciones: [
      {
        estado: 'Yucatán',
        ciudad: 'Mérida',
        coberturaNacional: false,
        atencionRemota: false,
        atencionPresencial: true,
      },
    ],
    idiomas: ['Español'],
    aniosExperiencia: 12,
    tamanosCliente: ['micro', 'pequena'],
    credenciales: [],
    verificacion: 'sin_verificar',
    plan: 'gratuito',
    patrocinado: false,
    aceptaNuevosClientes: true,
    publicado: true,
    creadoEn: '2026-08-04',
    actualizadoEn: REVISADO,
  },
];

/** ¿Este perfil viene del conjunto de demostración? */
export function esPerfilDemo(perfil: PerfilProveedor): boolean {
  return (perfil as PerfilDemo).esDemo === true;
}
