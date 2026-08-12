import type { Metadata } from 'next';
import Link from 'next/link';
import { VERSION_LEGAL, datos, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { AvisoIndependencia, Insignia, Nota, TablaEnvoltura } from '@leyantilavado/ui';
import { construirMetadata, jsonLdMigaDePan } from '@/lib/sitio';
import { EncabezadoPagina, REVISION_VIGENTE, NIVELES_VERIFICACION } from '@/components/inicio/comun';

const MIGA = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Metodología editorial', ruta: '/metodologia-editorial' },
];

export const metadata: Metadata = construirMetadata({
  titulo: 'Metodología editorial',
  descripcion:
    'Cómo verificamos cada dato de la LFPIORPI: los cuatro niveles de verificación, qué significa "Requiere revisión editorial", cómo versionamos las reglas y por qué no publicamos interpretaciones automáticas.',
  ruta: '/metodologia-editorial',
});

const TONO_NIVEL = {
  oficial_verificado: 'verde',
  oficial_no_accesible: 'ambar',
  fuente_secundaria: 'ambar',
  no_verificado: 'rojo',
} as const;

export default function MetodologiaEditorial() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdMigaDePan(MIGA)) }}
      />

      <EncabezadoPagina
        miga={MIGA}
        titulo="Cómo verificamos cada dato antes de publicarlo"
        entradilla="Un umbral mal publicado no es un error de redacción: es una multa ajena. Éste es el proceso completo, incluido lo que hacemos cuando el proceso falla."
        actualizado={formatearFechaLarga(REVISION_VIGENTE)}
      />

      <div className="contenedor-app py-12 md:py-16">
        <div className="prosa">
          <h2>1. De dónde puede salir un dato</h2>
          <p>
            Sólo publicamos cifras que provienen de una de las{' '}
            <Link href="/fuentes-oficiales">{datos.FUENTES.length} fuentes oficiales</Link> que
            listamos: el texto vigente de la ley compilado por la Cámara de Diputados, las
            publicaciones del Diario Oficial de la Federación, las tablas y el portal del SAT, y
            los valores de la UMA del INEGI.
          </p>
          <p>
            Las publicaciones de despachos y los portales comerciales se usan como pista para
            buscar, nunca como fuente. Si un dato sólo existe en un blog, no es un dato: es un
            rumor bien redactado.
          </p>

          <h2>2. Los cuatro niveles de verificación</h2>
          <p>
            Cada regla del motor arrastra un nivel de verificación. No es una etiqueta decorativa:
            determina si la cifra puede publicarse, con qué advertencia y si puede alimentar una
            conclusión.
          </p>
        </div>

        <TablaEnvoltura className="mt-6 bg-[var(--color-superficie)]">
          <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              Los cuatro niveles de verificación y qué hacemos con cada uno.
            </caption>
            <thead>
              <tr className="border-b border-[var(--color-borde)] bg-[var(--color-marfil-hondo)]">
                <th scope="col" className="px-4 py-3 font-semibold">
                  Nivel
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Qué significa
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Qué hacemos con él
                </th>
              </tr>
            </thead>
            <tbody>
              {NIVELES_VERIFICACION.map((n) => (
                <tr key={n.nivel} className="border-b border-[var(--color-borde)] last:border-b-0">
                  <th scope="row" className="px-4 py-4 align-top">
                    <Insignia tono={TONO_NIVEL[n.nivel]}>{n.etiqueta}</Insignia>
                  </th>
                  <td className="px-4 py-4 align-top text-[var(--color-tinta-suave)]">
                    {n.explicacion}
                  </td>
                  <td className="px-4 py-4 align-top text-[var(--color-tinta-suave)]">
                    {n.queHacemos}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablaEnvoltura>

        <div className="prosa mt-12">
          <h2>3. Qué significa exactamente “Requiere revisión editorial”</h2>
          <p>
            Es el nivel más bajo y la razón por la que existe la etiqueta. Aparece cuando la
            norma menciona un supuesto pero la autoridad no ha publicado su umbral, cuando dos
            fuentes oficiales se contradicen, o cuando el dato sólo aparece en fuentes
            secundarias.
          </p>
          <p>
            En ese caso <strong>no inventamos la cifra y tampoco la escondemos</strong>: la
            interfaz muestra el hueco en rojo y explica qué falta. Hoy hay{' '}
            {datos.ACTIVIDADES.length - datos.ACTIVIDADES_PUBLICABLES.length} apartados del
            artículo 17 en esa situación, y una obligación completa —los avisos de 24 horas— cuya
            fecha de exigibilidad depende de una resolución que aún no se publica.
          </p>
          <p>
            Un hueco declarado es información útil: te dice que ahí necesitas asesoría, no que
            ahí no hay nada.
          </p>

          <h2>4. Cómo se versionan las reglas</h2>
          <p>
            <strong>Una regla histórica nunca se sobreescribe.</strong> Cuando un umbral cambia,
            no editamos la fila existente: cerramos su vigencia en la fecha en que dejó de
            aplicar y damos de alta otra regla con su propia vigencia.
          </p>
          <p>
            La consecuencia es la que importa: una operación de 2024 se sigue midiendo con la
            regla y la UMA de 2024, que es exactamente lo que revisaría un verificador. Un sitio
            que sólo guarda “el umbral actual” no puede responder por el pasado, y el pasado es
            justo lo que se audita.
          </p>
          <p>
            El corpus completo lleva un número de versión —hoy{' '}
            <strong>{VERSION_LEGAL}</strong>— que queda registrado en cada resultado de
            herramienta. Si mañana cambia una regla, el resultado que guardaste sigue diciendo con
            qué versión se calculó.
          </p>

          <h2>5. Fechas: nominales, sin recorrer</h2>
          <p>
            Las fechas límite se publican como fecha nominal. No las movemos por fines de semana
            ni por días inhábiles: hacerlo sin una regla oficial registrada sería inventar
            derecho. Cuando la fecha nominal cae en sábado o domingo, lo advertimos y te decimos
            que lo confirmes contra el calendario oficial.
          </p>
          <p>
            Lo mismo aplica a los plazos que la norma expresa en meses y no como fecha de
            calendario. Los calculamos para que puedas planear, pero van marcados como{' '}
            <strong>fecha estimada</strong> y nunca como texto legal.
          </p>

          <h2>6. Compromiso: cero interpretaciones automáticas</h2>
          <p>
            Ninguna herramienta de este sitio emite una conclusión jurídica cerrada. Cuando la
            regla aplicable depende de un supuesto que no podemos resolver con los datos
            capturados, el resultado es “este caso requiere revisión profesional”, con el listado
            de qué falta saber.
          </p>
          <p>Tres cosas que este sitio no dirá nunca:</p>
          <ul>
            <li>Que cumples, que estás en regla o que no tienes obligaciones.</li>
            <li>Que un cálculo nuestro sustituye a un aviso, a un expediente o a un dictamen.</li>
            <li>Que algo está “certificado por LeyAntilavado.org”.</li>
          </ul>

          <h2>7. Correcciones</h2>
          <p>
            Si encuentras una cifra equivocada, escríbenos con la fuente oficial que la
            contradice. Corregimos el dato, actualizamos la fecha de revisión de la regla y, si el
            error afectó una conclusión publicada, lo dejamos anotado en la bitácora de{' '}
            <Link href="/actualizaciones">actualizaciones</Link> en vez de borrarlo en silencio.
          </p>
        </div>

        <Nota tono="info" titulo="Quién firma lo que publicamos" className="mt-10">
          <p>
            Las revisiones se firman como <strong>Equipo editorial de LeyAntilavado.org</strong>.
            Cada regla del motor guarda además su nivel de verificación y la fecha en que se
            contrastó, y eso es lo que aparece en el sello de procedencia de cada conclusión.
          </p>
        </Nota>

        <AvisoIndependencia className="mt-8" />
      </div>
    </>
  );
}
