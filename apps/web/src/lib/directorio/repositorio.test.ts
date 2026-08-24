import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * Prueba de la cola de escrituras del directorio.
 *
 * El repositorio guarda listas JSON completas: leer el archivo, empujar el
 * registro y reescribirlo entero. Sin serializar, dos altas simultáneas leen la
 * misma lista inicial y la segunda escritura pisa a la primera. El alta perdida
 * no produce ningún error —quien la envió recibe su folio igual— así que el
 * fallo sólo se ve contando registros. Por eso esta prueba existe.
 *
 * `DIRECTORIO_DATOS` se resuelve desde `process.cwd()` cuando el módulo se
 * carga, así que la prueba cambia de directorio ANTES de importarlo y escribe
 * en una carpeta temporal. Nunca toca el `.data/` real del proyecto.
 */

const CWD_ORIGINAL = process.cwd();
let temporal: string;
let repositorio: typeof import('./repositorio').repositorioDirectorio;

beforeAll(async () => {
  temporal = await mkdtemp(path.join(tmpdir(), 'directorio-'));
  process.chdir(temporal);
  ({ repositorioDirectorio: repositorio } = await import('./repositorio'));
});

afterAll(async () => {
  process.chdir(CWD_ORIGINAL);
  await rm(temporal, { recursive: true, force: true });
});

/** El alta mínima que el esquema acepta, parametrizada por nombre. */
function altaDe(nombre: string) {
  return {
    nombre,
    categorias: ['consultoria'],
    actividadesAtendidas: [],
    biografia: 'Despacho de prueba para la suite automatizada.',
    servicios: [],
    estado: 'Sinaloa',
    coberturaNacional: false,
    atencionRemota: true,
    atencionPresencial: false,
    idiomas: ['es'],
    tamanosCliente: [],
    correoContacto: `${nombre}@ejemplo.mx`,
    consentimiento: true,
  } as unknown as Parameters<typeof repositorio.guardarAlta>[0];
}

async function leerJson<T>(archivo: string): Promise<T[]> {
  const crudo = await readFile(path.join(temporal, '.data', archivo), 'utf8');
  return JSON.parse(crudo) as T[];
}

describe('escrituras concurrentes del directorio', () => {
  it('no pierde ningún alta cuando llegan todas a la vez', async () => {
    const CUANTAS = 25;

    await Promise.all(
      Array.from({ length: CUANTAS }, (_, i) => repositorio.guardarAlta(altaDe(`despacho-${i}`))),
    );

    const altas = await leerJson<{ id: string }>('directorio-altas.json');
    expect(altas).toHaveLength(CUANTAS);
    expect(new Set(altas.map((a) => a.id)).size).toBe(CUANTAS);
  });

  it('no repite el slug aunque todas las empresas se llamen igual', async () => {
    // El caso que de verdad duele: el slug es la URL pública. Si se repitiera,
    // la búsqueda por slug devolvería la ficha de otra empresa.
    const CUANTAS = 10;

    await Promise.all(
      Array.from({ length: CUANTAS }, () => repositorio.guardarAlta(altaDe('Cumplimiento Total'))),
    );

    const perfiles = await leerJson<{ slug: string }>('directorio-perfiles.json');
    const slugs = perfiles.map((p) => p.slug);
    expect(new Set(slugs).size, `slugs repetidos: ${slugs.join(', ')}`).toBe(slugs.length);
  });

  it('un fallo no rompe la cola para las operaciones siguientes', async () => {
    // Sin consentimiento el repositorio lanza a propósito. Ese rechazo no debe
    // dejar la cola envenenada: lo que venga después tiene que ejecutarse.
    await expect(
      repositorio.guardarSolicitudContacto({
        consentimiento: false,
      } as unknown as Parameters<typeof repositorio.guardarSolicitudContacto>[0]),
    ).rejects.toThrow();

    const folio = await repositorio.guardarAlta(altaDe('Despues Del Fallo'));
    expect(folio).toMatch(/^ALT-/);
  });
});
