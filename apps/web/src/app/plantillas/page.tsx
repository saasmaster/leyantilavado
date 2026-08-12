import type { Metadata } from 'next';
import Link from 'next/link';
import { EstadoVacio, Nota } from '@leyantilavado/ui';
import { construirMetadata } from '@/lib/sitio';

export const metadata: Metadata = construirMetadata({
  titulo: 'Plantillas de cumplimiento LFPIORPI',
  descripcion:
    'Manual de políticas, matriz de riesgos, expedientes de identificación y control de operaciones. Todavía no hay plantillas publicadas: aquí explicamos qué va a haber y por qué no publicamos una plantilla sin revisión.',
  ruta: '/plantillas',
});

/**
 * Sin inventario todavía. Una plantilla de cumplimiento mal hecha es peor que
 * ninguna: la empresa la firma, la archiva y cree que está resuelta. Hasta que
 * cada documento pase revisión editorial, esta página explica y no descarga.
 */
export default function PaginaPlantillas() {
  return (
    <div className="contenedor-app flex flex-col gap-10 py-10 md:py-14">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold md:text-4xl">Plantillas</h1>
        <p className="prosa text-[var(--color-tinta-suave)]">
          Documentos base para armar tu programa de cumplimiento: manual de políticas, metodología
          de riesgos, formatos de expediente y control de operaciones.
        </p>
      </header>

      <EstadoVacio
        titulo="Todavía no hay plantillas para descargar"
        descripcion="Estamos redactándolas y sometiéndolas a revisión. Una plantilla firmada y archivada da una sensación de cumplimiento que no queremos regalar sin estar seguros del contenido."
        accion={
          <Link
            href="/contacto"
            className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--color-petroleo)] px-5 text-sm font-medium text-white"
          >
            Avísame cuando estén listas
          </Link>
        }
      />

      <section aria-labelledby="que-habra" className="flex flex-col gap-4">
        <h2 id="que-habra" className="text-2xl font-semibold">
          Qué va a haber aquí
        </h2>
        <ul className="prosa flex flex-col gap-2 text-[var(--color-tinta-suave)]">
          <li>
            <strong>Manual de políticas y procedimientos</strong>, con una versión por actividad
            vulnerable en lugar de un texto único con el nombre cambiado.
          </li>
          <li>
            <strong>Metodología de evaluación de riesgos</strong> con factores, pesos y
            justificación escrita, para que puedas defenderla ante un auditor.
          </li>
          <li>
            <strong>Formatos de expediente de identificación</strong> por tipo de cliente: persona
            física, persona moral y fideicomiso.
          </li>
          <li>
            <strong>Cuestionario de conocimiento del cliente</strong> y ficha de beneficiario
            controlador.
          </li>
          <li>
            <strong>Control de operaciones</strong> preparado para medir la acumulación por cliente
            dentro de la ventana que marca la ley.
          </li>
          <li>
            <strong>Programa anual de capacitación</strong> y bitácora de evidencia.
          </li>
        </ul>
      </section>

      <section aria-labelledby="condiciones" className="flex flex-col gap-4">
        <h2 id="condiciones" className="text-2xl font-semibold">
          Cómo van a estar hechas
        </h2>
        <ul className="prosa flex flex-col gap-2 text-[var(--color-tinta-suave)]">
          <li>Cada documento lleva la disposición que lo sustenta y la fecha de última revisión.</li>
          <li>
            Los campos que dependen de tu operación vienen marcados como tales, no rellenados con
            un ejemplo que alguien va a olvidar cambiar.
          </li>
          <li>
            Ninguna plantilla afirma cumplimiento. Un documento no te pone en regla: lo hace lo que
            efectivamente ejecutas y puedes probar.
          </li>
        </ul>
      </section>

      <Nota tono="atencion" titulo="Una plantilla no sustituye criterio">
        Descargar un manual y firmarlo no crea un programa de cumplimiento. Si tu operación tiene
        aristas —varias actividades, estructuras corporativas, operaciones en el borde del umbral—
        conviene que alguien lo revise contigo. Puedes buscar quién en el{' '}
        <Link href="/directorio" className="underline underline-offset-4">
          directorio profesional
        </Link>
        .
      </Nota>
    </div>
  );
}
