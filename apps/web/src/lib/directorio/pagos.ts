import type { ClavePlan } from './planes';

/* ────────────────────────────────────────────────────────────────────────────
 * Adaptador de pagos.
 *
 * Mientras no exista `STRIPE_SECRET_KEY`, el sitio corre en modo de prueba: no
 * se cobra nada y la UI lo dice con todas sus letras. Fingir un cobro —o
 * insinuar que existe— sería mentirle al usuario sobre dinero, que es la
 * mentira que menos se perdona.
 * ────────────────────────────────────────────────────────────────────────── */

export type ModoPagos = 'prueba' | 'produccion';

export interface SolicitudSuscripcion {
  plan: ClavePlan;
  periodicidad: 'mensual' | 'anual';
  urlExito: string;
  urlCancelacion: string;
}

export type ResultadoSuscripcion =
  | { ok: true; urlPago: string }
  | { ok: false; motivo: string };

export interface ProveedorPagos {
  readonly modo: ModoPagos;
  /** Texto que la UI muestra junto a los precios. Vacío en producción. */
  readonly avisoUI: string;
  crearSesionSuscripcion(solicitud: SolicitudSuscripcion): Promise<ResultadoSuscripcion>;
}

export const PagosEnPrueba: ProveedorPagos = {
  modo: 'prueba',
  avisoUI:
    'Modo de prueba: el cobro todavía no está conectado. Puedes registrar interés en un plan, pero hoy no se realiza ningún cargo ni se piden datos de tarjeta.',
  async crearSesionSuscripcion() {
    return {
      ok: false,
      motivo:
        'El cobro todavía no está habilitado. Registra tu interés y te avisamos cuando el plan esté disponible.',
    };
  },
};

/**
 * Hueco para Stripe. Se implementa cuando exista la clave; hasta entonces
 * nadie lo instancia y la UI no promete lo que no puede cumplir.
 */
function crearPagosStripe(_claveSecreta: string): ProveedorPagos {
  return {
    modo: 'produccion',
    avisoUI: '',
    async crearSesionSuscripcion() {
      // TODO(Stripe): stripe.checkout.sessions.create({ mode: 'subscription', ... })
      // El precio no se manda desde el cliente: se resuelve del catálogo por
      // `plan` + `periodicidad` en el servidor.
      return {
        ok: false,
        motivo: 'La pasarela de pago está configurada pero aún no implementada.',
      };
    },
  };
}

export function obtenerProveedorPagos(): ProveedorPagos {
  const clave = process.env['STRIPE_SECRET_KEY'];
  return clave ? crearPagosStripe(clave) : PagosEnPrueba;
}

/** Para el render del servidor: ¿mostramos la nota de modo de prueba? */
export function enModoPrueba(): boolean {
  return obtenerProveedorPagos().modo === 'prueba';
}
