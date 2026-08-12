import { z } from 'zod';
import { ACTIVIDAD_SLUGS, CATEGORIAS_PROVEEDOR } from '@leyantilavado/types';
import { ESTADOS_MX, IDIOMAS_DIRECTORIO, TIPOS_SERVICIO } from './catalogo';

/* ────────────────────────────────────────────────────────────────────────────
 * Validación de todo lo que entra desde el público.
 *
 * El consentimiento es literal: `z.literal(true)`. No basta con que el campo
 * exista; tiene que venir en true, y la casilla nunca se dibuja premarcada.
 * ────────────────────────────────────────────────────────────────────────── */

const CLAVES_SERVICIO = TIPOS_SERVICIO.map((s) => s.clave) as [string, ...string[]];

const texto = (min: number, max: number, campo: string) =>
  z
    .string()
    .trim()
    .min(min, `${campo}: escribe al menos ${min} caracteres.`)
    .max(max, `${campo}: máximo ${max} caracteres.`);

const correo = z
  .string()
  .trim()
  .toLowerCase()
  .email('Escribe un correo electrónico válido.')
  .max(160);

const telefono = z
  .string()
  .trim()
  .regex(/^[\d\s()+-]{10,20}$/, 'Escribe un teléfono de 10 dígitos.')
  .optional()
  .or(z.literal('').transform(() => undefined));

const CONSENTIMIENTO_CONTACTO = z.literal(true, {
  errorMap: () => ({
    message: 'Necesitamos tu autorización expresa para compartir tus datos con el proveedor.',
  }),
});

export const esquemaContacto = z.object({
  proveedorSlug: z.string().trim().min(1).max(120),
  tipo: z.enum(['contacto', 'cotizacion', 'llamada']),
  nombre: texto(2, 120, 'Nombre'),
  correo,
  telefono,
  empresa: z.string().trim().max(160).optional(),
  actividad: z.enum(ACTIVIDAD_SLUGS).optional(),
  mensaje: texto(20, 2000, 'Mensaje'),
  consentimiento: CONSENTIMIENTO_CONTACTO,
});

export type DatosContacto = z.infer<typeof esquemaContacto>;

export const esquemaAlta = z.object({
  nombre: texto(3, 160, 'Nombre'),
  correoContacto: correo,
  telefono,
  sitioWeb: z
    .string()
    .trim()
    .url('Escribe la dirección completa, incluido https://')
    .max(200)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  categorias: z
    .array(z.enum(CATEGORIAS_PROVEEDOR))
    .min(1, 'Elige al menos una categoría.')
    .max(4, 'Elige un máximo de 4 categorías: un perfil que dice hacer todo no ayuda a nadie.'),
  actividadesAtendidas: z
    .array(z.enum(ACTIVIDAD_SLUGS))
    .min(1, 'Elige al menos una actividad vulnerable que atiendas.'),
  servicios: z.array(z.enum(CLAVES_SERVICIO)).min(1, 'Elige al menos un servicio.'),
  estado: z.enum(ESTADOS_MX as unknown as [string, ...string[]]),
  ciudad: z.string().trim().max(120).optional(),
  coberturaNacional: z.boolean(),
  atencionRemota: z.boolean(),
  atencionPresencial: z.boolean(),
  idiomas: z
    .array(z.enum(IDIOMAS_DIRECTORIO as unknown as [string, ...string[]]))
    .min(1, 'Elige al menos un idioma.'),
  tamanosCliente: z
    .array(z.enum(['micro', 'pequena', 'mediana', 'grande']))
    .min(1, 'Elige al menos un tamaño de cliente.'),
  aniosExperiencia: z.coerce.number().int().min(0).max(70).optional(),
  biografia: texto(80, 1200, 'Descripción'),
  credenciales: texto(20, 1200, 'Credenciales'),
  documentosDescritos: z.string().trim().max(1000).optional(),
  consentimiento: z.literal(true, {
    errorMap: () => ({
      message:
        'Necesitamos tu autorización para publicar los datos del perfil y revisar los documentos que envíes.',
    }),
  }),
});

export type DatosAlta = z.infer<typeof esquemaAlta>;

export const esquemaReclamo = z.object({
  proveedorSlug: z.string().trim().min(1).max(120),
  nombre: texto(2, 120, 'Nombre'),
  correo,
  telefono,
  cargo: texto(2, 120, 'Cargo'),
  pruebaRelacion: texto(30, 1200, 'Cómo podemos comprobar tu relación con el perfil'),
  consentimiento: z.literal(true, {
    errorMap: () => ({
      message: 'Necesitamos tu autorización para contactarte y verificar el reclamo.',
    }),
  }),
});

export type DatosReclamo = z.infer<typeof esquemaReclamo>;

export const esquemaReporte = z.object({
  proveedorSlug: z.string().trim().min(1).max(120),
  motivo: z.enum([
    'informacion_incorrecta',
    'no_es_el_titular',
    'credencial_falsa',
    'practica_enganosa',
    'perfil_duplicado',
    'otro',
  ]),
  detalle: texto(30, 2000, 'Detalle'),
  // El reporte puede ser anónimo: exigir correo desalienta el reporte legítimo.
  correo: correo.optional().or(z.literal('').transform(() => undefined)),
});

export type DatosReporte = z.infer<typeof esquemaReporte>;

/** Convierte los errores de zod a `{ campo: mensaje }` para pintarlos junto al campo. */
export function erroresPorCampo(error: z.ZodError): Record<string, string> {
  const salida: Record<string, string> = {};
  for (const issue of error.issues) {
    const campo = issue.path.join('.') || 'formulario';
    salida[campo] ??= issue.message;
  }
  return salida;
}
