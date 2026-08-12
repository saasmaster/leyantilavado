import { VERSION_LEGAL, datos } from '@leyantilavado/rules-engine';
import { PLANTILLA_POR_ARCHIVO, PLANTILLAS } from '@/content/plantillas';

/**
 * Generación de las plantillas descargables.
 *
 * Se construyen aquí, en la petición, a partir del corpus legal. Guardarlas
 * como archivos estáticos en `public/` habría sido más simple y habría creado
 * el problema que esta página existe para evitar: una plantilla que cita un
 * artículo derogado y que nadie vuelve a mirar.
 *
 * El CSV lleva BOM. Sin él, Excel en Windows abre el archivo en la
 * codificación del sistema y convierte cada acento en basura —«identificación»
 * sale como «identificaciÃ³n»—, que es exactamente la primera impresión que no
 * debe dar un documento de cumplimiento.
 */

export const dynamic = 'force-static';

export function generateStaticParams() {
  return PLANTILLAS.map((p) => ({ archivo: p.archivo }));
}

const BOM = '﻿';

/** Escapa un campo de CSV según RFC 4180. */
function campo(valor: string | number): string {
  const t = String(valor);
  return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
}

const csv = (filas: readonly (readonly (string | number)[])[]): string =>
  BOM + filas.map((f) => f.map(campo).join(',')).join('\r\n') + '\r\n';

/** Encabezado común: de dónde salió el archivo y contra qué versión. */
const procedencia = (titulo: string) => [
  [`# ${titulo}`],
  [`# Generado por LeyAntilavado.org contra la versión ${VERSION_LEGAL} del corpus legal`],
  ['# Esta plantilla no sustituye asesoría profesional. Adáptala a tu operación antes de usarla.'],
  [''],
];

function controlDeCumplimiento(): string {
  const filas: (string | number)[][] = [
    ...procedencia('Control de cumplimiento LFPIORPI'),
    [
      'Obligación',
      'Categoría',
      'Paso',
      'Evidencia a conservar',
      'Fundamento',
      'Responsable',
      'Fecha de cumplimiento',
      'Ubicación del soporte',
      'Estado',
    ],
  ];
  for (const o of datos.OBLIGACIONES) {
    for (const p of o.pasos) {
      filas.push([
        o.titulo,
        o.categoria,
        p.texto,
        p.evidencia ?? 'Sin evidencia específica señalada',
        o.procedencia.disposicion,
        '',
        '',
        '',
        'Pendiente',
      ]);
    }
  }
  return csv(filas);
}

function expedienteDeIdentificacion(): string {
  const relevantes = datos.OBLIGACIONES.filter(
    (o) => o.categoria === 'identificacion' || o.categoria === 'expediente',
  );
  const filas: (string | number)[][] = [
    ...procedencia('Expediente único de identificación'),
    ['Cliente', '', '', ''],
    ['Fecha de alta', '', '', ''],
    ['Tipo de persona (física / moral / fideicomiso)', '', '', ''],
    ['Nivel de riesgo asignado', '', '', ''],
    [''],
    ['Requisito', 'Fundamento', 'Documento recabado', 'Fecha', 'Vigencia', 'Observaciones'],
  ];
  for (const o of relevantes) {
    for (const p of o.pasos) {
      filas.push([p.texto, o.procedencia.disposicion, '', '', '', '']);
    }
  }
  filas.push(
    ['¿Se preguntó por el beneficiario controlador?', 'Art. 3 fr. III LFPIORPI', '', '', '', ''],
    ['¿El cliente es persona políticamente expuesta?', 'Debida diligencia reforzada', '', '', '', ''],
    ['Fecha de la próxima actualización del expediente', '', '', '', '', ''],
  );
  return csv(filas);
}

function controlDeOperaciones(): string {
  return csv([
    ...procedencia('Control de operaciones y acumulación de seis meses'),
    [
      'Folio',
      'Fecha de la operación',
      'Cliente',
      'Actividad vulnerable',
      'Monto de la operación',
      'Moneda',
      'Forma de pago',
      'Monto en efectivo',
      'Umbral de identificación aplicable',
      '¿Rebasa identificación?',
      'Umbral de aviso aplicable',
      '¿Rebasa aviso?',
      'Acumulado 6 meses del cliente',
      '¿Rebasa por acumulación?',
      'Límite de efectivo art. 32',
      '¿Rebasa efectivo?',
      'Fecha límite del aviso',
      'Fecha de presentación',
      'Acuse',
    ],
  ]);
}

function registroDeCapacitacion(): string {
  return csv([
    ...procedencia('Registro anual de capacitación'),
    ['Periodo', 'Del 1 de enero al 31 de diciembre de', ''],
    [''],
    [
      'Nombre completo',
      'Puesto',
      'Rol (dirección / cumplimiento / atención a clientes / operativo)',
      'Curso o sesión',
      'Temario',
      'Horas',
      'Fecha de impartición',
      'Impartido por',
      'Contra qué texto vigente se preparó',
      'Evaluación aplicada',
      'Resultado',
      'Constancia (ubicación)',
    ],
  ]);
}

function matrizDeRiesgos(): string {
  const factores = [
    ['Cliente', 'Tipo de cliente y su actividad'],
    ['Cliente', 'Cliente es persona políticamente expuesta'],
    ['Cliente', 'Estructura de propiedad opaca o con vehículos extranjeros'],
    ['Producto o servicio', 'Producto o servicio ofrecido'],
    ['Canal', 'Relación a distancia sin contacto presencial'],
    ['Geografía', 'Plaza de origen de los recursos'],
    ['Geografía', 'Plaza donde se realiza la operación'],
    ['Operación', 'Uso de efectivo'],
    ['Operación', 'Monto frente al perfil transaccional del cliente'],
    ['Operación', 'Frecuencia y patrón de operaciones'],
  ];
  return csv([
    ...procedencia('Matriz de riesgos con enfoque basado en riesgos'),
    [
      'Categoría',
      'Factor de riesgo',
      'Peso asignado (%)',
      'Justificación del peso',
      'Nivel evaluado (bajo / medio / alto)',
      'Mitigantes aplicados',
      'Nivel residual',
      'Fecha de evaluación',
      'Próxima revisión',
    ],
    ...factores.map(([c, f]) => [c ?? '', f ?? '', '', '', '', '', '', '', '']),
  ]);
}

function manualDePoliticas(): string {
  const cats = ['gobierno', 'riesgos', 'identificacion', 'expediente', 'avisos', 'conservacion'];
  const secciones = datos.OBLIGACIONES.filter((o) => cats.includes(o.categoria));

  const cuerpo = secciones
    .map((o, i) => {
      const pasos = o.pasos.map((p) => `- [ ] ${p.texto}`).join('\n');
      return `## ${i + 1}. ${o.titulo}

**Fundamento:** ${o.procedencia.disposicion}

_Qué debe decir esta sección:_ el procedimiento concreto que sigue TU negocio
para cumplir lo siguiente. No la redacción de la ley, que ya está en la ley.

${pasos}

_Escribe aquí el procedimiento:_

`;
    })
    .join('\n');

  return `# Manual de políticas, criterios y procedimientos internos

> Índice comentado generado por LeyAntilavado.org contra la versión ${VERSION_LEGAL} del corpus legal.
> **Esto no es un manual.** Es su esqueleto: cada sección está vacía a propósito,
> porque su contenido depende de lo que hace tu negocio, y esa es justamente la
> parte que revisa una auditoría. Un manual copiado se detecta en la primera
> pregunta, que casi siempre es sobre un procedimiento concreto.

## Datos del sujeto obligado

- Razón social:
- RFC:
- Actividad(es) vulnerable(s) que realiza:
- Fecha de alta en el SPPLD:
- Representante encargado del cumplimiento:
- Fecha de aprobación por el órgano de administración:
- Versión del manual:

---

${cuerpo}
---

## Control de versiones

| Versión | Fecha | Qué cambió | Quién lo aprobó |
| ------- | ----- | ---------- | --------------- |
|         |       |            |                 |
`;
}

const GENERADORES: Record<string, () => string> = {
  'control-de-cumplimiento.csv': controlDeCumplimiento,
  'expediente-de-identificacion.csv': expedienteDeIdentificacion,
  'control-de-operaciones.csv': controlDeOperaciones,
  'registro-de-capacitacion.csv': registroDeCapacitacion,
  'matriz-de-riesgos.csv': matrizDeRiesgos,
  'manual-de-politicas.md': manualDePoliticas,
};

export async function GET(
  _peticion: Request,
  { params }: { params: Promise<{ archivo: string }> },
): Promise<Response> {
  const { archivo } = await params;
  const plantilla = PLANTILLA_POR_ARCHIVO.get(archivo);
  const generar = GENERADORES[archivo];

  if (!plantilla || !generar) {
    return new Response('Plantilla no encontrada.', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  const tipo =
    plantilla.formato === 'csv' ? 'text/csv; charset=utf-8' : 'text/markdown; charset=utf-8';

  return new Response(generar(), {
    headers: {
      'content-type': tipo,
      'content-disposition': `attachment; filename="${archivo}"`,
      // Se regenera en cada despliegue del corpus; no conviene que un
      // intermediario lo guarde durante meses.
      'cache-control': 'public, max-age=3600',
      'x-robots-tag': 'noindex',
    },
  });
}
