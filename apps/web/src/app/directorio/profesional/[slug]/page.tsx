import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Building2, Clock, Globe2, Languages, MapPin, ShieldCheck } from 'lucide-react';
import type { PerfilProveedor } from '@leyantilavado/types';
import { datos } from '@leyantilavado/rules-engine';
import { Insignia, Nota, Tarjeta } from '@leyantilavado/ui';
import { AccionesPerfil } from '@/components/directorio/AccionesPerfil';
import { EtiquetaPatrocinado, InsigniaVerificacion } from '@/components/directorio/Distintivos';
import { FormularioContacto } from '@/components/directorio/FormularioContacto';
import { ETIQUETA_CATEGORIA, ETIQUETA_PLAN_PERFIL, ETIQUETA_SERVICIO, ETIQUETA_TAMANO } from '@/lib/directorio/catalogo';
import { repositorioDirectorio } from '@/lib/directorio/repositorio';
import { construirMetadata, jsonLdMigaDePan, SITIO } from '@/lib/sitio';

export async function generateStaticParams() {
  const perfiles = await repositorioDirectorio.listarPerfiles();
  return perfiles.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const perfil = await repositorioDirectorio.perfilPorSlug(slug);

  // `notFound()` aquí, y no unos metadatos de "perfil no encontrado".
  //
  // Devolver metadatos válidos hacía que la ruta se resolviera con éxito: el
  // cuerpo mostraba "no existe" pero la respuesta salía con HTTP 200. Eso es
  // un soft 404, y un buscador lo trata como una página real —la indexa, la
  // reporta como contenido de baja calidad y la conserva en su índice—. El
  // `noindex` lo tapaba a medias; el código de estado es lo que manda.
  if (!perfil) notFound();

  return construirMetadata({
    titulo: perfil.nombre,
    descripcion: perfil.biografia.slice(0, 300),
    ruta: `/directorio/profesional/${perfil.slug}`,
    actualizadoEn: perfil.actualizadoEn,
  });
}

/** Datos estructurados de la organización del perfil. */
function jsonLdPerfil(perfil: PerfilProveedor) {
  const esHerramienta = perfil.categorias.includes('software-cumplimiento');
  const ubicacion = perfil.ubicaciones[0];

  return {
    '@context': 'https://schema.org',
    '@type': esHerramienta ? 'Organization' : 'ProfessionalService',
    name: perfil.nombre,
    description: perfil.biografia,
    url: `${SITIO.url}/directorio/profesional/${perfil.slug}`,
    ...(perfil.sitioWeb ? { sameAs: [perfil.sitioWeb] } : {}),
    ...(ubicacion
      ? {
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'MX',
            addressRegion: ubicacion.estado,
            ...(ubicacion.ciudad ? { addressLocality: ubicacion.ciudad } : {}),
          },
        }
      : {}),
    ...(perfil.ubicaciones.some((u) => u.coberturaNacional)
      ? { areaServed: { '@type': 'Country', name: 'México' } }
      : {}),
    availableLanguage: perfil.idiomas,
    knowsAbout: perfil.servicios.map((s) => ETIQUETA_SERVICIO[s] ?? s),
  };
}

export default async function PaginaPerfil({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const perfil = await repositorioDirectorio.perfilPorSlug(slug);
  if (!perfil) notFound();

  const actividades = datos.ACTIVIDADES.filter((a) => perfil.actividadesAtendidas.includes(a.slug));
  const catalogoActividades = datos.ACTIVIDADES.map((a) => ({
    slug: a.slug,
    nombreCorto: a.nombreCorto,
  }));

  return (
    <div className="contenedor-app flex flex-col gap-10 py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            jsonLdMigaDePan([
              { nombre: 'Inicio', ruta: '/' },
              { nombre: 'Directorio', ruta: '/directorio' },
              { nombre: perfil.nombre, ruta: `/directorio/profesional/${perfil.slug}` },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPerfil(perfil)) }}
      />

      <header className="flex flex-col gap-5">
        <p className="text-sm text-[var(--color-tinta-tenue)]">
          <Link href="/directorio" className="underline underline-offset-4">
            Directorio
          </Link>{' '}
          /{' '}
          {perfil.categorias[0] && (
            <Link href={`/directorio/${perfil.categorias[0]}`} className="underline underline-offset-4">
              {ETIQUETA_CATEGORIA[perfil.categorias[0]]}
            </Link>
          )}
        </p>

        <div className="flex flex-wrap items-start gap-5">
          {perfil.logoUrl ? (
            <Image
              src={perfil.logoUrl}
              alt={`Logotipo de ${perfil.nombre}`}
              width={96}
              height={96}
              className="size-24 rounded-[var(--radius-card)] border border-[var(--color-borde)] object-contain"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex size-24 items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--color-borde-fuerte)] text-[var(--color-tinta-tenue)]"
            >
              <Building2 className="size-8" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-semibold md:text-4xl">{perfil.nombre}</h1>
            <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[var(--color-tinta-suave)]">
              {perfil.categorias.map((c) => (
                <Link key={c} href={`/directorio/${c}`} className="underline underline-offset-4">
                  {ETIQUETA_CATEGORIA[c]}
                </Link>
              ))}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {perfil.patrocinado && <EtiquetaPatrocinado />}
              <InsigniaVerificacion nivel={perfil.verificacion} />
              <Insignia tono="neutro">{ETIQUETA_PLAN_PERFIL[perfil.plan]}</Insignia>
              <Insignia tono={perfil.aceptaNuevosClientes ? 'verde' : 'neutro'}>
                {perfil.aceptaNuevosClientes
                  ? 'Acepta nuevos clientes'
                  : 'Agenda cerrada por ahora'}
              </Insignia>
            </div>
          </div>
        </div>

        <AccionesPerfil slug={perfil.slug} nombre={perfil.nombre} />
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="flex flex-col gap-8">
          <section aria-labelledby="biografia">
            <h2 id="biografia" className="text-xl font-semibold">
              Sobre este proveedor
            </h2>
            <p className="prosa mt-3 text-[var(--color-tinta-suave)]">{perfil.biografia}</p>
            {perfil.sitioWeb && (
              <p className="mt-3 text-sm">
                <a
                  href={perfil.sitioWeb}
                  rel="nofollow noopener external"
                  target="_blank"
                  className="text-[var(--color-petroleo-hondo)] underline underline-offset-4"
                >
                  Sitio del proveedor
                </a>
              </p>
            )}
          </section>

          <section aria-labelledby="servicios">
            <h2 id="servicios" className="text-xl font-semibold">
              Servicios
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {perfil.servicios.map((s) => (
                <li key={s}>
                  <Insignia tono="petroleo">{ETIQUETA_SERVICIO[s] ?? s}</Insignia>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="actividades">
            <h2 id="actividades" className="text-xl font-semibold">
              Actividades vulnerables que atiende
            </h2>
            <p className="mt-2 text-sm text-[var(--color-tinta-tenue)]">
              Dato declarado por el proveedor. No comprobamos su experiencia en cada una.
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {actividades.map((a) => (
                <li key={a.slug} className="text-sm text-[var(--color-tinta-suave)]">
                  <Link
                    href={`/actividades-vulnerables/${a.slug}`}
                    className="underline underline-offset-4"
                  >
                    {a.nombreCorto}
                  </Link>{' '}
                  <span className="text-[var(--color-tinta-tenue)]">(fracción {a.fraccion})</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="industrias">
            <h2 id="industrias" className="text-xl font-semibold">
              Industrias y tamaño de cliente
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {perfil.industrias.map((i) => (
                <li key={i}>
                  <Insignia tono="neutro">{i}</Insignia>
                </li>
              ))}
              {perfil.tamanosCliente.map((t) => (
                <li key={t}>
                  <Insignia tono="marino">{ETIQUETA_TAMANO[t]}</Insignia>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="credenciales">
            <h2 id="credenciales" className="text-xl font-semibold">
              Credenciales
            </h2>
            {perfil.credenciales.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--color-tinta-suave)]">
                Este perfil no ha presentado credenciales para revisión. Pídeselas directamente
                antes de contratar.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-3">
                {perfil.credenciales.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-4"
                  >
                    <p className="flex items-start gap-2 font-medium text-[var(--color-tinta)]">
                      <ShieldCheck
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-[var(--color-petroleo)]"
                      />
                      {c.nombre}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">
                      Emitida por {c.emisor}
                      {c.folio ? ` · folio ${c.folio}` : ''}
                      {c.vigenteHasta ? ` · vigente hasta ${c.vigenteHasta}` : ''}
                    </p>
                    {c.revisadoEn && (
                      <p className="mt-1 text-xs text-[var(--color-tinta-tenue)]">
                        Revisada por nuestro equipo el {c.revisadoEn}. Comprobamos que el documento
                        exista y corresponda al titular del perfil; no evaluamos su desempeño
                        profesional.
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-[var(--color-tinta-tenue)]">
              Los documentos que respaldan estas credenciales no son públicos: sólo los ve el equipo
              de moderación.
            </p>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <Tarjeta>
            <div className="flex flex-col gap-3 p-5">
              <h2 className="text-lg font-semibold">Cobertura y contacto</h2>
              <ul className="flex flex-col gap-3 text-sm text-[var(--color-tinta-suave)]">
                {perfil.ubicaciones.map((u) => (
                  <li key={`${u.estado}-${u.ciudad ?? ''}`} className="flex items-start gap-2">
                    <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                    <span>
                      {u.ciudad ? `${u.ciudad}, ${u.estado}` : u.estado}
                      {u.coberturaNacional && ' — cobertura nacional'}
                    </span>
                  </li>
                ))}
                <li className="flex items-start gap-2">
                  <Globe2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  <span>
                    {[
                      perfil.ubicaciones.some((u) => u.atencionPresencial) ? 'Presencial' : null,
                      perfil.ubicaciones.some((u) => u.atencionRemota) ? 'En línea' : null,
                    ]
                      .filter(Boolean)
                      .join(' y ') || 'Modalidad no indicada'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Languages aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  <span>{perfil.idiomas.join(', ')}</span>
                </li>
                {perfil.aniosExperiencia !== undefined && (
                  <li className="flex items-start gap-2">
                    <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                    <span>{perfil.aniosExperiencia} años de experiencia declarados</span>
                  </li>
                )}
              </ul>
            </div>
          </Tarjeta>

          <Tarjeta elevada>
            <div className="p-5">
              <h2 className="text-lg font-semibold">Contactar a {perfil.nombre}</h2>
              <p className="mt-2 text-sm text-[var(--color-tinta-suave)]">
                Sólo compartimos tus datos si marcas la casilla de autorización.
              </p>
              <div className="mt-4">
                <FormularioContacto
                  proveedorSlug={perfil.slug}
                  proveedorNombre={perfil.nombre}
                  actividades={catalogoActividades}
                />
              </div>
            </div>
          </Tarjeta>

          <Nota tono="info" titulo="Sobre las opiniones de clientes">
            No publicamos reseñas ni calificaciones. Un directorio de cumplimiento no puede mostrar
            opiniones sin moderación, sin derecho de respuesta y sin comprobar que quien opina fue
            realmente cliente. Mientras no tengamos las tres cosas, preferimos no tenerlas.
          </Nota>
        </aside>
      </div>
    </div>
  );
}
