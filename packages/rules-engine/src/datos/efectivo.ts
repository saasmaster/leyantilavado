import type { Procedencia, ReglaEfectivo } from '@leyantilavado/types';
import { SIN_CAMBIOS_DESDE, ULTIMA_REVISION } from './revision';

const P: Procedencia = {
  fuentes: ['lfpiorpi-vigente', 'sat-umbrales'],
  disposicion: 'Art. 32 LFPIORPI',
  verificacion: 'oficial_verificado',
  ultimaRevision: ULTIMA_REVISION,
  ultimaModificacion: SIN_CAMBIOS_DESDE,
  notaEditorial:
    'Contrastado contra el art. 32 de la LFPIORPI vigente y la tabla del SAT. Los montos se miden al día en que se realiza el pago o se cumple la obligación.',
};

/**
 * Restricciones al uso de efectivo y metales preciosos (art. 32 LFPIORPI).
 *
 * Esto NO es un umbral de aviso: es una PROHIBICIÓN. Rebasar el límite es
 * infracción del art. 53 fracción VII aunque se hayan presentado todos los
 * avisos en tiempo y forma.
 *
 * Diferencia que casi nadie implementa: para el art. 32 la base de comparación
 * incluye el IVA, mientras que los umbrales de aviso del art. 17 se miden sin
 * IVA. El motor recibe ambas bases por separado.
 */
export const REGLAS_EFECTIVO: readonly ReglaEfectivo[] = [
  {
    id: 'efectivo-inmuebles',
    slug: 'inmuebles',
    nombre: 'Constitución o transmisión de derechos reales sobre inmuebles',
    descripcion:
      'Compraventa de inmuebles y demás actos que constituyen o transmiten derechos reales sobre ellos.',
    actividades: [
      'inmuebles-construccion-intermediacion',
      'desarrollo-inmobiliario',
      'fe-publica-notarios',
    ],
    limiteUMA: 8025,
    periodicidad: 'operacion',
    vigencia: { desde: '2025-07-17', hasta: null },
    procedencia: P,
    estado: 'publicado',
  },
  {
    id: 'efectivo-vehiculos',
    slug: 'vehiculos',
    nombre: 'Vehículos nuevos o usados: terrestres, marítimos y aéreos',
    descripcion:
      'Transmisión de propiedad o constitución de derechos reales sobre vehículos de cualquier tipo, nuevos o usados.',
    actividades: ['vehiculos'],
    limiteUMA: 3210,
    periodicidad: 'operacion',
    vigencia: { desde: '2025-07-17', hasta: null },
    procedencia: P,
    estado: 'publicado',
  },
  {
    id: 'efectivo-relojes-joyeria-arte',
    slug: 'relojes-joyeria-arte',
    nombre: 'Relojes, joyería, metales, piedras preciosas y obras de arte',
    descripcion:
      'Transmisión de propiedad de relojes, joyería, metales preciosos y piedras preciosas, así como de obras de arte. El límite aplica por pieza o por lote.',
    actividades: ['metales-joyeria', 'obras-arte'],
    limiteUMA: 3210,
    periodicidad: 'operacion',
    vigencia: { desde: '2025-07-17', hasta: null },
    procedencia: P,
    estado: 'publicado',
  },
  {
    id: 'efectivo-juegos-apuesta',
    slug: 'juegos-apuesta',
    nombre: 'Boletos de juegos con apuesta y pago de premios',
    descripcion:
      'Adquisición de boletos para participar en juegos con apuesta, concursos o sorteos, así como la entrega o pago de los premios.',
    actividades: ['juegos-sorteos'],
    limiteUMA: 3210,
    periodicidad: 'operacion',
    vigencia: { desde: '2025-07-17', hasta: null },
    procedencia: P,
    estado: 'publicado',
  },
  {
    id: 'efectivo-blindaje',
    slug: 'blindaje',
    nombre: 'Servicios de blindaje',
    descripcion:
      'Prestación de servicios de blindaje para vehículos o para bienes inmuebles.',
    actividades: ['blindaje'],
    limiteUMA: 3210,
    periodicidad: 'operacion',
    vigencia: { desde: '2025-07-17', hasta: null },
    procedencia: P,
    estado: 'publicado',
  },
  {
    id: 'efectivo-acciones-partes-sociales',
    slug: 'acciones-partes-sociales',
    nombre: 'Acciones y partes sociales',
    descripcion:
      'Transmisión de dominio o constitución de derechos sobre títulos representativos de partes sociales o acciones de personas morales.',
    actividades: ['fe-publica-notarios', 'fe-publica-corredores', 'servicios-profesionales'],
    limiteUMA: 3210,
    periodicidad: 'operacion',
    vigencia: { desde: '2025-07-17', hasta: null },
    procedencia: P,
    estado: 'publicado',
  },
  {
    id: 'efectivo-arrendamiento',
    slug: 'arrendamiento',
    nombre: 'Arrendamiento de inmuebles, vehículos y bienes blindados',
    descripcion:
      'Constitución de derechos personales de uso o goce sobre inmuebles, vehículos y bienes blindados. El límite se mide de forma mensual.',
    actividades: ['arrendamiento-inmuebles'],
    limiteUMA: 3210,
    periodicidad: 'mensual',
    vigencia: { desde: '2025-07-17', hasta: null },
    procedencia: P,
    estado: 'publicado',
  },
  {
    id: 'efectivo-consignacion-pago',
    slug: 'consignacion-pago',
    nombre: 'Consignación de pago',
    descripcion:
      'Consignación de pago relacionada con cualquiera de los actos u operaciones anteriores. Fracción adicionada por la reforma publicada el 16 de julio de 2025.',
    actividades: [],
    limiteUMA: 3210,
    periodicidad: 'operacion',
    discrepanciaOficial: {
      descripcion:
        'Dos fuentes oficiales publican reglas distintas para este supuesto. Mientras la autoridad no lo aclare, la herramienta muestra ambas y no calcula un resultado definitivo.',
      segunSAT: 'La tabla del SAT publica un límite fijo de 3,210 UMA.',
      segunLey:
        'El texto de la ley remite al umbral de la fracción con la que se relaciona la consignación: 8,025 UMA si es sobre inmuebles y 3,210 UMA en los demás casos.',
    },
    vigencia: { desde: '2025-07-17', hasta: null },
    procedencia: {
      ...P,
      verificacion: 'no_verificado',
      notaEditorial:
        'Existe una contradicción entre la tabla del SAT y el texto de la ley. Requiere revisión editorial antes de publicarse como regla firme.',
    },
    estado: 'borrador',
  },
];

export const REGLAS_EFECTIVO_POR_SLUG = Object.fromEntries(
  REGLAS_EFECTIVO.map((r) => [r.slug, r]),
);

export const REGLAS_EFECTIVO_PUBLICADAS = REGLAS_EFECTIVO.filter((r) => r.estado === 'publicado');
