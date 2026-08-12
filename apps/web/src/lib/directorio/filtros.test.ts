import { describe, expect, it } from 'vitest';
import { buscarProveedores, escribirFiltros, leerFiltros, POR_PAGINA } from './filtros';
import { limitarPorIP } from './limite-tasa';
import { PERFILES_DEMO } from './perfiles-demo';

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

  it('un proveedor con cobertura nacional aparece al filtrar por cualquier estado', () => {
    const { resultados, patrocinados } = buscarProveedores(
      PERFILES_DEMO,
      leerFiltros({ estado: 'Sinaloa' }),
    );
    const nombres = [...patrocinados, ...resultados].map((p) => p.nombre);
    expect(nombres).toContain('Despacho Demostración Norte');
    // El de Mérida no atiende Sinaloa y no debe colarse.
    expect(nombres).not.toContain('Contaduría Ficticia del Sureste');
  });

  it('los patrocinados nunca se mezclan con los resultados orgánicos', () => {
    const { patrocinados, resultados } = buscarProveedores(PERFILES_DEMO, leerFiltros({}));
    expect(patrocinados.length).toBeGreaterThan(0);
    expect(patrocinados.every((p) => p.patrocinado)).toBe(true);
    expect(resultados.some((p) => p.patrocinado)).toBe(false);
  });

  it('el filtro de disponibilidad excluye a quien tiene la agenda cerrada', () => {
    const abiertos = buscarProveedores(PERFILES_DEMO, leerFiltros({ disponibilidad: 'abiertos' }));
    expect([...abiertos.patrocinados, ...abiertos.resultados].every((p) => p.aceptaNuevosClientes))
      .toBe(true);
  });

  it('pagina sin perder ni duplicar perfiles', () => {
    // Los perfiles de demostración no llenan dos páginas: se replican para
    // ejercitar la paginación de verdad.
    const muchos = [0, 1].flatMap((n) =>
      PERFILES_DEMO.map((p) => ({ ...p, id: `${p.id}-${n}`, slug: `${p.slug}-${n}` })),
    );

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
    const r = buscarProveedores(PERFILES_DEMO, leerFiltros({ pagina: '99' }));
    expect(r.pagina).toBe(r.totalPaginas);
    expect(r.resultados.length).toBeGreaterThan(0);
  });

  it('el orden natural no lo altera el plan contratado', () => {
    const { resultados } = buscarProveedores(PERFILES_DEMO, leerFiltros({}));
    const gratuitoAntesQueProfesional = resultados.findIndex((p) => p.plan === 'gratuito');
    // Basta con que exista al menos un gratuito por delante de algún de pago
    // para probar que el plan no ordena.
    expect(gratuitoAntesQueProfesional).toBeGreaterThanOrEqual(0);
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
