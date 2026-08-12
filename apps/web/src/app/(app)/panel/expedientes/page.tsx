import { datos, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Nota, SelloProcedencia, Tarjeta, TarjetaCuerpo, TarjetaTitulo } from '@leyantilavado/ui';
import { EncabezadoSeccion, Seccion } from '@/components/app/Contenedor';
import { TablaRecurso, type ColumnaTabla } from '@/components/app/TablaRecurso';
import { AvisoNoEsCumplimiento } from '@/components/app/Avisos';
import { requerirContexto } from '@/lib/auth/sesion';
import { fechaDeHoy } from '@/lib/app/fecha';

const COLUMNAS: readonly ColumnaTabla[] = [
  { clave: 'title', titulo: 'Documento' },
  { clave: 'kind', titulo: 'Tipo', formato: 'insignia' },
  { clave: 'issued_on', titulo: 'Emitido', formato: 'fecha', vacio: 'Sin fecha' },
  { clave: 'expires_on', titulo: 'Vence', formato: 'fecha', vacio: 'Sin vencimiento' },
  { clave: 'retain_until', titulo: 'Conservar hasta', formato: 'fecha', vacio: 'Sin fecha de retención' },
  { clave: 'mime_type', titulo: 'Formato', vacio: 'Sin registrar' },
  { clave: 'size_bytes', titulo: 'Tamaño (bytes)', formato: 'numero', vacio: '—' },
];

export default async function PaginaExpedientes() {
  const contexto = await requerirContexto('/panel/expedientes');
  const org = contexto.organizacion?.organizacionId ?? null;
  const hoy = await fechaDeHoy();
  const conservacion = datos.OBLIGACIONES.find((o) => o.categoria === 'conservacion');

  return (
    <>
      <EncabezadoSeccion
        titulo="Expedientes y documentos"
        descripcion={`Metadatos de los documentos que integran los expedientes: cuándo se emitieron, cuándo vencen y hasta cuándo hay que conservarlos. Fecha de referencia: ${formatearFechaLarga(hoy)}.`}
      />

      <Seccion titulo="Documentos vencidos o por vencer">
        <TablaRecurso
          tabla="documents"
          columnas={COLUMNAS}
          organizacionId={org}
          ordenarPor="expires_on"
          ascendente
          vacioTitulo="Todavía no hay documentos registrados"
          vacioDescripcion="Esta tabla guarda sólo metadatos: el archivo vive en el almacenamiento y su acceso lo controlan las políticas del bucket. Aquí nunca se guarda contenido de e.firma."
          pie={
            <p className="text-xs text-[var(--color-tinta-suave)]">
              Ordenados por fecha de vencimiento, primero los más próximos. Los documentos sin
              vencimiento aparecen al final. Compara la columna «Vence» contra la fecha de hoy (
              {formatearFechaLarga(hoy)}): esta pantalla no marca por ti cuáles ya vencieron porque
              el criterio de vigencia depende del tipo de documento.
            </p>
          }
        />
      </Seccion>

      <Seccion titulo="Conservación del expediente">
        {conservacion ? (
          <Tarjeta>
            <TarjetaCuerpo className="flex flex-col gap-3">
              <TarjetaTitulo className="text-base">{conservacion.titulo}</TarjetaTitulo>
              <p className="text-sm text-[var(--color-tinta-suave)]">{conservacion.resumen}</p>
              <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm text-[var(--color-tinta)]">
                {conservacion.pasos.map((p) => (
                  <li key={p.id}>
                    {p.texto}
                    {p.evidencia && (
                      <span className="block text-xs text-[var(--color-tinta-tenue)]">
                        Evidencia esperada: {p.evidencia}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
              <SelloProcedencia procedencia={conservacion.procedencia} fuentes={datos.FUENTES_POR_ID} />
            </TarjetaCuerpo>
          </Tarjeta>
        ) : (
          <Nota tono="riesgo" titulo="Requiere revisión editorial">
            <p>
              El corpus legal cargado no trae la obligación de conservación. No vamos a escribir el
              plazo de memoria en esta pantalla.
            </p>
          </Nota>
        )}
      </Seccion>

      <Nota tono="atencion" titulo="La columna «Conservar hasta» la calculas tú, no la ley">
        <p>
          El campo <code>retain_until</code> guarda la fecha que tu organización decidió para cada
          documento. Contrástalo contra el plazo de la obligación de arriba, que es el que está
          registrado en el corpus legal con su fuente: si tu criterio de cómputo es más corto,
          quedará documentación fuera de resguardo antes de tiempo. La plataforma no reescribe esa
          fecha por ti ni afirma que el plazo capturado sea el correcto.
        </p>
      </Nota>

      <AvisoNoEsCumplimiento />
    </>
  );
}
