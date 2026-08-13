import type { Metadata } from 'next';
import Link from 'next/link';
import { datos } from '@leyantilavado/rules-engine';
import { CIFRAS, ETIQUETA_ACTIVIDADES } from '@/content/cifras';
import type { Actividad } from '@leyantilavado/types';
import { Insignia, Nota, Tarjeta, TarjetaCuerpo } from '@leyantilavado/ui';
import {
  AvisoLegal,
  CabeceraArticulo,
  EnlacesRelacionados,
  FirmaEditorial,
  IndiceContenidos,
  JsonLd,
  Migas,
  Seccion,
  UmbralVista,
  describirUmbral,
} from '@/components/contenido';
import { REVISION_VIGENTE } from '@/content/autores';
import { CONTENIDO_ACTIVIDADES } from '@/content/actividades';
import { construirMetadata, jsonLdMigaDePan } from '@/lib/sitio';
import { FuentesPrincipales } from '@/components/contenido/FuentesPrincipales';
import { jsonLdArticulo } from '@/components/contenido/JsonLd';

const RUTA = '/actividades-vulnerables';

/** Fracciones "raíz" del art. 17: II a), II b) y II c) son una sola fracción. */
const FRACCIONES_RAIZ = new Set(datos.ACTIVIDADES.map((a) => a.fraccion.split(' ')[0]));

export const metadata: Metadata = construirMetadata({
  titulo: `Actividades vulnerables: las ${FRACCIONES_RAIZ.size} fracciones del art. 17`,
  descripcion: `Los ${datos.ACTIVIDADES.length} supuestos del art. 17 con su umbral de identificación y de aviso, a quién alcanza cada uno y qué obligaciones genera.`,
  ruta: RUTA,
  tipo: 'article',
  publicadoEn: REVISION_VIGENTE,
  actualizadoEn: REVISION_VIGENTE,
});

const INDICE = [
  { id: 'que-es', titulo: 'Qué es una actividad vulnerable' },
  { id: 'catalogo', titulo: 'Catálogo completo' },
  { id: 'como-leerlo', titulo: 'Cómo leer los umbrales' },
  { id: 'acumulacion', titulo: 'La regla que aplica a todas' },
];

function ResumenUmbral({ actividad }: { actividad: Actividad }) {
  const reglas = datos.UMBRALES.filter((r) => r.actividad === actividad.slug);

  if (reglas.length === 0) {
    return (
      <p className="text-sm text-[var(--color-tinta-tenue)]">
        Sin regla registrada para esta actividad.
      </p>
    );
  }

  if (reglas.length > 1) {
    return (
      <p className="text-sm text-[var(--color-tinta-suave)]">
        <span className="font-medium text-[var(--color-tinta)]">
          {reglas.length} supuestos con regla propia.
        </span>{' '}
        No se pueden reducir a un solo número: cada inciso se mide por separado.
      </p>
    );
  }

  const regla = reglas[0]!;
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-tinta-tenue)]">
          Identificación
        </dt>
        <dd className="mt-1">
          <UmbralVista vista={describirUmbral(regla.identificacion, REVISION_VIGENTE)} compacto />
        </dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-tinta-tenue)]">
          Aviso
        </dt>
        <dd className="mt-1">
          <UmbralVista vista={describirUmbral(regla.aviso, REVISION_VIGENTE)} compacto />
        </dd>
      </div>
    </dl>
  );
}

export default function PaginaActividades() {
  const migas = [
    { nombre: 'Inicio', ruta: '/' },
    { nombre: 'Actividades vulnerables', ruta: RUTA },
  ];

  const sinUmbralPublicado = datos.ACTIVIDADES.filter(
    (a) => a.procedencia.verificacion === 'no_verificado',
  );

  return (
    <div className="contenedor-app py-12 md:py-16">
      <JsonLd datos={jsonLdMigaDePan(migas)} />
      <JsonLd
        datos={jsonLdArticulo({
          titulo: 'Actividades vulnerables del artículo 17 de la LFPIORPI',
          descripcion:
            'Catálogo de actividades vulnerables con su umbral de identificación y de aviso.',
          ruta: RUTA,
          publicadoEn: REVISION_VIGENTE,
          actualizadoEn: REVISION_VIGENTE,
          seccion: 'Actividades vulnerables',
        })}
      />

      <Migas items={migas} />

      <CabeceraArticulo
        titulo="Actividades vulnerables: el catálogo completo del artículo 17"
        etiquetas={[
          { texto: `${FRACCIONES_RAIZ.size} fracciones`, tono: 'marino' },
          { texto: ETIQUETA_ACTIVIDADES, tono: 'petroleo' },
          { texto: `Vigente al ${REVISION_VIGENTE}`, tono: 'neutro' },
        ]}
        respuestaDirecta={`El artículo 17 de la Ley Antilavado lista ${CIFRAS.fracciones} fracciones de actividades vulnerables. Como varias se desdoblan en incisos y apartados con reglas propias, en la práctica hay ${CIFRAS.supuestos} supuestos distintos, de los cuales ${CIFRAS.supuestosVerificados} tienen umbral verificado contra fuente oficial y ${CIFRAS.supuestosPendientes} existen en la ley sin cifra publicada por la autoridad. Por eso cada uno tiene su propia página en lugar de una tabla que los aplane a un solo número.`}
      />

      <IndiceContenidos entradas={INDICE} />

      <Seccion
        id="que-es"
        titulo="Qué es una actividad vulnerable"
        descripcion="Una clasificación de riesgo del sector, no una sospecha sobre tu negocio."
      >
        <div className="prosa text-[var(--color-tinta-suave)]">
          <p>
            Una actividad vulnerable es una actividad económica perfectamente lícita que la ley
            lista porque, por su naturaleza, puede usarse para introducir recursos de origen
            ilícito en la economía formal. Realizarla no te convierte en sospechoso: te convierte
            en sujeto obligado.
          </p>
          <p>
            Ser sujeto obligado significa cuatro cosas: darte de alta en el padrón del SAT,
            identificar a tus clientes e integrar su expediente, presentar avisos cuando una
            operación alcanza el umbral y conservar toda esa información por diez años. La
            obligación nace de la actividad, no del tamaño del negocio ni del régimen fiscal.
          </p>
          <p>
            Cada fracción tiene dos umbrales que no hay que confundir. El{' '}
            <Link href="/glosario#umbral-de-identificacion">umbral de identificación</Link> marca
            desde cuándo hay que integrar expediente, y el{' '}
            <Link href="/glosario#umbral-de-aviso">umbral de aviso</Link> marca desde cuándo hay
            que reportar. El primero es más bajo y es el que más se pasa por alto.
          </p>
        </div>
      </Seccion>

      <Seccion
        id="catalogo"
        titulo="Catálogo completo"
        descripcion="Cada tarjeta lleva su fracción, a quién alcanza y el umbral resumido con la UMA vigente a la fecha de revisión."
      >
        <ul className="grid gap-5 md:grid-cols-2">
          {datos.ACTIVIDADES.map((a) => {
            const contenido = CONTENIDO_ACTIVIDADES[a.slug];
            const pendiente = a.procedencia.verificacion === 'no_verificado';
            return (
              <li key={a.slug}>
                <Tarjeta className="h-full">
                  <TarjetaCuerpo className="flex h-full flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Insignia tono="marino">Fracción {a.fraccion}</Insignia>
                      {pendiente && <Insignia tono="ambar">Sin umbral publicado</Insignia>}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">
                        <Link
                          href={`${RUTA}/${a.slug}`}
                          className="underline decoration-transparent underline-offset-4 transition-colors hover:decoration-[var(--color-petroleo)]"
                        >
                          {a.nombre}
                        </Link>
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                        {contenido?.respuestaDirecta ?? a.descripcion}
                      </p>
                    </div>

                    <ResumenUmbral actividad={a} />

                    <div className="mt-auto">
                      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-tinta-tenue)]">
                        A quién alcanza
                      </p>
                      <ul className="mt-1 flex flex-wrap gap-1.5">
                        {a.ejemplosSujetos.slice(0, 3).map((e) => (
                          <li key={e}>
                            <Insignia tono="neutro">{e}</Insignia>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3">
                        <Link
                          href={`${RUTA}/${a.slug}`}
                          className="text-sm font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-2"
                        >
                          Ver la fracción completa
                        </Link>
                      </p>
                    </div>
                  </TarjetaCuerpo>
                </Tarjeta>
              </li>
            );
          })}
        </ul>
      </Seccion>

      <Seccion
        id="como-leerlo"
        titulo="Cómo leer los umbrales"
        descripcion="Seis formas distintas de expresar una obligación, y ninguna se puede aplanar a las demás."
      >
        <div className="prosa text-[var(--color-tinta-suave)]">
          <p>
            En este sitio un umbral puede tomar seis formas: una cifra en UMA, la palabra{' '}
            <strong>siempre</strong> cuando la obligación no depende del monto, la palabra{' '}
            <strong>no aplica</strong> cuando el supuesto no genera esa obligación, dos
            disparadores independientes que basta con que uno se alcance, un conjunto de{' '}
            <strong>supuestos</strong> con reglas distintas, y{' '}
            <strong>sin umbral publicado</strong> cuando la autoridad no ha fijado una cifra.
          </p>
          <p>
            Ese último caso existe de verdad y afecta a{' '}
            {sinUmbralPublicado.length === 1 ? 'una actividad' : `${sinUmbralPublicado.length} actividades`}:{' '}
            {sinUmbralPublicado.map((a) => a.nombreCorto).join(' y ')}. Ahí no publicamos ninguna
            cifra porque no existe una fuente oficial que la respalde.
          </p>
        </div>

        <Nota tono="atencion" className="mt-5" titulo="Cuidado con las tablas de un solo número">
          <p>
            Los notarios no tienen &ldquo;un umbral&rdquo;: tienen cinco incisos, tres de ellos sin
            cifra. El comercio exterior no tiene &ldquo;un umbral&rdquo;: tiene seis incisos, cuatro
            de ellos sin cifra. Cualquier tabla que resuma esas fracciones en una sola casilla está
            perdiendo información que decide si hay obligación o no.
          </p>
        </Nota>
      </Seccion>

      <Seccion
        id="acumulacion"
        titulo="La regla que aplica a todas las fracciones"
        descripcion="El último párrafo del art. 17: acumulación en una ventana de seis meses."
      >
        <div className="prosa text-[var(--color-tinta-suave)]">
          <p>
            Los actos por montos inferiores al umbral no generan obligación por sí solos. Pero si
            una persona realiza operaciones que, sumadas en un periodo de seis meses, superan el
            monto de aviso de su supuesto, la operación puede quedar sujeta a la obligación de
            avisar. Es el mecanismo antifraccionamiento y aplica a todas las fracciones.
          </p>
          <p>
            El Reglamento precisa que el aviso se presenta en el momento de la operación con la que
            se alcanza el umbral, sin esperar a que se agoten los seis meses. En la práctica, esto
            obliga a tener una base consolidada por cliente: revisar tickets a mano no escala.
          </p>
          <p>
            <Link href="/herramientas/acumulacion-operaciones">
              Calcula la acumulación de un cliente
            </Link>{' '}
            o revisa la{' '}
            <Link href="/umbrales">tabla completa de umbrales</Link> con el año de UMA que
            necesites.
          </p>
        </div>
      </Seccion>

      <EnlacesRelacionados
        grupos={[
          {
            titulo: 'Herramientas',
            enlaces: [
              { href: '/herramientas/cuestionario', etiqueta: '¿Me aplica la ley?', descripcion: 'Diagnóstico guiado' },
              { href: '/herramientas/calculadora-umbrales', etiqueta: 'Calculadora de umbrales' },
              { href: '/herramientas/acumulacion-operaciones', etiqueta: 'Acumulación de seis meses' },
            ],
          },
          {
            titulo: 'Contenido relacionado',
            enlaces: [
              { href: '/umbrales', etiqueta: 'Tabla completa de umbrales' },
              { href: '/obligaciones', etiqueta: 'Todas las obligaciones' },
              { href: '/limites-efectivo', etiqueta: 'Límites de efectivo del art. 32' },
            ],
          },
          {
            titulo: 'La reforma',
            enlaces: [
              { href: '/reforma-ley-antilavado-2026', etiqueta: 'Qué cambió en 2025 y 2026' },
              { href: '/calendario-cumplimiento', etiqueta: 'Calendario de fechas exigibles' },
              { href: '/glosario', etiqueta: 'Glosario de términos' },
            ],
          },
        ]}
      />

      <FirmaEditorial />
      <AvisoLegal />
      <FuentesPrincipales className="mt-4" />

    </div>
  );
}
