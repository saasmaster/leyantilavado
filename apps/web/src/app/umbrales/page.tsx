import type { Metadata } from 'next';
import Link from 'next/link';
import { ANIOS_UMA_DISPONIBLES, datos } from '@leyantilavado/rules-engine';
import { CIFRAS, ETIQUETA_UMBRALES } from '@/content/cifras';
import { formatearMXN } from '@leyantilavado/types';
import { Nota, SelloProcedencia, TablaEnvoltura } from '@leyantilavado/ui';
import {
  AvisoLegal,
  CabeceraArticulo,
  EnlacesRelacionados,
  FirmaEditorial,
  IndiceContenidos,
  JsonLd,
  Migas,
  PreguntasFrecuentes,
  Seccion,
  TablaUmbrales,
} from '@/components/contenido';
import { jsonLdArticulo, jsonLdConjuntoDatos } from '@/components/contenido/JsonLd';
import { REVISION_VIGENTE } from '@/content/autores';
import { VERSION_LEGAL } from '@leyantilavado/rules-engine';
import { construirMetadata, jsonLdFAQ, jsonLdMigaDePan } from '@/lib/sitio';

const RUTA = '/umbrales';
const ANIO_MAS_RECIENTE = ANIOS_UMA_DISPONIBLES[0] ?? 2026;
const ANIO_MAS_ANTIGUO = ANIOS_UMA_DISPONIBLES[ANIOS_UMA_DISPONIBLES.length - 1] ?? 2016;

export const metadata: Metadata = construirMetadata({
  titulo: `Umbrales de la Ley Antilavado en UMA y pesos ${ANIO_MAS_RECIENTE}`,
  descripcion: `Las ${datos.UMBRALES.length} reglas de umbral del art. 17, con identificación y aviso por actividad, conversión a pesos y el comparador exacto que usa la ley.`,
  ruta: RUTA,
  tipo: 'article',
  publicadoEn: REVISION_VIGENTE,
  actualizadoEn: REVISION_VIGENTE,
});

const INDICE = [
  { id: 'tabla', titulo: 'Tabla completa de umbrales' },
  { id: 'identificacion-vs-aviso', titulo: 'Identificación frente a aviso' },
  { id: 'uma', titulo: 'Cómo se convierte de UMA a pesos' },
  { id: 'historico', titulo: 'Serie histórica de la UMA' },
  { id: 'preguntas', titulo: 'Preguntas frecuentes' },
];

const FAQ = [
  {
    pregunta: '¿Cuál es la diferencia entre umbral de identificación y umbral de aviso?',
    respuesta:
      'El de identificación marca desde cuándo hay que identificar al cliente e integrar su expediente. El de aviso marca desde cuándo, además, hay que reportar la operación en el portal. El de identificación siempre es igual o más bajo, y es el que más se pasa por alto.',
  },
  {
    pregunta: '¿Los umbrales se calculan con IVA o sin IVA?',
    respuesta:
      'Los umbrales de identificación y aviso del art. 17 se miden sobre el valor del acto sin IVA. El límite al uso de efectivo del art. 32 se mide con IVA incluido. Es la misma operación comparada contra dos bases distintas.',
  },
  {
    pregunta: '¿Qué UMA aplico a una operación de enero?',
    respuesta:
      'La del año anterior. El nuevo valor de la UMA entra en vigor el 1 de febrero de cada año, así que una operación de enero se mide con la UMA del ejercicio previo. Por eso esta tabla tiene selector de año y el motor resuelve la UMA por fecha de operación, no por año en curso.',
  },
  {
    pregunta: '¿Por qué algunas filas dicen "siempre" en lugar de una cifra?',
    respuesta:
      'Porque la ley no fijó monto para ese supuesto: la obligación nace con independencia del valor de la operación. Convertir esos casos en un número sería inventar una regla que no existe.',
  },
  {
    pregunta: '¿Por qué hay filas sin umbral publicado?',
    respuesta:
      'Porque la ley enuncia el supuesto pero la autoridad no ha publicado la cifra correspondiente, y la tabla oficial del SAT no la incluye. Preferimos mostrar el hueco a copiar un número de otra fracción.',
  },
  {
    pregunta: '¿El umbral aplica por operación o por cliente?',
    respuesta:
      'Por operación, con la periodicidad propia de cada fracción. Pero además existe la regla de acumulación del último párrafo del art. 17, que suma las operaciones del mismo cliente por el mismo tipo de acto dentro de una ventana de seis meses.',
  },
  {
    pregunta: '¿Qué significa que una regla diga "superior a" y otra "igual o superior a"?',
    respuesta:
      'Que en el borde exacto el resultado cambia. Con "superior a", un monto idéntico al umbral no alcanza la obligación; con "igual o superior a", sí. Guardamos el comparador de cada regla precisamente porque ahí es donde más se necesita certeza.',
  },
];

export default function PaginaUmbrales() {
  const migas = [
    { nombre: 'Inicio', ruta: '/' },
    { nombre: 'Umbrales', ruta: RUTA },
  ];

  const umas = [...datos.VALORES_UMA].sort((a, b) => b.anio - a.anio);
  const reglaEjemploProcedencia = datos.UMBRALES[0]?.procedencia;

  return (
    <div className="contenedor-app py-12 md:py-16">
      <JsonLd datos={jsonLdMigaDePan(migas)} />
      <JsonLd
        datos={jsonLdArticulo({
          titulo: 'Umbrales de identificación y aviso de la LFPIORPI',
          descripcion:
            'Tabla completa de umbrales por actividad vulnerable, en UMA y en pesos, con selector de año.',
          ruta: RUTA,
          publicadoEn: REVISION_VIGENTE,
          actualizadoEn: REVISION_VIGENTE,
          seccion: 'Umbrales',
        })}
      />
      <JsonLd
        datos={jsonLdConjuntoDatos({
          nombre: 'Umbrales de identificación y aviso del artículo 17 de la LFPIORPI',
          descripcion: `Conjunto de ${datos.UMBRALES.length} reglas de umbral por actividad vulnerable, con su comparador, periodicidad y regla de acumulación, convertibles a pesos con los valores de la UMA de ${ANIO_MAS_ANTIGUO} a ${ANIO_MAS_RECIENTE}.`,
          ruta: RUTA,
          actualizadoEn: REVISION_VIGENTE,
          publicadoEn: REVISION_VIGENTE,
          version: VERSION_LEGAL,
          cobertura: `${ANIO_MAS_ANTIGUO}/${ANIO_MAS_RECIENTE}`,
          variables: [
            'Umbral de identificación en UMA por actividad vulnerable',
            'Umbral de aviso en UMA por actividad vulnerable',
            'Equivalente en pesos mexicanos según el año de la UMA',
            'Comparador aplicable (superior a / igual o superior a)',
            'Periodicidad y regla de acumulación',
            'Disposición legal y nivel de verificación de cada regla',
          ],
          descargas: [
            { url: '/datos/umbrales.csv', formato: 'text/csv' },
            { url: '/datos/umbrales.json', formato: 'application/json' },
          ],
        })}
      />
      <JsonLd datos={jsonLdFAQ(FAQ)} />

      <Migas items={migas} />

      <CabeceraArticulo
        titulo="Umbrales de la Ley Antilavado, actividad por actividad"
        etiquetas={[
          { texto: ETIQUETA_UMBRALES, tono: 'marino' },
          { texto: `UMA ${ANIO_MAS_ANTIGUO}-${ANIO_MAS_RECIENTE}`, tono: 'petroleo' },
          { texto: `Vigente al ${REVISION_VIGENTE}`, tono: 'neutro' },
        ]}
        respuestaDirecta="Cada actividad vulnerable tiene dos umbrales: uno de identificación y otro de aviso, expresados en veces el valor diario de la UMA. Esta tabla los muestra todos, los convierte a pesos con la UMA del año que elijas y conserva el detalle que las tablas estáticas pierden: el comparador exacto, la periodicidad y los supuestos de las reglas que no son un número."
        entradilla="Es la tabla que usamos internamente para alimentar las calculadoras del sitio. No hay dos versiones: lo que ves aquí es lo que calcula el motor."
      />

      <IndiceContenidos entradas={INDICE} />

      <Seccion
        id="tabla"
        titulo="Tabla completa de umbrales"
        descripcion="Cambia el año para recalcular todo con la UMA vigente en ese ejercicio, filtra por actividad o busca por fracción."
      >
        <TablaUmbrales reglas={datos.UMBRALES} actividades={datos.ACTIVIDADES} />
      </Seccion>

      <Seccion
        id="identificacion-vs-aviso"
        titulo="Identificación frente a aviso"
        descripcion="Dos obligaciones distintas que se disparan en momentos distintos."
      >
        <div className="prosa text-[var(--color-tinta-suave)]">
          <p>
            El umbral de identificación marca desde cuándo tienes que conocer a tu cliente,
            verificar su identidad e integrar su expediente. El umbral de aviso marca desde cuándo,
            además, tienes que reportar esa operación en el portal del SAT.
          </p>
          <p>
            En varias fracciones el umbral de identificación no existe como cifra: la ley dice que
            se identifica siempre, sin importar el monto. En otras, ambos umbrales coinciden, de
            modo que toda operación que obliga a identificar obliga también a reportar.
          </p>
          <p>
            El error más caro del mercado es mirar sólo el umbral de aviso. Un negocio puede llegar
            a una visita de verificación con todos sus avisos presentados y ni un solo expediente
            integrado, y eso también es infracción.
          </p>
        </div>
      </Seccion>

      <Seccion
        id="uma"
        titulo="Cómo se convierte de UMA a pesos"
        descripcion="La aritmética es simple; lo que se equivoca es la fecha."
      >
        <div className="prosa text-[var(--color-tinta-suave)]">
          <p>
            Un umbral expresado en UMA se convierte multiplicando el número de UMA por el valor
            diario vigente en la fecha del acto u operación. La trampa está en esa última frase: no
            se usa la UMA de hoy ni la del año en curso, sino la vigente el día de la operación.
          </p>
          <p>
            Como el nuevo valor entra en vigor el 1 de febrero, todas las operaciones de enero se
            miden con la UMA del año anterior. Varias tablas publicadas en internet con el rótulo
            de un año usan el valor equivocado justo en ese mes.
          </p>
          <p>
            Nuestro motor hace la conversión en aritmética entera de centavos para que el resultado
            cuadre al centavo exacto en el borde del umbral, que es donde más importa.{' '}
            <Link href="/herramientas/calculadora-uma">Convierte cualquier cantidad</Link> con la
            UMA del año que necesites.
          </p>
        </div>
      </Seccion>

      <Seccion
        id="historico"
        titulo="Serie histórica de la UMA"
        descripcion="Valores diarios registrados en el motor, con el nivel de verificación de cada uno."
      >
        <TablaEnvoltura etiqueta="Umbrales de identificación y aviso por actividad vulnerable">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              Valor diario de la UMA por año y su vigencia.
            </caption>
            <thead className="bg-[var(--color-marfil-hondo)]">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Año
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  UMA diaria
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Vigencia
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Verificación
                </th>
              </tr>
            </thead>
            <tbody>
              {umas.map((u) => (
                <tr key={u.anio} className="border-t border-[var(--color-borde)]">
                  <th scope="row" className="cifra px-4 py-3 font-medium">
                    {u.anio}
                  </th>
                  <td className="cifra px-4 py-3">{formatearMXN(u.diariaCentavos)}</td>
                  <td className="cifra px-4 py-3 text-[var(--color-tinta-suave)]">
                    {u.vigencia.desde} a {u.vigencia.hasta ?? 'sin fecha de término'}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--color-tinta-suave)]">
                    {u.procedencia.verificacion === 'oficial_verificado'
                      ? 'Contrastado contra la publicación oficial'
                      : 'Pendiente de contraste contra la publicación oficial del año'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablaEnvoltura>

        <Nota tono="atencion" className="mt-5" titulo="Qué está y qué no está verificado">
          <p>
            Los valores de los años más antiguos provienen de reproducciones confiables que
            coinciden entre sí, pero no se han contrastado uno por uno contra la publicación
            original. Aparecen en la tabla porque son necesarios para medir operaciones de esos
            años, y aparecen marcados porque el lector merece saberlo.
          </p>
        </Nota>
      </Seccion>

      <Seccion id="preguntas" titulo="Preguntas frecuentes">
        <PreguntasFrecuentes preguntas={FAQ} id="lista-preguntas" />
      </Seccion>

      {reglaEjemploProcedencia && (
        <SelloProcedencia
          className="mt-10"
          procedencia={{
            ...reglaEjemploProcedencia,
            disposicion: 'Art. 17 LFPIORPI y tabla oficial de umbrales del SAT',
          }}
          fuentes={datos.FUENTES_POR_ID}
        />
      )}

      <EnlacesRelacionados
        grupos={[
          {
            titulo: 'Herramientas',
            enlaces: [
              { href: '/herramientas/calculadora-umbrales', etiqueta: '¿Identifico o aviso?' },
              { href: '/herramientas/calculadora-uma', etiqueta: 'Conversor UMA a pesos' },
              { href: '/herramientas/acumulacion-operaciones', etiqueta: 'Acumulación de seis meses' },
            ],
          },
          {
            titulo: 'Contenido relacionado',
            enlaces: [
              { href: '/actividades-vulnerables', etiqueta: 'Las actividades explicadas' },
              { href: '/limites-efectivo', etiqueta: 'Límites de efectivo del art. 32' },
              { href: '/multas', etiqueta: 'Infracciones y multas' },
            ],
          },
          {
            titulo: 'Mantente al día',
            enlaces: [
              { href: '/actualizaciones', etiqueta: 'Bitácora de cambios normativos' },
              { href: '/calendario-cumplimiento', etiqueta: 'Calendario de cumplimiento' },
              { href: '/glosario', etiqueta: 'Glosario' },
            ],
          },
        ]}
      />

      <FirmaEditorial />
      <AvisoLegal />
    </div>
  );
}
