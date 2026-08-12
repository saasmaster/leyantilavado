import Link from 'next/link';
import { AlertTriangle, CalendarClock, Users, Wallet } from 'lucide-react';
import { proximasFechasLimite, datos, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Boton, Nota, Tarjeta, TarjetaCuerpo, TarjetaTitulo } from '@leyantilavado/ui';
import {
  EncabezadoSeccion,
  RejillaTarjetas,
  Seccion,
  TarjetaMetrica,
} from '@/components/app/Contenedor';
import { AvisoNoEsCumplimiento } from '@/components/app/Avisos';
import { contar } from '@/lib/app/consultas';
import { requerirContexto } from '@/lib/auth/sesion';
import { fechaDeHoy } from '@/lib/app/fecha';

function valor(resultado: Awaited<ReturnType<typeof contar>>): string {
  return resultado.estado === 'ok' ? String(resultado.filas[0] ?? 0) : 'Sin datos';
}

export default async function PaginaPanel() {
  const contexto = await requerirContexto();
  const org = contexto.organizacion?.organizacionId ?? null;
  const hoy = await fechaDeHoy();

  const [clientes, operaciones, alertas, avisos] = await Promise.all([
    contar('customers', { organizacionId: org }),
    contar('operations', { organizacionId: org }),
    contar('alerts', { organizacionId: org, filtros: { status: 'abierta' } }),
    contar('notice_records', { organizacionId: org, filtros: { status: 'borrador' } }),
  ]);

  const proximas = proximasFechasLimite(hoy, 3);
  const hitos = datos.CALENDARIO.filter((h) => h.fecha >= hoy).slice(0, 4);

  if (!contexto.organizacion) {
    return (
      <>
        <EncabezadoSeccion
          titulo="Panel de control"
          descripcion="Todavía no perteneces a ninguna organización."
        />
        <Nota tono="info" titulo="Crea tu organización para empezar">
          <p>
            El área privada guarda expedientes, operaciones y avisos por organización. Crea la tuya
            o pide a quien administra la existente que te invite.
          </p>
          <p className="mt-3">
            <Boton comoHijo variante="accion">
              <Link href="/panel/organizaciones">Ir a organizaciones</Link>
            </Boton>
          </p>
        </Nota>
      </>
    );
  }

  return (
    <>
      <EncabezadoSeccion
        titulo="Panel de control"
        descripcion={`Estado de ${contexto.organizacion.nombre} al ${formatearFechaLarga(hoy)}. Los conteos vienen de lo que tu organización capturó; esta pantalla no evalúa cumplimiento.`}
      />

      <RejillaTarjetas>
        <TarjetaMetrica etiqueta="Clientes registrados" valor={valor(clientes)} detalle="Expedientes de identificación" />
        <TarjetaMetrica etiqueta="Operaciones capturadas" valor={valor(operaciones)} detalle="Todas las actividades" />
        <TarjetaMetrica etiqueta="Alertas abiertas" valor={valor(alertas)} detalle="Pendientes de resolver" />
        <TarjetaMetrica etiqueta="Avisos en borrador" valor={valor(avisos)} detalle="Sin aprobar ni exportar" />
      </RejillaTarjetas>

      <div className="grid gap-4 lg:grid-cols-2">
        <Tarjeta>
          <TarjetaCuerpo className="flex flex-col gap-3">
            <TarjetaTitulo>
              <CalendarClock aria-hidden="true" className="mr-2 inline size-4 align-[-2px]" />
              Próximas fechas límite de aviso
            </TarjetaTitulo>
            <ul className="flex flex-col gap-2 text-sm">
              {proximas.map((f) => (
                <li key={f.fechaLimite} className="flex items-baseline justify-between gap-3">
                  <span className="text-[var(--color-tinta-suave)]">
                    Operaciones de {f.periodo}
                  </span>
                  <span className="cifra font-medium text-[var(--color-tinta)]">
                    {formatearFechaLarga(f.fechaLimite)}
                  </span>
                </li>
              ))}
            </ul>
            <Boton comoHijo variante="contorno" tamano="sm">
              <Link href="/panel/avisos">Ver el registro de avisos</Link>
            </Boton>
          </TarjetaCuerpo>
        </Tarjeta>

        <Tarjeta>
          <TarjetaCuerpo className="flex flex-col gap-3">
            <TarjetaTitulo>
              <AlertTriangle aria-hidden="true" className="mr-2 inline size-4 align-[-2px]" />
              Hitos del calendario normativo
            </TarjetaTitulo>
            {hitos.length === 0 ? (
              <p className="text-sm text-[var(--color-tinta-suave)]">
                No hay hitos futuros en el calendario cargado.
              </p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {hitos.map((h) => (
                  <li key={h.id}>
                    <span className="cifra text-[var(--color-tinta-suave)]">
                      {formatearFechaLarga(h.fecha)}
                    </span>
                    <span className="mx-2 text-[var(--color-tinta-tenue)]">·</span>
                    <span className="text-[var(--color-tinta)]">{h.titulo}</span>
                    {!h.confirmadoOficialmente && (
                      <span className="ml-2 text-xs text-[var(--color-ambar)]">
                        (fecha no confirmada oficialmente)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <Boton comoHijo variante="contorno" tamano="sm">
              <Link href="/panel/calendario">Ver el calendario completo</Link>
            </Boton>
          </TarjetaCuerpo>
        </Tarjeta>
      </div>

      <Seccion titulo="Atajos">
        <div className="flex flex-wrap gap-2">
          {contexto.puede('clientes.editar') && (
            <Boton comoHijo variante="contorno" tamano="sm">
              <Link href="/panel/clientes">
                <Users aria-hidden="true" />
                Clientes
              </Link>
            </Boton>
          )}
          {contexto.puede('operaciones.importar') && (
            <Boton comoHijo variante="contorno" tamano="sm">
              <Link href="/panel/operaciones/importar">
                <Wallet aria-hidden="true" />
                Importar operaciones
              </Link>
            </Boton>
          )}
          {contexto.puede('riesgos.ver') && (
            <Boton comoHijo variante="contorno" tamano="sm">
              <Link href="/panel/riesgo">Clasificación de riesgo</Link>
            </Boton>
          )}
        </div>
      </Seccion>

      <AvisoNoEsCumplimiento />
    </>
  );
}
