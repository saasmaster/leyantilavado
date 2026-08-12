import { rm } from 'node:fs/promises';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { guardarDocumentos } from './documentos';

/* ────────────────────────────────────────────────────────────────────────────
 * Validación de los documentos que sube un proveedor.
 *
 * Esto es lógica de seguridad, no de formato: lo que entra por aquí son
 * cédulas profesionales y títulos, y lo que podría entrar es cualquier cosa
 * que alguien renombre a .pdf. Las tres propiedades que se verifican son las
 * tres que, si se rompen, no se notan hasta que ya es tarde.
 * ────────────────────────────────────────────────────────────────────────── */

const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const EJECUTABLE = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00]);

const archivo = (nombre: string, datos: Uint8Array, tipo = 'application/pdf') =>
  // `datos.buffer` y no `datos`: el tipo de `BlobPart` no acepta un
  // `Uint8Array` genérico bajo `strict`, aunque en tiempo de ejecución
  // funcione. tsc lo caza sólo en `npm run build`, no en `npx tsc` del test.
  new File([datos.buffer as ArrayBuffer], nombre, { type: tipo });

afterAll(async () => {
  await rm(path.join(process.cwd(), '.data', 'documentos'), { recursive: true, force: true });
});

describe('documentos del alta', () => {
  it('acepta un PDF y un PNG de verdad', async () => {
    const r = await guardarDocumentos(
      [archivo('cedula.pdf', PDF), archivo('titulo.png', PNG, 'image/png')],
      'prueba',
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.documentos).toHaveLength(2);
  });

  it('rechaza un ejecutable renombrado a .pdf', async () => {
    // El navegador puede mandar cualquier `type`; aquí se declara el correcto
    // a propósito, para probar que la decisión NO depende de ese dato.
    const r = await guardarDocumentos([archivo('cedula.pdf', EJECUTABLE)], 'prueba');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('no es un PDF');
  });

  it('nunca usa el nombre del usuario para construir la ruta', async () => {
    // `../../` en el nombre es como se escribe una travesía de rutas. La ruta
    // guardada tiene que colgar de `documentos/` y de ningún otro sitio.
    const r = await guardarDocumentos([archivo('../../../etc/passwd.pdf', PDF)], 'prueba');
    expect(r.ok).toBe(true);
    if (r.ok) {
      const doc = r.documentos[0];
      expect(doc).toBeDefined();
      expect(doc?.ruta.startsWith('documentos/')).toBe(true);
      expect(doc?.ruta).not.toContain('..');
      // El nombre original se conserva como dato, pero saneado.
      expect(doc?.nombreOriginal).not.toContain('/');
    }
  });

  it('rechaza un archivo de más de 8 MB', async () => {
    const grande = new Uint8Array(9 * 1024 * 1024);
    grande.set(PDF);
    const r = await guardarDocumentos([archivo('enorme.pdf', grande)], 'prueba');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('8 MB');
  });

  it('rechaza más de cinco archivos', async () => {
    const seis = Array.from({ length: 6 }, (_, i) => archivo(`d${i}.pdf`, PDF));
    const r = await guardarDocumentos(seis, 'prueba');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('5 documentos');
  });

  it('sin archivos no falla ni crea nada', async () => {
    const r = await guardarDocumentos([], 'prueba');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.documentos).toHaveLength(0);
  });
});
