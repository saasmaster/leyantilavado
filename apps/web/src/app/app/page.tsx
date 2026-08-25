import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { AvisoIndependencia, Nota, Tarjeta, TarjetaCuerpo } from '@leyantilavado/ui';
import { SITIO, construirMetadata, jsonLdMigaDePan, jsonParaScript } from '@/lib/sitio';
import { EncabezadoPagina } from '@/components/inicio/comun';
import { BotonGooglePlay } from '@/components/app/BotonGooglePlay';
import { CapturaApp } from '@/components/app/CapturaApp';
import { VitrinaApp } from '@/components/app/VitrinaApp';
import capturaInicio from '../../../public/img/app/inicio.webp';
import capturaEvaluar from '../../../public/img/app/evaluar.webp';
import capturaCalculadora from '../../../public/img/app/calculadora.webp';
import capturaOperaciones from '../../../public/img/app/operaciones.webp';
import {
  APP,
  DESLINDE,
  FRENTE_A_LA_EXTENSION,
  FUNCIONES,
  PRIVACIDAD,
  QUE_RESPONDE,
  URL_PLAY,
} from '@/content/app';

const MIGA = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'App para Android', ruta: '/app' },
];

/**
 * Landing de la app Android.
 *
 * ── Por qué la ruta es exactamente `/app` ──────────────────────────────────
 *
 * No es una elección estética. El manifiesto de la app declara App Links
 * verificados con `pathPrefix="/app"`, así que esta ruta y sus hijas son el
 * espacio de nombres de sus enlaces profundos. Moverla rompería los enlaces de
 * una app ya publicada, que no se puede corregir a posteriori en los teléfonos
 * que ya la tienen instalada.
 *
 * Consecuencia buscada: quien ya tiene la app y abre `leyantilavado.org/app`
 * aterriza en la app, no en esta página. Para quien no la tiene —y para
 * cualquiera que comparta el enlace— esta página es el destino.
 *
 * Para que esa verificación funcione, el sitio sirve
 * `/.well-known/assetlinks.json`. Sin ese archivo Android no verifica nada y
 * los enlaces se abren en el navegador, en silencio.
 */

export const metadata: Metadata = construirMetadata({
  titulo: 'Ley AntiLavado MX: la app para Android',
  descripcion:
    'Registra operaciones, evalúalas con el umbral que les toca por su fecha y recibe aviso de lo que vence. Mismo motor jurídico que el sitio, y todo cifrado en tu teléfono.',
  ruta: '/app',
});

const JSON_LD_APP = {
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  name: APP.nombre,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Android',
  url: `${SITIO.url}/app`,
  downloadUrl: URL_PLAY,
  description: APP.entradilla,
  inLanguage: 'es-MX',
  // Gratis de instalar. La app incluye funciones de pago, así que decirla
  // «gratuita» a secas sería inexacto; `Offer` con precio 0 describe la
  // descarga, que es lo que este marcado anuncia.
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'MXN' },
  publisher: { '@id': `${SITIO.url}/#organizacion` },
  privacyPolicy: `${SITIO.url}/legal/privacidad-app`,
};

export default function PaginaApp() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonParaScript(jsonLdMigaDePan(MIGA)) }}
      />
      {URL_PLAY ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonParaScript(JSON_LD_APP) }}
        />
      ) : null}

      <EncabezadoPagina
        miga={MIGA}
        titulo={`${APP.nombre}: ${APP.tagline}`}
        subtitulo="App para Android"
        entradilla={APP.entradilla}
      />

      <div className="contenedor-app pb-16">
        {/*
          * Vitrina: el teléfono manda, y la descarga vive junto a él.
          *
          * El patrón de landing de app pide encabezar con el dispositivo, y
          * aquí además resuelve un problema de color: las capturas son de tema
          * oscuro y sobre el marfil del sitio flotaban como recortes.
          */}
        <VitrinaApp
          captura={capturaInicio}
          alt="Pantalla de inicio de la app con el negocio de ejemplo «Joyería La Perla», un aviso de que tres operaciones alcanzan el umbral, la próxima obligación con su fecha, y accesos rápidos para registrar, calcular umbral, verificar efectivo y ver la agenda."
        >
          <p className="text-2xl font-semibold leading-tight text-white md:text-3xl">
            Lo primero que ves es lo que vence.
          </p>
          <p className="mt-4 max-w-md leading-relaxed text-[color-mix(in_srgb,white_82%,transparent)]">
            La misma respuesta que da este sitio, pero guardando el historial: qué operaciones
            registraste, cuáles alcanzaron umbral, qué se acumula con qué y qué plazo corre.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            {URL_PLAY ? (
              <BotonGooglePlay href={URL_PLAY} />
            ) : (
              <Nota tono="atencion">Próximamente en Google Play</Nota>
            )}
            <Link
              href="/legal/privacidad-app"
              className="text-sm text-[color-mix(in_srgb,white_82%,transparent)] underline underline-offset-4"
            >
              Ver la política de privacidad
            </Link>
          </div>

          <p className="mt-6 text-sm text-[color-mix(in_srgb,white_64%,transparent)]">
            Android · gratis de instalar · funciona sin conexión y sin cuenta
          </p>
        </VitrinaApp>

        {/* ── Qué responde ─────────────────────────────────────────────── */}
        <section aria-labelledby="que-responde" className="mt-16">
          <h2 id="que-responde" className="text-2xl font-semibold text-[var(--color-tinta)]">
            Las preguntas que resuelve
          </h2>
          <p className="prosa mt-2">
            Siempre en el mismo orden: respuesta, razón, fundamento y fuente. Nunca un sí o un no
            a secas.
          </p>

          {/* Dos columnas de texto, no seis tarjetas: son preguntas, y una
              tarjeta por pregunta convierte una lista en un muro. */}
          <ul className="mt-7 grid gap-x-10 gap-y-0 md:grid-cols-2">
            {QUE_RESPONDE.map((p) => (
              <li
                key={p}
                className="flex items-start gap-3 border-b border-[var(--color-borde)] py-4 text-[var(--color-tinta-suave)]"
              >
                <span
                  aria-hidden
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--color-petroleo)]"
                />
                {p}
              </li>
            ))}
          </ul>
        </section>

        {/* ── Cómo se ve ───────────────────────────────────────────────── */}
        <section aria-labelledby="como-se-ve" className="mt-14">
          <h2 id="como-se-ve" className="text-2xl font-semibold text-[var(--color-tinta)]">
            Cómo responde
          </h2>
          <p className="prosa mt-2">
            Cada pantalla enseña el cálculo, no sólo el veredicto: el umbral que aplicó, la UMA de
            esa fecha y el artículo del que sale.
          </p>

          {/*
            * Ancho fijo por columna y no `w-full` dentro de una rejilla `auto`.
            * Esa combinación es circular —la columna se mide por su contenido y
            * el contenido pide el 100 % de la columna— y ya colapsó una captura
            * a dos píxeles en la landing de la extensión.
            */}
          <div className="mt-8 flex flex-wrap justify-center gap-8 lg:justify-start lg:gap-10">
            <CapturaApp
              imagen={capturaEvaluar}
              alt="Pantalla «Evaluar» con la pregunta «¿Qué quieres averiguar?», un acceso al cuestionario que decide si la actividad es vulnerable, y la lista de calculadoras: umbrales, acumulación de seis meses y verificador de efectivo."
              className="entra-al-ver w-[15rem] shrink-0 sm:w-[16rem]"
              pie="Empieza por la pregunta, no por el formulario."
            />
            <CapturaApp
              imagen={capturaCalculadora}
              alt="Resultado de la calculadora de umbrales: «Probablemente debes presentar aviso», con el umbral de identificación de 805 UMA, su equivalencia en pesos, la UMA aplicada del año 2026 y en cuánto se rebasa el umbral."
              className="entra-al-ver w-[15rem] shrink-0 sm:w-[16rem]"
              pie="El umbral, su equivalencia en pesos y la UMA que se aplicó por la fecha de la operación."
            />
            <CapturaApp
              imagen={capturaOperaciones}
              alt="Listado de operaciones agrupadas por mes, cada una con su importe, actividad, fecha y una etiqueta de «posible aviso». Los registros del ejemplo están marcados como demostración."
              className="entra-al-ver w-[15rem] shrink-0 sm:w-[16rem]"
              pie="El historial es lo que permite sumar seis meses y sostener una auditoría."
            />
          </div>
        </section>

        {/* ── App o extensión ──────────────────────────────────────────── */}
        <section aria-labelledby="cual-me-toca" className="mt-14">
          <h2 id="cual-me-toca" className="text-2xl font-semibold text-[var(--color-tinta)]">
            ¿Ésta o la extensión de Chrome?
          </h2>
          <p className="prosa mt-2">
            Son dos herramientas distintas y conviene no instalar la que no te sirve.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Tarjeta>
              <TarjetaCuerpo>
                <h3 className="font-semibold text-[var(--color-tinta)]">La app, si llevas un negocio</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                  {FRENTE_A_LA_EXTENSION.app}
                </p>
              </TarjetaCuerpo>
            </Tarjeta>
            <Tarjeta>
              <TarjetaCuerpo>
                <h3 className="font-semibold text-[var(--color-tinta)]">
                  La extensión, si resuelves dudas sueltas
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                  {FRENTE_A_LA_EXTENSION.extension}
                </p>
                <Link
                  href="/extension"
                  className="mt-4 inline-block text-sm font-medium text-[var(--color-petroleo-hondo)]"
                >
                  Ver la extensión de Chrome
                  <ArrowRight aria-hidden className="ml-1.5 inline size-4 align-[-0.18em]" />
                </Link>
              </TarjetaCuerpo>
            </Tarjeta>
          </div>
        </section>

        {/* ── Qué trae ─────────────────────────────────────────────────── */}
        <section aria-labelledby="funciones" className="mt-16">
          <h2 id="funciones" className="text-2xl font-semibold text-[var(--color-tinta)]">
            Qué trae
          </h2>

          {/*
            * La primera función ocupa el doble y las demás van en lista.
            *
            * Siete tarjetas del mismo tamaño no son una jerarquía: son un muro
            * donde el lector no sabe qué mirar primero. Y aquí sí hay un
            * primero — que el motor sea el mismo del sitio es el argumento, y
            * el resto son consecuencias suyas.
            */}
          {/* `items-start`: sin él la tarjeta destacada se estira para igualar la
              altura de la lista y queda medio bloque de color vacío debajo del
              texto. Una tarjeta debe medir lo que mide su contenido. */}
          <div className="mt-7 grid items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
            <div className="entra-al-ver rounded-[var(--radius-card)] border border-[var(--color-petroleo-tenue)] bg-[var(--color-petroleo-tenue)]/45 p-6 md:p-8">
              <h3 className="text-xl font-semibold text-[var(--color-tinta)]">
                {FUNCIONES[0]?.titulo}
              </h3>
              <p className="mt-3 leading-relaxed text-[var(--color-tinta-suave)]">
                {FUNCIONES[0]?.detalle}
              </p>
              <Link
                href="/metodologia-editorial"
                className="mt-5 inline-block text-sm font-medium text-[var(--color-petroleo-hondo)]"
              >
                Cómo se mantiene ese motor
                <ArrowRight aria-hidden className="ml-1.5 inline size-4 align-[-0.18em]" />
              </Link>
            </div>

            <ul className="flex flex-col">
              {FUNCIONES.slice(1).map((f) => (
                <li
                  key={f.titulo}
                  className="border-b border-[var(--color-borde)] py-4 first:pt-0 last:border-0"
                >
                  <h3 className="font-semibold text-[var(--color-tinta)]">{f.titulo}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                    {f.detalle}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Privacidad ───────────────────────────────────────────────── */}
        <section aria-labelledby="privacidad" className="mt-14">
          <h2 id="privacidad" className="text-2xl font-semibold text-[var(--color-tinta)]">
            Qué hace con tus datos
          </h2>
          <Nota tono="info" titulo="Nada sale de tu teléfono" className="mt-4">
            <ul className="flex flex-col gap-2">
              {PRIVACIDAD.map((p) => (
                <li key={p} className="flex items-start gap-2.5">
                  <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-[var(--color-verde)]" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              El documento completo, que es el que declara la ficha de Google Play, está en{' '}
              <Link href="/legal/privacidad-app">la política de privacidad de la app</Link>.
            </p>
          </Nota>
        </section>

        <Nota tono="atencion" titulo="Qué NO es esta app" className="mt-10">
          <p>{DESLINDE}</p>
        </Nota>

        {/*
          * Descarga otra vez al cierre.
          *
          * Quien llegó hasta aquí leyó privacidad, permisos y deslinde: es el
          * punto donde una persona cuidadosa decide, y obligarla a subir a
          * buscar el botón es perder justo a la que más se lo pensó.
          */}
        <section
          aria-labelledby="descargar"
          className="entra-al-ver mt-16 flex flex-col items-start gap-6 rounded-[var(--radius-card)] border border-[var(--color-borde)] bg-[var(--color-marfil-hondo)] p-8 sm:flex-row sm:items-center sm:justify-between md:p-10"
        >
          <div>
            <h2 id="descargar" className="text-xl font-semibold text-[var(--color-tinta)] md:text-2xl">
              Instálala y registra tu primera operación
            </h2>
            <p className="mt-2 max-w-lg text-[var(--color-tinta-suave)]">
              Trae un negocio de ejemplo con operaciones ya evaluadas, así que se entiende antes de
              capturar nada tuyo.
            </p>
          </div>
          {URL_PLAY ? <BotonGooglePlay href={URL_PLAY} /> : null}
        </section>

        <AvisoIndependencia className="mt-10" />
      </div>
    </>
  );
}
