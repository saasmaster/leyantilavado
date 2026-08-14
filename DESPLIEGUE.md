# Publicar LeyAntilavado.org

Guía para poner el **sitio público** en producción. El área privada (`/panel`, `/admin`) y
Supabase no son requisito: si faltan sus credenciales, esas rutas muestran una pantalla de
configuración pendiente y el resto del sitio funciona igual.

> **Esto es una app de Node, no de PHP.** Next.js necesita un proceso de Node corriendo. En un
> VPS eso no es problema; en un hosting compartido de PHP no funcionaría sin exportar a HTML
> estático, y eso rompería los formularios y el área privada.

Hay dos caminos según el VPS:

| VPS | Camino | Sección |
|---|---|---|
| Nginx (sólo despliegue por GitHub) | ServerAvatar clona el repo y compila en el servidor | [§2](#2-vps-con-nginx--despliegue-desde-github) |
| OpenLiteSpeed | ZIP autocontenido por SFTP | [§3](#3-vps-con-openlitespeed--zip-por-sftp) |

---

## 1. Antes de publicar — bloqueantes reales

No son cosméticos. Publicar sin resolverlos expone al proyecto.

### 1.1 Datos legales del responsable

Las páginas legales llevan marcadores visibles `[PENDIENTE: …]` en nota ámbar. Están puestos a
propósito —es más honesto que un texto inventado— pero **no pueden salir a producción así**.

```bash
grep -rn "PENDIENTE:" apps/web/src --include="*.tsx"
```

Faltan: razón social, RFC, domicilio fiscal, correo del responsable de datos personales,
autoridad garante vigente, proveedores (hosting, base de datos, correo), plazo de conservación
tras la baja, jurisdicción aplicable, responsable editorial con su credencial PLD y las tarifas
de perfiles destacados.

### 1.2 Revisión jurídica humana

El contenido está contrastado contra DOF, SAT, INEGI y Cámara de Diputados, y cada regla lleva su
nivel de verificación. Aun así, **alguien con credencial en PLD/FT debe revisarlo y firmar**.

Puntos que exigen atención específica:

- **Fracción XII, Apartados C y D** (servidores públicos y personas facilitadoras): la autoridad
  no publicó umbrales. Están marcados `no_verificado` y **no se publican**. Verifica que sigan así.
- **Art. 32, fracción VIII** (consignación de pago): el SAT publica 3,210 UMA fijos y la ley remite
  al umbral de cada fracción. La herramienta muestra **ambas versiones** sin elegir. No lo
  "resuelvas" sin fundamento.
- **UMA 2016-2021**: respaldadas por dos fuentes secundarias que coinciden al centavo, pero no
  contra el DOF primario — los boletines del INEGI de esos años ya no están en línea.
- **Avisos de 24 horas**: sin fecha cierta hasta que la UIF publique la Resolución de formatos.
  No les pongas fecha en el calendario.

### 1.3 Verificación técnica

```bash
npm ci
npm run test        # 84 pruebas: 62 del motor jurídico + 22 de la app
npm run typecheck   # los 4 paquetes
npm run build       # eslint atrapa lo que tsc no ve — nunca lo saltes
npm --prefix apps/web run test:e2e   # 122 pruebas end-to-end
```

`npm run build` no es opcional. Las reglas `react-hooks/purity` (nada de `new Date()` durante el
render) y `react-hooks/set-state-in-effect` sólo se detectan ahí, y ya cazaron dos bugs reales en
este proyecto que `tsc` daba por buenos.

---

## 2. VPS con Nginx — despliegue desde GitHub

ServicioAvatar clona el repositorio, instala, compila y arranca el proceso.

### 2.1 Subir el repositorio

El repositorio ya está inicializado localmente. Sube el remoto y luego conéctalo en ServerAvatar.

**Que sea privado.** No hay secretos en el código —`.env` está ignorado— pero el repo contiene la
investigación jurídica y el contenido editorial antes de su revisión.

### 2.2 Configuración en ServerAvatar

Crea una aplicación **Node.js** apuntando al repositorio, con estos valores:

| Campo | Valor |
|---|---|
| Rama | `main` |
| Versión de Node | **20 o superior** |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Start command | `npm run start` |
| Puerto | `5400` |

### 2.3 Variables de entorno

En el panel de la aplicación:

```bash
NODE_ENV=production
PORT=5400
HOSTNAME=127.0.0.1

NEXT_PUBLIC_SITE_URL=https://leyantilavado.org
NEXT_PUBLIC_SITE_INDEXABLE=true

# openssl rand -hex 32
CRON_SECRET=

# Cloudflare Turnstile (opcional). Sin estas dos, los formularios funcionan
# igual pero SIN verificación antibot: sólo queda el límite de tasa por IP.
# Se sacan de https://dash.cloudflare.com → Turnstile → Add site.
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

**Turnstile.** `NEXT_PUBLIC_TURNSTILE_SITE_KEY` también se incrusta en el build, y además
decide la CSP: sólo cuando está presente se abre `challenges.cloudflare.com` en `script-src`,
`connect-src` y `frame-src`. Si la agregas después de compilar, el widget no aparecerá y, si
apareciera, la CSP lo bloquearía. **Hay que recompilar.**

Verificar que quedó activo, una vez desplegado:

```bash
curl -sI https://leyantilavado.org/ | grep -i content-security-policy | grep -o 'challenges.cloudflare.com' | head -1
```

Si no imprime nada, el build no vio la llave.

**`NEXT_PUBLIC_SITE_URL` y `NEXT_PUBLIC_SITE_INDEXABLE` se incrustan en el bundle durante el
build.** Cambiarlas después y reiniciar no sirve de nada: hay que volver a compilar. Si el sitio
sale con `noindex` cuando no debía, es esto.

### 2.4 Nginx

ServerAvatar genera el proxy inverso solo. Sólo hay que cuidar una cosa:

> **No agregues cabeceras de seguridad en Nginx.** La app ya envía CSP, HSTS, X-Frame-Options,
> Referrer-Policy y Permissions-Policy. Dos cabeceras `Content-Security-Policy` se intersectan y
> el resultado suele ser más restrictivo de lo que ninguna de las dos pretendía, con fallos
> difíciles de diagnosticar.

Si quieres afinar el rendimiento, `dist/config/nginx.conf` (generado por `npm run empaquetar`)
trae las reglas de caché para `/_next/static/` y la excepción del service worker, que **nunca**
debe cachearse: si se queda pegado, sirve un bundle viejo y la app falla con errores que no
existen en el código.

### 2.5 Actualizar

> **El panel NO compila.** «Git → Pull Latest Changes» hace `git pull` y nada más: no ejecuta el
> *Build Command* ni reinicia PM2. Como Next sirve `.next/`, el servidor se queda con el código
> nuevo y el sitio compilado viejo, y una ruta recién añadida devuelve **404 con su `page.tsx` en
> disco**. Los síntomas engañan —parece caché del navegador, o DNS, o el proxy— y no es ninguno.

Tras cada push, despliega por SSH:

```bash
ssh leyantilavado@209.54.100.69   # contraseña: system_user en la API de ServerAvatar
cd ~/leyantilavado/public_html && git pull --ff-only && \
  NODE_ENV=production NEXT_PUBLIC_SITE_URL=https://leyantilavado.org \
  NEXT_PUBLIC_SITE_INDEXABLE=true NODE_OPTIONS=--max_old_space_size=4096 \
  npm run build && pm2 restart leyantilavado --update-env
```

Las variables van a mano porque **no hay `.env` en el servidor** —sólo `.env.example`—: las
inyecta PM2. Un `npm run build` pelado compilaría sin `NEXT_PUBLIC_SITE_URL` y dejaría canónicas
y sitemap apuntando a `localhost`: un despliegue «exitoso» que rompe el SEO en silencio. Si
cambian, sácalas del proceso vivo con `pm2 jlist`.

Diagnóstico rápido cuando algo «no se refleja» — comparar dos fechas por SSH:

```bash
cd ~/leyantilavado/public_html && git log -1 --format=%h\ %ad && ls -ld apps/web/.next
```

Si el commit está al día y `.next` atrasado, falta compilar. No es caché.

### 2.6 Verificar el despliegue

Desde fuera, nunca desde el navegador: tu caché y el service worker mienten sobre lo que sirve
el servidor.

```bash
curl -sI https://leyantilavado.org/<ruta-nueva> | head -1
E2E_BASE=https://leyantilavado.org npx playwright test   # las 128 del contrato
```

---

## 3. VPS con OpenLiteSpeed — ZIP por SFTP

```bash
npm run empaquetar -- --dominio leyantilavado.org
```

Genera `dist/leyantilavado-<fecha>.zip` con la app en salida autocontenida —trae su propio
`server.js` y las dependencias mínimas, **no requiere `npm install` en el servidor**—, la
configuración de OpenLiteSpeed, un servicio systemd y las instrucciones.

Opciones:

```bash
npm run empaquetar -- --dominio leyantilavado.org --sin-indexar   # cerrado a buscadores
npm run empaquetar -- --puerto 5400
```

Las instrucciones de subida van dentro del ZIP, en `LEEME.md`.

---

## 4. Después de publicar, en cualquiera de los dos

1. **Verifica las cabeceras:**
   ```bash
   curl -sI https://leyantilavado.org | grep -i 'content-security\|strict-transport\|x-frame'
   ```
2. **Confirma la indexación:**
   ```bash
   curl -s https://leyantilavado.org/robots.txt
   ```
   Si dice `Disallow: /`, se compiló con `NEXT_PUBLIC_SITE_INDEXABLE=false`.
3. **Envía el sitemap** a Google Search Console y a Bing Webmaster Tools.
4. **Programa el monitor regulatorio**, una vez al día:
   ```
   0 7 * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://leyantilavado.org/api/cron/monitor-fuentes
   ```
   Revisa las URLs oficiales y avisa cuando cambian; **nunca publica una interpretación por su
   cuenta**: crea un borrador para revisión humana.
5. **Respalda `.data/`.** Ahí viven los correos de suscriptores y las solicitudes de contacto
   mientras Supabase no esté conectado. Está en `.gitignore`, pero existe en el disco del
   servidor: migra ese contenido a la base en cuanto exista y borra los archivos.

---

## 5. Sobre la Content Security Policy

`script-src` incluye `'unsafe-inline'`. Es deliberado y tiene su explicación completa en
`apps/web/next.config.mjs`: los scripts de hidratación de Next tienen contenido variable por
página y por build, así que ningún hash los cubre. La alternativa —un nonce por petición—
obligaría a renderizar las 172 páginas de forma dinámica, y este sitio de contenido perdería
justo lo que lo hace rápido y barato de servir.

El resto de la política sí está cerrado: `object-src 'none'`, `base-uri 'self'`,
`frame-ancestors 'none'`, `form-action 'self'` y sin destinos externos en `connect-src`. La suite
e2e verifica que no se cuele un origen externo.

---

## 6. Lo que queda pendiente y hay que decirlo

Publicar el sitio no significa que todo esté terminado.

| Pendiente | Impacto |
|---|---|
| Supabase sin conectar | El área privada muestra pantalla de configuración pendiente |
| Directorio con perfiles demostrativos | Marcados como tales y con `noindex`; hay que sustituirlos por altas reales |
| Sin consola de moderación | Nadie lee `.data/*.jsonl`: las solicitudes se guardan pero no se entregan |
| Stripe sin credenciales | `/precios` muestra "modo de prueba" de forma visible; no finge cobros |
| Proveedor PEP sin conectar | El adaptador local declara en la interfaz que no consulta fuentes externas |
| Falta el umbral de control del beneficiario controlador | La herramienta lo pide al usuario en vez de inventarlo |
| Sin imagen de hero | Se agotaron los créditos de generación; el hero usa un degradado del sistema |
| Cursos y plantillas sin inventario | Estado vacío honesto en lugar de tarjetas falsas |

Ninguno impide publicar el sitio informativo. Todos deben quedar visibles para quien tome la
decisión de lanzar.
