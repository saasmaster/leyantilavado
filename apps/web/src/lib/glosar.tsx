import * as React from 'react';
import Link from 'next/link';
import { GLOSARIO } from '@/content/glosario';

/**
 * Enlaza automáticamente los términos del glosario dentro de un texto.
 *
 * El sitio explica una ley densa a gente que no es abogada, y usa 52 términos
 * —PLD, EBR, beneficiario controlador, PEP— como si el lector ya los supiera.
 * Casi nadie los sabe. Definir cada uno en cada página sería insufrible; que
 * el lector abandone la página para buscarlos, peor.
 *
 * Reglas que evitan que esto se convierta en ruido:
 *
 *  - **Una sola vez por bloque.** Un término repetido siete veces enlazado
 *    siete veces convierte el párrafo en un campo de minas azul y hace que se
 *    ignoren todos, incluido el primero.
 *  - **De más largo a más corto.** «beneficiario controlador» tiene que ganarle
 *    a «beneficiario»; si no, el término largo nunca se enlaza entero.
 *  - **Fronteras de palabra.** Sin esto, «PEP» enlaza dentro de «PEPSI» y «FT»
 *    dentro de «SOFT». Con acrónimos de dos letras esto no es teórico.
 *  - **Acrónimos con mayúsculas exactas.** «UIF» es la Unidad; «uif» dentro de
 *    otra palabra no lo es. Los términos en minúsculas sí ignoran mayúsculas,
 *    porque «Beneficiario controlador» al inicio de una frase es el mismo
 *    término.
 *
 * Devuelve nodos de React, no HTML: nada de `dangerouslySetInnerHTML` sobre
 * texto editorial. El término se enlaza al glosario y lleva la definición en
 * `title`, que es gratis, funciona sin JavaScript y lo anuncian los lectores
 * de pantalla.
 */

interface Entrada {
  patron: RegExp;
  slug: string;
  definicion: string;
}

/** Escapa lo que en el término sea metacarácter de expresión regular. */
function escapar(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const ES_ACRONIMO = /^[A-ZÁÉÍÓÚÑ0-9/.]+$/;

/**
 * Un término por entrada, ordenados de más largo a más corto.
 *
 * Se construye una vez al cargar el módulo, no en cada render: son 52 términos
 * y otras tantas expresiones regulares, y esto lo llama cada párrafo de cada
 * página del sitio.
 */
const ENTRADAS: readonly Entrada[] = GLOSARIO.flatMap((t) => {
  // El `alterno` también se enlaza: mucha gente escribe «beneficiario
  // controlador» y no «BC», y quien lee «Prevención de Lavado de Dinero»
  // necesita el mismo enlace que quien lee «PLD».
  const formas = [t.termino, ...(t.alterno ? [t.alterno] : [])];
  return formas.map((forma) => ({
    forma,
    slug: t.slug,
    definicion: t.matiz ? `${t.definicion} ${t.matiz}` : t.definicion,
  }));
})
  .sort((a, b) => b.forma.length - a.forma.length)
  .map(({ forma, slug, definicion }) => ({
    slug,
    definicion,
    patron: new RegExp(
      `(?<![\\p{L}\\p{N}])${escapar(forma)}(?![\\p{L}\\p{N}])`,
      ES_ACRONIMO.test(forma) ? 'u' : 'iu',
    ),
  }));

export interface OpcionesGlosa {
  /**
   * Términos que no deben enlazarse en este bloque.
   *
   * Sirve para la propia página del glosario —donde enlazar cada término a sí
   * mismo es absurdo— y para la página de un término concreto.
   */
  excluir?: readonly string[];
}

/**
 * Recorre el texto enlazando el primer uso de cada término.
 *
 * Trabaja sobre una lista de fragmentos: los ya enlazados son nodos de React y
 * se dejan intactos, y sólo se sigue buscando dentro de los que siguen siendo
 * cadena. Así un término no puede quedar anidado dentro de otro enlace.
 */
export function glosar(texto: string, opciones: OpcionesGlosa = {}): React.ReactNode {
  const excluidos = new Set(opciones.excluir ?? []);
  const usados = new Set<string>();
  let piezas: React.ReactNode[] = [texto];

  for (const entrada of ENTRADAS) {
    if (usados.has(entrada.slug) || excluidos.has(entrada.slug)) continue;

    let yaEnlazado = false;
    const siguientes: React.ReactNode[] = [];

    for (const pieza of piezas) {
      if (yaEnlazado || typeof pieza !== 'string') {
        siguientes.push(pieza);
        continue;
      }

      const encontrado = entrada.patron.exec(pieza);
      if (!encontrado) {
        siguientes.push(pieza);
        continue;
      }

      const inicio = encontrado.index;
      const fin = inicio + encontrado[0].length;
      if (inicio > 0) siguientes.push(pieza.slice(0, inicio));
      siguientes.push(
        <Link
          key={`${entrada.slug}-${inicio}`}
          href={`/glosario#${entrada.slug}`}
          title={entrada.definicion}
          className="termino-glosario"
        >
          {/* Se conserva el texto tal cual aparecía: si el autor escribió
              «Beneficiario controlador» al inicio de una frase, enlazarlo no es
              excusa para cambiarle la mayúscula. */}
          {encontrado[0]}
        </Link>,
      );
      if (fin < pieza.length) siguientes.push(pieza.slice(fin));

      yaEnlazado = true;
      usados.add(entrada.slug);
    }

    piezas = siguientes;
  }

  return piezas.length === 1 ? piezas[0] : piezas;
}

/** Cuántos términos distintos enlazaría este texto. Se usa en pruebas. */
export function contarGlosas(texto: string, opciones: OpcionesGlosa = {}): number {
  const nodos = glosar(texto, opciones);
  if (!Array.isArray(nodos)) return 0;
  return nodos.filter((n) => React.isValidElement(n)).length;
}
