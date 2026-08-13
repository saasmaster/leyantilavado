import Link from 'next/link';
import { Boton, Nota } from '@leyantilavado/ui';
import { EncabezadoSeccion, Seccion } from '@/components/app/Contenedor';
import { TablaRecurso, type ColumnaTabla } from '@/components/app/TablaRecurso';
import {
  AvisoEnvioManual,
  AvisoFormatoOficial,
  AvisoNoEsCumplimiento,
} from '@/components/app/Avisos';
import { requerirPermiso } from '@/lib/auth/sesion';

const COLUMNAS = [
  { clave: 'period', titulo: 'Periodo' },
  { clave: 'activity_slug', titulo: 'Actividad', formato: 'insignia' },
  { clave: 'reference', titulo: 'Referencia', vacio: 'Sin referencia' },
  { clave: 'amount_cents', titulo: 'Monto', formato: 'dinero' },
  { clave: 'due_date', titulo: 'Fecha límite', formato: 'fecha' },
  { clave: 'status', titulo: 'Estado', formato: 'insignia' },
  { clave: 'exported_at', titulo: 'Exportado', formato: 'fecha_hora', vacio: 'Sin exportar' },
  {
    clave: 'acknowledgement_ref',
    titulo: 'Folio del acuse',
    vacio: 'Sin acuse cargado',
  },
  { clave: 'acknowledgement_at', titulo: 'Fecha del acuse', formato: 'fecha', vacio: '—' },
] satisfies readonly ColumnaTabla[];

const FLUJO: readonly { estado: string; titulo: string; texto: string }[] = [
  {
    estado: 'borrador',
    titulo: 'Preparar',
    texto:
      'Se arma el contenido del aviso con las operaciones del periodo. Cualquier persona con escritura operativa puede llegar hasta aquí.',
  },
  {
    estado: 'en_revision',
    titulo: 'Revisar',
    texto:
      'Otra persona verifica los datos capturados contra el expediente. Queda registrado quién revisó y cuándo.',
  },
  {
    estado: 'aprobado',
    titulo: 'Aprobar',
    texto:
      'La aprobación exige rol de administración. La base de datos lo comprueba sobre la fila resultante, así que no hay forma de dejar un aviso aprobado sin ese permiso.',
  },
  {
    estado: 'exportado',
    titulo: 'Exportar',
    texto:
      'Se descarga el archivo con los datos del aviso. Aquí termina lo que hace esta plataforma: exportar no es presentar.',
  },
  {
    estado: 'con_acuse',
    titulo: 'Cargar el acuse',
    texto:
      'Después de subir el aviso al portal SPPLD, tú capturas aquí el folio y la fecha del acuse que te devolvió la autoridad, y adjuntas el documento. Nadie más puede marcar este estado por ti, porque nadie más tiene ese acuse.',
  },
  {
    estado: 'no_procede',
    titulo: 'No procede',
    texto:
      'Se analizó y se concluyó que no hay que presentar aviso. Esa decisión también se registra: un aviso descartado sin rastro es indistinguible de un aviso olvidado.',
  },
];

export default async function PaginaAvisos() {
  const contexto = await requerirPermiso('avisos.ver', '/panel/avisos');
  const org = contexto.organizacion?.organizacionId ?? null;

  return (
    <>
      <EncabezadoSeccion
        titulo="Registro de avisos"
        descripcion="Preparación, revisión, aprobación y exportación del contenido de los avisos. La presentación ante la autoridad la haces tú."
      />

      <AvisoEnvioManual />
      <AvisoFormatoOficial />

      <Seccion
        titulo="El flujo completo"
        descripcion="Estos son los estados que puede tener un aviso en esta plataforma. No existe un estado «enviado»."
      >
        <ol className="flex flex-col gap-3">
          {FLUJO.map((paso, i) => (
            <li key={paso.estado} className="tarjeta flex gap-4 p-4">
              <span
                aria-hidden="true"
                className="cifra flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-marino-tenue)] text-sm font-semibold text-[var(--color-marino)]"
              >
                {i + 1}
              </span>
              <div>
                <p className="font-medium text-[var(--color-tinta)]">
                  {paso.titulo}{' '}
                  <code className="text-xs text-[var(--color-tinta-tenue)]">{paso.estado}</code>
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-tinta-suave)]">
                  {paso.texto}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Seccion>

      <Seccion
        titulo="Avisos registrados"
        descripcion="Ordenados por periodo, del más reciente al más antiguo."
      >
        <TablaRecurso
          tabla="notice_records"
          columnas={COLUMNAS}
          organizacionId={org}
          ordenarPor="period"
          vacioTitulo="Todavía no hay avisos preparados"
          vacioDescripcion="Un aviso se arma a partir de las operaciones capturadas del periodo. Cuando prepares el primero aparecerá aquí con su estado y su fecha límite."
          pie={
            contexto.puede('documentos.descargar') ? (
              <div className="flex flex-wrap gap-2">
                <Boton comoHijo variante="contorno" tamano="sm">
                  <Link href="/panel/exportaciones">Ir a exportaciones</Link>
                </Boton>
                <Boton comoHijo variante="fantasma" tamano="sm">
                  <Link href="/panel/calendario">Ver las próximas fechas límite</Link>
                </Boton>
              </div>
            ) : undefined
          }
        />
      </Seccion>

      <Nota tono="riesgo" titulo="Exportar no es presentar">
        <p>
          Un aviso marcado como <code>exportado</code> significa únicamente que descargaste el
          archivo. Mientras no lo cargues en el portal SPPLD y guardes el acuse, la obligación sigue
          pendiente ante la autoridad, aunque esta pantalla se vea completa.
        </p>
      </Nota>

      <AvisoNoEsCumplimiento />
    </>
  );
}
