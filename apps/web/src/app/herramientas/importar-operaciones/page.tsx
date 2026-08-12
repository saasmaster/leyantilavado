import type { Metadata } from 'next';
import { construirMetadata } from '@/lib/sitio';
import { MarcoHerramienta } from '@/components/herramientas/MarcoHerramienta';
import { Importador } from './Importador';

export const metadata: Metadata = construirMetadata({
  titulo: 'Importador de operaciones desde CSV',
  descripcion:
    'Sube tus operaciones en CSV, valida cada fila con el número de línea del error y evalúa las válidas contra los umbrales del artículo 17 y el límite de efectivo del artículo 32.',
  ruta: '/herramientas/importar-operaciones',
});

export default function Pagina() {
  return (
    <MarcoHerramienta
      slug="importar-operaciones"
      titulo="Importador de operaciones"
      entradilla="Pasa el mes completo de una sola vez. Cada fila se valida por separado, los errores se reportan con su número de línea y lo válido se evalúa con el mismo motor de las calculadoras."
      actualizadoEn="2026-08-11"
      tambienVer={['acumulacion-operaciones', 'calculadora-umbrales']}
      lecturas={[
        { href: '/umbrales', etiqueta: 'Tabla de umbrales por actividad' },
        {
          href: '/obligaciones/mecanismos-automatizados',
          etiqueta: 'Qué exige un mecanismo automatizado',
        },
        { href: '/obligaciones/avisos', etiqueta: 'Cómo se presentan los avisos' },
      ]}
      introduccion={
        <>
          <p>
            Revisar operación por operación funciona hasta que son doscientas al mes. Este
            importador toma un CSV exportado de tu sistema de facturación o de tu hoja de control y
            evalúa todo de golpe: qué alcanza el umbral de identificación, qué llega al de aviso y
            qué rebasa el límite de efectivo.
          </p>
          <p>
            La parte útil no es sólo lo que evalúa: es lo que <strong>rechaza</strong>. Cada fila con
            problemas se reporta con su número de línea y el motivo concreto —fecha inválida, clave
            de actividad desconocida, inciso faltante, monto que no es un número— para que corrijas
            el archivo en lugar de adivinar por qué el total no cuadra.
          </p>
          <p>
            Todo ocurre en tu navegador. El archivo no se sube a ningún servidor, y los resultados
            desaparecen al cerrar la pestaña salvo que los descargues.
          </p>
        </>
      }
      comoCalcula={
        <>
          <p>
            <strong>Lectura.</strong> Se acepta coma o punto y coma como separador, comillas dobles
            para campos con comas, y encabezado opcional: si la primera celda no parece una fecha, se
            asume que es un encabezado y se salta.
          </p>
          <p>
            <strong>Validación por fila.</strong> Se revisa que la fecha sea válida y tenga UMA
            registrada, que la clave de actividad exista, que se haya enviado el inciso cuando la
            actividad lo exige, y que los montos sean cifras en pesos. Una fila con cualquier
            problema no se evalúa: se reporta.
          </p>
          <p>
            <strong>Evaluación.</strong> Cada fila válida pasa por el mismo motor que la calculadora
            individual: umbral de identificación, umbral de aviso con la UMA de la fecha de{' '}
            <em>esa</em> operación, y límite de efectivo del artículo 32 si capturaste una parte en
            efectivo.
          </p>
          <p>
            <strong>Lo que no hace.</strong> No acumula. Cada fila se mide por separado porque el
            formato no trae identificador de cliente. Si tus clientes repiten, la acumulación de seis
            meses puede disparar avisos que aquí no salen, y para eso está la herramienta de
            acumulación.
          </p>
        </>
      }
      ejemplo={
        <>
          <p>
            <strong>Notaría que sube el mes de julio con 84 operaciones.</strong> El resultado:
          </p>
          <ul>
            <li>
              <strong>79 filas válidas.</strong> De ellas, 31 marcadas como aviso probable —casi
              todas constituciones de personas morales, que generan aviso sin umbral desde la reforma
              de julio de 2025—, 44 como identificación y 4 sin obligación aparente.
            </li>
            <li>
              <strong>5 filas rechazadas:</strong> tres con fecha en formato 15/07/2026 en lugar de
              2026-07-15, y dos de fe pública sin la columna de subtipo, donde el motor no puede
              elegir entre inmuebles, fideicomisos o mutuo sin adivinar.
            </li>
          </ul>
          <p>
            El hallazgo interesante suele ser el mismo: las constituciones de personas morales. Antes
            de la reforma tenían umbral de 8,000 UMA y muchas escrituras de capital pequeño no
            generaban aviso. Ahora generan aviso <strong>siempre</strong>, y una notaría que siga
            filtrando por monto está omitiendo la mayor parte de sus avisos sin saberlo.
          </p>
        </>
      }
      faq={[
        {
          pregunta: '¿Se sube mi archivo a algún servidor?',
          respuesta:
            'No. El archivo se lee con las APIs del navegador y todo el procesamiento ocurre en tu equipo. No hay ninguna llamada de red en el proceso, y los resultados se pierden al cerrar la pestaña si no los descargas.',
        },
        {
          pregunta: '¿Qué formato de fecha acepta?',
          respuesta:
            'AAAA-MM-DD, por ejemplo 2026-07-15. Es el formato que evita la ambigüedad entre día y mes. Si tu sistema exporta en otro formato, conviértelo antes: preferimos rechazar la fila a interpretar 05/07 como el 5 de julio o el 7 de mayo.',
        },
        {
          pregunta: '¿De dónde saco las claves de actividad?',
          respuesta:
            'De la plantilla de ejemplo que puedes descargar, y de la página de actividades vulnerables. Son claves estables tipo vehiculos, metales-joyeria o fe-publica-notarios. Si escribes una que no existe, la fila se rechaza con ese motivo.',
        },
        {
          pregunta: '¿Por qué me pide subtipo en algunas filas?',
          respuesta:
            'Porque en fe pública, servicios profesionales, comercio exterior y activos virtuales la regla cambia por inciso. Sin ese dato el motor no tiene una regla única que aplicar, y elegir una al azar produciría un resultado con apariencia de certeza.',
        },
        {
          pregunta: '¿El resultado considera la acumulación de seis meses?',
          respuesta:
            'No, y lo advertimos en el resultado. El formato no trae identificador de cliente, así que cada fila se mide sola. Para la regla antifraccionamiento usa la herramienta de acumulación, donde las operaciones se agrupan por cliente.',
        },
      ]}
    >
      <Importador />
    </MarcoHerramienta>
  );
}
