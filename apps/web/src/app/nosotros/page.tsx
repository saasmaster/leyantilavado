import type { Metadata } from 'next';
import Link from 'next/link';
import { VERSION_LEGAL, datos, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { FRASE_ACTIVIDADES, FRASE_UMBRALES } from '@/content/cifras';
import { Nota } from '@leyantilavado/ui';
import { construirMetadata, jsonLdMigaDePan } from '@/lib/sitio';
import { EncabezadoPagina, REVISION_VIGENTE } from '@/components/inicio/comun';

const MIGA = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Quiénes somos', ruta: '/nosotros' },
];

export const metadata: Metadata = construirMetadata({
  titulo: 'Quiénes somos',
  descripcion:
    'LeyAntilavado.org es una plataforma privada e independiente sobre la LFPIORPI. Qué publicamos, cómo nos financiamos y qué no vamos a hacer nunca.',
  ruta: '/nosotros',
});

export default function Nosotros() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdMigaDePan(MIGA)) }}
      />

      <EncabezadoPagina
        miga={MIGA}
        titulo="Un centro de información sobre la Ley Antilavado, no un despacho"
        entradilla="Existimos porque el nicho está lleno de artículos y vacío de herramientas, y porque las cifras que más importan se publican mal con demasiada frecuencia."
        actualizado={formatearFechaLarga(REVISION_VIGENTE)}
      />

      <div className="contenedor-app py-12 md:py-16">
        <div className="prosa">
          <h2>Qué problema atacamos</h2>
          <p>
            Decenas de miles de negocios en México realizan una actividad vulnerable sin saberlo.
            Cuando lo averiguan, se topan con tres capas de norma —ley, reglamento y reglas de
            carácter general—, con umbrales expresados en UMA que cambian cada año y con tablas
            publicadas que aplican el valor equivocado a las operaciones de enero.
          </p>
          <p>
            Nuestro trabajo es reducir eso a una pregunta contestable: <em>¿esto me aplica y con
            qué número?</em> Con la disposición citada, la fuente enlazada y la fecha en que la
            revisamos.
          </p>

          <h2>Qué publicamos y qué no</h2>
          <p>Tres reglas gobiernan todo lo que sale al público:</p>
          <ul>
            <li>
              <strong>Ninguna cifra vive en una página.</strong> Todos los umbrales, límites y
              rangos de sanción salen de un motor jurídico versionado, con vigencia y procedencia
              por regla. Si el motor no tiene el dato, la página muestra el hueco y explica por
              qué está vacío.
            </li>
            <li>
              <strong>Ninguna herramienta declara cumplimiento.</strong> No existe un resultado
              que diga “cumples” o “estás en regla”. La conclusión más benigna es “no parece
              aplicarte con la información proporcionada”, y siempre viene con los supuestos que
              se dieron por hecho.
            </li>
            <li>
              <strong>Ningún sello nuestro.</strong> No certificamos a nadie. En el directorio, el
              nivel más alto que otorgamos es “documentación revisada”, y decimos textualmente qué
              se revisó y qué no.
            </li>
          </ul>

          <h2>Cómo nos financiamos</h2>
          <p>
            El contenido y las herramientas públicas son gratuitos y no llevan muro de pago. El
            proyecto se sostiene con la suscripción al área privada de cumplimiento y con perfiles
            destacados en el directorio profesional. Todo perfil pagado lleva la etiqueta
            “Patrocinado” a la vista, sin excepción, y ningún pago cambia el contenido editorial ni
            el resultado de una herramienta.
          </p>
          <p>
            Los detalles de esa separación están en la{' '}
            <Link href="/legal/publicidad">divulgación de publicidad</Link>.
          </p>

          <h2>Qué hay detrás del sitio hoy</h2>
          <p>
            El corpus legal está en la versión <strong>{VERSION_LEGAL}</strong> e incluye{' '}
            {FRASE_ACTIVIDADES}, {FRASE_UMBRALES},{' '}
            {datos.OBLIGACIONES.length} obligaciones y {datos.CALENDARIO.length} hitos de
            calendario, todos apuntando a alguna de las {datos.FUENTES.length} fuentes oficiales
            que listamos.
          </p>
        </div>
      </div>
    </>
  );
}
