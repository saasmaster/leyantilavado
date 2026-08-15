import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { PerfilProveedor } from '@leyantilavado/types';
import { aplicarDecision, type AltaProveedor } from '@/lib/directorio/repositorio';

/* ────────────────────────────────────────────────────────────────────────────
 * Consola de moderación del directorio.
 *
 * Dos cosas que, si se rompen, no se notan hasta que es tarde:
 *
 *  1. Las reglas de la decisión: la bitácora crece y nunca se sustituye, un
 *     rechazo despublica pero no borra, y sólo aprobar mueve el nivel de
 *     verificación.
 *  2. Que cada acción compruebe el permiso EN EL SERVIDOR. Igual que
 *     `frontera.test.ts`, esto se verifica leyendo el código fuente: lo que hay
 *     que garantizar es que nadie añada una acción nueva sin frontera, y eso es
 *     una propiedad del archivo, no de una llamada.
 * ────────────────────────────────────────────────────────────────────────── */

const RAIZ = process.cwd();
const CONSOLA = path.join(RAIZ, 'src/app/admin/directorio');

const ALTA: AltaProveedor = {
  id: 'alta-1',
  folio: 'ALT-ABC1234',
  nombre: 'Despacho de prueba',
  correoContacto: 'contacto@ejemplo.mx',
  categorias: ['contadores'],
  actividadesAtendidas: [],
  estado: 'Sinaloa',
  coberturaNacional: false,
  atencionRemota: true,
  atencionPresencial: true,
  idiomas: ['Español'],
  tamanosCliente: ['pequena'],
  servicios: [],
  biografia: 'Texto.',
  credenciales: 'Cédula 123.',
  consentimiento: true,
  publicado: true,
  estadoModeracion: 'pendiente',
  perfilSlug: 'despacho-de-prueba',
  creadoEn: '2026-08-01T10:00:00.000Z',
};

const PERFIL = {
  id: 'alta-1',
  slug: 'despacho-de-prueba',
  verificacion: 'sin_verificar',
  publicado: true,
  actualizadoEn: '2026-08-01T10:00:00.000Z',
} as unknown as PerfilProveedor;

const AHORA = '2026-08-14T18:00:00.000Z';
const QUIEN = { actorId: 'usuario-1', actor: 'staff@leyantilavado.org' } as const;

describe('decisión de moderación', () => {
  it('aprobar fija el nivel revisado y firma quién y cuándo', () => {
    const r = aplicarDecision(
      ALTA,
      PERFIL,
      { ...QUIEN, decision: 'aprobada', nivelVerificacion: 'documentacion_revisada' },
      AHORA,
    );

    expect(r.alta.estadoModeracion).toBe('revisado');
    expect(r.perfil?.verificacion).toBe('documentacion_revisada');
    expect(r.perfil?.publicado).toBe(true);

    const entrada = r.alta.bitacora?.[0];
    expect(entrada?.actorId).toBe('usuario-1');
    expect(entrada?.registradoEn).toBe(AHORA);
  });

  it('rechazar despublica el perfil pero no borra nada', () => {
    const r = aplicarDecision(ALTA, PERFIL, { ...QUIEN, decision: 'rechazada', motivo: 'No es el titular.' }, AHORA);

    expect(r.alta.estadoModeracion).toBe('rechazado');
    expect(r.alta.folio).toBe(ALTA.folio);
    expect(r.perfil).not.toBeNull();
    expect(r.perfil?.publicado).toBe(false);
    // El nivel no se toca: rechazar no es una verificación al revés.
    expect(r.perfil?.verificacion).toBe('sin_verificar');
  });

  it('rechazar sin motivo no se puede registrar', () => {
    expect(() =>
      aplicarDecision(ALTA, PERFIL, { ...QUIEN, decision: 'rechazada', motivo: '   ' }, AHORA),
    ).toThrow();
  });

  it('pedir corrección deja el perfil como estaba', () => {
    const r = aplicarDecision(
      ALTA,
      PERFIL,
      { ...QUIEN, decision: 'correccion_solicitada', motivo: 'Falta la cédula.' },
      AHORA,
    );

    expect(r.alta.estadoModeracion).toBe('correccion_solicitada');
    expect(r.perfil).toBe(PERFIL);
  });

  it('una decisión posterior se apila sobre la anterior, no la sustituye', () => {
    const primera = aplicarDecision(
      ALTA,
      PERFIL,
      { ...QUIEN, decision: 'correccion_solicitada', motivo: 'Falta la cédula.' },
      AHORA,
    );
    const segunda = aplicarDecision(
      primera.alta,
      primera.perfil,
      { ...QUIEN, decision: 'aprobada', nivelVerificacion: 'identidad_verificada' },
      '2026-08-20T09:00:00.000Z',
    );

    expect(segunda.alta.bitacora).toHaveLength(2);
    expect(segunda.alta.bitacora?.[0]?.decision).toBe('correccion_solicitada');
  });
});

describe('frontera de la consola de moderación', () => {
  const acciones = readFileSync(path.join(CONSOLA, 'acciones.ts'), 'utf8');

  it('toda acción exportada comprueba el permiso en el servidor', () => {
    const exportadas = [...acciones.matchAll(/export async function (\w+)/g)].map(
      (m) => m[1] as string,
    );
    expect(exportadas.length).toBeGreaterThan(0);

    // Una Server Action es un endpoint POST propio: quien la invoca no pasa por
    // la página que dibuja el botón. Si alguien añade una acción y se olvida de
    // la comprobación, esta prueba la caza antes que un auditor.
    for (const nombre of exportadas) {
      const inicio = acciones.indexOf(`export async function ${nombre}`);
      expect(
        acciones.slice(inicio, inicio + 300).includes('requerirStaff()'),
        `la acción ${nombre} no llama a requerirStaff antes de escribir`,
      ).toBe(true);
    }
  });

  it('el manejador de documentos comprueba el permiso antes de leer del disco', () => {
    const ruta = readFileSync(path.join(CONSOLA, 'documento/[id]/route.ts'), 'utf8');

    // El orden es la propiedad: comprobar después de leer ya expuso el archivo
    // al proceso, y una excepción en medio lo dejaría servido.
    expect(ruta.indexOf('esStaff')).toBeGreaterThan(-1);
    expect(ruta.indexOf('esStaff')).toBeLessThan(ruta.indexOf('readFile('));

    // La ruta del archivo sale del registro, nunca de la petición.
    expect(ruta).toContain('documento.ruta');
    expect(ruta).not.toMatch(/readFile\([^)]*params/);
  });

  it('las páginas de la consola exigen sesión de personal', () => {
    for (const pagina of ['page.tsx', 'solicitud/[id]/page.tsx']) {
      const fuente = readFileSync(path.join(CONSOLA, pagina), 'utf8');
      expect(fuente, `${pagina} no llama a requerirStaff`).toContain('requerirStaff()');
      // Ninguna declara `metadata`: heredan el `noindex` del layout de /admin.
      expect(
        /export const metadata/.test(fuente),
        `${pagina} declara metadata propia y perdería el noindex del layout`,
      ).toBe(false);
    }
  });
});
