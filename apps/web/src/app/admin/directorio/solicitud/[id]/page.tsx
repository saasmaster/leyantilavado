import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download } from 'lucide-react';
import {
  AreaTexto,
  Boton,
  Campo,
  EstadoVacio,
  Insignia,
  Nota,
  Selector,
  Tarjeta,
  TarjetaCuerpo,
} from '@leyantilavado/ui';
import { EncabezadoSeccion, Seccion } from '@/components/app/Contenedor';
import { fechaDeHoy } from '@/lib/app/fecha';
import { requerirStaff } from '@/lib/auth/sesion';
import { ETIQUETA_CATEGORIA, esCategoria } from '@/lib/directorio/catalogo';
import { repositorioDirectorio, type AltaProveedor } from '@/lib/directorio/repositorio';
import { aprobar, pedirCorreccion, rechazar } from '../../acciones';
import {
  ETIQUETA_DECISION,
  ETIQUETA_ESTADO,
  ETIQUETA_NIVEL,
  NIVELES_APROBABLES,
  QUE_SIGNIFICA_NIVEL,
  TONO_ESTADO,
  diasEspera,
  fechaHora,
} from '../../estados';

/* ────────────────────────────────────────────────────────────────────────────
 * Detalle de una solicitud de alta.
 *
 * Sin `metadata` propia: hereda el `noindex` del layout de /admin.
 * ────────────────────────────────────────────────────────────────────────── */

const MENSAJE_ERROR: Record<string, string> = {
  motivo: 'Escribe el motivo. Sin él, quien se dio de alta no sabe qué corregir.',
  nivel: 'Elige un nivel de verificación válido para aprobar.',
  no_encontrada: 'Esa solicitud ya no existe en el almacén.',
};

const MENSAJE_AVISO: Record<string, string> = {
  aprobada: 'Aprobada. El perfil quedó con el nivel de verificación que elegiste.',
  rechazada: 'Rechazada. El perfil dejó de listarse; la solicitud y su motivo se conservan.',
  correccion_solicitada:
    'Corrección pedida. El perfil sigue publicado como «Sin verificar» mientras se corrige.',
};

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-tinta-tenue)]">
        {etiqueta}
      </dt>
      <dd className="mt-0.5 text-sm text-[var(--color-tinta)]">{children}</dd>
    </div>
  );
}

function lista(valores: readonly string[] | undefined, vacio: string): string {
  return valores && valores.length > 0 ? valores.join(', ') : vacio;
}

function si(valor: boolean): string {
  return valor ? 'Sí' : 'No';
}

function TextoLargo({ contenido, vacio }: { contenido: string | undefined; vacio: string }) {
  if (!contenido?.trim()) {
    return <span className="text-[var(--color-tinta-tenue)]">{vacio}</span>;
  }
  return <span className="whitespace-pre-line">{contenido}</span>;
}

function Documentos({ alta }: { alta: AltaProveedor }) {
  const documentos = alta.documentos ?? [];

  if (documentos.length === 0) {
    return (
      <EstadoVacio
        titulo="No subió ningún documento"
        descripcion="Sin documentos no se puede pasar de «Identidad verificada»: los niveles superiores exigen que alguien haya mirado un papel. Pídeselos por correo antes de aprobar un nivel alto."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {documentos.map((doc) => (
        <li
          key={doc.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--color-borde)] px-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-[var(--color-tinta)]">{doc.nombreOriginal}</p>
            <p className="text-xs text-[var(--color-tinta-suave)]">
              {doc.tipo} · {Math.max(1, Math.round(doc.bytes / 1024))} KB · subido el{' '}
              <span className="cifra">{fechaHora(doc.subidoEn)}</span>
            </p>
          </div>
          <Boton comoHijo variante="contorno" tamano="sm">
            <a href={`/admin/directorio/documento/${doc.id}`} download>
              <Download aria-hidden="true" />
              Descargar
              <span className="sr-only"> {doc.nombreOriginal}</span>
            </a>
          </Boton>
        </li>
      ))}
    </ul>
  );
}

export default async function PaginaSolicitud({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requerirStaff();

  const { id } = await params;
  const consulta = await searchParams;
  const hoy = await fechaDeHoy();

  const alta = (await repositorioDirectorio.listarAltas()).find((a) => a.id === id);
  if (!alta) notFound();

  const error = typeof consulta['error'] === 'string' ? consulta['error'] : undefined;
  const aviso = typeof consulta['aviso'] === 'string' ? consulta['aviso'] : undefined;
  const bitacora = alta.bitacora ?? [];

  return (
    <>
      <EncabezadoSeccion
        titulo={alta.nombre}
        descripcion={`Solicitud ${alta.folio}, recibida el ${fechaHora(alta.creadoEn)}. Lleva ${diasEspera(alta.creadoEn, hoy)} día(s) en la bandeja.`}
        etiqueta={ETIQUETA_ESTADO[alta.estadoModeracion]}
        acciones={
          <Boton comoHijo variante="fantasma" tamano="sm">
            <Link href="/admin/directorio">
              <ArrowLeft aria-hidden="true" />
              Volver a la bandeja
            </Link>
          </Boton>
        }
      />

      {error && MENSAJE_ERROR[error] && (
        <Nota tono="riesgo" titulo="No se registró la decisión">
          <p>{MENSAJE_ERROR[error]}</p>
        </Nota>
      )}

      {aviso && MENSAJE_AVISO[aviso] && (
        <Nota tono="exito" titulo="Decisión registrada">
          <p>{MENSAJE_AVISO[aviso]}</p>
        </Nota>
      )}

      <Seccion titulo="Lo que envió" descripcion="Tal cual llegó del formulario público.">
        <Tarjeta>
          <TarjetaCuerpo>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Dato etiqueta="Folio">
                <span className="cifra">{alta.folio}</span>
              </Dato>
              <Dato etiqueta="Estado de moderación">
                <Insignia tono={TONO_ESTADO[alta.estadoModeracion]}>
                  {ETIQUETA_ESTADO[alta.estadoModeracion]}
                </Insignia>
              </Dato>
              <Dato etiqueta="Perfil público">
                {alta.perfilSlug ? (
                  <Link
                    href={`/directorio/profesional/${alta.perfilSlug}`}
                    className="cursor-pointer text-[var(--color-petroleo-hondo)] underline underline-offset-4"
                  >
                    /directorio/profesional/{alta.perfilSlug}
                  </Link>
                ) : (
                  <span className="text-[var(--color-tinta-tenue)]">Sin perfil asociado</span>
                )}
              </Dato>
              <Dato etiqueta="Correo de contacto">{alta.correoContacto}</Dato>
              <Dato etiqueta="Teléfono">
                <TextoLargo contenido={alta.telefono} vacio="No lo dio" />
              </Dato>
              <Dato etiqueta="Sitio web">
                <TextoLargo contenido={alta.sitioWeb} vacio="No lo dio" />
              </Dato>
              <Dato etiqueta="Categorías">
                {lista(
                  alta.categorias.map((c) => (esCategoria(c) ? ETIQUETA_CATEGORIA[c] : c)),
                  'Sin categoría',
                )}
              </Dato>
              <Dato etiqueta="Actividades que atiende">
                {lista(alta.actividadesAtendidas, 'Ninguna declarada')}
              </Dato>
              <Dato etiqueta="Servicios">{lista(alta.servicios, 'Ninguno declarado')}</Dato>
              <Dato etiqueta="Ubicación">
                {alta.ciudad ? `${alta.ciudad}, ${alta.estado}` : alta.estado}
              </Dato>
              <Dato etiqueta="Cobertura y modalidad">
                Nacional: {si(alta.coberturaNacional)} · Remota: {si(alta.atencionRemota)} ·
                Presencial: {si(alta.atencionPresencial)}
              </Dato>
              <Dato etiqueta="Idiomas">{lista(alta.idiomas, 'No los dijo')}</Dato>
              <Dato etiqueta="Tamaño de cliente">
                {lista(alta.tamanosCliente, 'No lo dijo')}
              </Dato>
              <Dato etiqueta="Años de experiencia">
                {alta.aniosExperiencia !== undefined ? (
                  <span className="cifra">{alta.aniosExperiencia}</span>
                ) : (
                  <span className="text-[var(--color-tinta-tenue)]">No lo dijo</span>
                )}
              </Dato>
              <Dato etiqueta="Consentimiento">{si(alta.consentimiento)}</Dato>
            </dl>

            <dl className="mt-6 flex flex-col gap-4 border-t border-[var(--color-borde)] pt-5">
              <Dato etiqueta="Descripción">
                <TextoLargo contenido={alta.biografia} vacio="Sin descripción" />
              </Dato>
              <Dato etiqueta="Credenciales que declara">
                <TextoLargo contenido={alta.credenciales} vacio="No declaró ninguna" />
              </Dato>
              <Dato etiqueta="Documentos que dice enviar">
                <TextoLargo contenido={alta.documentosDescritos} vacio="No describió ninguno" />
              </Dato>
            </dl>

            <Nota tono="atencion" className="mt-5" titulo="Esto es lo que dice de sí mismo">
              <p>
                Las credenciales llegan como texto libre y <strong>no se publican</strong> como
                credenciales verificadas. Contrástalas contra los documentos antes de subir el nivel
                de verificación.
              </p>
            </Nota>
          </TarjetaCuerpo>
        </Tarjeta>
      </Seccion>

      <Seccion
        titulo="Documentos subidos"
        descripcion="Se guardan fuera de public/ y no tienen URL pública. La descarga pasa por un manejador que comprueba tu sesión de personal antes de leer el archivo, y no revela dónde está guardado."
      >
        <Documentos alta={alta} />
      </Seccion>

      <Seccion
        titulo="Decidir"
        descripcion="Cada decisión queda firmada con tu cuenta y la hora. Ninguna borra nada."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <form action={aprobar} className="tarjeta flex flex-col gap-4 p-5">
            <input type="hidden" name="id" value={alta.id} />
            <div>
              <h3 className="font-semibold text-[var(--color-tinta)]">Aprobar</h3>
              <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">
                Publicable con el nivel que corresponda a lo que revisaste. Nunca significa
                &laquo;certificado por LeyAntilavado.org&raquo;.
              </p>
            </div>
            <Campo
              id="nivel"
              etiqueta="Nivel de verificación"
              ayuda="Elige el nivel más bajo que puedas sostener con lo que miraste."
              requerido
            >
              <Selector name="nivel" defaultValue={NIVELES_APROBABLES[0]}>
                {NIVELES_APROBABLES.map((nivel) => (
                  <option key={nivel} value={nivel}>
                    {ETIQUETA_NIVEL[nivel]} — {QUE_SIGNIFICA_NIVEL[nivel]}
                  </option>
                ))}
              </Selector>
            </Campo>
            <Campo id="motivo-aprobacion" etiqueta="Nota interna" ayuda="Opcional.">
              <AreaTexto name="motivo" maxLength={2000} rows={3} />
            </Campo>
            <Boton type="submit" variante="accion">
              Aprobar con este nivel
            </Boton>
          </form>

          <form action={pedirCorreccion} className="tarjeta flex flex-col gap-4 p-5">
            <input type="hidden" name="id" value={alta.id} />
            <div>
              <h3 className="font-semibold text-[var(--color-tinta)]">Pedir corrección</h3>
              <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">
                Para datos incompletos o dudosos. El perfil sigue publicado como &laquo;Sin
                verificar&raquo;.
              </p>
            </div>
            <Campo
              id="motivo-correccion"
              etiqueta="Qué tiene que corregir"
              ayuda="Se guarda en la bitácora. Escríbelo como se lo dirías a esa persona."
              requerido
            >
              <AreaTexto name="motivo" required maxLength={2000} rows={5} />
            </Campo>
            <Boton type="submit" variante="contorno">
              Pedir corrección
            </Boton>
          </form>

          <form action={rechazar} className="tarjeta flex flex-col gap-4 p-5">
            <input type="hidden" name="id" value={alta.id} />
            <div>
              <h3 className="font-semibold text-[var(--color-tinta)]">Rechazar</h3>
              <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">
                Despublica la ficha del directorio. No borra la solicitud ni el perfil.
              </p>
            </div>
            <Campo
              id="motivo-rechazo"
              etiqueta="Motivo del rechazo"
              ayuda="Obligatorio. Es lo que sostiene la decisión si alguien la reclama."
              requerido
            >
              <AreaTexto name="motivo" required maxLength={2000} rows={5} />
            </Campo>
            <Boton type="submit" variante="peligro">
              Rechazar y despublicar
            </Boton>
          </form>
        </div>
      </Seccion>

      <Seccion
        titulo="Bitácora"
        descripcion="Quién decidió qué y cuándo. Se conserva completa: una decisión posterior no sustituye a la anterior."
      >
        {bitacora.length === 0 ? (
          <EstadoVacio
            titulo="Nadie ha decidido todavía"
            descripcion="Esta solicitud no tiene ninguna decisión registrada. Si es anterior a esta consola, tampoco la tendría: hasta ahora no había dónde escribirla."
          />
        ) : (
          <ol className="flex flex-col gap-3">
            {[...bitacora].reverse().map((entrada, i) => (
              <li
                key={`${entrada.registradoEn}-${i}`}
                className="rounded-[var(--radius-card)] border border-[var(--color-borde)] px-4 py-3"
              >
                <p className="text-sm font-medium text-[var(--color-tinta)]">
                  {ETIQUETA_DECISION[entrada.decision]}
                  {entrada.nivelVerificacion
                    ? ` · ${ETIQUETA_NIVEL[entrada.nivelVerificacion]}`
                    : ''}
                </p>
                <p className="text-xs text-[var(--color-tinta-suave)]">
                  {entrada.actor} · <span className="cifra">{fechaHora(entrada.registradoEn)}</span>
                </p>
                {entrada.motivo && (
                  <p className="mt-2 whitespace-pre-line text-sm text-[var(--color-tinta)]">
                    {entrada.motivo}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </Seccion>
    </>
  );
}
