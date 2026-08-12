import { headers } from 'next/headers';

/**
 * Fecha "de hoy" en formato YYYY-MM-DD.
 *
 * El motor jurídico NUNCA llama al reloj: la fecha entra como parámetro. Esta
 * función es el único lugar del área privada que lo consulta, y se llama desde
 * el servidor (nunca durante el render de un componente cliente, que rompería
 * la regla `react-hooks/purity`).
 *
 * `headers()` fuerza el render dinámico: sin eso Next podría cachear la página
 * con la fecha del build y mostrar un calendario congelado.
 */
export async function fechaDeHoy(): Promise<string> {
  await headers();
  return new Date().toISOString().slice(0, 10);
}
