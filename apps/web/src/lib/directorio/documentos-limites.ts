/**
 * Límites de carga de documentos, compartidos entre cliente y servidor.
 *
 * Viven aparte de `documentos.ts` porque ese módulo es `server-only` —maneja
 * el sistema de archivos— y el formulario, que es de cliente, necesita estos
 * números para escribir su texto de ayuda. Duplicarlos habría sido peor: el
 * día que cambie el límite, el mensaje diría una cosa y el servidor haría otra.
 */

/** Cinco documentos bastan: cédula, título, certificación y dos más. */
export const MAXIMO_ARCHIVOS = 5;

/** 8 MB por archivo. Una cédula escaneada no pasa de 2 MB. */
export const MAXIMO_BYTES = 8 * 1024 * 1024;

export const TIPOS_ACEPTADOS = ['application/pdf', 'image/jpeg', 'image/png'] as const;

export const EXTENSIONES_VISIBLES = '.pdf, .jpg, .png';
