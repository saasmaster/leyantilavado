import Link from 'next/link';
import { Search, SlidersHorizontal } from 'lucide-react';
import { ETIQUETA_VERIFICACION } from '@leyantilavado/types';
import { datos } from '@leyantilavado/rules-engine';
import { Boton, Campo, Entrada, Selector } from '@leyantilavado/ui';
import {
  ESTADOS_MX,
  ETIQUETA_CATEGORIA,
  ETIQUETA_PLAN_PERFIL,
  ETIQUETA_TAMANO,
  IDIOMAS_DIRECTORIO,
  ORDEN_CATEGORIAS,
  TIPOS_SERVICIO,
} from '@/lib/directorio/catalogo';
import type { FiltrosDirectorio as Filtros } from '@/lib/directorio/filtros';
import { hayFiltrosActivos } from '@/lib/directorio/filtros';

/* ────────────────────────────────────────────────────────────────────────────
 * Filtros del directorio.
 *
 * Es un `<form method="get">` y nada más: cero JavaScript, cero estado de
 * cliente. Al enviar, los filtros quedan en la URL, así que el resultado se
 * puede compartir, marcar y rastrear. Y funciona con JavaScript desactivado.
 *
 * Al enviarse no viaja `pagina`, así que toda búsqueda nueva vuelve a la 1.
 * ────────────────────────────────────────────────────────────────────────── */

const AÑOS_EXPERIENCIA = [3, 5, 10, 15, 20];

export function FiltrosDirectorio({ filtros }: { filtros: Filtros }) {
  const actividades = datos.ACTIVIDADES;

  return (
    <form
      method="get"
      action="/directorio"
      className="rounded-[var(--radius-card)] border border-[var(--color-borde)] bg-[var(--color-superficie)] p-5"
      aria-labelledby="titulo-filtros"
    >
      <h2
        id="titulo-filtros"
        className="flex items-center gap-2 text-base font-semibold text-[var(--color-tinta)]"
      >
        <SlidersHorizontal aria-hidden="true" className="size-4" />
        Filtrar el directorio
      </h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Campo
          id="q"
          etiqueta="Buscar por nombre, industria o lugar"
          ayuda="Todas las palabras que escribas deben aparecer en el perfil."
          className="md:col-span-2 lg:col-span-3"
        >
          <Entrada name="q" type="search" defaultValue={filtros.q} maxLength={80} />
        </Campo>

        <Campo id="categoria" etiqueta="Tipo de profesional">
          <Selector name="categoria" defaultValue={filtros.categoria ?? ''}>
            <option value="">Todos</option>
            {ORDEN_CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {ETIQUETA_CATEGORIA[c]}
              </option>
            ))}
          </Selector>
        </Campo>

        <Campo id="servicio" etiqueta="Tipo de servicio">
          <Selector name="servicio" defaultValue={filtros.servicio ?? ''}>
            <option value="">Todos</option>
            {TIPOS_SERVICIO.map((s) => (
              <option key={s.clave} value={s.clave}>
                {s.etiqueta}
              </option>
            ))}
          </Selector>
        </Campo>

        <Campo id="actividad" etiqueta="Actividad vulnerable que atiende">
          <Selector name="actividad" defaultValue={filtros.actividad ?? ''}>
            <option value="">Todas</option>
            {actividades.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.nombreCorto}
              </option>
            ))}
          </Selector>
        </Campo>

        <Campo id="estado" etiqueta="Estado">
          <Selector name="estado" defaultValue={filtros.estado ?? ''}>
            <option value="">Todo México</option>
            {ESTADOS_MX.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </Selector>
        </Campo>

        <Campo id="ciudad" etiqueta="Ciudad">
          <Entrada name="ciudad" type="text" defaultValue={filtros.ciudad ?? ''} maxLength={60} />
        </Campo>

        <Campo id="modalidad" etiqueta="Atención">
          <Selector name="modalidad" defaultValue={filtros.modalidad ?? ''}>
            <option value="">Presencial o en línea</option>
            <option value="presencial">Presencial</option>
            <option value="remota">En línea</option>
          </Selector>
        </Campo>

        <Campo id="idioma" etiqueta="Idioma">
          <Selector name="idioma" defaultValue={filtros.idioma ?? ''}>
            <option value="">Cualquiera</option>
            {IDIOMAS_DIRECTORIO.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </Selector>
        </Campo>

        <Campo id="tamano" etiqueta="Tamaño de cliente que atiende">
          <Selector name="tamano" defaultValue={filtros.tamano ?? ''}>
            <option value="">Cualquiera</option>
            {(['micro', 'pequena', 'mediana', 'grande'] as const).map((t) => (
              <option key={t} value={t}>
                {ETIQUETA_TAMANO[t]}
              </option>
            ))}
          </Selector>
        </Campo>

        <Campo id="experiencia" etiqueta="Experiencia mínima">
          <Selector name="experiencia" defaultValue={filtros.experienciaMinima?.toString() ?? ''}>
            <option value="">Sin mínimo</option>
            {AÑOS_EXPERIENCIA.map((n) => (
              <option key={n} value={n}>
                {n} años o más
              </option>
            ))}
          </Selector>
        </Campo>

        <Campo
          id="verificacion"
          etiqueta="Nivel de verificación"
          ayuda="Qué comprobamos nosotros del perfil. Nunca es un aval de su trabajo."
        >
          <Selector name="verificacion" defaultValue={filtros.verificacion ?? ''}>
            <option value="">Cualquiera</option>
            {(
              [
                'certificacion_externa_revisada',
                'documentacion_revisada',
                'identidad_verificada',
                'correo_verificado',
                'sin_verificar',
              ] as const
            ).map((v) => (
              <option key={v} value={v}>
                {ETIQUETA_VERIFICACION[v]}
              </option>
            ))}
          </Selector>
        </Campo>

        <Campo id="plan" etiqueta="Plan del proveedor" ayuda="El plan no afecta el orden de los resultados.">
          <Selector name="plan" defaultValue={filtros.plan ?? ''}>
            <option value="">Cualquiera</option>
            {(['gratuito', 'profesional', 'destacado'] as const).map((p) => (
              <option key={p} value={p}>
                {ETIQUETA_PLAN_PERFIL[p]}
              </option>
            ))}
          </Selector>
        </Campo>

        <fieldset className="flex flex-col justify-center gap-2 md:col-span-2 lg:col-span-1">
          <legend className="mb-1 text-sm font-medium text-[var(--color-tinta)]">
            Cobertura y disponibilidad
          </legend>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-[var(--color-tinta-suave)]">
            <input
              type="checkbox"
              name="cobertura"
              value="nacional"
              defaultChecked={filtros.soloNacional}
              className="size-4 cursor-pointer accent-[var(--color-petroleo)]"
            />
            Sólo con cobertura nacional
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-[var(--color-tinta-suave)]">
            <input
              type="checkbox"
              name="disponibilidad"
              value="abiertos"
              defaultChecked={filtros.soloDisponibles}
              className="size-4 cursor-pointer accent-[var(--color-petroleo)]"
            />
            Sólo quienes aceptan nuevos clientes
          </label>
        </fieldset>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Boton type="submit" variante="accion">
          <Search aria-hidden="true" />
          Aplicar filtros
        </Boton>
        {hayFiltrosActivos(filtros) && (
          <Link
            href="/directorio"
            className="text-sm font-medium text-[var(--color-petroleo-hondo)] underline underline-offset-4"
          >
            Limpiar todos los filtros
          </Link>
        )}
      </div>
    </form>
  );
}
