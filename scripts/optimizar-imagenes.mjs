#!/usr/bin/env node
/**
 * Convierte las imágenes de origen a WebP para `next/image`.
 *
 *   node scripts/optimizar-imagenes.mjs <origen.png> <nombre-destino>
 *
 * Los PNG que salen del generador pesan varios megas a 2752px. `next/image`
 * sabe redimensionar, pero conviene guardar un original acotado: el archivo
 * fuente se lee en cada regeneración de tamaños, y 5 MB por imagen se nota en
 * el tiempo de build y en el disco del servidor.
 *
 * 1920px de ancho cubre pantallas grandes con holgura; calidad 82 en WebP es
 * el punto donde la fotografía deja de mejorar a simple vista.
 */

import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

const [origen, nombre] = process.argv.slice(2);
if (!origen || !nombre) {
  console.error('Uso: node scripts/optimizar-imagenes.mjs <origen> <nombre-destino>');
  process.exit(1);
}

const DESTINO = path.resolve('apps/web/public/img');
await mkdir(DESTINO, { recursive: true });

const salida = path.join(DESTINO, `${nombre}.webp`);

await sharp(origen)
  .resize({ width: 1920, withoutEnlargement: true })
  .webp({ quality: 82, effort: 6 })
  .toFile(salida);

const antes = (await stat(origen)).size;
const despues = (await stat(salida)).size;
const meta = await sharp(salida).metadata();

console.log(
  `✓ ${nombre}.webp  ${meta.width}×${meta.height}  ` +
    `${(antes / 1024 / 1024).toFixed(1)} MB → ${(despues / 1024).toFixed(0)} KB`,
);
