import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatearFechaCorta, formatearFechaLarga } from '@leyantilavado/rules-engine';
import {
  Boton,
  EstadoVacio,
  Insignia,
  Nota,
  Tarjeta,
  TarjetaCuerpo,
  TarjetaTitulo,
  TablaEnvoltura,
} from '@leyantilavado/ui';
import { EncabezadoSeccion, Seccion } from '@/components/app/Contenedor';
import { EstadoConsulta } from '@/components/app/TablaRecurso';
import { AvisoNoEsCumplimiento } from '@/components/app/Avisos';
import { listar } from '@/lib/app/consultas';
import { requerirContexto } from '@/lib/auth/sesion';

interface FilaCliente {
  id: string;
  full_name: string;
  legal_name: string | null;
  person_type: string;
  rfc: string | null;
  curp: string | null;
  foreign_tax_id: string | null;
  nationality: string | null;
  country: string;
  economic_activity: string | null;
  occupation: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  is_pep: boolean;
  pep_detail: string | null;
  pep_checked_at: string | null;
  pep_source: string;
  risk_level: string | null;
  risk_reviewed_at: string | null;
  next_risk_review: string | null;
  identified_at: string | null;
  file_status: string;
  notes: string | null;
}

interface FilaBeneficiario {
  id: string;
  full_name: string;
  ownership_percent: number | null;
  control_type: string;
  control_detail: string | null;
  determination_status: string;
  determination_note: string | null;
  is_pep: boolean;
  identified_at: string | null;
}

interface FilaRelacion {
  id: string;
  parent_name: string;
  child_name: string;
  percent: number;
  relation: string;
  depth: number;
  note: string | null;
}

interface FilaDocumento {
  id: string;
  kind: string;
  title: string;
  issued_on: string | null;
  expires_on: string | null;
  retain_until: string | null;
}

interface FilaRiesgo {
  id: string;
  assessed_on: string;
  raw_score: number;
  final_score: number;
  level: string;
  enhanced_due_diligence: boolean;
  next_review: string;
  methodology_version: string;
  explanation: string;
}

const ETIQUETA_TIPO: Record<string, string> = {
  persona_fisica: 'Persona física',
  persona_moral: 'Persona moral',
  fideicomiso: 'Fideicomiso',
};

const ETIQUETA_EXPEDIENTE: Record<string, string> = {
  incompleto: 'Incompleto',
  completo: 'Completo',
  en_revision: 'En revisión',
  observado: 'Observado',
};

const ETIQUETA_DETERMINACION: Record<string, string> = {
  pendiente: 'Pendiente',
  identificado: 'Identificado',
  no_determinado: 'No determinado',
};

const TONO_RIESGO: Record<string, 'verde' | 'ambar' | 'rojo'> = {
  bajo: 'verde',
  medio: 'ambar',
  alto: 'rojo',
};

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-tinta-tenue)]">
        {etiqueta}
      </dt>
      <dd className="mt-0.5 text-sm text-[var(--color-tinta)]">
        {valor && valor !== '' ? valor : <span className="text-[var(--color-tinta-tenue)]">Sin capturar</span>}
      </dd>
    </div>
  );
}

export default async function PaginaCliente({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contexto = await requerirContexto(`/panel/clientes/${id}`);
  const org = contexto.organizacion?.organizacionId ?? null;

  const [clientes, beneficiarios, relaciones, documentos, riesgos] = await Promise.all([
    listar<FilaCliente>('customers', { organizacionId: org, filtros: { id }, limite: 1 }),
    listar<FilaBeneficiario>('beneficial_owners', {
      organizacionId: org,
      columnas:
        'id,full_name,ownership_percent,control_type,control_detail,determination_status,determination_note,is_pep,identified_at',
      filtros: { customer_id: id },
      ordenarPor: 'ownership_percent',
    }),
    listar<FilaRelacion>('ownership_relations', {
      organizacionId: org,
      columnas: 'id,parent_name,child_name,percent,relation,depth,note',
      filtros: { customer_id: id },
      ordenarPor: 'depth',
      ascendente: true,
    }),
    listar<FilaDocumento>('documents', {
      organizacionId: org,
      columnas: 'id,kind,title,issued_on,expires_on,retain_until',
      filtros: { customer_id: id },
      ordenarPor: 'issued_on',
    }),
    listar<FilaRiesgo>('risk_assessments', {
      organizacionId: org,
      columnas:
        'id,assessed_on,raw_score,final_score,level,enhanced_due_diligence,next_review,methodology_version,explanation',
      filtros: { customer_id: id },
      ordenarPor: 'assessed_on',
      limite: 1,
    }),
  ]);

  const volver = (
    <Boton comoHijo variante="contorno" tamano="sm">
      <Link href="/panel/clientes">
        <ArrowLeft aria-hidden="true" />
        Volver a clientes
      </Link>
    </Boton>
  );

  if (clientes.estado !== 'ok') {
    return (
      <>
        <EncabezadoSeccion titulo="Expediente del cliente" descripcion="Ficha completa de identificación." acciones={volver} />
        <EstadoConsulta resultado={clientes} vacioTitulo="" vacioDescripcion="" />
      </>
    );
  }

  const cliente = clientes.filas[0];
  if (!cliente) {
    return (
      <>
        <EncabezadoSeccion titulo="Expediente del cliente" descripcion="Ficha completa de identificación." acciones={volver} />
        <EstadoVacio
          titulo="No encontramos ese cliente"
          descripcion="El identificador no corresponde a ningún cliente visible para tu rol en esta organización. Puede que se haya eliminado o que pertenezca a otra organización."
          accion={volver}
        />
      </>
    );
  }

  const evaluacion = riesgos.estado === 'ok' ? riesgos.filas[0] : undefined;

  return (
    <>
      <EncabezadoSeccion
        titulo={cliente.full_name}
        descripcion={`${ETIQUETA_TIPO[cliente.person_type] ?? cliente.person_type} · Expediente ${(ETIQUETA_EXPEDIENTE[cliente.file_status] ?? cliente.file_status).toLowerCase()}`}
        etiqueta={cliente.is_pep ? 'Marcado como PEP' : undefined}
        acciones={volver}
      />

      <Seccion titulo="Identificación">
        <Tarjeta>
          <TarjetaCuerpo>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Dato etiqueta="Nombre o razón social" valor={cliente.full_name} />
              <Dato etiqueta="Denominación legal" valor={cliente.legal_name} />
              <Dato etiqueta="RFC" valor={cliente.rfc} />
              <Dato etiqueta="CURP" valor={cliente.curp} />
              <Dato etiqueta="Identificador fiscal extranjero" valor={cliente.foreign_tax_id} />
              <Dato etiqueta="Nacionalidad" valor={cliente.nationality} />
              <Dato etiqueta="País" valor={cliente.country} />
              <Dato etiqueta="Actividad económica" valor={cliente.economic_activity} />
              <Dato etiqueta="Ocupación" valor={cliente.occupation} />
              <Dato etiqueta="Correo" valor={cliente.email} />
              <Dato etiqueta="Teléfono" valor={cliente.phone} />
              <Dato
                etiqueta="Domicilio"
                valor={[cliente.address, cliente.city, cliente.state].filter(Boolean).join(', ')}
              />
              <Dato
                etiqueta="Identificado el"
                valor={cliente.identified_at ? formatearFechaLarga(cliente.identified_at.slice(0, 10)) : null}
              />
              <Dato etiqueta="Notas internas" valor={cliente.notes} />
            </dl>
          </TarjetaCuerpo>
        </Tarjeta>
      </Seccion>

      <Seccion titulo="Persona políticamente expuesta">
        <Tarjeta>
          <TarjetaCuerpo className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Insignia tono={cliente.is_pep ? 'ambar' : 'neutro'}>
                {cliente.is_pep ? 'Marcado como PEP' : 'No marcado como PEP'}
              </Insignia>
              <span className="text-sm text-[var(--color-tinta-suave)]">
                Origen del dato: {cliente.pep_source}
                {cliente.pep_checked_at
                  ? ` · Revisado el ${formatearFechaCorta(cliente.pep_checked_at.slice(0, 10))}`
                  : ' · Sin fecha de revisión'}
              </span>
            </div>
            {cliente.pep_detail && (
              <p className="text-sm text-[var(--color-tinta)]">{cliente.pep_detail}</p>
            )}
            <p className="text-sm text-[var(--color-tinta-suave)]">
              La marca proviene de lo que capturó tu organización o del adaptador local. No se
              consultó ningún padrón oficial de personas políticamente expuestas.
            </p>
          </TarjetaCuerpo>
        </Tarjeta>
      </Seccion>

      <Seccion
        titulo="Beneficiarios controladores"
        descripcion="Personas físicas que se benefician o que ejercen el control, aunque no aparezcan en la escritura."
      >
        {beneficiarios.estado !== 'ok' || beneficiarios.filas.length === 0 ? (
          <EstadoConsulta
            resultado={beneficiarios}
            vacioTitulo="Sin beneficiarios controladores capturados"
            vacioDescripcion="Mientras no haya un beneficiario identificado ni una nota que documente por qué no se pudo determinar, el expediente queda sin ese elemento."
          />
        ) : (
          <TablaEnvoltura aria-label="Beneficiarios controladores del cliente">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--color-borde)] bg-[var(--color-marfil-hondo)]">
                  {['Nombre', 'Participación', 'Tipo de control', 'Determinación', 'PEP', 'Identificado el'].map(
                    (t) => (
                      <th
                        key={t}
                        scope="col"
                        className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-tinta-suave)]"
                      >
                        {t}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {beneficiarios.filas.map((b) => (
                  <tr key={b.id} className="border-b border-[var(--color-borde)] last:border-0">
                    <td className="px-3 py-2.5 align-top text-[var(--color-tinta)]">{b.full_name}</td>
                    <td className="cifra px-3 py-2.5 align-top text-[var(--color-tinta)]">
                      {b.ownership_percent === null ? '—' : `${b.ownership_percent}%`}
                    </td>
                    <td className="px-3 py-2.5 align-top text-[var(--color-tinta)]">
                      {b.control_type}
                      {b.control_detail ? (
                        <span className="block text-xs text-[var(--color-tinta-suave)]">
                          {b.control_detail}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <Insignia tono={b.determination_status === 'identificado' ? 'verde' : 'ambar'}>
                        {ETIQUETA_DETERMINACION[b.determination_status] ?? b.determination_status}
                      </Insignia>
                      {b.determination_status === 'no_determinado' && !b.determination_note && (
                        <span className="mt-1 block text-xs font-medium text-[var(--color-rojo)]">
                          Falta la nota que documente el procedimiento seguido.
                        </span>
                      )}
                      {b.determination_note ? (
                        <span className="mt-1 block text-xs text-[var(--color-tinta-suave)]">
                          {b.determination_note}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      {b.is_pep ? <Insignia tono="ambar">Sí</Insignia> : <span className="text-[var(--color-tinta-tenue)]">No</span>}
                    </td>
                    <td className="cifra px-3 py-2.5 align-top text-[var(--color-tinta)]">
                      {b.identified_at ? formatearFechaCorta(b.identified_at.slice(0, 10)) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TablaEnvoltura>
        )}
      </Seccion>

      <Seccion
        titulo="Cadena de propiedad"
        descripcion="Cada eslabón capturado entre el cliente y las personas físicas que están al final."
      >
        {relaciones.estado !== 'ok' || relaciones.filas.length === 0 ? (
          <EstadoConsulta
            resultado={relaciones}
            vacioTitulo="Sin cadena de propiedad capturada"
            vacioDescripcion="En personas morales y fideicomisos, la cadena es la evidencia de cómo se llegó (o no) al beneficiario controlador."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {relaciones.filas.map((r) => (
              <li
                key={r.id}
                className="rounded-[var(--radius-card)] border border-[var(--color-borde)] p-3 text-sm"
              >
                <span className="text-[var(--color-tinta)]">
                  {r.parent_name} → {r.child_name}
                </span>
                <span className="cifra ml-2 text-[var(--color-tinta-suave)]">{r.percent}%</span>
                <span className="ml-2 text-xs text-[var(--color-tinta-tenue)]">
                  {r.relation} · nivel {r.depth}
                </span>
                {r.note ? (
                  <span className="mt-1 block text-xs text-[var(--color-tinta-suave)]">{r.note}</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Seccion>

      <Seccion titulo="Documentos del expediente">
        {documentos.estado !== 'ok' || documentos.filas.length === 0 ? (
          <EstadoConsulta
            resultado={documentos}
            vacioTitulo="Sin documentos registrados"
            vacioDescripcion="Aquí aparecen los metadatos de los documentos del expediente: tipo, fecha de emisión, vencimiento y hasta cuándo hay que conservarlos. Los archivos viven en el almacenamiento, no en esta tabla."
          />
        ) : (
          <TablaEnvoltura aria-label="Documentos del expediente">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--color-borde)] bg-[var(--color-marfil-hondo)]">
                  {['Tipo', 'Título', 'Emitido', 'Vence', 'Conservar hasta'].map((t) => (
                    <th
                      key={t}
                      scope="col"
                      className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-tinta-suave)]"
                    >
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {documentos.filas.map((d) => (
                  <tr key={d.id} className="border-b border-[var(--color-borde)] last:border-0">
                    <td className="px-3 py-2.5 align-top text-[var(--color-tinta)]">{d.kind}</td>
                    <td className="px-3 py-2.5 align-top text-[var(--color-tinta)]">{d.title}</td>
                    <td className="cifra px-3 py-2.5 align-top text-[var(--color-tinta)]">
                      {d.issued_on ? formatearFechaCorta(d.issued_on.slice(0, 10)) : '—'}
                    </td>
                    <td className="cifra px-3 py-2.5 align-top text-[var(--color-tinta)]">
                      {d.expires_on ? formatearFechaCorta(d.expires_on.slice(0, 10)) : '—'}
                    </td>
                    <td className="cifra px-3 py-2.5 align-top text-[var(--color-tinta)]">
                      {d.retain_until ? formatearFechaCorta(d.retain_until.slice(0, 10)) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TablaEnvoltura>
        )}
      </Seccion>

      <Seccion titulo="Última clasificación de riesgo">
        {!evaluacion ? (
          <EstadoConsulta
            resultado={riesgos}
            vacioTitulo="Sin clasificación de riesgo registrada"
            vacioDescripcion="Puedes calcular una clasificación con la calculadora de la sección Clasificación de riesgo y registrarla cuando la base esté conectada."
            accion={
              <Boton comoHijo variante="contorno">
                <Link href="/panel/riesgo">Ir a clasificación de riesgo</Link>
              </Boton>
            }
          />
        ) : (
          <Tarjeta>
            <TarjetaCuerpo className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <TarjetaTitulo>Riesgo {evaluacion.level}</TarjetaTitulo>
                <Insignia tono={TONO_RIESGO[evaluacion.level] ?? 'neutro'}>
                  {evaluacion.final_score}/100
                </Insignia>
                {evaluacion.enhanced_due_diligence && (
                  <Insignia tono="rojo">Debida diligencia reforzada</Insignia>
                )}
              </div>
              <p className="text-sm text-[var(--color-tinta-suave)]">
                Evaluado el {formatearFechaLarga(evaluacion.assessed_on.slice(0, 10))} · puntaje bruto{' '}
                {evaluacion.raw_score}/100 · metodología {evaluacion.methodology_version} · próxima
                revisión {formatearFechaLarga(evaluacion.next_review.slice(0, 10))}
              </p>
              {evaluacion.explanation && (
                <p className="text-sm text-[var(--color-tinta)]">{evaluacion.explanation}</p>
              )}
            </TarjetaCuerpo>
          </Tarjeta>
        )}
      </Seccion>

      {cliente.risk_level && (
        <Nota tono="info" titulo="El nivel guardado en la ficha y la última evaluación pueden no coincidir">
          <p>
            La ficha del cliente tiene registrado riesgo <strong>{cliente.risk_level}</strong>
            {cliente.risk_reviewed_at
              ? `, revisado el ${formatearFechaCorta(cliente.risk_reviewed_at.slice(0, 10))}`
              : ', sin fecha de revisión'}
            {cliente.next_risk_review
              ? `, con próxima revisión el ${formatearFechaCorta(cliente.next_risk_review.slice(0, 10))}`
              : ''}
            . Si difiere de la última evaluación, se muestran ambos en lugar de elegir uno por ti.
          </p>
        </Nota>
      )}

      <AvisoNoEsCumplimiento />
    </>
  );
}
