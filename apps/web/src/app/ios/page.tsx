import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { AvisoIndependencia, Nota } from '@leyantilavado/ui';
import { SITIO, construirMetadata, jsonLdMigaDePan, jsonParaScript } from '@/lib/sitio';
import { EncabezadoPagina } from '@/components/inicio/comun';
import { CapturaIOS, VitrinaIOS } from '@/components/ios/PiezasIOS';
import capturaInicio from '../../../public/img/ios/inicio.webp';
import capturaCalculadora from '../../../public/img/ios/calculadora.webp';
import capturaAcumulacion from '../../../public/img/ios/acumulacion.webp';
import capturaEfectivo from '../../../public/img/ios/efectivo.webp';
import capturaCalendario from '../../../public/img/ios/calendario.webp';
import {
  DESLINDE,
  FRENTE_A_ANDROID,
  FUNCIONES,
  IOS,
  PRIVACIDAD,
  QUE_RESPONDE,
  REQUISITOS,
  URL_APP_STORE,
} from '@/content/ios';
import { URL_PLAY } from '@/content/app';

const MIGA = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'App para iPhone', ruta: '/ios' },
];

/**
 * Landing de la app de iOS.
 *
 * ── Por qué la ruta es `/ios` y no `/app/ios` ──────────────────────────────
 *
 * No es estética. El `apple-app-site-association` declara `/app/*` como
 * espacio de Universal Links, igual que el manifiesto de Android declara
 * `pathPrefix="/app"`. Una página colgada de ahí abriría la APP en cualquier
 * teléfono que ya la tenga instalada, en lugar de mostrar la página que invita
 * a instalarla. `/ios` queda fuera de ese espacio y siempre se renderiza.
 *
 * ── Lo que esta página NO hace ─────────────────────────────────────────────
 *
 * No ofrece una descarga. La app está compilada, probada y con las capturas
 * hechas, pero no está publicada, así que `URL_APP_STORE` está vacía y la
 * página lo dice. El día que se publique, basta rellenar esa constante.
 */

export const metadata: Metadata = construirMetadata({
  titulo: 'Ley Antilavado {año} para iPhone: umbrales y avisos',
  descripcion:
    'App para iPhone y iPad con el mismo motor jurídico de este sitio: evalúa cada operación con la UMA de su fecha, acumula seis meses, verifica el efectivo del art. 32 y avisa de lo que vence. Cifrada en el dispositivo.',
  ruta: '/ios',
});

const JSON_LD_APP = {
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  name: IOS.nombre,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'iOS 15.0 o posterior',
  url: `${SITIO.url}/ios`,
  description: IOS.entradilla,
  inLanguage: 'es-MX',
  publisher: { '@id': `${SITIO.url}/#organizacion` },
  privacyPolicy: `${SITIO.url}/legal/privacidad-ios`,
};

export default function PaginaIOS() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonParaScript(jsonLdMigaDePan(MIGA)) }}
      />
      {/*
       * El marcado de app sólo se emite cuando hay ficha pública. Declarar una
       * `MobileApplication` que nadie puede instalar es prometerle a un
       * buscador algo que no existe.
       */}
      {URL_APP_STORE ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonParaScript({ ...JSON_LD_APP, downloadUrl: URL_APP_STORE }),
          }}
        />
      ) : null}

      <EncabezadoPagina
        miga={MIGA}
        titulo={`${IOS.nombre}: ${IOS.tagline}`}
        subtitulo="App para iPhone y iPad"
        entradilla={IOS.entradilla}
      />

      <div className="contenedor-app pb-16">
        <VitrinaIOS
          captura={capturaInicio}
          alt="Pantalla de inicio de la app en un iPhone: el negocio de ejemplo «Joyería La Perla», un aviso rojo de que tres operaciones alcanzan el umbral, la próxima obligación con los días que faltan, y accesos rápidos para registrar, calcular umbral, verificar efectivo y ver la agenda."
        >
          <p className="text-2xl font-semibold leading-tight text-[var(--color-tinta)] md:text-3xl">
            Lo primero que ves es lo que vence.
          </p>
          <p className="mt-4 max-w-md leading-relaxed text-[var(--color-tinta-suave)]">
            La misma respuesta que da este sitio, guardando el historial: qué operaciones
            registraste, cuáles alcanzaron umbral, qué se acumula con qué y qué plazo corre.
          </p>

          <div className="mt-8">
            {URL_APP_STORE ? (
              <Link
                href={URL_APP_STORE}
                className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-tinta)] px-5 py-3 font-medium text-[var(--color-marfil)] transition-transform duration-200 hover:-translate-y-0.5"
              >
                Descargar en el App Store
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            ) : (
              <Nota tono="atencion" titulo="Todavía no está en el App Store">
                <p>
                  La app está terminada y probada en iPhone y iPad, pero aún no se publica. Esta
                  página existe para que puedas revisar qué hace y cómo trata tus datos antes de
                  que salga — no para venderte algo que no puedes instalar.
                </p>
                <p className="mt-3">
                  Mientras tanto,{' '}
                  <Link href="/app" className="underline underline-offset-4">
                    la versión de Android sí está publicada
                  </Link>
                  {URL_PLAY ? '' : ''} y es exactamente la misma app.
                </p>
              </Nota>
            )}
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4">
            {REQUISITOS.map((r) => (
              <div key={r.que}>
                <dt className="text-[0.8rem] text-[var(--color-tinta-tenue)]">{r.que}</dt>
                <dd className="mt-0.5 text-[0.92rem] font-medium text-[var(--color-tinta)]">
                  {r.valor}
                </dd>
              </div>
            ))}
          </dl>
        </VitrinaIOS>

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
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--color-petroleo)]"
                />
                {p}
              </li>
            ))}
          </ul>
        </section>

        {/* ── Cómo responde ────────────────────────────────────────────── */}
        <section aria-labelledby="como-se-ve" className="mt-16">
          <h2 id="como-se-ve" className="text-2xl font-semibold text-[var(--color-tinta)]">
            Cómo responde
          </h2>
          <p className="prosa mt-2">
            Cada pantalla enseña el cálculo, no sólo el veredicto: el umbral que aplicó, la UMA de
            esa fecha y el artículo del que sale.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-8 lg:justify-start lg:gap-10">
            <CapturaIOS
              imagen={capturaCalculadora}
              alt="Calculadora de umbrales: la app concluye «probablemente debes presentar aviso», etiqueta la confianza como media, cita la fracción VI, y desglosa el umbral de identificación de 805 UMA equivalente a 94,434.55 pesos con la UMA del año 2026."
              pie={
                <>
                  Enseña el umbral en UMA <strong>y</strong> su equivalente en pesos, con el año de
                  la UMA que aplicó. También marca su propia confianza: «media» significa que la
                  regla admite lectura, no que el cálculo falle.
                </>
              }
            />
            <CapturaIOS
              imagen={capturaAcumulacion}
              alt="Pantalla de acumulación de seis meses, con un aviso que explica que es una ventana móvil y no el semestre natural, y campos para elegir cliente, actividad vulnerable y fecha de fin de la ventana."
              pie={
                <>
                  La confusión más cara de esta ley: se miran seis meses hacia atrás desde la fecha
                  que elijas, <strong>no</strong> el semestre natural. Y sólo suma el mismo cliente
                  por el mismo tipo de acto.
                </>
              }
            />
            <CapturaIOS
              imagen={capturaEfectivo}
              alt="Verificador de efectivo: la app responde «permitido sólo en parte», indica que se pueden liquidar hasta 376,565.10 pesos en efectivo, y desglosa el límite del artículo 32 de 3,210 UMA frente a los 480,000 pesos de la operación."
              pie={
                <>
                  El art. 32 es una prohibición, no un umbral de reporte. La app dice hasta cuánto
                  puedes recibir en efectivo y cuánto excede, en vez de responder sólo «no».
                </>
              }
            />
            <CapturaIOS
              imagen={capturaCalendario}
              alt="Calendario de obligaciones con tres pendientes próximos: el aviso de mayo marcado como urgente, la revisión semestral de expedientes y el aviso de junio, cada uno con su artículo, más una nota de que la app nunca pide credenciales del SAT."
              pie={
                <>
                  Separa lo urgente de lo que tiene tiempo, con el artículo de cada obligación. Y
                  deja claro, dentro de la propia pantalla, que el envío lo haces tú en el portal
                  oficial.
                </>
              }
            />
          </div>
        </section>

        {/* ── Frente a Android ─────────────────────────────────────────── */}
        <section aria-labelledby="frente-android" className="mt-16">
          <h2 id="frente-android" className="text-2xl font-semibold text-[var(--color-tinta)]">
            Qué cambia respecto a la de Android
          </h2>
          <p className="prosa mt-2">
            Poco, y a propósito. Lo que cambia es lo que sólo existe en iOS.
          </p>

          <ul className="mt-7 grid gap-x-10 gap-y-6 md:grid-cols-3">
            {FRENTE_A_ANDROID.map((f) => (
              <li key={f.titulo} className="border-t-2 border-[var(--color-petroleo)] pt-4">
                <p className="font-semibold text-[var(--color-tinta)]">{f.titulo}</p>
                <p className="mt-1.5 text-[0.95rem] leading-relaxed text-[var(--color-tinta-suave)]">
                  {f.detalle}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Funciones ────────────────────────────────────────────────── */}
        <section aria-labelledby="funciones" className="mt-16">
          <h2 id="funciones" className="text-2xl font-semibold text-[var(--color-tinta)]">
            Lo que hace
          </h2>

          <dl className="mt-7 flex flex-col divide-y divide-[var(--color-borde)]">
            {FUNCIONES.map((f) => (
              <div key={f.titulo} className="grid gap-x-10 gap-y-1 py-5 md:grid-cols-[16rem_1fr]">
                <dt className="font-semibold text-[var(--color-tinta)]">{f.titulo}</dt>
                <dd className="leading-relaxed text-[var(--color-tinta-suave)]">{f.detalle}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Privacidad ───────────────────────────────────────────────── */}
        <section aria-labelledby="privacidad" className="mt-16">
          <h2 id="privacidad" className="text-2xl font-semibold text-[var(--color-tinta)]">
            Qué pasa con tus datos
          </h2>

          <Nota tono="info" titulo="Nada sale de tu iPhone" className="mt-4">
            <ul className="flex flex-col gap-2">
              {PRIVACIDAD.map((p) => (
                <li key={p} className="flex items-start gap-2.5">
                  <ShieldCheck
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-[var(--color-petroleo)]"
                  />
                  {p}
                </li>
              ))}
            </ul>
            <p className="mt-4">
              <Link href="/legal/privacidad-ios" className="underline underline-offset-4">
                Leer la política de privacidad completa
              </Link>
            </p>
          </Nota>
        </section>

        <Nota tono="atencion" titulo="Qué NO es esta app" className="mt-10">
          <p>{DESLINDE}</p>
        </Nota>

        <AvisoIndependencia className="mt-10" />
      </div>
    </>
  );
}
