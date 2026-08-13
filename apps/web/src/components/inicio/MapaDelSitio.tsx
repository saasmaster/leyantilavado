import Link from 'next/link';
import {
  ArrowRight,
  Banknote,
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  FileSearch,
  Gavel,
  Layers,
  MessageCircleQuestion,
  Scale,
  ShieldCheck,
  Users,
  Wrench,
} from 'lucide-react';
import { datos } from '@leyantilavado/rules-engine';
import { ETIQUETA_ACTIVIDADES, ETIQUETA_EFECTIVO, ETIQUETA_UMBRALES } from '@/content/cifras';
import { CATEGORIAS_PROVEEDOR } from '@leyantilavado/types';
import { cn } from '@leyantilavado/ui';
import { Aparece } from './Aparece';
import { NIVELES_VERIFICACION } from './comun';

/**
 * Mapa del sitio de la portada.
 *
 * Cada tarjeta lleva una CIFRA REAL calculada del motor, no una frase de
 * relleno. El objetivo es que la portada informe aunque no des clic: saber que
 * hay 41 reglas de umbral vigentes ya es información, "descubre nuestros
 * umbrales" no lo es.
 */

// Las etiquetas salen de `content/cifras.ts`, que es el único sitio donde se
// decide cómo se nombran. Antes cada tarjeta contaba lo que le parecía —una
// los verificados, otra el total— y el resultado era un sitio que aparentaba
// contradecirse consigo mismo.
const TOTAL_ACTIVIDADES = ETIQUETA_ACTIVIDADES;
const TOTAL_UMBRALES = ETIQUETA_UMBRALES;
const TOTAL_EFECTIVO = ETIQUETA_EFECTIVO;
const TOTAL_OBLIGACIONES = datos.OBLIGACIONES.length;
const TOTAL_HITOS = datos.CALENDARIO.length;
const TOTAL_SANCIONES = datos.SANCIONES.length;
const TOTAL_FUENTES = datos.FUENTES.length;
const TOTAL_CATEGORIAS = CATEGORIAS_PROVEEDOR.length;

interface Destino {
  href: string;
  titulo: string;
  descripcion: string;
  dato: string;
  icono: React.ComponentType<{ className?: string }>;
  destacado?: boolean;
}

const ENTENDER: Destino[] = [
  {
    href: '/actividades-vulnerables',
    titulo: 'Actividades vulnerables',
    descripcion:
      'Las 16 fracciones del art. 17, quién cae en cada una y quién no. Con los incisos desglosados, no aplanados a un solo número.',
    dato: TOTAL_ACTIVIDADES,
    icono: Layers,
    destacado: true,
  },
  {
    href: '/umbrales',
    titulo: 'Umbrales de identificación y aviso',
    descripcion:
      'La tabla completa, convertible a pesos con la UMA de cualquier año desde 2016.',
    dato: TOTAL_UMBRALES,
    icono: Scale,
    destacado: true,
  },
  {
    href: '/obligaciones',
    titulo: 'Obligaciones',
    descripcion:
      'Qué tienes que hacer, en qué orden y con qué evidencia esperaría verlo un auditor.',
    dato: `${TOTAL_OBLIGACIONES} obligaciones`,
    icono: ClipboardCheck,
  },
  {
    href: '/limites-efectivo',
    titulo: 'Límites de efectivo',
    descripcion:
      'Las prohibiciones del art. 32. Ojo: se miden con IVA, mientras que los umbrales de aviso van sin IVA.',
    dato: TOTAL_EFECTIVO,
    icono: Banknote,
  },
  {
    href: '/multas',
    titulo: 'Multas y sanciones',
    descripcion:
      'Rangos del art. 54 y los escenarios de autocorrección del 55, con sus requisitos reales.',
    dato: `${TOTAL_SANCIONES} supuestos`,
    icono: Gavel,
  },
  {
    href: '/glosario',
    titulo: 'Glosario',
    descripcion: 'PLD, EBR, PEP, beneficiario controlador, perfil transaccional y 36 términos más.',
    dato: '41 términos',
    icono: BookOpen,
  },
];

const ACTUAR: Destino[] = [
  {
    href: '/herramientas',
    titulo: 'Herramientas',
    descripcion:
      'Calculadoras que calculan de verdad: umbrales, acumulación de seis meses, efectivo, multas y fechas de aviso.',
    dato: '18 herramientas',
    icono: Wrench,
    destacado: true,
  },
  {
    href: '/calendario-cumplimiento',
    titulo: 'Calendario 2026-2029',
    descripcion:
      'Cada fecha exigible con su cuenta regresiva, y las obligaciones que aún no tienen fecha cierta.',
    dato: `${TOTAL_HITOS} hitos`,
    icono: CalendarClock,
    destacado: true,
  },
  {
    href: '/plataforma',
    titulo: 'Plataforma de cumplimiento',
    descripcion:
      'El mismo motor aplicado a tu operación diaria: clientes, expedientes, alertas y auditoría.',
    dato: 'Área privada',
    icono: ShieldCheck,
  },
  {
    href: '/directorio',
    titulo: 'Directorio profesional',
    descripcion:
      'Contadores, abogados, auditores con certificación UIF, capacitadores y software.',
    dato: `${TOTAL_CATEGORIAS} categorías`,
    icono: Users,
  },
];

const CONFIAR: Destino[] = [
  {
    href: '/reforma-ley-antilavado-2026',
    titulo: 'Qué cambió en 2025-2026',
    descripcion:
      'No es una ley nueva: son tres instrumentos con fechas distintas. Tabla de antes y después.',
    dato: '3 instrumentos',
    icono: FileSearch,
  },
  {
    href: '/fuentes-oficiales',
    titulo: 'Fuentes oficiales',
    descripcion:
      'De dónde sale cada cifra, con enlace directo al documento y fecha de última revisión.',
    dato: `${TOTAL_FUENTES} fuentes`,
    icono: BookOpen,
  },
  {
    href: '/metodologia-editorial',
    titulo: 'Cómo verificamos',
    descripcion:
      'Los cuatro niveles de verificación, qué publicamos con cada uno y qué hacemos cuando la fuente oficial no está disponible.',
    dato: `${NIVELES_VERIFICACION.length} niveles`,
    icono: ClipboardCheck,
  },
  {
    href: '/nosotros',
    titulo: 'Quién publica esto',
    descripcion:
      'Un centro independiente, sin relación con la UIF ni con el SAT. Quiénes somos, cómo nos financiamos y qué no hacemos.',
    dato: 'Independiente',
    icono: Users,
  },
  {
    href: '/preguntas-frecuentes',
    titulo: 'Preguntas frecuentes',
    descripcion:
      'Las dudas que más se repiten, respondidas con el artículo aplicable a la vista.',
    dato: 'Respuestas con fuente',
    icono: MessageCircleQuestion,
  },
];

export function MapaDelSitio() {
  return (
    <div className="contenedor-app seccion">
      <Grupo titulo="Entender qué te obliga la ley, artículo por artículo" destinos={ENTENDER} />
      <Grupo
        titulo="Calcular, organizar y encontrar ayuda"
        destinos={ACTUAR}
        className="mt-16"
      />
      <Grupo
        titulo="Comprobar de dónde sale cada dato"
        destinos={CONFIAR}
        className="mt-16"
      />
    </div>
  );
}

function Grupo({
  titulo,
  destinos,
  className,
}: {
  titulo: string;
  destinos: Destino[];
  className?: string;
}) {
  return (
    <Aparece>
      <section className={className}>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-(length:--text-seccion)">{titulo}</h2>
          </div>
        </div>

        <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destinos.map((d) => (
            <li key={d.href} className={cn(d.destacado && 'lg:col-span-1')}>
              <TarjetaDestino destino={d} />
            </li>
          ))}
        </ul>
      </section>
    </Aparece>
  );
}

function TarjetaDestino({ destino }: { destino: Destino }) {
  const Icono = destino.icono;
  return (
    <Link
      href={destino.href}
      className="tarjeta tarjeta-interactiva group flex h-full flex-col p-5 focus-visible:outline-2"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-[var(--radius-control)] bg-[var(--color-petroleo-tenue)] text-[var(--color-petroleo-hondo)]">
          <Icono className="size-5" />
        </span>
        <span className="cifra rounded-[var(--radius-pastilla)] bg-[var(--color-marfil-hondo)] px-2.5 py-1 text-[0.7rem] font-medium text-[var(--color-tinta-suave)]">
          {destino.dato}
        </span>
      </div>

      <h3 className="mt-4 text-[1.0625rem] leading-snug font-semibold text-[var(--color-tinta)]">
        {destino.titulo}
      </h3>
      <p className="mt-2 flex-1 text-[0.875rem] leading-relaxed text-[var(--color-tinta-suave)]">
        {destino.descripcion}
      </p>

      <span className="mt-4 inline-flex items-center gap-1.5 text-[0.85rem] font-medium text-[var(--color-petroleo-hondo)]">
        Ver
        <ArrowRight className="size-3.5 transition-transform duration-200 ease-[var(--ease-suave)] group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
