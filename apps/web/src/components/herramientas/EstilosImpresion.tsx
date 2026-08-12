/**
 * Hoja de estilos de impresión de las herramientas.
 *
 * Se emite con `<style href precedence>` de React 19: se iza al `<head>` una
 * sola vez aunque varias herramientas lo rendericen, y no obliga a tocar
 * `globals.css`, que es compartido.
 *
 * Convenciones:
 *   `.no-imprimir`   → se oculta en papel (formularios, botones, navegación).
 *   `.solo-imprimir` → sólo aparece en papel (encabezado del documento, URL).
 *   `.evitar-corte`  → el bloque no se parte entre dos hojas.
 */
const CSS = `
@media print {
  header, footer, .no-imprimir { display: none !important; }
  .solo-imprimir { display: block !important; }

  html, body {
    background: #fff !important;
    color: #000 !important;
    font-size: 11pt;
  }

  main { padding: 0 !important; }

  .contenedor-app {
    max-width: none !important;
    padding-inline: 0 !important;
  }

  .tarjeta,
  .imprimible {
    box-shadow: none !important;
    backdrop-filter: none !important;
    background: #fff !important;
    border: 1px solid #999 !important;
  }

  .evitar-corte { break-inside: avoid; page-break-inside: avoid; }

  h1, h2, h3 { break-after: avoid; page-break-after: avoid; }

  table { width: 100% !important; }
  thead { display: table-header-group; }

  /* Las URL de los enlaces se pierden en papel: se imprimen al lado. */
  .prosa a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 9pt; }

  a { text-decoration: underline; color: #000 !important; }
}

.solo-imprimir { display: none; }
`;

export function EstilosImpresion() {
  return (
    <style
      href="herramientas-impresion"
      precedence="medium"
      dangerouslySetInnerHTML={{ __html: CSS }}
    />
  );
}
