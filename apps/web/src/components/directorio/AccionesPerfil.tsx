'use client';

import * as React from 'react';
import { BookmarkCheck, BookmarkPlus, Flag, KeyRound, Share2 } from 'lucide-react';
import { Turnstile, reiniciarTurnstile } from '@/components/Turnstile';
import { AreaTexto, Boton, Campo, Entrada, Nota, Selector } from '@leyantilavado/ui';

/* ────────────────────────────────────────────────────────────────────────────
 * Acciones del perfil: guardar, compartir, reportar y reclamar.
 *
 * Los favoritos viven sólo en el navegador de quien los guarda. No se envían
 * al servidor: a quién estás mirando en un directorio de cumplimiento es un
 * dato sensible que no necesitamos.
 * ────────────────────────────────────────────────────────────────────────── */

const LLAVE_FAVORITOS = 'directorio:favoritos';

function suscribirFavoritos(alCambiar: () => void) {
  window.addEventListener('storage', alCambiar);
  window.addEventListener('favoritos-directorio', alCambiar);
  return () => {
    window.removeEventListener('storage', alCambiar);
    window.removeEventListener('favoritos-directorio', alCambiar);
  };
}

// El snapshot devuelve la cadena cruda: si devolviera un arreglo nuevo cada
// vez, React entraría en bucle de "getSnapshot should be cached".
function leerFavoritos(): string {
  try {
    return window.localStorage.getItem(LLAVE_FAVORITOS) ?? '';
  } catch {
    return '';
  }
}

const MOTIVOS = [
  ['informacion_incorrecta', 'La información del perfil es incorrecta o está desactualizada'],
  ['no_es_el_titular', 'Quien controla el perfil no es quien dice ser'],
  ['credencial_falsa', 'Una credencial o certificación parece falsa'],
  ['practica_enganosa', 'Ofrece resultados que la ley no permite garantizar'],
  ['perfil_duplicado', 'Es un perfil duplicado'],
  ['otro', 'Otro motivo'],
] as const;

type Panel = 'ninguno' | 'reportar' | 'reclamar';

export function AccionesPerfil({
  slug,
  nombre,
}: {
  slug: string;
  nombre: string;
}) {
  const guardados = React.useSyncExternalStore(suscribirFavoritos, leerFavoritos, () => '');
  const esFavorito = guardados.split(',').includes(slug);

  const [panel, setPanel] = React.useState<Panel>('ninguno');
  const [aviso, setAviso] = React.useState<string | null>(null);

  function alternarFavorito() {
    const actuales = guardados.split(',').filter(Boolean);
    const nuevos = esFavorito ? actuales.filter((s) => s !== slug) : [...actuales, slug];
    try {
      window.localStorage.setItem(LLAVE_FAVORITOS, nuevos.join(','));
      window.dispatchEvent(new Event('favoritos-directorio'));
    } catch {
      setAviso('Tu navegador no permite guardar favoritos (modo privado o almacenamiento lleno).');
    }
  }

  async function compartir() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: nombre, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setAviso('Copiamos el enlace de este perfil en tu portapapeles.');
    } catch {
      setAviso(`Copia el enlace manualmente: ${url}`);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Boton
          type="button"
          variante="contorno"
          tamano="sm"
          onClick={alternarFavorito}
          aria-pressed={esFavorito}
        >
          {esFavorito ? (
            <BookmarkCheck aria-hidden="true" />
          ) : (
            <BookmarkPlus aria-hidden="true" />
          )}
          {esFavorito ? 'Guardado' : 'Guardar'}
        </Boton>

        <Boton type="button" variante="contorno" tamano="sm" onClick={compartir}>
          <Share2 aria-hidden="true" />
          Compartir
        </Boton>

        <Boton
          type="button"
          variante="contorno"
          tamano="sm"
          onClick={() => setPanel(panel === 'reclamar' ? 'ninguno' : 'reclamar')}
          aria-expanded={panel === 'reclamar'}
        >
          <KeyRound aria-hidden="true" />
          ¿Es tu perfil?
        </Boton>

        <Boton
          type="button"
          variante="fantasma"
          tamano="sm"
          onClick={() => setPanel(panel === 'reportar' ? 'ninguno' : 'reportar')}
          aria-expanded={panel === 'reportar'}
        >
          <Flag aria-hidden="true" />
          Reportar perfil
        </Boton>
      </div>

      {aviso && <Nota tono="info">{aviso}</Nota>}

      {panel === 'reclamar' && (
        <PanelEnvio
          key="reclamar"
          titulo="Reclamar este perfil"
          descripcion={`Si trabajas en ${nombre} y quieres administrar este perfil, cuéntanos cómo podemos comprobarlo. Revisamos cada reclamo a mano antes de dar acceso.`}
          endpoint="/api/directorio/reclamar"
          slug={slug}
          campos="reclamo"
        />
      )}

      {panel === 'reportar' && (
        <PanelEnvio
          key="reportar"
          titulo="Reportar este perfil"
          descripcion="Cuéntanos qué está mal. Puedes reportar sin dejar tu correo; si lo dejas, te avisamos qué resolvimos."
          endpoint="/api/directorio/reportar"
          slug={slug}
          campos="reporte"
        />
      )}
    </div>
  );
}

/* ── Panel de envío ──────────────────────────────────────────────────────────
   Un solo componente para reclamo y reporte: cambian tres campos y el texto,
   no la mecánica.
   ─────────────────────────────────────────────────────────────────────────── */

function PanelEnvio({
  titulo,
  descripcion,
  endpoint,
  slug,
  campos,
}: {
  titulo: string;
  descripcion: string;
  endpoint: string;
  slug: string;
  campos: 'reclamo' | 'reporte';
}) {
  const [enviando, setEnviando] = React.useState(false);
  const [errores, setErrores] = React.useState<Record<string, string>>({});
  const [folio, setFolio] = React.useState<string | null>(null);

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const cuerpo =
      campos === 'reclamo'
        ? {
            proveedorSlug: slug,
            nombre: datos.get('nombre'),
            correo: datos.get('correo'),
            telefono: datos.get('telefono') || undefined,
            cargo: datos.get('cargo'),
            pruebaRelacion: datos.get('pruebaRelacion'),
            consentimiento: datos.get('consentimiento') === 'si',
          }
        : {
            proveedorSlug: slug,
            motivo: datos.get('motivo'),
            detalle: datos.get('detalle'),
            correo: datos.get('correo') || undefined,
          };

    setEnviando(true);
    setErrores({});
    try {
      const respuesta = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...cuerpo,
          'cf-turnstile-response': String(datos.get('cf-turnstile-response') ?? ''),
        }),
      });
      const json = (await respuesta.json()) as {
        ok?: boolean;
        folio?: string;
        errores?: Record<string, string>;
        error?: string;
      };
      if (json.ok && json.folio) setFolio(json.folio);
      else setErrores(json.errores ?? { formulario: json.error ?? 'No se pudo enviar.' });
    } catch {
      setErrores({ formulario: 'No hay conexión con el servidor. Vuelve a intentarlo.' });
    } finally {
      setEnviando(false);
      reiniciarTurnstile();
    }
  }

  if (folio) {
    return (
      <Nota tono="exito" titulo="Recibido">
        Tu folio es <strong>{folio}</strong>. Lo revisa una persona del equipo editorial; el plazo
        habitual es de 3 a 5 días hábiles.
      </Nota>
    );
  }

  return (
    <form
      onSubmit={enviar}
      noValidate
      className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--color-borde-fuerte)] p-5"
    >
      <div>
        <h3 className="text-base font-semibold text-[var(--color-tinta)]">{titulo}</h3>
        <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">{descripcion}</p>
      </div>

      {campos === 'reclamo' ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo id="rec-nombre" etiqueta="Tu nombre" requerido {...(errores['nombre'] ? { error: errores['nombre'] } : {})}>
              <Entrada name="nombre" required maxLength={120} />
            </Campo>
            <Campo id="rec-cargo" etiqueta="Tu cargo" requerido {...(errores['cargo'] ? { error: errores['cargo'] } : {})}>
              <Entrada name="cargo" required maxLength={120} />
            </Campo>
            <Campo id="rec-correo" etiqueta="Correo corporativo" requerido ayuda="De preferencia con el dominio de la firma." {...(errores['correo'] ? { error: errores['correo'] } : {})}>
              <Entrada name="correo" type="email" required maxLength={160} />
            </Campo>
            <Campo id="rec-telefono" etiqueta="Teléfono" ayuda="Opcional.">
              <Entrada name="telefono" type="tel" maxLength={20} />
            </Campo>
          </div>
          <Campo
            id="rec-prueba"
            etiqueta="¿Cómo podemos comprobar tu relación con el perfil?"
            requerido
            ayuda="Por ejemplo: correo con el dominio de la firma, alta patronal, acta constitutiva o una publicación oficial donde aparezcas."
            {...(errores['pruebaRelacion'] ? { error: errores['pruebaRelacion'] } : {})}
          >
            <AreaTexto name="pruebaRelacion" required minLength={30} maxLength={1200} />
          </Campo>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-[var(--color-tinta)]">
            <input
              type="checkbox"
              name="consentimiento"
              value="si"
              required
              className="mt-1 size-4 shrink-0 cursor-pointer accent-[var(--color-petroleo)]"
            />
            <span>
              Autorizo que me contacten a este correo para verificar el reclamo. Entiendo que el
              perfil no cambia de manos hasta que la verificación concluya.
            </span>
          </label>
          {errores['consentimiento'] && (
            <p role="alert" className="text-xs font-medium text-[var(--color-rojo)]">
              {errores['consentimiento']}
            </p>
          )}
        </>
      ) : (
        <>
          <Campo id="rep-motivo" etiqueta="Motivo" requerido {...(errores['motivo'] ? { error: errores['motivo'] } : {})}>
            <Selector name="motivo" defaultValue="informacion_incorrecta" required>
              {MOTIVOS.map(([valor, etiqueta]) => (
                <option key={valor} value={valor}>
                  {etiqueta}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo
            id="rep-detalle"
            etiqueta="Qué encontraste"
            requerido
            ayuda="Sé concreto: qué dato está mal y, si puedes, dónde se ve lo correcto."
            {...(errores['detalle'] ? { error: errores['detalle'] } : {})}
          >
            <AreaTexto name="detalle" required minLength={30} maxLength={2000} />
          </Campo>
          <Campo
            id="rep-correo"
            etiqueta="Tu correo"
            ayuda="Opcional: puedes reportar de forma anónima."
            {...(errores['correo'] ? { error: errores['correo'] } : {})}
          >
            <Entrada name="correo" type="email" maxLength={160} />
          </Campo>
        </>
      )}

      {errores['formulario'] && <Nota tono="riesgo">{errores['formulario']}</Nota>}

      <div>
        <Turnstile className="my-1" />
        <Boton type="submit" variante="primario" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Enviar'}
        </Boton>
      </div>
    </form>
  );
}
