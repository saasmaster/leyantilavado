'use client';

import * as React from 'react';
import { Campo, Nota, Selector, Tarjeta, TarjetaCuerpo } from '@leyantilavado/ui';
import { Checklist } from '@/components/herramientas/Checklist';
import { seccionesExpediente, type TipoExpediente } from '@/lib/herramientas/checklists';

const ETIQUETA: Record<TipoExpediente, string> = {
  persona_fisica: 'Persona física',
  persona_moral: 'Persona moral',
  fideicomiso: 'Fideicomiso u otra figura',
};

export function ChecklistExpediente() {
  const [tipo, setTipo] = React.useState<TipoExpediente>('persona_fisica');
  const [riesgoAlto, setRiesgoAlto] = React.useState(false);

  const secciones = seccionesExpediente(tipo, riesgoAlto);

  return (
    <div className="flex flex-col gap-6">
      <Tarjeta className="no-imprimir">
        <TarjetaCuerpo className="grid gap-5 md:grid-cols-2 md:items-end">
          <Campo
            id="tipo-expediente"
            etiqueta="Tipo de cliente"
            ayuda="Cambia la sección de documentos: no es lo mismo un expediente de persona física que de fideicomiso."
            requerido
          >
            <Selector
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoExpediente)}
            >
              {(Object.keys(ETIQUETA) as TipoExpediente[]).map((t) => (
                <option key={t} value={t}>
                  {ETIQUETA[t]}
                </option>
              ))}
            </Selector>
          </Campo>

          <label className="flex cursor-pointer items-start gap-3 pb-2.5 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 size-5 cursor-pointer"
              checked={riesgoAlto}
              onChange={(e) => setRiesgoAlto(e.target.checked)}
            />
            <span className="text-[var(--color-tinta-suave)]">
              Este cliente quedó en <strong>riesgo alto</strong> o es persona políticamente
              expuesta. Agrega la sección de debida diligencia reforzada.
            </span>
          </label>
        </TarjetaCuerpo>
      </Tarjeta>

      {/* La clave de guardado incluye el tipo para no mezclar dos expedientes
          distintos en el mismo almacenamiento local. */}
      <Checklist
        key={`${tipo}-${riesgoAlto}`}
        secciones={secciones}
        claveGuardado={`expediente-${tipo}`}
        nombreArchivo={`checklist-expediente-${tipo}`}
        tituloImpresion={`Checklist de expediente — ${ETIQUETA[tipo]}`}
        etiquetaPuntaje="Expediente integrado"
        encabezado={
          <Nota tono="atencion" titulo="Qué viene del corpus verificado y qué es propuesta nuestra">
            <p>
              La primera sección sale del catálogo de obligaciones del motor, con su evidencia
              citada. Las secciones de documentos por tipo de cliente y de diligencia reforzada son{' '}
              <strong>propuesta editorial</strong>: la lista literal por tipo de persona vive en el
              Reglamento y en las Disposiciones de Carácter General, que aún no están en nuestro
              corpus verificado. Contrástalas con la disposición aplicable antes de darlas por
              cerradas.
            </p>
          </Nota>
        }
      />
    </div>
  );
}
