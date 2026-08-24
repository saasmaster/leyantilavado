import { describe, expect, it } from 'vitest';
import { datos } from '@leyantilavado/rules-engine';
import { LARGO_DESCRIPCION, LARGO_TITULO, construirMetadata } from './sitio';
import { CONTENIDO_ACTIVIDADES } from '../content/actividades';
import { CONTENIDO_OBLIGACIONES } from '../content/obligaciones';
import { OFICIOS } from '../content/oficios';
import { TRAMITES } from '../content/tramites';

/* ────────────────────────────────────────────────────────────────────────────
 * El largo de los textos de buscador se verifica, no se recorta.
 *
 * Antes `construirMetadata` cortaba en el último espacio y añadía «…». El
 * resultado: 31 títulos y 59 descripciones terminaban en puntos suspensivos,
 * que es la firma más reconocible de un texto generado, y el corte se comía
 * justo la parte específica de cada página.
 *
 * Estas pruebas hacen que un texto demasiado largo rompa el build en vez de
 * salir mocho a producción. El arreglo entonces es reescribirlo más corto,
 * que es lo que había que hacer desde el principio.
 * ────────────────────────────────────────────────────────────────────────── */

const textos: readonly { fuente: string; titulo: string; descripcion: string }[] = [
  ...Object.entries(CONTENIDO_ACTIVIDADES).map(([slug, c]) => ({
    fuente: `actividad ${slug}`,
    titulo: c.tituloSEO,
    descripcion: c.descripcionSEO,
  })),
  ...Object.entries(CONTENIDO_OBLIGACIONES).map(([slug, c]) => ({
    fuente: `obligación ${slug}`,
    titulo: c.tituloSEO,
    descripcion: c.descripcionSEO,
  })),
  // Las puertas por oficio entran aquí por la misma razón que las demás: son
  // páginas indexables con título y descripción propios, y sin esta cobertura
  // un texto largo se recortaría en el buscador sin que nada avisara.
  ...OFICIOS.map((o) => ({
    fuente: `oficio ${o.slug}`,
    titulo: o.tituloSEO,
    descripcion: o.descripcionSEO,
  })),
  ...TRAMITES.map((t) => ({
    fuente: `trámite ${t.slug}`,
    titulo: t.tituloSEO,
    descripcion: t.descripcionSEO,
  })),
];

describe('textos de buscador', () => {
  it('hay textos que verificar (el catálogo no está vacío)', () => {
    // La suma no es decorativa: si un catálogo dejara de exportar, el arreglo
    // quedaría corto y las pruebas de largo pasarían sobre un conjunto vacío
    // sin que nada avisara. Al añadir una fuente hay que sumarla aquí.
    expect(textos.length).toBe(
      datos.ACTIVIDADES.length + datos.OBLIGACIONES.length + OFICIOS.length + TRAMITES.length,
    );
  });

  it.each(textos)('$fuente: el título cabe en el resultado', ({ titulo }) => {
    expect(titulo.length, `«${titulo}» (${titulo.length})`).toBeLessThanOrEqual(LARGO_TITULO);
  });

  it.each(textos)('$fuente: la descripción cabe en el resultado', ({ descripcion }) => {
    expect(
      descripcion.length,
      `«${descripcion}» (${descripcion.length})`,
    ).toBeLessThanOrEqual(LARGO_DESCRIPCION);
  });

  it.each(textos)('$fuente: ningún texto termina en puntos suspensivos', ({ titulo, descripcion }) => {
    expect(titulo.trimEnd().endsWith('…')).toBe(false);
    expect(descripcion.trimEnd().endsWith('…')).toBe(false);
  });

  it('la marca se añade sólo cuando cabe entera', () => {
    const corto = construirMetadata({ titulo: 'Umbrales', descripcion: 'x', ruta: '/umbrales' });
    expect(corto.title).toBe('Umbrales | LeyAntilavado.org');

    // Con un título ya largo, la marca se omite en vez de empujar el conjunto
    // por encima del corte: el dominio ya sale encima del título en Google.
    const largo = 'Personas facilitadoras públicas y privadas: apartado D';
    const conTituloLargo = construirMetadata({ titulo: largo, descripcion: 'x', ruta: '/x' });
    expect(conTituloLargo.title).toBe(largo);
  });

  it('la descripción viaja íntegra a las tarjetas sociales', () => {
    const d = 'Una descripción cualquiera que no llega al límite.';
    const m = construirMetadata({ titulo: 'T', descripcion: d, ruta: '/t' });
    expect(m.description).toBe(d);
    expect(m.openGraph?.description).toBe(d);
  });
});
