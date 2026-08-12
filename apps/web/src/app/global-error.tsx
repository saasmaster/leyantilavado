'use client';

/**
 * Frontera de último recurso: se usa cuando el fallo ocurre en el propio
 * layout raíz.
 *
 * Por eso reemplaza `<html>` y `<body>` — y por eso todo va en estilos en
 * línea. Cuando este componente entra en acción, el layout que importa
 * `globals.css` es justamente el que falló: las variables del tema
 * (`--color-tinta`, `--color-marfil`…) pueden no existir, y una hoja de
 * estilos que no cargó dejaría la pantalla en blanco sobre blanco.
 *
 * Los colores están escritos a mano a propósito. Es el único archivo del
 * proyecto donde eso es correcto.
 */

export default function ErrorGlobal({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es-MX">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: '#f7f5f1',
          color: '#1b1f23',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          lineHeight: 1.6,
        }}
      >
        <main style={{ maxWidth: '34rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>
            El sitio no pudo cargar
          </h1>
          <p style={{ marginTop: '1rem', color: '#4a5259' }}>
            Ocurrió un fallo antes de que la página llegara a construirse. No es algo que hayas
            hecho tú. Recarga en unos segundos; si sigue igual, escríbenos y lo revisamos.
          </p>

          <div style={{ marginTop: '1.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={reset}
              style={{
                minHeight: '2.75rem',
                padding: '0 1.5rem',
                borderRadius: '0.6rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: 500,
                color: '#ffffff',
                backgroundColor: '#0f5364',
              }}
            >
              Reintentar
            </button>
            {/* `<a>` y no `<Link>`, a propósito: una transición de `next/link`
                pasa por el router que acaba de fallar. Aquí hace falta una
                carga completa de página, que es lo único que garantiza salir
                del estado roto. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: '2.75rem',
                padding: '0 1.5rem',
                borderRadius: '0.6rem',
                border: '1px solid #cfd4d8',
                fontSize: '0.95rem',
                fontWeight: 500,
                color: '#1b1f23',
                textDecoration: 'none',
              }}
            >
              Ir al inicio
            </a>
          </div>

          {error.digest && (
            <p style={{ marginTop: '1.75rem', fontSize: '0.8rem', color: '#6b7378' }}>
              Referencia para reportarlo: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
