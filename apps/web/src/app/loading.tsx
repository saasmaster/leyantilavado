/**
 * Estado de carga entre rutas.
 *
 * Es un esqueleto, no un spinner girando en el centro: un bloque con la forma
 * aproximada de lo que viene reserva el espacio y evita que la página salte
 * cuando llega el contenido.
 *
 * `animate-pulse` respeta `prefers-reduced-motion` por la regla global de
 * `globals.css`, así que aquí no hay nada que condicionar.
 *
 * Lleva `aria-hidden` porque las barras grises no significan nada para quien
 * no las ve; el anuncio lo hace el `role="status"` con texto real.
 */

export default function Cargando() {
  return (
    <div className="contenedor-app py-16 md:py-20">
      <p role="status" className="sr-only">
        Cargando la página…
      </p>

      <div aria-hidden="true" className="flex animate-pulse flex-col gap-4">
        <div className="h-3 w-32 rounded-full bg-[var(--color-borde-fuerte)]" />
        <div className="h-9 w-[min(100%,32rem)] rounded-lg bg-[var(--color-borde-fuerte)]" />
        <div className="mt-2 flex flex-col gap-2.5">
          <div className="h-3.5 w-[min(100%,44rem)] rounded-full bg-[var(--color-borde)]" />
          <div className="h-3.5 w-[min(100%,40rem)] rounded-full bg-[var(--color-borde)]" />
          <div className="h-3.5 w-[min(100%,22rem)] rounded-full bg-[var(--color-borde)]" />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="h-36 rounded-[var(--radius-card)] bg-[var(--color-marfil-hondo)]" />
          <div className="h-36 rounded-[var(--radius-card)] bg-[var(--color-marfil-hondo)]" />
        </div>
      </div>
    </div>
  );
}
