import Link from 'next/link';
import { Briefcase, Clock, Globe2, Languages, MapPin } from 'lucide-react';
import type { PerfilProveedor } from '@leyantilavado/types';
import { Insignia, Tarjeta } from '@leyantilavado/ui';
import { ETIQUETA_CATEGORIA, ETIQUETA_SERVICIO } from '@/lib/directorio/catalogo';
import { EtiquetaPatrocinado, InsigniaVerificacion } from './Distintivos';

function resumenUbicacion(perfil: PerfilProveedor): string {
  const nacional = perfil.ubicaciones.some((u) => u.coberturaNacional);
  const lugares = perfil.ubicaciones
    .map((u) => (u.ciudad ? `${u.ciudad}, ${u.estado}` : u.estado))
    .join(' · ');
  return nacional ? `${lugares} — cobertura nacional` : lugares;
}

function modalidades(perfil: PerfilProveedor): string {
  const presencial = perfil.ubicaciones.some((u) => u.atencionPresencial);
  const remota = perfil.ubicaciones.some((u) => u.atencionRemota);
  if (presencial && remota) return 'Presencial y en línea';
  if (presencial) return 'Sólo presencial';
  if (remota) return 'Sólo en línea';
  return 'Modalidad no indicada';
}

export function TarjetaProveedor({ perfil }: { perfil: PerfilProveedor }) {
  return (
    <Tarjeta
      elevada={perfil.patrocinado}
      className={perfil.patrocinado ? 'border-[var(--color-ambar)]/50' : undefined}
    >
      <div className="flex flex-col gap-4 p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-[var(--color-tinta)]">
              <Link
                href={`/directorio/profesional/${perfil.slug}`}
                className="hover:underline focus-visible:underline"
              >
                {perfil.nombre}
              </Link>
            </h3>
            <p className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-sm text-[var(--color-tinta-tenue)]">
              {perfil.categorias.map((c) => (
                <span key={c}>{ETIQUETA_CATEGORIA[c]}</span>
              ))}
            </p>
          </div>
          {!perfil.aceptaNuevosClientes && (
            <Insignia tono="neutro">Agenda cerrada por ahora</Insignia>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* La etiqueta de patrocinio va primero y siempre visible. */}
          {perfil.patrocinado && <EtiquetaPatrocinado />}
          <InsigniaVerificacion nivel={perfil.verificacion} />
        </div>

        <p className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">
          {perfil.biografia}
        </p>

        <ul className="grid gap-2 text-sm text-[var(--color-tinta-suave)] sm:grid-cols-2">
          <li className="flex items-start gap-2">
            <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>{resumenUbicacion(perfil)}</span>
          </li>
          <li className="flex items-start gap-2">
            <Globe2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>{modalidades(perfil)}</span>
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

        <div className="flex flex-wrap items-center gap-2">
          <Briefcase aria-hidden="true" className="size-4 text-[var(--color-tinta-tenue)]" />
          {perfil.servicios.slice(0, 4).map((s) => (
            <Insignia key={s} tono="neutro">
              {ETIQUETA_SERVICIO[s] ?? s}
            </Insignia>
          ))}
          {perfil.servicios.length > 4 && (
            <span className="text-xs text-[var(--color-tinta-tenue)]">
              +{perfil.servicios.length - 4} más
            </span>
          )}
        </div>

        <Link
          href={`/directorio/profesional/${perfil.slug}`}
          className="text-sm font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-4"
        >
          Ver perfil y contactar
        </Link>
      </div>
    </Tarjeta>
  );
}
