import { ULTIMA_MODIFICACION, ULTIMA_REVISION } from './revision';
import type {
  ActividadSlug,
  EspecificacionUmbral,
  Periodicidad,
  Procedencia,
  ReglaAcumulacion,
  ReglaUmbral,
} from '@leyantilavado/types';

const P = (disposicion: string, nota?: string): Procedencia => ({
  fuentes: ['lfpiorpi-vigente', 'sat-umbrales'],
  disposicion,
  verificacion: 'oficial_verificado',
  ultimaRevision: ULTIMA_REVISION,
  ultimaModificacion: ULTIMA_MODIFICACION,
  notaEditorial:
    nota ??
    'Contrastado contra la tabla oficial de umbrales del SAT y el texto vigente de la LFPIORPI (última reforma DOF 16-07-2025).',
});

const P_REVISAR = (disposicion: string, nota: string): Procedencia => ({
  fuentes: ['lfpiorpi-vigente'],
  disposicion,
  verificacion: 'no_verificado',
  ultimaRevision: ULTIMA_REVISION,
  ultimaModificacion: ULTIMA_MODIFICACION,
  notaEditorial: nota,
});

/**
 * Acumulación antifraccionamiento: el último párrafo del art. 17 manda sumar
 * las operaciones del mismo cliente por el mismo tipo de acto dentro de una
 * ventana de seis meses. Aplica a TODAS las fracciones, no sólo a algunas.
 */
const ACUM_6M: ReglaAcumulacion = {
  aplica: true,
  ventanaMeses: 6,
  agrupaPor: ['cliente', 'actividad'],
  nota: 'Regla antifraccionamiento del art. 17, último párrafo: se suman las operaciones del mismo cliente por el mismo tipo de acto realizadas en seis meses.',
};

const ACUM_6M_SUBTIPO: ReglaAcumulacion = {
  ...ACUM_6M,
  agrupaPor: ['cliente', 'actividad', 'subtipo'],
};

/** Para supuestos que generan aviso siempre: no hay nada que acumular. */
const SIN_ACUM: ReglaAcumulacion = {
  aplica: false,
  ventanaMeses: 0,
  agrupaPor: [],
  nota: 'El supuesto genera obligación con independencia del monto, por lo que la acumulación no cambia el resultado.',
};

// Los helpers devuelven el miembro CONCRETO de la unión, no la unión entera.
// Así `SupuestoVariable.umbral`, que prohíbe anidar otro 'variable', los acepta
// sin castings — el compilador verifica que no se anide, en vez de confiar.
type UmbralUMA = Extract<EspecificacionUmbral, { tipo: 'uma' }>;
type UmbralSiempre = Extract<EspecificacionUmbral, { tipo: 'siempre' }>;

const uma = (n: number, nota?: string): UmbralUMA =>
  nota ? { tipo: 'uma', uma: n, nota } : { tipo: 'uma', uma: n };

/** Umbral con comparación estricta: "superior a N", no "igual o superior a N". */
const umaEstricto = (n: number, nota: string): UmbralUMA => ({
  tipo: 'uma',
  uma: n,
  comparador: 'mayor',
  nota,
});

const siempre = (nota?: string): UmbralSiempre =>
  nota ? { tipo: 'siempre', nota } : { tipo: 'siempre' };

/** Aviso de servicios profesionales: depende del rol, no del monto. */
const AVISO_EN_REPRESENTACION: EspecificacionUmbral = {
  tipo: 'variable',
  nota: 'El aviso no tiene umbral monetario: procede cuando el profesional realiza la operación financiera en nombre y representación del cliente.',
  supuestos: [
    {
      clave: 'en-representacion',
      descripcion:
        'El profesional realiza, en nombre y representación del cliente, la operación financiera relacionada con el acto.',
      umbral: siempre('Procede el aviso, sin umbral monetario.'),
    },
    {
      clave: 'solo-asesoria',
      descripcion:
        'El profesional únicamente asesora, opina o prepara documentos, sin realizar la operación en nombre del cliente.',
      umbral: {
        tipo: 'nunca',
        nota: 'No procede el aviso por este supuesto, pero subsisten las obligaciones de identificar al cliente e integrar expediente.',
      },
    },
  ],
};

interface Def {
  actividad: ActividadSlug;
  subtipo?: string;
  identificacion: EspecificacionUmbral;
  aviso: EspecificacionUmbral;
  periodicidad?: Periodicidad;
  acumulacion?: ReglaAcumulacion;
  disposicion: string;
  nota?: string;
  revisar?: string;
}

const DEFINICIONES: Def[] = [
  // ── I. Juegos con apuesta, concursos y sorteos ──────────────────────────
  {
    actividad: 'juegos-sorteos',
    identificacion: uma(325),
    aviso: uma(645),
    disposicion: 'Art. 17, fracción I',
    nota: 'Aplica a la operación individual o a series de transacciones vinculadas entre sí en apariencia.',
  },

  // ── II. Tarjetas e instrumentos de valor almacenado ─────────────────────
  {
    actividad: 'tarjetas-credito-servicios',
    identificacion: uma(805, 'Medido sobre el gasto mensual acumulado en la cuenta de la tarjeta.'),
    aviso: uma(1285, 'Medido sobre el gasto mensual acumulado en la cuenta de la tarjeta.'),
    periodicidad: 'mensual',
    disposicion: 'Art. 17, fracción II, inciso a)',
  },
  {
    actividad: 'tarjetas-prepagadas',
    identificacion: uma(645),
    aviso: uma(645),
    disposicion: 'Art. 17, fracción II, inciso b)',
    nota: 'Se mide por operación de comercialización o abono de recursos. Los umbrales de identificación y aviso coinciden.',
  },
  {
    actividad: 'vales-cupones-monederos',
    identificacion: uma(645),
    aviso: uma(645),
    disposicion: 'Art. 17, fracción II, inciso c)',
    nota: 'Se mide por operación de emisión, comercialización o abono de recursos. Los umbrales coinciden.',
  },

  // ── III. Cheques de viajero ─────────────────────────────────────────────
  {
    actividad: 'cheques-viajero',
    identificacion: siempre('Se identifica a quien adquiere cheques de viajero sin importar el monto.'),
    aviso: uma(645),
    disposicion: 'Art. 17, fracción III',
  },

  // ── IV. Préstamos, créditos y mutuos ────────────────────────────────────
  {
    actividad: 'prestamos-creditos',
    identificacion: siempre('Toda operación de mutuo, préstamo, crédito o garantía exige identificar al cliente.'),
    aviso: uma(1605),
    disposicion: 'Art. 17, fracción IV',
  },

  // ── V y V Bis. Inmobiliario ─────────────────────────────────────────────
  {
    actividad: 'inmuebles-construccion-intermediacion',
    identificacion: siempre('La intermediación y el desarrollo inmobiliario exigen identificar siempre al cliente.'),
    aviso: uma(8025),
    disposicion: 'Art. 17, fracción V',
  },
  {
    actividad: 'desarrollo-inmobiliario',
    identificacion: siempre(),
    aviso: uma(8025),
    disposicion: 'Art. 17, fracción V Bis (adicionada DOF 16-07-2025)',
  },

  // ── VI a IX. Bienes ─────────────────────────────────────────────────────
  {
    actividad: 'metales-joyeria',
    identificacion: uma(805),
    aviso: uma(1605),
    disposicion: 'Art. 17, fracción VI',
    nota: 'Es objeto de aviso con independencia de la forma de pago. Se exceptúan las operaciones en que interviene el Banco de México.',
  },
  {
    actividad: 'obras-arte',
    identificacion: uma(2410),
    aviso: uma(4815),
    disposicion: 'Art. 17, fracción VII',
  },
  {
    actividad: 'vehiculos',
    identificacion: uma(3210),
    aviso: uma(6420),
    disposicion: 'Art. 17, fracción VIII',
    nota: 'Sólo constituye actividad vulnerable cuando la distribución o comercialización es habitual o profesional.',
  },
  {
    actividad: 'blindaje',
    identificacion: uma(2410),
    aviso: uma(4815),
    disposicion: 'Art. 17, fracción IX',
  },

  // ── X. Traslado y custodia de valores ───────────────────────────────────
  {
    actividad: 'traslado-custodia-valores',
    identificacion: siempre(),
    aviso: {
      tipo: 'variable',
      nota: 'Hay dos supuestos: uno con umbral y otro que obliga siempre cuando el monto no puede determinarse.',
      supuestos: [
        {
          clave: 'monto-determinable',
          descripcion: 'Es posible determinar el monto del dinero o de los valores trasladados o custodiados.',
          umbral: uma(3210),
        },
        {
          clave: 'monto-indeterminable',
          descripcion: 'No es posible determinar el monto del dinero o los valores.',
          umbral: siempre('Procede el aviso en todos los casos, sin importar el valor.'),
        },
      ],
    },
    disposicion: 'Art. 17, fracción X',
    nota: 'Se exceptúan el Banco de México y las instituciones de depósito de valores.',
  },

  // ── XI. Servicios profesionales independientes ──────────────────────────
  ...(
    [
      ['compraventa-inmuebles', 'a)'],
      ['administracion-recursos', 'b)'],
      ['cuentas-bancarias', 'c)'],
      ['aportaciones-capital', 'd)'],
      ['constitucion-personas-morales', 'e)'],
    ] as const
  ).map(
    ([subtipo, inciso]): Def => ({
      actividad: 'servicios-profesionales',
      subtipo,
      identificacion: siempre(
        'Se identifica al cliente siempre que se prepare o realice el acto, sin importar el monto.',
      ),
      aviso: AVISO_EN_REPRESENTACION,
      acumulacion: SIN_ACUM,
      disposicion: `Art. 17, fracción XI, inciso ${inciso}`,
      nota: 'La ley preserva el secreto profesional y la garantía de defensa del cliente.',
    }),
  ),

  // ── XII Apartado A. Notarios ────────────────────────────────────────────
  {
    actividad: 'fe-publica-notarios',
    subtipo: 'inmuebles',
    identificacion: siempre(),
    aviso: uma(
      8000,
      'La base es el valor más alto entre el precio pactado, el valor catastral, el valor comercial y el monto garantizado por suerte principal.',
    ),
    disposicion: 'Art. 17, fracción XII, Apartado A, inciso a)',
    nota: 'La reforma del 16-07-2025 bajó este umbral de 16,000 a 8,000 UMA. Se exceptúan las garantías a favor de instituciones del sistema financiero u organismos públicos de vivienda.',
  },
  {
    actividad: 'fe-publica-notarios',
    subtipo: 'poderes-irrevocables',
    identificacion: siempre(),
    aviso: siempre('Los poderes irrevocables para actos de administración o dominio son siempre objeto de aviso.'),
    acumulacion: SIN_ACUM,
    disposicion: 'Art. 17, fracción XII, Apartado A, inciso b)',
  },
  {
    actividad: 'fe-publica-notarios',
    subtipo: 'constitucion-personas-morales',
    identificacion: siempre(),
    aviso: siempre(
      'La constitución de personas morales, los cambios de capital, las fusiones, escisiones y la compraventa de acciones o partes sociales son siempre objeto de aviso.',
    ),
    acumulacion: SIN_ACUM,
    disposicion: 'Art. 17, fracción XII, Apartado A, inciso c)',
    nota: 'La reforma del 16-07-2025 eliminó el umbral de 8,000 UMA que existía: ahora el aviso procede siempre.',
  },
  {
    actividad: 'fe-publica-notarios',
    subtipo: 'fideicomisos',
    identificacion: siempre(),
    aviso: uma(4000),
    disposicion: 'Art. 17, fracción XII, Apartado A, inciso d)',
    nota: 'La reforma del 16-07-2025 bajó este umbral de 8,000 a 4,000 UMA. Se exceptúan los fideicomisos constituidos para garantizar crédito a favor del sistema financiero u organismos públicos de vivienda.',
  },
  {
    actividad: 'fe-publica-notarios',
    subtipo: 'mutuo-credito',
    identificacion: siempre(),
    aviso: siempre('Los mutuos y créditos otorgados ante notario son siempre objeto de aviso.'),
    acumulacion: SIN_ACUM,
    disposicion: 'Art. 17, fracción XII, Apartado A, inciso e)',
    nota: 'Aplica cuando el acreedor no forma parte del sistema financiero ni es organismo público de vivienda.',
  },

  // ── XII Apartado B. Corredores públicos ─────────────────────────────────
  {
    actividad: 'fe-publica-corredores',
    subtipo: 'avaluos',
    identificacion: uma(8025),
    aviso: uma(8025),
    disposicion: 'Art. 17, fracción XII, Apartado B, inciso a)',
  },
  {
    actividad: 'fe-publica-corredores',
    subtipo: 'constitucion-sociedades',
    identificacion: siempre(),
    aviso: siempre(),
    acumulacion: SIN_ACUM,
    disposicion: 'Art. 17, fracción XII, Apartado B, inciso b)',
  },
  {
    actividad: 'fe-publica-corredores',
    subtipo: 'fideicomisos',
    identificacion: siempre(),
    aviso: siempre(),
    acumulacion: SIN_ACUM,
    disposicion: 'Art. 17, fracción XII, Apartado B, inciso c)',
    nota: 'Se exceptúan los constituidos para garantizar crédito a favor de instituciones del sistema financiero.',
  },
  {
    actividad: 'fe-publica-corredores',
    subtipo: 'mutuo-mercantil',
    identificacion: siempre(),
    aviso: siempre(),
    acumulacion: SIN_ACUM,
    disposicion: 'Art. 17, fracción XII, Apartado B, inciso d)',
    nota: 'Aplica cuando el acreedor no forma parte del sistema financiero.',
  },

  // ── XII Apartados C y D. Sin umbral publicado ───────────────────────────
  {
    actividad: 'fe-publica-servidores-publicos',
    identificacion: { tipo: 'requiere_revision', nota: 'Sin umbral publicado por la autoridad.' },
    aviso: { tipo: 'requiere_revision', nota: 'Sin umbral publicado por la autoridad.' },
    acumulacion: SIN_ACUM,
    disposicion: 'Art. 17, fracción XII, Apartado C',
    revisar:
      'La ley enuncia el apartado sin fijar umbrales y la tabla oficial de umbrales del SAT no lo incluye. No debe publicarse una cifra sin confirmación de la autoridad.',
  },
  {
    actividad: 'personas-facilitadoras',
    identificacion: { tipo: 'requiere_revision', nota: 'Sin umbral publicado por la autoridad.' },
    aviso: { tipo: 'requiere_revision', nota: 'Sin umbral publicado por la autoridad.' },
    acumulacion: SIN_ACUM,
    disposicion: 'Art. 17, fracción XII, Apartado D (adicionado DOF 16-07-2025)',
    revisar:
      'Apartado nuevo que remite a los supuestos del Apartado A "en los términos que se señalan". No aparece en la tabla del SAT. Requiere revisión editorial antes de publicar umbrales.',
  },

  // ── XIII. Donativos ─────────────────────────────────────────────────────
  {
    actividad: 'donativos',
    identificacion: uma(1605),
    aviso: uma(3210),
    disposicion: 'Art. 17, fracción XIII',
  },

  // ── XIV. Comercio exterior ──────────────────────────────────────────────
  ...(
    [
      ['vehiculos', 'a)', 'Vehículos terrestres, aéreos y marítimos, nuevos y usados.'],
      ['maquinas-juegos', 'b)', 'Máquinas para juegos de apuesta y sorteos, nuevas y usadas.'],
      ['equipos-tarjetas-pago', 'c)', 'Equipos y materiales para la elaboración de tarjetas de pago.'],
      ['material-balistico', 'f)', 'Materiales de resistencia balística para blindaje de vehículos.'],
    ] as const
  ).map(
    ([subtipo, inciso, desc]): Def => ({
      actividad: 'comercio-exterior',
      subtipo,
      identificacion: siempre(),
      aviso: siempre(`${desc} Genera aviso cualquiera que sea el valor de los bienes.`),
      acumulacion: SIN_ACUM,
      disposicion: `Art. 17, fracción XIV, inciso ${inciso}`,
    }),
  ),
  {
    actividad: 'comercio-exterior',
    subtipo: 'joyas-metales',
    identificacion: uma(485, 'El umbral se mide por el valor individual del bien, no por el pedimento completo.'),
    aviso: uma(485, 'El umbral se mide por el valor individual del bien, no por el pedimento completo.'),
    disposicion: 'Art. 17, fracción XIV, inciso d)',
  },
  {
    actividad: 'comercio-exterior',
    subtipo: 'obras-arte',
    identificacion: uma(4815, 'El umbral se mide por el valor individual del bien.'),
    aviso: uma(4815, 'El umbral se mide por el valor individual del bien.'),
    disposicion: 'Art. 17, fracción XIV, inciso e)',
  },

  // ── XV. Arrendamiento ───────────────────────────────────────────────────
  {
    actividad: 'arrendamiento-inmuebles',
    identificacion: umaEstricto(
      1605,
      'La ley dice "superior a": una renta mensual de exactamente 1,605 UMA no alcanza el umbral de identificación.',
    ),
    aviso: uma(
      3210,
      'La ley dice "igual o superior a": una renta mensual de exactamente 3,210 UMA sí alcanza el umbral de aviso.',
    ),
    periodicidad: 'mensual',
    disposicion: 'Art. 17, fracción XV',
    nota: 'El valor se mide de forma mensual, al día en que se realiza el pago o se cumple la obligación.',
  },

  // ── XVI. Activos virtuales ──────────────────────────────────────────────
  {
    actividad: 'activos-virtuales',
    identificacion: siempre('Toda operación de intercambio de activos virtuales exige identificar al cliente.'),
    aviso: {
      tipo: 'monto_o_comision',
      umaMonto: 210,
      umaComision: 4,
      nota: 'Hay dos disparadores independientes: el monto de la operación por cliente (210 UMA) y la contraprestación cobrada por el servicio (4 UMA). Basta con que uno se alcance.',
    },
    disposicion: 'Art. 17, fracción XVI, incisos a) y b)',
    nota: 'Alcanza también operaciones realizadas con ciudadanos mexicanos desde otra jurisdicción.',
  },
];

/**
 * Reglas de umbral con vigencia.
 *
 * Todas arrancan el 17 de julio de 2025, fecha de entrada en vigor de la
 * reforma publicada el día anterior.
 *
 * Cuando un umbral cambie, NO se edita la fila: se cierra su `vigencia.hasta`
 * y se agrega otra con `desde` en la nueva fecha. El histórico jamás se
 * sobreescribe, porque una operación de 2024 debe seguir midiéndose con la
 * regla de 2024.
 */
export const UMBRALES: readonly ReglaUmbral[] = DEFINICIONES.map((d) => ({
  id: d.subtipo ? `${d.actividad}--${d.subtipo}` : d.actividad,
  actividad: d.actividad,
  ...(d.subtipo ? { subtipo: d.subtipo } : {}),
  identificacion: d.identificacion,
  aviso: d.aviso,
  periodicidad: d.periodicidad ?? 'operacion',
  acumulacion: d.acumulacion ?? (d.subtipo ? ACUM_6M_SUBTIPO : ACUM_6M),
  vigencia: { desde: '2025-07-17', hasta: null },
  procedencia: d.revisar ? P_REVISAR(d.disposicion, d.revisar) : P(d.disposicion, d.nota),
  estado: (d.revisar ? 'borrador' : 'publicado') as ReglaUmbral['estado'],
}));

export const UMBRALES_POR_ACTIVIDAD = UMBRALES.reduce<Record<string, ReglaUmbral[]>>((acc, r) => {
  (acc[r.actividad] ??= []).push(r);
  return acc;
}, {});

/** Sólo lo que puede mostrarse en el sitio público. */
export const UMBRALES_PUBLICADOS = UMBRALES.filter((u) => u.estado === 'publicado');
