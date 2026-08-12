import type { Metadata } from 'next';
import Link from 'next/link';
import {
  AlertTriangle,
  BookLock,
  Boxes,
  ClipboardList,
  FileWarning,
  GraduationCap,
  History,
  ListChecks,
  Radar,
  ScrollText,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react';
import { datos } from '@leyantilavado/rules-engine';
import { MATRIZ_PERMISOS, ROLES_ORGANIZACION, type RolOrganizacion } from '@leyantilavado/types';
import { AvisoIndependencia, Boton, Nota, TablaEnvoltura } from '@leyantilavado/ui';
import { construirMetadata, jsonLdMigaDePan } from '@/lib/sitio';
import { EncabezadoPagina, Seccion } from '@/components/inicio/comun';

export const metadata: Metadata = construirMetadata({
  titulo: 'Plataforma de cumplimiento PLD/FT',
  descripcion:
    'Área privada para administrar el cumplimiento de la LFPIORPI: clientes, expedientes, beneficiario controlador, operaciones, acumulación de seis meses, alertas, riesgos, capacitación y auditoría. Con el mismo motor jurídico que las calculadoras públicas.',
  ruta: '/plataforma',
});

const MIGA = jsonLdMigaDePan([
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Plataforma de cumplimiento', ruta: '/plataforma' },
]);

/* ────────────────────────────────────────────────────────────────────────── */

const MODULOS = [
  {
    icono: Users,
    titulo: 'Clientes y usuarios',
    descripcion:
      'Personas físicas, morales y fideicomisos con su expediente único de identificación. El expediente marca por sí solo qué documentos faltan, en lugar de esperar a que alguien lo note.',
    incluye: [
      'Expediente único con control de versiones',
      'Recordatorio de actualización periódica',
      'Manifestación de actuar por cuenta propia o de tercero',
      'Alertas de documentación vencida',
    ],
  },
  {
    icono: Boxes,
    titulo: 'Beneficiario controlador',
    descripcion:
      'Estructura de propiedad con porcentajes y control por otros medios. Calcula la propiedad indirecta a lo largo de la cadena y señala dónde se pierde el rastro.',
    incluye: [
      'Cadena de propiedad con cálculo indirecto',
      'Control por medios distintos a la participación',
      'Registro de por qué no fue posible determinarlo',
      'Régimen fiscal del CFF, separado del de la LFPIORPI',
    ],
  },
  {
    icono: ClipboardList,
    titulo: 'Operaciones',
    descripcion:
      'Captura manual o importación por CSV con validación fila por fila. Cada operación se evalúa contra la regla vigente en SU fecha, no en la de hoy.',
    incluye: [
      'Importación CSV con reporte de errores por fila',
      'Evaluación con la UMA vigente en la fecha de la operación',
      'Acumulación antifraccionamiento de seis meses',
      'Verificación del límite de efectivo del art. 32',
    ],
  },
  {
    icono: Radar,
    titulo: 'Alertas y casos',
    descripcion:
      'Detección de umbrales y acumulación, con expediente de investigación por cada alerta. Queda registrada la decisión incluso cuando se concluye que no procede el aviso.',
    incluye: [
      'Umbral alcanzado por operación o por acumulación',
      'Desviación contra el perfil transaccional',
      'Escalamiento al representante encargado del cumplimiento',
      'Bitácora de resolución con responsable y fecha',
    ],
  },
  {
    icono: ShieldCheck,
    titulo: 'Riesgos',
    descripcion:
      'Metodología de enfoque basado en riesgos con factores y ponderaciones editables, mitigantes y clasificación de clientes en bajo, medio y alto.',
    incluye: [
      'Factores: operación, cliente, geografía, canal, PEP',
      'Ponderaciones documentadas y versionadas',
      'Debida diligencia reforzada automática en riesgo alto',
      'Revisión semestral con recordatorio',
    ],
  },
  {
    icono: ScrollText,
    titulo: 'Avisos e informes',
    descripcion:
      'Preparación, revisión, aprobación y exportación de avisos, con la fecha límite del día 17 calculada por periodo. Incluye el informe en ceros.',
    incluye: [
      'Fecha límite por periodo con cuenta regresiva',
      'Flujo de aprobación con responsable',
      'Informe en ceros cuando no hubo operaciones',
      'Resguardo del acuse',
    ],
  },
  {
    icono: GraduationCap,
    titulo: 'Capacitación',
    descripcion:
      'Evidencia del periodo anual obligatorio: personal alcanzado, asistencia, evaluación y constancias.',
    incluye: [
      'Programa anual por puesto',
      'Registro de asistencia y evaluación',
      'Constancias conservadas por el plazo aplicable',
    ],
  },
  {
    icono: ListChecks,
    titulo: 'Auditoría y dictamen',
    descripcion:
      'Auditorías con hallazgos, severidad, plan de remediación y seguimiento hasta el cierre de cada observación.',
    incluye: [
      'Alcance y plan de trabajo',
      'Hallazgos con severidad y responsable',
      'Plan de remediación con fechas',
      'Seguimiento hasta el cierre',
    ],
  },
  {
    icono: History,
    titulo: 'Bitácora y trazabilidad',
    descripcion:
      'Registro de auditoría que sólo agrega, nunca modifica ni borra. Cada cambio de regla guarda autor, versión, fecha, motivo y fuente.',
    incluye: [
      'Bitácora de sólo escritura',
      'Historial de versiones del manual',
      'Cambios de reglas con motivo y fuente',
      'Exportación para el auditor externo',
    ],
  },
];

/** Lo que la plataforma NO hace. Va con el mismo peso visual que lo que sí. */
const LIMITES = [
  {
    icono: FileWarning,
    titulo: 'No presenta avisos ante el SAT por ti',
    detalle:
      'No existe una integración oficial validada con el portal SPPLD. La plataforma prepara, revisa, aprueba y exporta el archivo; el envío lo haces tú desde el portal. Cualquier producto que prometa envío automático sin integración oficial te está vendiendo un riesgo.',
  },
  {
    icono: BookLock,
    titulo: 'No pide ni almacena tu e.firma',
    detalle:
      'No hay un campo para la llave privada, ni lo habrá en esta versión. Guardar la e.firma de un contribuyente en un servidor de terceros es un riesgo que ninguna funcionalidad justifica.',
  },
  {
    icono: AlertTriangle,
    titulo: 'No genera XML oficiales todavía',
    detalle:
      'Sólo publicaremos generación de archivos oficiales cuando el esquema vigente esté documentado y probado contra el portal. Mientras tanto exportamos CSV y JSON, y lo decimos en la interfaz.',
  },
  {
    icono: Radar,
    titulo: 'La consulta PEP usa un adaptador local',
    detalle:
      'Sin un proveedor externo conectado, la consulta PEP no consulta ninguna fuente y la interfaz lo declara. No simulamos resultados: un falso negativo en PEP es peor que no tener la función.',
  },
];

const ETIQUETA_ROL: Record<RolOrganizacion, { nombre: string; para: string }> = {
  propietario: { nombre: 'Propietario', para: 'Quien responde por la organización ante la autoridad.' },
  administrador: { nombre: 'Administrador', para: 'Representante encargado del cumplimiento.' },
  analista: { nombre: 'Analista', para: 'Quien captura operaciones y resuelve alertas.' },
  auditor: { nombre: 'Auditor', para: 'Externo o interno. Lee todo, escribe sólo en auditoría.' },
  consulta: { nombre: 'Consulta', para: 'Sólo lectura. Para dirección o áreas de apoyo.' },
};

const TOTAL_OBLIGACIONES = datos.OBLIGACIONES.length;

export default function Plataforma() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(MIGA) }}
      />

      <EncabezadoPagina
        miga={[
          { nombre: 'Inicio', ruta: '/' },
          { nombre: 'Plataforma de cumplimiento', ruta: '/plataforma' },
        ]}
        titulo="El mismo motor, aplicado a tu operación diaria"
        entradilla={`Las calculadoras públicas responden una pregunta a la vez. La plataforma lleva el registro completo: clientes, expedientes, operaciones, alertas, riesgos y auditoría, con las ${TOTAL_OBLIGACIONES} obligaciones convertidas en tareas con evidencia.`}
      />

      <div className="contenedor-app">
        {/* El alta todavía no está abierta: la plataforma necesita su base de
            datos conectada. Se enlaza a contacto en lugar de a un formulario
            de registro que no puede completarse — un botón que lleva a un
            callejón sin salida es peor que decir que aún no está listo. */}
        <div className="flex flex-wrap gap-3">
          <Boton comoHijo variante="accion" tamano="lg">
            <Link href="/contacto?asunto=plataforma">Solicitar acceso anticipado</Link>
          </Boton>
          <Boton comoHijo variante="contorno" tamano="lg">
            <Link href="/precios">Ver planes</Link>
          </Boton>
        </div>

        <Nota tono="info" titulo="Todavía no está abierta al público" className="mt-5 max-w-2xl">
          <p>
            La plataforma está construida pero aún no tiene su base de datos en producción. Escribe
            si quieres probarla en cuanto abra: te avisamos y te damos acceso antes que al resto.
          </p>
        </Nota>
      </div>

      {/* ── Módulos ───────────────────────────────────────────────────── */}
      <Seccion
        id="modulos"
        etiqueta="Qué incluye"
        titulo="Nueve módulos que cubren el ciclo completo"
        descripcion="Cada módulo produce la evidencia que un auditor externo va a pedir, no sólo la pantalla que se ve bien en una demostración."
      >
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {MODULOS.map((m) => {
            const Icono = m.icono;
            return (
              <li key={m.titulo} className="tarjeta flex flex-col p-5">
                <span className="grid size-10 place-items-center rounded-[var(--radius-control)] bg-[var(--color-marino-tenue)] text-[var(--color-marino)]">
                  <Icono className="size-5" />
                </span>
                <h3 className="mt-4 text-[1.0625rem] font-semibold text-[var(--color-tinta)]">
                  {m.titulo}
                </h3>
                <p className="mt-2 text-[0.875rem] leading-relaxed text-[var(--color-tinta-suave)]">
                  {m.descripcion}
                </p>
                <ul className="mt-4 flex flex-col gap-1.5 border-t border-[var(--color-borde)] pt-3">
                  {m.incluye.map((i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-[0.82rem] text-[var(--color-tinta-suave)]"
                    >
                      <span aria-hidden="true" className="text-[var(--color-petroleo)]">
                        ·
                      </span>
                      {i}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </Seccion>

      {/* ── Roles ─────────────────────────────────────────────────────── */}
      <Seccion
        id="roles"
        etiqueta="Control de acceso"
        titulo="Cinco roles, con la frontera real en la base de datos"
        descripcion="La matriz de permisos decide qué se dibuja en pantalla. Quién puede leer qué lo decide Postgres con políticas de seguridad a nivel de fila: si alguien evade la interfaz, la base sigue negando el acceso."
      >
        <TablaEnvoltura>
          <table className="w-full min-w-[42rem] text-left text-sm">
            <thead className="bg-[var(--color-marfil-hondo)]">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Rol</th>
                <th scope="col" className="px-4 py-3 font-semibold">Para quién</th>
                <th scope="col" className="px-4 py-3 font-semibold">Permisos</th>
              </tr>
            </thead>
            <tbody>
              {ROLES_ORGANIZACION.map((rol) => (
                <tr key={rol} className="border-t border-[var(--color-borde)] align-top">
                  <th scope="row" className="px-4 py-3 font-medium text-[var(--color-tinta)]">
                    {ETIQUETA_ROL[rol].nombre}
                  </th>
                  <td className="px-4 py-3 text-[var(--color-tinta-suave)]">
                    {ETIQUETA_ROL[rol].para}
                  </td>
                  <td className="cifra px-4 py-3 text-[var(--color-tinta-suave)]">
                    {MATRIZ_PERMISOS[rol].length} de {MATRIZ_PERMISOS.propietario.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablaEnvoltura>

        <Nota tono="info" titulo="Por qué esto importa" className="mt-5">
          <p>
            Una matriz de permisos en el navegador es presentación, no seguridad. Por eso el
            aislamiento entre organizaciones vive en políticas de base de datos, la bitácora de
            auditoría no admite modificación ni borrado para nadie, y un usuario no puede cambiarse
            el rol a sí mismo aunque tenga permisos de administración.
          </p>
        </Nota>
      </Seccion>

      {/* ── Límites ───────────────────────────────────────────────────── */}
      <Seccion
        id="limites"
        etiqueta="Los límites"
        titulo="Lo que esta plataforma no hace"
        descripcion="Esta sección existe a propósito. Un producto de cumplimiento que sólo enumera virtudes te obliga a descubrir sus límites el día de la verificación."
      >
        <ul className="grid gap-4 md:grid-cols-2">
          {LIMITES.map((l) => {
            const Icono = l.icono;
            return (
              <li
                key={l.titulo}
                className="tarjeta border-l-4 border-l-[var(--color-ambar)] p-5"
              >
                <div className="flex items-start gap-3">
                  <Icono className="mt-0.5 size-5 shrink-0 text-[var(--color-ambar)]" />
                  <div>
                    <h3 className="text-[0.975rem] font-semibold text-[var(--color-tinta)]">
                      {l.titulo}
                    </h3>
                    <p className="mt-1.5 text-[0.875rem] leading-relaxed text-[var(--color-tinta-suave)]">
                      {l.detalle}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Seccion>

      {/* ── Mecanismos automatizados ──────────────────────────────────── */}
      <Seccion
        id="mecanismos"
        etiqueta="Mecanismos automatizados"
        titulo="Cómo se acredita el requisito del 1 de junio de 2027"
        descripcion="La norma no pide un sistema cualquiera: pide poder demostrar cómo se detecta, quién decidió y con qué regla."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="tarjeta p-5">
            <h3 className="flex items-center gap-2 text-[0.975rem] font-semibold text-[var(--color-tinta)]">
              <UserCog className="size-4 text-[var(--color-petroleo)]" />
              Reglas configurables sin tocar código
            </h3>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-[var(--color-tinta-suave)]">
              Los umbrales, las ventanas de acumulación y los factores de riesgo se editan desde la
              interfaz. Cada cambio guarda autor, versión, fecha de activación, motivo, fuente y el
              resultado de las pruebas: es lo que convierte una configuración en evidencia.
            </p>
          </div>
          <div className="tarjeta p-5">
            <h3 className="flex items-center gap-2 text-[0.975rem] font-semibold text-[var(--color-tinta)]">
              <History className="size-4 text-[var(--color-petroleo)]" />
              Reglas históricas que no se sobreescriben
            </h3>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-[var(--color-tinta-suave)]">
              Cuando un umbral cambia no se edita la regla anterior: se cierra su vigencia y se abre
              otra. Una operación de 2024 se sigue evaluando con la regla de 2024, que es lo que la
              autoridad va a revisar.
            </p>
          </div>
        </div>
      </Seccion>

      <div className="contenedor-app pb-20">
        <AvisoIndependencia />
      </div>
    </>
  );
}
