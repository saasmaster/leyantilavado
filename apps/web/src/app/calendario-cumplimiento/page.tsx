import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { datos, formatearFechaLarga } from '@leyantilavado/rules-engine';
import { Nota } from '@leyantilavado/ui';
import { construirMetadata, jsonLdMigaDePan } from '@/lib/sitio';
import { REVISION_VIGENTE } from '@/content/autores';
import {
  AvisoLegal,
  CabeceraArticulo,
  CalendarioCumplimiento,
  EnlacesRelacionados,
  FirmaEditorial,
  JsonLd,
  Migas,
  Seccion,
  jsonLdArticulo,
  type HitoVista,
  type PendienteVista,
} from '@/components/contenido';
import { BandaParalaje } from '@/components/contenido/BandaParalaje';
import bandaCalendario from '../../../public/img/bandas/calendario.webp';

const RUTA = '/calendario-cumplimiento';
const TITULO = 'Calendario de cumplimiento 2026-2029';
const DESCRIPCION =
  'Cada fecha exigible del Acuerdo 115/2026 con cuenta regresiva en vivo: metodología de riesgos, mecanismos automatizados, capacitación y auditoría.';

export const metadata: Metadata = construirMetadata({
  titulo: TITULO,
  descripcion: DESCRIPCION,
  ruta: RUTA,
  tipo: 'article',
  publicadoEn: '2026-08-11',
  actualizadoEn: REVISION_VIGENTE,
});

/** Datos planos: nada de objetos del motor cruzando al cliente. */
const HITOS: HitoVista[] = [...datos.CALENDARIO]
  .sort((a, b) => a.fecha.localeCompare(b.fecha))
  .map((h) => ({
    id: h.id,
    fecha: h.fecha,
    ...(h.fechaFin ? { fechaFin: h.fechaFin } : {}),
    fechaLarga: h.fechaFin
      ? `Del ${formatearFechaLarga(h.fecha)} al ${formatearFechaLarga(h.fechaFin)}`
      : formatearFechaLarga(h.fecha),
    titulo: h.titulo,
    descripcion: h.descripcion,
    confirmadoOficialmente: h.confirmadoOficialmente,
    obligacionSlugs: h.obligaciones,
    obligacionTitulos: h.obligaciones.map(
      (slug) => datos.OBLIGACIONES_POR_SLUG[slug]?.titulo ?? slug,
    ),
  }));

const PENDIENTES: PendienteVista[] = datos.PENDIENTES_SIN_FECHA.map((p) => ({
  id: p.id,
  titulo: p.titulo,
  descripcion: p.descripcion,
  motivo: `Fundamento: ${p.procedencia.disposicion}. Última revisión: ${p.ultimaRevision}.`,
  obligacionSlugs: p.obligaciones,
}));

/** Sólo las obligaciones que algún hito activa: filtrar por las 20 sería ruido. */
const OBLIGACIONES_CON_FECHA = [
  ...new Set([...HITOS, ...PENDIENTES].flatMap((h) => h.obligacionSlugs)),
]
  .map((slug) => ({ slug, titulo: datos.OBLIGACIONES_POR_SLUG[slug]?.titulo ?? slug }))
  .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es-MX'));

const CONFIRMADOS = HITOS.filter((h) => h.confirmadoOficialmente).length;
const ESTIMADOS = HITOS.length - CONFIRMADOS;

export default function Calendario() {
  // La marca de tiempo se resuelve en el servidor y viaja como prop para que
  // el primer render del cliente produzca exactamente el mismo HTML.
  const ahoraISO = new Date().toISOString();

  return (
    <>
    <div className="contenedor-app py-10 md:py-14">
      <JsonLd
        datos={[
          jsonLdMigaDePan([
            { nombre: 'Inicio', ruta: '/' },
            { nombre: TITULO, ruta: RUTA },
          ]),
          jsonLdArticulo({
            titulo: TITULO,
            descripcion: DESCRIPCION,
            ruta: RUTA,
            publicadoEn: '2026-08-11',
            actualizadoEn: REVISION_VIGENTE,
            seccion: 'Cumplimiento',
          }),
        ]}
      />

      <Migas
        items={[
          { nombre: 'Inicio', ruta: '/' },
          { nombre: TITULO, ruta: RUTA },
        ]}
      />

      <CabeceraArticulo
        titulo={TITULO}
        etiquetas={[
          { texto: `${HITOS.length} hitos`, tono: 'marino' },
          { texto: `${CONFIRMADOS} con fecha oficial`, tono: 'verde' },
          ...(ESTIMADOS > 0
            ? ([{ texto: `${ESTIMADOS} estimadas`, tono: 'ambar' }] as const)
            : []),
        ]}
        respuestaDirecta="El Acuerdo 115/2026 entra en vigor el 30 de noviembre de 2026 y escalona el resto: metodología de riesgos, manual y expedientes el 1 de marzo de 2027; mecanismos automatizados el 1 de junio de 2027; el ejercicio 2027 como primer periodo de capacitación; el 2028 como primero de auditoría, con dictamen a más tardar el último día hábil de marzo de 2029."
        entradilla={DESCRIPCION}
      />

      <Nota tono="atencion" titulo="Cómo leer estas fechas">
        <p>
          Las fechas se muestran <strong>nominales</strong>: no las recorremos por fines de semana
          ni días inhábiles. Hacerlo sin una regla oficial registrada sería inventar derecho.
        </p>
        <p>
          Cuando el texto oficial fija un plazo en meses en lugar de una fecha calendario, el hito
          aparece marcado como <strong>fecha estimada</strong>. Úsalo para planear, no como fecha
          límite operativa.
        </p>
      </Nota>

      {/* El componente incluye la cuenta regresiva en vivo por regla, el filtro
          por obligación y la exportación .ics. */}
      <div className="mt-10">
        <CalendarioCumplimiento
          hitos={HITOS}
          pendientes={PENDIENTES}
          obligaciones={OBLIGACIONES_CON_FECHA}
          ahoraISO={ahoraISO}
        />
      </div>

      <Seccion
        id="por-que-escalonado"
        titulo="Por qué el calendario va escalonado"
        descripcion="La norma no exigió todo el mismo día, y entender la lógica ayuda a priorizar."
      >
        <div className="prosa">
          <p>
            El Acuerdo 115/2026 separa las obligaciones en tres oleadas según lo que exige montar.
            La primera, el <strong>1 de marzo de 2027</strong>, agrupa lo documental: metodología de
            enfoque basado en riesgos, manual de políticas, clasificación de clientes, expedientes,
            beneficiario controlador y procedimientos de selección de personal. Son cosas que se
            escriben, se aprueban y se archivan.
          </p>
          <p>
            La segunda, el <strong>1 de junio de 2027</strong>, exige que los mecanismos
            automatizados estén operando. Llega después a propósito: no se puede automatizar la
            detección sin haber definido antes la metodología que decide qué es una alerta.
          </p>
          <p>
            La tercera es de verificación. El ejercicio <strong>2027</strong> completo es el primer
            periodo anual de capacitación y el <strong>2028</strong> el primero sujeto a auditoría,
            con dictamen a más tardar el último día hábil de marzo de 2029. La auditoría puede ser
            interna cuando el riesgo de la organización es bajo o medio; es obligatoriamente externa
            cuando es alto, y el auditor externo necesita certificación vigente ante la UIF.
          </p>
          <p>
            Consecuencia práctica: si empiezas por comprar software antes de tener la metodología
            escrita, vas a configurar reglas que no puedes justificar. El orden del calendario es
            también el orden recomendado de trabajo.
          </p>
        </div>
      </Seccion>

      <EnlacesRelacionados
        grupos={[
          {
            titulo: 'Entender qué cambió',
            enlaces: [
              {
                etiqueta: 'La reforma 2025-2026',
                href: '/reforma-ley-antilavado-2026',
                descripcion: 'Los tres instrumentos y la tabla de antes y después',
              },
              {
                etiqueta: 'Acuerdo 115/2026',
                href: '/acuerdo-115-2026',
                descripcion: 'Qué es y qué obliga capítulo por capítulo',
              },
            ],
          },
          {
            titulo: 'Prepararte',
            enlaces: [
              {
                etiqueta: 'Generador de plan de cumplimiento',
                href: '/herramientas/plan-cumplimiento',
                descripcion: 'Convierte estas fechas en tareas con responsable',
              },
              {
                etiqueta: 'Evaluación de preparación para auditoría',
                href: '/herramientas/preparacion-auditoria',
              },
              {
                etiqueta: 'Todas las obligaciones',
                href: '/obligaciones',
                descripcion: 'Con los pasos y la evidencia que pide cada una',
              },
            ],
          },
        ]}
      />

      <FirmaEditorial />
      <AvisoLegal />
    </div>

    {/* A sangre y fuera del contenedor: es el cierre de la página, no una
        sección más. Lleva al siguiente paso en vez de terminar en seco. */}
    <BandaParalaje imagen={bandaCalendario} alt="Una agenda abierta con las páginas en blanco, junto a una tela clara.">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-semibold text-white md:text-4xl">Las fechas no llegan todas juntas</h2>
        <p className="mt-5 text-lg leading-relaxed text-[color-mix(in_srgb,white_86%,transparent)]">
          El Acuerdo 115/2026 escalona sus obligaciones entre 2026 y 2029. Saber cuál te toca primero es lo que separa una preparación ordenada de una carrera de último minuto.
        </p>
        <Link
          href="/herramientas/plan-30-noviembre"
          className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] bg-white px-5 font-medium text-[var(--color-marino)] transition-transform duration-200 hover:-translate-y-0.5"
        >
          Ver qué tener listo antes del 30 de noviembre
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
    </BandaParalaje>
    </>
  );
}
