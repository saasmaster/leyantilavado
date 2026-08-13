import type { Metadata } from 'next';
import Link from 'next/link';
import { formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Nota } from '@leyantilavado/ui';
import { construirMetadata, jsonLdMigaDePan } from '@/lib/sitio';
import { EncabezadoPagina, REVISION_VIGENTE } from '@/components/inicio/comun';

const MIGA = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Términos de uso', ruta: '/legal/terminos' },
];

export const metadata: Metadata = construirMetadata({
  titulo: 'Términos de uso',
  descripcion:
    'Condiciones de uso de LeyAntilavado.org: alcance de la información, límite de responsabilidad, propiedad intelectual y reglas del directorio profesional.',
  ruta: '/legal/terminos',
});

export default function Terminos() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdMigaDePan(MIGA)) }}
      />

      <EncabezadoPagina
        miga={MIGA}
        titulo="Términos de uso"
        entradilla="Lo importante en una línea: esto es información y son herramientas de cálculo. No es asesoría jurídica, no crea relación profesional y no sustituye tu criterio ni el de tu asesor."
        actualizado={formatearFechaLarga(REVISION_VIGENTE)}
      />

      <div className="contenedor-app py-12 md:py-16">
        <div className="prosa">
          <h2>1. Aceptación</h2>
          <p>
            Al usar LeyAntilavado.org aceptas estos términos. Si no estás de acuerdo con ellos, no
            uses el sitio. El uso de la sección privada de cumplimiento se rige además por las
            condiciones específicas de su contratación.
          </p>

          <h2>2. Qué es y qué no es este sitio</h2>
          <p>
            Este sitio es una plataforma privada e independiente de información y herramientas de
            cálculo sobre la LFPIORPI. <strong>No está afiliada al SAT, la UIF, la Secretaría de
            Hacienda ni a ninguna autoridad.</strong> Las menciones a esas instituciones se hacen
            únicamente para identificar la normativa citada.
          </p>
          <p>
            El contenido tiene finalidad informativa y orientativa. <strong>No constituye
            asesoría jurídica, fiscal, contable ni de cumplimiento</strong>, y su consulta no crea
            una relación profesional ni de patrocinio entre tú y el titular del sitio.
          </p>

          <h2>3. Cómo debes usar los resultados</h2>
          <p>
            Las herramientas calculan a partir de los datos que tú capturas y de reglas
            versionadas con su fuente y su fecha de revisión. Eso implica tres cosas:
          </p>
          <ul>
            <li>
              <strong>La calidad del resultado depende de la calidad de tus datos.</strong> Un
              monto mal capturado o una fecha equivocada producen una conclusión equivocada.
            </li>
            <li>
              <strong>Ningún resultado declara cumplimiento.</strong> No emitimos “cumples”, “estás
              en regla” ni “no tienes obligaciones”. La conclusión más benigna posible es que, con
              la información proporcionada, no parece aplicarte una obligación.
            </li>
            <li>
              <strong>Los resultados no sustituyen tus obligaciones.</strong> Presentar un aviso,
              integrar un expediente o entregar un dictamen sigue siendo tuyo, ante la autoridad
              y con tu responsabilidad.
            </li>
          </ul>
          <p>
            El detalle de cómo verificamos y versionamos cada dato está en la{' '}
            <Link href="/metodologia-editorial">metodología editorial</Link>.
          </p>

          <h2>4. Exactitud y actualización</h2>
          <p>
            Trabajamos con fuentes oficiales y publicamos la fecha de revisión de cada regla, pero
            la normativa cambia y una fuente puede modificarse antes de que lo detectemos. No
            garantizamos que todo el contenido esté actualizado en todo momento. Cuando un dato no
            pudo verificarse, el sitio lo declara en lugar de esconderlo.
          </p>

          <h2>5. Límite de responsabilidad</h2>
          <p>
            En la máxima medida permitida por la ley aplicable, el titular no será responsable de
            daños o perjuicios derivados del uso o de la imposibilidad de uso del sitio, ni de
            decisiones tomadas con base en su contenido, incluidas multas, sanciones o pérdidas de
            oportunidad. El sitio se ofrece “tal cual”, sin garantías implícitas de idoneidad para
            un fin particular.
          </p>

          <h2>6. Disponibilidad</h2>
          <p>
            No garantizamos disponibilidad ininterrumpida. Podemos modificar, suspender o retirar
            cualquier herramienta o contenido, incluso sin aviso previo, especialmente cuando una
            regla deja de estar verificada.
          </p>

          <h2>7. Propiedad intelectual</h2>
          <p>
            El texto de la ley, del reglamento y de las publicaciones del Diario Oficial de la
            Federación es de dominio público y no lo reclamamos. Sí son nuestros los resúmenes, la
            estructura editorial, las explicaciones, el diseño, el software y las bases de datos
            propias.
          </p>
          <p>
            Puedes citar fragmentos con atribución y enlace a la página de origen. No puedes
            reproducir el sitio de forma sistemática, extraerlo con robots para reconstruirlo, ni
            usarlo para entrenar servicios que lo sustituyan sin autorización escrita.
          </p>

          <h2>8. Enlaces a sitios de terceros</h2>
          <p>
            Enlazamos documentos y páginas de autoridades y de terceros como referencia. No
            controlamos su contenido ni respondemos por él, y el enlace no implica respaldo.
          </p>

          <h2>9. Directorio profesional</h2>
          <p>
            El directorio lista a terceros independientes. La verificación que hacemos se declara
            en cada perfil y tiene el alcance exacto que ahí se describe:{' '}
            <strong>no certificamos a nadie</strong> y el nivel máximo es “documentación
            revisada”. La contratación ocurre directamente entre tú y el profesional, bajo su
            propia responsabilidad.
          </p>
          <p>
            Todo perfil pagado lleva la etiqueta “Patrocinado” visible. Los detalles están en la{' '}
            <Link href="/legal/publicidad">divulgación de publicidad</Link>.
          </p>

          <h2>10. Conducta del usuario</h2>
          <ul>
            <li>No intentes vulnerar la seguridad del sitio ni acceder a áreas privadas ajenas.</li>
            <li>
              No uses las herramientas para automatizar consultas masivas que degraden el servicio.
            </li>
            <li>
              No publiques en el directorio información falsa, credenciales que no te
              correspondan o datos de terceros sin su consentimiento.
            </li>
          </ul>

          <h2>11. Cambios a estos términos</h2>
          <p>
            Podemos actualizarlos. La versión vigente es siempre la publicada en esta página, con
            su fecha. El uso posterior a un cambio implica su aceptación.
          </p>

          <h2>12. Ley aplicable</h2>
          <p>
            Estos términos se rigen por la legislación federal mexicana y se interpretan conforme
            a ella. Cualquier controversia se somete a los tribunales federales competentes de los
            Estados Unidos Mexicanos.
          </p>
        </div>
      </div>
    </>
  );
}
