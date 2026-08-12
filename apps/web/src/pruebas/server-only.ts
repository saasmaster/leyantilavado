/**
 * Sustituto de `server-only` para las pruebas.
 *
 * El paquete real no exporta nada: su único trabajo es hacer fallar el build
 * de Next si un módulo de servidor se importa desde un componente de cliente.
 * Esa protección sigue intacta en el build; aquí sólo se le da algo que
 * resolver a vitest, que no la necesita.
 */
export {};
