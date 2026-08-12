/**
 * Rastreadores de modelos de lenguaje.
 *
 * Por qué existe esta lista en lugar de confiar en la regla `*`:
 *
 * Varios de estos agentes NO heredan la regla comodín de la forma que uno
 * supone. `Google-Extended` es el caso claro: no es un rastreador, es un
 * interruptor de permiso: si no aparece con nombre propio, Google decide por
 * omisión, y esa omisión cambia con el tiempo. `Applebot-Extended` funciona
 * igual. Nombrarlos convierte una decisión editorial en algo escrito.
 *
 * La política de este sitio es abrir la puerta a los rastreadores que pueden
 * citarnos. El proyecto compite contra despachos que publican PDF: la ventaja
 * es que cada cifra sale del motor con su artículo y su fuente. Si un asistente
 * responde "¿cuál es el umbral de aviso de una inmobiliaria?" citando esta
 * página, el trabajo ya rindió. Cerrarles el paso protegería un contenido que
 * de todos modos se publica para ser leído.
 *
 * Lo que NO se abre es lo mismo que no se abre a Google: el área privada, el
 * panel administrativo y la API. Esa lista vive en `robots.ts` y se aplica
 * igual a todos.
 */

export type PropositoRastreador =
  /** Alimenta un índice que se cita con enlace en la respuesta. */
  | 'busqueda'
  /** Lee la página en el momento porque alguien la pidió en una conversación. */
  | 'lectura_a_peticion'
  /** Recolecta corpus para entrenar modelos. */
  | 'entrenamiento';

export interface RastreadorIA {
  /** Valor exacto de `User-agent`. Distingue mayúsculas en la práctica. */
  agente: string;
  operador: string;
  proposito: PropositoRastreador;
}

/**
 * Agentes permitidos, en orden de cuánto nos interesa que nos citen.
 *
 * Si mañana hay que cerrarle la puerta a uno, se quita de aquí y `robots.ts`
 * lo empieza a bloquear con la misma lista de rutas privadas. No hay que tocar
 * dos archivos.
 */
export const RASTREADORES_IA: readonly RastreadorIA[] = [
  { agente: 'GPTBot', operador: 'OpenAI', proposito: 'entrenamiento' },
  { agente: 'OAI-SearchBot', operador: 'OpenAI', proposito: 'busqueda' },
  { agente: 'ChatGPT-User', operador: 'OpenAI', proposito: 'lectura_a_peticion' },
  { agente: 'ClaudeBot', operador: 'Anthropic', proposito: 'entrenamiento' },
  { agente: 'Claude-SearchBot', operador: 'Anthropic', proposito: 'busqueda' },
  { agente: 'Claude-User', operador: 'Anthropic', proposito: 'lectura_a_peticion' },
  { agente: 'PerplexityBot', operador: 'Perplexity', proposito: 'busqueda' },
  { agente: 'Perplexity-User', operador: 'Perplexity', proposito: 'lectura_a_peticion' },
  { agente: 'Google-Extended', operador: 'Google', proposito: 'entrenamiento' },
  { agente: 'Applebot-Extended', operador: 'Apple', proposito: 'entrenamiento' },
  { agente: 'meta-externalagent', operador: 'Meta', proposito: 'entrenamiento' },
  { agente: 'cohere-ai', operador: 'Cohere', proposito: 'entrenamiento' },
  { agente: 'CCBot', operador: 'Common Crawl', proposito: 'entrenamiento' },
  { agente: 'MistralAI-User', operador: 'Mistral', proposito: 'lectura_a_peticion' },
] as const;

/**
 * Agentes bloqueados a propósito.
 *
 * Bytespider no publica una forma de citar la fuente y ha rastreado por encima
 * de lo razonable en sitios pequeños. Se bloquea por costo de servidor, no por
 * postura sobre el entrenamiento: los demás rastreadores de entrenamiento
 * siguen permitidos arriba.
 */
export const RASTREADORES_IA_BLOQUEADOS: readonly string[] = ['Bytespider'] as const;
