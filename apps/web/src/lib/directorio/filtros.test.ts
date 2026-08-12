import { describe, expect, it } from 'vitest';
import type { PerfilProveedor } from '@leyantilavado/types';
import { buscarProveedores, escribirFiltros, leerFiltros, POR_PAGINA } from './filtros';
import { limitarPorIP } from './limite-tasa';

/* ────────────────────────────────────────────────────────────────────────────
 * Perfiles de prueba.
 *
 * Viven aquí, no en `src/lib`, y esa es la diferencia que importa: el sitio
 * publicado sólo muestra perfiles reales aprobados a mano. Estos existen para
 * ejercitar el buscador y nunca llegan a un bundle.
 *
 * Cada uno aporta exactamente el rasgo que una prueba necesita —cobertura
 * nacional, patrocinio, agenda cerrada, plan gratuito— en vez de ser una ficha
 * completa de la que las pruebas leen una propiedad.
 * ────────────────────────────────────────────────────────────────────────── */

const UBICACION_BASE = {
  estado: 'Nuevo León',
  coberturaNacional: false,
  atencionPresencial: true,
  atencionRemota: true,
} as const;

function perfil(id: string, campos: Partial<PerfilProveedor> = {}): PerfilProveedor {
  return {
    id,
    slug: id,
    nombre: id,
    categorias: ['contadores'],
    actividadesAtendidas: [],
    biografia: '',
    servicios: [],
    industrias: [],
    ubicaciones: [UBICACION_BASE],
    idiomas: ['es'],
    tamanosCliente: ['pequena'],
    credenciales: [],
    verificacion: 'correo_verificado',
    plan: 'gratuito',
    patrocinado: false,
    aceptaNuevosClientes: true,
    publicado: true,
    creadoEn: '2025-01-01',
    actualizadoEn: '2025-01-01',
    ...campos,
  };
}

const PERFILES: readonly PerfilProveedor[] = [
  perfil('nacional', {
    ubicaciones: [
      { ...UBICACION_BASE, coberturaNacional: true },
    ],
  }),
  perfil('solo-merida', {
    ubicaciones: [{ ...UBICACION_BASE, estado: 'Yucatán', ciudad: 'Mérida' }],
  }),
  perfil('pagado', { patrocinado: true, plan: 'destacado' }),
  perfil('agenda-cerrada', { aceptaNuevosClientes: false }),
  perfil('profesional', { plan: 'profesional' }),
  perfil('gratuito-verificado', { verificacion: 'documentacion_revisada' }),
];

describe('filtros del directorio', () => {
  it('ignora valores desconocidos en la URL', () => {
    const f = leerFiltros({ categoria: 'brujos', verificacion: 'inventado', pagina: '-3' });
    expect(f.categoria).toBeNull();
    expect(f.verificacion).toBeNull();
    expect(f.pagina).toBe(1);
  });

  it('el query string sobrevive la ida y la vuelta', () => {
    const original = { estado: 'Jalisco', actividad: 'vehiculos', cobertura: 'nacional' };
    expect(escribirFiltros(leerFiltros(original))).toBe(
      '?estado=Jalisco&cobertura=nacional&actividad=vehiculos',
    );
  });

  it('sin ningún filtro puesto, el query string queda vacío', () => {
    // De esto depende que el estado vacío sepa distinguir «filtraste de más»
    // de «esta categoría todavía no tiene perfiles».
    expect(escribirFiltros(leerFiltros({}))).toBe('');
  });

  it('un proveedor con cobertura nacional aparece al filtrar por cualquier estado', () => {
    const { resultados, patrocinados } = buscarProveedores(
      PERFILES,
      leerFiltros({ estado: 'Sinaloa' }),
    );
    const nombres = [...patrocinados, ...resultados].map((p) => p.nombre);
    expect(nombres).toContain('nacional');
    // El de Mérida no atiende Sinaloa y no debe colarse.
    expect(nombres).not.toContain('solo-merida');
  });

  it('los patrocinados nunca se mezclan con los resultados orgánicos', () => {
    const { patrocinados, resultados } = buscarProveedores(PERFILES, leerFiltros({}));
    expect(patrocinados.length).toBeGreaterThan(0);
    expect(patrocinados.every((p) => p.patrocinado)).toBe(true);
    expect(resultados.some((p) => p.patrocinado)).toBe(false);
  });

  it('el filtro de disponibilidad excluye a quien tiene la agenda cerrada', () => {
    const abiertos = buscarProveedores(PERFILES, leerFiltros({ disponibilidad: 'abiertos' }));
    expect(
      [...abiertos.patrocinados, ...abiertos.resultados].every((p) => p.aceptaNuevosClientes),
    ).toBe(true);
  });

  it('pagina sin perder ni duplicar perfiles', () => {
    // Seis perfiles no llenan dos páginas: se replican para ejercitar la
    // paginación de verdad.
    const muchos = Array.from({ length: POR_PAGINA }, (_, n) =>
      PERFILES.map((p) => ({ ...p, id: `${p.id}-${n}`, slug: `${p.slug}-${n}` })),
    ).flat();

    const p1 = buscarProveedores(muchos, leerFiltros({}));
    const p2 = buscarProveedores(muchos, leerFiltros({ pagina: '2' }));

    expect(p1.totalPaginas).toBeGreaterThan(1);
    expect(p1.resultados).toHaveLength(POR_PAGINA);
    const ids = new Set([...p1.resultados, ...p2.resultados].map((p) => p.id));
    expect(ids.size).toBe(p1.resultados.length + p2.resultados.length);
    // Los patrocinados sólo encabezan la primera página.
    expect(p1.patrocinados.length).toBeGreaterThan(0);
    expect(p2.patrocinados).toHaveLength(0);
  });

  it('una página fuera de rango se ajusta a la última existente', () => {
    const r = buscarProveedores(PERFILES, leerFiltros({ pagina: '99' }));
    expect(r.pagina).toBe(r.totalPaginas);
    expect(r.resultados.length).toBeGreaterThan(0);
  });

  it('el orden natural no lo altera el plan contratado', () => {
    const { resultados } = buscarProveedores(PERFILES, leerFiltros({}));
    const gratuito = resultados.findIndex((p) => p.plan === 'gratuito');
    const dePago = resultados.findIndex((p) => p.plan !== 'gratuito');
    // Un gratuito por delante de uno de pago basta para probar que el plan no
    // ordena: si ordenara, todos los de pago irían primero.
    expect(gratuito).toBeGreaterThanOrEqual(0);
    expect(gratuito).toBeLessThan(dePago);
  });

  it('sin perfiles publicados el buscador devuelve cero, no falla', () => {
    const r = buscarProveedores([], leerFiltros({}));
    expect(r.total).toBe(0);
    expect(r.resultados).toHaveLength(0);
    expect(r.patrocinados).toHaveLength(0);
  });
});

describe('límite de tasa', () => {
  it('bloquea al superar el máximo y libera al pasar la ventana', () => {
    const clave = `prueba-${Math.random()}`;
    const limite = { maximo: 2, ventanaMs: 1000 };

    expect(limitarPorIP(clave, limite, 0).permitido).toBe(true);
    expect(limitarPorIP(clave, limite, 100).permitido).toBe(true);

    const bloqueado = limitarPorIP(clave, limite, 200);
    expect(bloqueado.permitido).toBe(false);
    expect(bloqueado.esperaSegundos).toBeGreaterThan(0);

    // Pasada la ventana, vuelve a permitir.
    expect(limitarPorIP(clave, limite, 1500).permitido).toBe(true);
  });
});
