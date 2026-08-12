import { ETIQUETA_VERIFICACION, EXPLICACION_VERIFICACION } from '@leyantilavado/types';
import { VERSION_LEGAL } from '@leyantilavado/rules-engine';
import { Insignia, Nota } from '@leyantilavado/ui';

/**
 * Textos del panel administrativo que no se pueden suavizar desde una página.
 *
 * Regla de la casa: la interfaz DESCRIBE lo que garantiza Postgres; nunca
 * promete algo que dependa del código de la aplicación.
 */

/**
 * Qué tablas llevan trigger de versionado y cuáles sólo bitácora.
 *
 * Espejo de `supabase/migrations/0010_versionado_legal.sql`. Se duplica aquí a
 * propósito: la interfaz tiene que poder decir la verdad tabla por tabla, y
 * decir "todo queda versionado" en una tabla que no lleva trigger sería
 * exactamente la clase de promesa que este producto no puede hacer. Si cambia
 * la migración, cambia esta lista.
 */
export const TABLAS_VERSIONADAS: ReadonlySet<string> = new Set([
  'legal_sources', 'uma_values', 'vulnerable_activities', 'threshold_rules',
  'cash_restriction_rules', 'sanctions', 'obligations', 'deadlines', 'legal_versions',
  'articles', 'faq_entries', 'glossary_terms', 'changelog_entries',
]);

export const TABLAS_EN_BITACORA: ReadonlySet<string> = new Set([
  'legal_sources', 'uma_values', 'vulnerable_activities', 'threshold_rules',
  'cash_restriction_rules', 'sanctions', 'obligations', 'deadlines',
  'accumulation_rules', 'provider_profiles', 'provider_credentials', 'feature_flags',
]);

/**
 * El versionado NO lo hace esta aplicación. Lo hacen triggers en la base, y por
 * eso también queda registrado un UPDATE hecho desde la consola de Supabase.
 */
export function AvisoRegistroCambios({ tabla }: { tabla: string }) {
  const versionada = TABLAS_VERSIONADAS.has(tabla);
  const enBitacora = TABLAS_EN_BITACORA.has(tabla);

  if (!versionada && !enBitacora) {
    return (
      <Nota tono="atencion" titulo="Esta tabla no lleva historial de cambios">
        <p>
          <code>{tabla}</code> no tiene trigger de versionado ni de bitácora: si alguien modifica
          una fila, no queda constancia de cómo estaba antes. Es una decisión deliberada para
          tablas sin efecto jurídico, pero conviene saberlo antes de apoyarse en un dato de aquí
          para justificar algo.
        </p>
        <p>
          Si esta tabla llega a contener algo que se pueda citar en una revisión, hay que añadirle
          el trigger en la migración de versionado. No se arregla desde la aplicación.
        </p>
      </Nota>
    );
  }

  return (
    <Nota tono="info" titulo="Los cambios de esta tabla los registra la base de datos">
      <p>
        {versionada ? (
          <>
            Antes de sobrescribir una fila de <code>{tabla}</code>, un trigger de Postgres guarda la
            versión anterior, los campos que cambiaron, el autor, la fecha y el motivo en{' '}
            <code>content_revisions</code>.{' '}
          </>
        ) : (
          <>
            <code>{tabla}</code> no guarda versiones anteriores completas, pero{' '}
          </>
        )}
        {enBitacora ? (
          <>
            El movimiento también se anota en <code>audit_logs</code>, que es la bitácora que puede
            leer un auditor externo sin acceso al panel editorial.
          </>
        ) : (
          <>
            El movimiento no se anota en <code>audit_logs</code>: esta tabla no está en la lista de
            la bitácora general.
          </>
        )}
      </p>
      <p>
        Esta pantalla no ejecuta ese registro ni lo puede garantizar por su cuenta: lo describe. Las
        tablas de historial son de sólo lectura desde la aplicación —no existe política de{' '}
        <code>INSERT</code> ni de <code>DELETE</code> que permita tocarlas desde el navegador— y el
        motivo del cambio viaja en la variable de sesión <code>app.motivo_cambio</code>, así que un{' '}
        <code>UPDATE</code> hecho desde la consola sin motivo queda registrado como tal.
      </p>
    </Nota>
  );
}

/**
 * Las tablas del corpus legal son el espejo editorial del motor, no al revés.
 */
export function AvisoMotorEsLaFuente() {
  return (
    <Nota tono="atencion" titulo="En ejecución manda el motor, no esta tabla">
      <p>
        Las herramientas públicas y el área privada resuelven con{' '}
        <code>@leyantilavado/rules-engine</code> (versión <strong>{VERSION_LEGAL}</strong>), que es
        puro y viaja con el despliegue. Estas tablas guardan el historial editorial: quién cambió
        una regla, cuándo, por qué y contra qué fuente.
      </p>
      <p>
        Consecuencia práctica: editar una fila aquí <strong>no</strong> cambia lo que calcula una
        calculadora. Un cambio de regla se publica modificando los datos semilla del motor y
        desplegando; la fila de la base deja constancia de ese cambio.
      </p>
    </Nota>
  );
}

/** El nivel máximo de verificación del directorio y qué significa cada uno. */
export function LeyendaVerificacion() {
  return (
    <div className="tarjeta flex flex-col gap-3 p-4">
      <div>
        <h2 className="text-base font-semibold text-[var(--color-tinta)]">
          Qué significa cada nivel de verificación
        </h2>
        <p className="mt-1 text-sm text-[var(--color-tinta-suave)]">
          El nivel más alto que se otorga es &ldquo;Documentación revisada&rdquo;. No existe, y no
          debe existir, un nivel que diga &ldquo;certificado por LeyAntilavado.org&rdquo;: revisar
          documentos no es certificar a nadie.
        </p>
      </div>
      <dl className="flex flex-col gap-2.5">
        {(
          Object.keys(ETIQUETA_VERIFICACION) as (keyof typeof ETIQUETA_VERIFICACION)[]
        ).map((nivel) => (
          <div key={nivel} className="flex flex-col gap-1 sm:flex-row sm:gap-3">
            <dt className="sm:w-56 sm:shrink-0">
              <Insignia tono={nivel === 'sin_verificar' ? 'neutro' : 'marino'}>
                {ETIQUETA_VERIFICACION[nivel]}
              </Insignia>
            </dt>
            <dd className="text-sm leading-relaxed text-[var(--color-tinta-suave)]">
              {EXPLICACION_VERIFICACION[nivel]}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Los perfiles pagados se etiquetan. No es una preferencia de diseño. */
export function AvisoPatrocinado() {
  return (
    <Nota tono="atencion" titulo="La columna “Patrocinado” es obligatoria en el sitio público">
      <p>
        La columna <code>sponsored</code> de <code>provider_profiles</code> es la que obliga a
        pintar la etiqueta <strong>Patrocinado</strong> en la ficha pública del proveedor. Vive en
        la base justamente para que ninguna pantalla pueda decidir ocultarla. Si aquí ves
        &ldquo;Sí&rdquo;, en el directorio tiene que verse la etiqueta.
      </p>
    </Nota>
  );
}

/** Datos personales de terceros: se advierte antes de mostrarlos. */
export function AvisoDatosPersonales({ que }: { que: string }) {
  return (
    <Nota tono="riesgo" titulo="Estás viendo datos personales de terceros">
      <p>
        {que} Son datos personales de personas que no trabajan aquí. Trátalos conforme al aviso de
        privacidad: no los exportes a hojas de cálculo personales, no los uses para nada distinto
        del propósito con el que se recabaron y no los compartas fuera del equipo.
      </p>
      <p>
        La lista sólo la puede leer el personal de la plataforma; la política RLS de la tabla lo
        impone en Postgres, no esta pantalla.
      </p>
    </Nota>
  );
}

/** El monitor regulatorio nunca publica una interpretación por su cuenta. */
export function AvisoMonitorNoPublica() {
  return (
    <Nota tono="riesgo" titulo="El monitor no publica nada por su cuenta">
      <p>
        La tarea automática descarga la URL de cada fuente, guarda el estado HTTP y la huella
        SHA-256 del contenido y compara con la anterior. Cuando algo cambia,{' '}
        <strong>crea una alerta de contenido y deja el trabajo a una persona</strong>: nunca
        modifica un umbral, ni redacta una interpretación, ni pasa un contenido a
        &ldquo;publicado&rdquo;.
      </p>
      <p>
        Un cambio de hash sólo dice que los bytes de la página cambiaron. Puede ser una reforma o
        puede ser un banner de cookies. Quien decide qué significa es el equipo editorial, con la
        fuente oficial a la vista.
      </p>
    </Nota>
  );
}

/** `is_staff` no se otorga desde la aplicación: lo bloquea un trigger. */
export function AvisoStaffNoEditable() {
  return (
    <Nota tono="atencion" titulo="El acceso de personal no se otorga desde aquí">
      <p>
        Las columnas <code>is_staff</code> y <code>staff_role</code> no se pueden modificar desde
        la aplicación: un trigger de Postgres rechaza el cambio aunque quien lo intente ya sea
        personal. Es la única puerta al panel administrativo y por eso no depende de una pantalla.
      </p>
      <p>
        Para dar o quitar acceso de personal hay que hacerlo desde la consola de Supabase (SQL
        Editor) con una cuenta con permisos de administración de la base. Por eso esta pantalla no
        tiene ningún botón para hacerlo: no sería un botón, sería un error.
      </p>
    </Nota>
  );
}
