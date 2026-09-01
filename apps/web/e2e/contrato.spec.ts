import { expect, test, type Page } from '@playwright/test';

/**
 * Pruebas de CONTRATO DE PRODUCTO.
 *
 * No verifican maquetación ni textos concretos: verifican las promesas que el
 * producto no puede romper sin dejar de ser lo que dice ser. Si alguien
 * "mejora" la portada y de paso quita el aviso de independencia, esto falla.
 */

const RUTAS_PUBLICAS = [
  '/',
  // ── Contenido legal ────────────────────────────────────────────────────
  '/actividades-vulnerables',
  '/umbrales',
  '/obligaciones',
  '/limites-efectivo',
  '/multas',
  '/glosario',
  '/calendario-cumplimiento',
  '/reforma-ley-antilavado-2026',
  '/acuerdo-115-2026',
  '/actualizaciones',
  // Secciones nuevas: una página índice y una hija de cada ruta dinámica, que
  // es donde aparecen los fallos de `generateStaticParams` y de metadatos.
  '/app',
  '/extension',
  '/tramites',
  '/tramites/alta-y-registro',
  '/tramites/baja-del-padron',
  '/guia-aviso',
  '/exigibilidad',
  '/requerimiento-sat',
  '/para',
  '/para/notarias',
  '/para/casas-de-empeno',
  '/casos-practicos',
  '/casos-practicos/notaria-compraventa-inmueble-pago-mixto',
  '/que-cambio',
  '/que-cambio/fe-publica-notarios',
  '/que-cambio/donativos',
  // ── Herramientas ───────────────────────────────────────────────────────
  '/herramientas',
  '/herramientas/cuestionario',
  '/herramientas/calculadora-umbrales',
  '/herramientas/calculadora-uma',
  '/herramientas/acumulacion-operaciones',
  '/herramientas/limites-efectivo',
  '/herramientas/calculadora-multas',
  '/herramientas/fecha-limite-aviso',
  '/herramientas/beneficiario-controlador',
  '/herramientas/consulta-libre',
  '/herramientas/plan-30-noviembre',
  '/herramientas/matriz-riesgos',
  '/herramientas/clasificacion-clientes',
  '/herramientas/checklist-expediente',
  '/herramientas/comparador-obligaciones',
  '/herramientas/preparacion-auditoria',
  '/herramientas/mecanismos-automatizados',
  '/herramientas/capacitacion-anual',
  // ── Directorio y monetización ──────────────────────────────────────────
  '/directorio',
  '/directorio/alta',
  '/plataforma',
  '/precios',
  '/software-cumplimiento',
  '/cursos',
  '/plantillas',
  // ── Confianza ──────────────────────────────────────────────────────────
  '/fuentes-oficiales',
  '/preguntas-frecuentes',
  '/nosotros',
  '/metodologia-editorial',
  '/contacto',
  // ── Legales ────────────────────────────────────────────────────────────
  '/legal/aviso-de-privacidad',
  '/legal/terminos',
  '/legal/cookies',
  '/legal/publicidad',
];

/** Rutas que NUNCA deben ser indexables ni accesibles sin sesión. */
const RUTAS_PRIVADAS = ['/panel', '/admin'];

/** Errores de consola que son ruido del entorno, no defectos del sitio. */
const RUIDO_CONOCIDO = [
  // La vista previa inyecta un <script>; el aviso de React es falso positivo.
  'Encountered a script tag while rendering',
  'Download the React DevTools',
];

function capturarErrores(page: Page): string[] {
  const errores: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const texto = msg.text();
    if (RUIDO_CONOCIDO.some((r) => texto.includes(r))) return;
    errores.push(texto);
  });
  page.on('pageerror', (err) => errores.push(err.message));
  return errores;
}

test.describe('Rutas públicas', () => {
  for (const ruta of RUTAS_PUBLICAS) {
    test(`${ruta} carga sin errores de consola`, async ({ page }) => {
      const errores = capturarErrores(page);
      const respuesta = await page.goto(ruta);

      expect(respuesta?.status(), `${ruta} debe responder 200`).toBeLessThan(400);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page).toHaveTitle(/.{10,}/);
      expect(errores, `errores de consola en ${ruta}`).toEqual([]);
    });
  }
});

test.describe('Promesas que no se pueden romper', () => {
  test('el aviso de independencia aparece en todas las páginas', async ({ page }) => {
    for (const ruta of ['/', '/umbrales', '/herramientas', '/directorio']) {
      await page.goto(ruta);
      await expect(
        page.getByText(/plataforma privada e independiente/i).first(),
        `falta el aviso de independencia en ${ruta}`,
      ).toBeAttached();
    }
  });

  test('en ninguna página se afirma cumplimiento', async ({ page }) => {
    // "Cumples con la ley" o "estás en regla" son afirmaciones que el producto
    // no está autorizado a hacer: no puede constatar el cumplimiento de nadie.
    for (const ruta of ['/', '/umbrales', '/multas', '/herramientas']) {
      await page.goto(ruta);
      const texto = (await page.locator('body').innerText()).toLowerCase();
      expect(texto, `afirmación de cumplimiento en ${ruta}`).not.toMatch(
        /\b(cumples con la ley|estás en regla|estás cumpliendo|garantiza(mos)? (tu )?cumplimiento)\b/,
      );
    }
  });

  test('el directorio niega explícitamente certificar a nadie', async ({ page }) => {
    await page.goto('/directorio');
    const texto = (await page.locator('body').innerText()).toLowerCase();

    // Buscar la frase a secas no sirve: la página la usa DENTRO de su propia
    // negación ("nunca decimos que alguien está certificado por
    // LeyAntilavado.org, porque no certificamos a nadie"), que es justo el
    // comportamiento correcto. Lo que se verifica es la negación explícita.
    expect(texto, 'debe negar expresamente que certifica').toMatch(
      /no certificamos|no es una certificación|no es un aval/,
    );

    // Y que no aparezca como afirmación: "X está certificado por
    // LeyAntilavado" sin una negación delante.
    const afirmaciones = texto.match(/[^.]*certificad[oa] por leyantilavado[^.]*/g) ?? [];
    for (const frase of afirmaciones) {
      expect(frase, `uso afirmativo: "${frase.trim()}"`).toMatch(/nunca|no |jamás/);
    }
  });

  test('no se aparenta ser una autoridad', async ({ page }) => {
    await page.goto('/');
    const texto = (await page.locator('body').innerText()).toLowerCase();
    // Debe distanciarse explícitamente, no sólo omitir el tema.
    expect(texto).toMatch(/no pertenece ni está afiliada/);
  });
});

test.describe('El área privada no se filtra', () => {
  for (const ruta of RUTAS_PRIVADAS) {
    test(`${ruta} nunca se indexa`, async ({ request }) => {
      const res = await request.get(ruta, { maxRedirects: 0 });
      // Redirección a /entrar o pantalla de configuración pendiente: cualquiera
      // sirve. Lo que NO puede pasar es que se indexe.
      const robots = res.headers()['x-robots-tag'] ?? '';
      const esRedireccion = res.status() >= 300 && res.status() < 400;
      expect(
        esRedireccion || robots.includes('noindex'),
        `${ruta} debe redirigir o marcarse noindex`,
      ).toBe(true);
    });
  }

  test('el sitemap no expone rutas privadas', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    for (const ruta of [...RUTAS_PRIVADAS, '/entrar', '/registro', '/api/']) {
      expect(xml, `el sitemap no debe listar ${ruta}`).not.toContain(`${ruta}<`);
    }
  });

  test('las respuestas de la API no se cachean', async ({ request }) => {
    const res = await request.post('/api/newsletter', { data: {}, failOnStatusCode: false });
    expect(res.headers()['cache-control'] ?? '').toContain('no-store');
  });
});

test.describe('Cabeceras de seguridad', () => {
  test('la CSP cierra todo lo que puede cerrar', async ({ request }) => {
    const csp = (await request.get('/')).headers()['content-security-policy'] ?? '';
    expect(csp, 'falta la CSP').toBeTruthy();

    // Estas cuatro sí se pueden cerrar del todo, y deben estarlo.
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");

    // `script-src` lleva 'unsafe-inline' de forma deliberada: los scripts de
    // hidratación de Next tienen contenido variable y ningún hash los cubre.
    // Ver la explicación completa en next.config.mjs. Lo que sí se verifica es
    // que no se haya colado un origen externo: el sitio no carga código de
    // terceros y `connect-src` no debe apuntar fuera del propio origen.
    const directiva = (nombre: string) =>
      csp.split(';').find((d) => d.trim().startsWith(nombre))?.trim() ?? '';

    expect(directiva('script-src'), 'script-src no debe permitir orígenes externos').not.toMatch(
      /https?:\/\//,
    );
    expect(directiva('connect-src'), 'connect-src no debe salir del origen').not.toMatch(
      /https?:\/\//,
    );

    const enProduccion = !csp.includes("'unsafe-eval'");
    if (enProduccion) {
      expect(directiva('script-src'), 'producción no debe permitir eval').not.toContain(
        "'unsafe-eval'",
      );
    }
  });

  test('las cabeceras básicas están presentes', async ({ request }) => {
    const h = (await request.get('/')).headers();
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['x-frame-options']).toBe('DENY');
    expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(h['strict-transport-security']).toContain('max-age=');
  });
});

test.describe('SEO técnico', () => {
  test('sitemap y robots responden', async ({ request }) => {
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain('<urlset');

    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
  });

  /**
   * Una URL inventada tiene que responder 404 de verdad, no 200 con la página
   * de «no encontrada» dentro.
   *
   * Esto ya se rompió una vez, y en silencio: un `loading.tsx` en la raíz
   * envuelve toda la app en Suspense, así que Next manda la cabecera 200 con el
   * esqueleto antes de ejecutar la página. Cuando después se lanza `notFound()`
   * el estado ya viajó y no se puede cambiar. El cuerpo decía «Página no
   * encontrada» y el servidor decía 200.
   *
   * No lo cazaba nada: la página se ve bien en el navegador, el `noindex` está
   * puesto y el build pasa. Sólo se nota mirando el estado HTTP —que es
   * justamente lo único que mira Google—, y el precio es que el directorio
   * acepta como válida cualquier URL que alguien invente.
   *
   * Las rutas estáticas se salvaban solas (`dynamicParams` las corta antes de
   * renderizar); las dinámicas, no. Por eso se prueban las dinámicas.
   */
  test('las rutas inexistentes responden 404 de verdad', async ({ request }) => {
    const inventadas = [
      '/ruta-completamente-inventada',
      '/actividades-vulnerables/no-existe-xyz',
      '/obligaciones/no-existe-xyz',
      '/directorio/no-existe-xyz',
      '/directorio/profesional/no-existe-xyz',
    ];

    for (const ruta of inventadas) {
      const res = await request.get(ruta, { maxRedirects: 0 });
      expect(res.status(), `${ruta} debe devolver 404, no ${res.status()}`).toBe(404);
    }
  });

  /**
   * El marcado `Dataset` tiene que pasar el validador de Google, no sólo ser
   * correcto según schema.org.
   *
   * Search Console reportó «Invalid object type for field spatialCoverage» en
   * /umbrales y /limites-efectivo. El valor era `Country`, que en schema.org
   * desciende de `Place` y por tanto es válido —pero el parser de Google no
   * sigue esa herencia y espera `Place` o texto.
   *
   * Es un aviso no crítico, y ahí está el problema: la página se indexa igual,
   * el build pasa, nada se ve roto, y sólo se pierde la elegibilidad para
   * Google Dataset Search —que es justo donde estas dos páginas tienen algo que
   * ganar—. Un fallo que no duele es un fallo que vuelve.
   */
  test('el marcado Dataset usa los tipos que Google acepta', async ({ page }) => {
    for (const ruta of ['/umbrales', '/limites-efectivo']) {
      await page.goto(ruta);
      const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();

      const datasets = bloques
        .flatMap((b) => {
          const dato: unknown = JSON.parse(b);
          return Array.isArray(dato) ? dato : [dato];
        })
        .filter((d): d is Record<string, unknown> => {
          return !!d && typeof d === 'object' && (d as Record<string, unknown>)['@type'] === 'Dataset';
        });

      expect(datasets.length, `${ruta} debe emitir un Dataset`).toBeGreaterThan(0);

      for (const ds of datasets) {
        const cobertura = ds['spatialCoverage'] as Record<string, unknown> | string | undefined;
        expect(cobertura, `${ruta}: falta spatialCoverage`).toBeDefined();
        if (typeof cobertura === 'object') {
          expect(cobertura['@type'], `${ruta}: spatialCoverage debe ser Place`).toBe('Place');
        }
      }
    }
  });

  /**
   * La extensión se publicó en la Chrome Web Store el 24 ago 2026.
   *
   * Esta prueba existe porque el botón y el marcado del producto son
   * condicionales: si alguien vacía `URL_TIENDA`, la página sigue construyendo
   * y sigue pasando el resto de la suite —simplemente deja de ofrecer el
   * producto, en silencio—. Aquí eso falla.
   *
   * También veta las estrellas inventadas: `aggregateRating` sin reseñas
   * reales es motivo de sanción manual de Google, y en un sitio cuya promesa
   * es «no inventamos cifras» sería la contradicción más cara posible.
   */
  test('la extensión se ofrece con su ficha real y sin reseñas inventadas', async ({ page }) => {
    await page.goto('/extension');

    const boton = page.getByRole('link', { name: /Chrome Web Store/i });
    await expect(boton).toBeVisible();
    const href = await boton.getAttribute('href');
    expect(href, 'el botón debe apuntar a la Chrome Web Store').toMatch(
      /^https:\/\/chromewebstore\.google\.com\/detail\//,
    );
    // Los parámetros de sesión de quien copió el enlace no deben publicarse.
    expect(href).not.toMatch(/authuser=|[?&]hl=/);

    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const apps = bloques
      .flatMap((b) => {
        const dato: unknown = JSON.parse(b);
        return Array.isArray(dato) ? dato : [dato];
      })
      .filter((d): d is Record<string, unknown> => {
        return (
          !!d && typeof d === 'object' &&
          (d as Record<string, unknown>)['@type'] === 'SoftwareApplication'
        );
      });

    expect(apps.length, 'debe emitirse un SoftwareApplication').toBe(1);
    expect(apps[0]?.['downloadUrl'], 'el marcado debe llevar a la ficha').toBe(href);
    expect(apps[0]?.['aggregateRating'], 'no se declaran reseñas que no existen').toBeUndefined();
  });

  /**
   * La app Android está publicada y su manifiesto declara App Links
   * verificados para `leyantilavado.org/app`.
   *
   * Esta prueba existe porque el fallo es silencioso: si `assetlinks.json`
   * desaparece o deja de servirse como JSON, Android simplemente no verifica y
   * los enlaces se abren en el navegador. Nadie recibe un error, ni el sitio ni
   * el teléfono, y el defecto sólo se nota si alguien prueba a abrir un enlace
   * con la app instalada.
   */
  test('el sitio autoriza los App Links de la app Android', async ({ request }) => {
    const res = await request.get('/.well-known/assetlinks.json');
    expect(res.status()).toBe(200);

    const enlaces = await res.json();
    expect(Array.isArray(enlaces)).toBe(true);

    const android = enlaces.find(
      (e: { target?: { namespace?: string } }) => e.target?.namespace === 'android_app',
    );
    expect(android, 'falta la declaración de la app Android').toBeDefined();
    expect(android.target.package_name).toBe('org.leyantilavado.mx');
    expect(android.relation).toContain('delegate_permission/common.handle_all_urls');
    expect(
      android.target.sha256_cert_fingerprints.length,
      'sin huella no se verifica nada',
    ).toBeGreaterThan(0);
  });

  test('la landing de la app se ofrece con su ficha real', async ({ page }) => {
    await page.goto('/app');

    // La página repite la descarga: una vez arriba y otra al cierre, después de
    // privacidad y deslinde, que es donde decide quien se lo piensa. Por eso se
    // comprueban TODAS y no la primera: un segundo botón mal puesto sería peor
    // que no tenerlo, porque nadie vuelve a mirar el que ya funcionaba.
    const botones = page.getByRole('link', { name: /Google Play/i });
    const cuantos = await botones.count();
    expect(cuantos, 'la landing debe ofrecer la descarga').toBeGreaterThan(0);

    for (let i = 0; i < cuantos; i++) {
      const href = await botones.nth(i).getAttribute('href');
      expect(href, `botón ${i + 1}`).toMatch(
        /^https:\/\/play\.google\.com\/store\/apps\/details\?id=/,
      );
      // `pli` es un parámetro de la sesión de quien copió el enlace.
      expect(href, `botón ${i + 1}`).not.toMatch(/[?&]pli=/);
    }
  });

  /**
   * `llms-full.txt` publica el corpus entero para modelos.
   *
   * Se vigila porque su fallo sería mudo en los dos sentidos: si la ruta
   * desaparece nadie se entera, y si alguien congelara las cifras en un archivo
   * estático el corpus seguiría sirviéndose —viejo— durante años.
   *
   * La comprobación de que la UMA vigente aparece es justamente eso: si el
   * archivo dejara de derivarse del motor, este número sería el primero en
   * desincronizarse.
   */
  test('el corpus completo se publica para modelos y sale del motor', async ({ request }) => {
    const res = await request.get('/llms-full.txt');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('text/plain');

    const txt = await res.text();
    expect(txt.length, 'un corpus de menos de 5 KB está incompleto').toBeGreaterThan(5000);

    // El comparador es la distinción que este sitio defiende: sin él, «superior
    // a» e «igual o superior a» se colapsan y se inventa o se borra una
    // obligación justo en el borde.
    expect(txt).toContain('igual o superior a');
    // Lo no verificado se declara, no se rellena con la cifra de otra fracción.
    expect(txt).toContain('sin umbral publicado');
    // Si esto falla, el archivo dejó de leer del motor.
    expect(txt).toMatch(/UMA más reciente registrada: año 20\d\d/);

    const corto = await (await request.get('/llms.txt')).text();
    expect(corto, 'el llms.txt debe apuntar al corpus completo').toContain('/llms-full.txt');
  });

  /**
   * La portada tiene que decir CUÁNDO se comprobaron las fuentes, no sólo la
   * versión del corpus.
   *
   * Son dos preguntas distintas y la versión sólo responde una: numera el
   * último cambio de DATO, así que en una revisión que no encuentra cambios se
   * queda quieta, a propósito. Sola en la tarjeta, esa fecha quieta se lee como
   * un sitio abandonado — pasó dos veces, la segunda con el dueño del sitio,
   * después de que la pastilla del titular se quitara y la fecha de revisión
   * desapareciera de la portada entera sin que nadie lo notara.
   *
   * Es un fallo mudo: no rompe el build, no rompe ningún tipo, y la página se
   * ve perfecta. Por eso vive aquí.
   */
  test('la portada dice cuándo se revisaron las fuentes, no sólo la versión', async ({
    page,
  }) => {
    await page.goto('/');
    const tarjeta = page.getByText('Datos base del cálculo').locator('..');

    await expect(
      tarjeta.getByText('Última revisión de fuentes'),
      'la tarjeta de datos perdió la fecha de revisión',
    ).toBeVisible();

    // Y que sea una fecha de verdad, no una etiqueta vacía: el año en curso
    // basta para distinguir «se renderizó» de «se renderizó un valor».
    await expect(tarjeta).toContainText(/de 20\d\d/);
  });

  test('el manifiesto de la PWA es válido', async ({ request }) => {
    const res = await request.get('/manifest.webmanifest');
    expect(res.status()).toBe(200);
    const manifiesto = await res.json();
    expect(manifiesto.name).toContain('LeyAntilavado');
    expect(manifiesto.icons.length).toBeGreaterThanOrEqual(2);
    expect(manifiesto.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true);
  });

  test('cada página tiene canonical y descripción únicas', async ({ page }) => {
    const vistos = new Map<string, string>();
    for (const ruta of ['/', '/umbrales', '/multas', '/glosario']) {
      await page.goto(ruta);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      const desc = await page.locator('meta[name="description"]').getAttribute('content');

      expect(canonical, `falta canonical en ${ruta}`).toBeTruthy();
      expect(desc?.length ?? 0, `descripción muy corta en ${ruta}`).toBeGreaterThan(50);
      expect(vistos.has(desc!), `descripción duplicada entre ${vistos.get(desc!)} y ${ruta}`).toBe(
        false,
      );
      vistos.set(desc!, ruta);
    }
  });
});

test.describe('Accesibilidad', () => {
  test('el salto al contenido funciona con teclado', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const enfocado = page.locator(':focus');
    await expect(enfocado).toHaveText(/saltar al contenido/i);
    await enfocado.press('Enter');
    await expect(page.locator('#contenido')).toBeVisible();
  });

  test('todo control interactivo es alcanzable y etiquetado', async ({ page }) => {
    await page.goto('/herramientas/calculadora-uma');

    const sinEtiqueta = await page.evaluate(() => {
      const malos: string[] = [];
      document.querySelectorAll('input, select, textarea').forEach((el) => {
        const id = el.id;
        const tieneLabel = id && document.querySelector(`label[for="${CSS.escape(id)}"]`);
        const tieneAria = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
        if (!tieneLabel && !tieneAria) malos.push(el.outerHTML.slice(0, 90));
      });
      return malos;
    });
    expect(sinEtiqueta, 'campos sin etiqueta accesible').toEqual([]);
  });

  test('el foco nunca se oculta', async ({ page }) => {
    await page.goto('/');
    const ocultos = await page.evaluate(() => {
      const malos: string[] = [];
      document.querySelectorAll('a, button, input, select, textarea').forEach((el) => {
        const estilo = getComputedStyle(el, ':focus-visible');
        if (estilo.outlineStyle === 'none' && estilo.boxShadow === 'none') {
          malos.push(el.tagName);
        }
      });
      return malos;
    });
    expect(ocultos.length, 'elementos que eliminan el indicador de foco').toBe(0);
  });

  test('la página no se desplaza horizontalmente en móvil', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    for (const ruta of ['/', '/umbrales', '/multas', '/herramientas', '/directorio', '/calendario-cumplimiento']) {
      await page.goto(ruta);

      // Se comprueba el COMPORTAMIENTO, no `scrollWidth`.
      //
      // `document.documentElement.scrollWidth > clientWidth` da falso positivo
      // en este sitio: `html` lleva `overflow-x: clip` y con `clip` el
      // navegador sigue reportando el ancho del contenido recortado aunque la
      // página no se pueda desplazar. Lo que importa es si el usuario puede
      // arrastrar la página a la derecha, y eso se mide intentándolo.
      const seDesplaza = await page.evaluate(() => {
        window.scrollTo(9999, 0);
        const x = window.scrollX;
        window.scrollTo(0, 0);
        return x > 0;
      });

      expect(seDesplaza, `la página se desplaza horizontalmente en ${ruta}`).toBe(false);
    }
  });

  test('las tablas anchas scrollean dentro de su propio contenedor', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/umbrales');

    const estado = await page.evaluate(() => {
      const region = document.querySelector('[role="region"]');
      if (!region) return null;
      return {
        cabeEnPantalla: region.getBoundingClientRect().width <= document.documentElement.clientWidth,
        scrolleaDentro: region.scrollWidth > region.clientWidth,
        // El contenedor debe ser alcanzable con teclado para poder recorrer
        // la tabla sin ratón.
        enfocable: region.getAttribute('tabindex') === '0',
      };
    });

    expect(estado, 'no se encontró el contenedor de la tabla').not.toBeNull();
    expect(estado!.cabeEnPantalla, 'el contenedor desborda la pantalla').toBe(true);
    expect(estado!.scrolleaDentro, 'la tabla debe scrollear dentro del contenedor').toBe(true);
    expect(estado!.enfocable, 'el contenedor con scroll debe ser enfocable').toBe(true);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * Móvil: los dos fallos que se reportaron desde un teléfono real.
 *
 * Los dos son de la clase que no se ve en una revisión de código y no aparece
 * si sólo se prueba la página desde arriba.
 * ────────────────────────────────────────────────────────────────────────── */

test.describe('Móvil', () => {
  test('el menú se ve aunque la página esté desplazada', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('load');

    // Espera a la hidratación de verdad, no a un temporizador.
    //
    // El resto del contrato comprueba HTML servido, así que nunca la necesitó.
    // Ésta sí pulsa un botón: sin hidratar el clic no dispara nada, y el fallo
    // se lee como «el menú no existe» cuando lo que pasó es que React todavía
    // no había enganchado el manejador.
    const boton = page.locator('header button[aria-controls="menu-movil"]');
    await expect
      .poll(async () => {
        await boton.click();
        return boton.getAttribute('aria-expanded');
      }, { timeout: 15_000, message: 'el botón del menú nunca respondió' })
      .toBe('true');
    await boton.click(); // cerrar, para abrirlo ya desplazado

    // A media página. El fallo original NO se reproducía en scrollY = 0: el
    // encabezado sólo aplica `backdrop-filter` cuando detecta desplazamiento,
    // y ese filtro crea bloque contenedor, que convertía el menú `fixed` en
    // algo que se comportaba como `absolute` y se iba con el scroll.
    //
    // `behavior: 'instant'` a propósito: el sitio lleva `scroll-behavior:
    // smooth`, y con un desplazamiento animado el encabezado sigue moviéndose
    // cuando Playwright evalúa si el botón está estable. La prueba caducaba
    // esperando a un elemento que no estaba quieto, no por el fallo real.
    await page.evaluate(() => window.scrollTo({ top: 3000, behavior: 'instant' }));
    await page.waitForFunction(() => window.scrollY >= 2900);
    await boton.click();
    await page.locator('#menu-movil').waitFor({ state: 'visible' });
    await page.waitForTimeout(400);

    const m = await page.evaluate(() => {
      const nav = document.querySelector('#menu-movil') as HTMLElement | null;
      if (!nav) return null;
      const b = nav.getBoundingClientRect();
      const cta = nav.querySelector('a[href*="cuestionario"]')?.getBoundingClientRect();
      return {
        dentroDePantalla: b.top >= 0 && b.top < window.innerHeight,
        // El portal saca el menú del <header> justamente para que ningún
        // filtro de un ancestro pueda volver a romper el `fixed`.
        fueraDelEncabezado: nav.parentElement?.tagName === 'BODY',
        ctaVisibleSinDesplazar: !!cta && cta.top >= 0 && cta.bottom <= window.innerHeight,
        // El encabezado tiene que seguir a la vista: ahí está la X de cerrar.
        encabezadoVisible: (() => {
          const h = document.querySelector('header')!.getBoundingClientRect();
          return h.top >= 0 && h.top < window.innerHeight;
        })(),
      };
    });

    expect(m, 'el menú móvil debe existir al abrirlo').not.toBeNull();
    expect(m!.dentroDePantalla, 'el menú debe verse sin subir al principio').toBe(true);
    expect(m!.fueraDelEncabezado, 'el menú debe vivir fuera del <header>').toBe(true);
    expect(m!.ctaVisibleSinDesplazar, 'el CTA debe verse sin desplazar el menú').toBe(true);
    expect(m!.encabezadoVisible, 'el encabezado debe seguir visible: lleva la X').toBe(true);
  });

  test('la portada no tiene franjas en blanco', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('load');

    // Se revela todo primero: una animación de entrada pendiente no es un
    // hueco, y confundirlas haría fallar la prueba por el motivo equivocado.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
    });
    await page.waitForTimeout(600);

    const huecos = await page.evaluate(() => {
      const total = document.body.scrollHeight;
      const pintado = new Uint8Array(Math.ceil(total / 10));
      for (const e of document.querySelectorAll('body *')) {
        const el = e as HTMLElement;
        const s = getComputedStyle(el);
        if (s.display === 'none' || Number(s.opacity) === 0) continue;
        const tieneTinta =
          (el.innerText?.trim().length ?? 0) > 0 ||
          el.tagName === 'IMG' ||
          el.tagName === 'SVG' ||
          (s.backgroundColor !== 'rgba(0, 0, 0, 0)' && s.backgroundColor !== 'transparent') ||
          s.borderTopWidth !== '0px';
        if (!tieneTinta) continue;
        const b = el.getBoundingClientRect();
        if (b.height <= 0 || b.height >= 2000) continue;
        for (let i = Math.floor((b.top + scrollY) / 10); i <= Math.floor((b.bottom + scrollY) / 10); i++) {
          if (i >= 0 && i < pintado.length) pintado[i] = 1;
        }
      }
      const encontrados: string[] = [];
      let inicio = -1;
      for (let i = 0; i < pintado.length; i++) {
        if (!pintado[i] && inicio < 0) inicio = i;
        if (pintado[i] && inicio >= 0) {
          // 150px es más de un sexto de pantalla: por debajo es respiro, por
          // encima se lee como que la página se rompió.
          if ((i - inicio) * 10 >= 150) encontrados.push(`y=${inicio * 10} (${(i - inicio) * 10}px)`);
          inicio = -1;
        }
      }
      return encontrados;
    });

    expect(huecos, `Franjas sin nada dibujado: ${huecos.join(', ')}`).toEqual([]);
  });
});
