#!/usr/bin/env node
/**
 * Empaqueta LeyAntilavado.org para subir a un VPS.
 *
 *   node scripts/empaquetar.mjs [--dominio leyantilavado.org] [--sin-indexar]
 *
 * Produce `dist/leyantilavado-<fecha>.zip` con:
 *   · la app Next en salida autocontenida (no requiere `npm install` en el VPS)
 *   · configuraciones listas para Nginx y para OpenLiteSpeed
 *   · un servicio systemd
 *   · .env.produccion.ejemplo y las instrucciones de subida
 *
 * Por omisión el sitio se empaqueta INDEXABLE. `--sin-indexar` lo deja cerrado
 * a buscadores, que es lo que conviene si todavía falta la revisión jurídica.
 */

import { execFileSync } from 'node:child_process';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WEB = path.join(RAIZ, 'apps/web');
const SALIDA = path.join(RAIZ, 'dist');

const args = process.argv.slice(2);
const valorDe = (bandera, pordefecto) => {
  const i = args.indexOf(bandera);
  return i >= 0 && args[i + 1] ? args[i + 1] : pordefecto;
};

const DOMINIO = valorDe('--dominio', 'leyantilavado.org');
const INDEXABLE = !args.includes('--sin-indexar');
const PUERTO = valorDe('--puerto', '5400');

const paso = (n, texto) => console.log(`\n[${n}] ${texto}`);
const correr = (cmd, cmdArgs, cwd) =>
  execFileSync(cmd, cmdArgs, { cwd, stdio: 'inherit', env: { ...process.env } });

/* ────────────────────────────────────────────────────────────────────────── */

paso(1, 'Limpiando salida anterior');
await rm(SALIDA, { recursive: true, force: true });
await mkdir(SALIDA, { recursive: true });

paso(2, `Compilando (indexable: ${INDEXABLE ? 'SÍ' : 'no'}, dominio: ${DOMINIO})`);
// Estas dos variables se INCRUSTAN en el bundle del cliente durante el build.
// Cambiarlas después en el servidor no tiene efecto: hay que recompilar.
process.env.NEXT_PUBLIC_SITE_URL = `https://${DOMINIO}`;
process.env.NEXT_PUBLIC_SITE_INDEXABLE = INDEXABLE ? 'true' : 'false';
process.env.NODE_ENV = 'production';
// Activa `output: 'standalone'` en next.config.mjs. Sólo aquí: el despliegue
// desde GitHub arranca con `next start` y no debe usar esa salida.
process.env.EMPAQUETAR = '1';

await rm(path.join(WEB, '.next'), { recursive: true, force: true });
correr('npx', ['next', 'build'], WEB);

const standalone = path.join(WEB, '.next/standalone');
if (!existsSync(standalone)) {
  console.error(
    '\nNo se generó .next/standalone. Revisa que next.config.mjs tenga output: "standalone".',
  );
  process.exit(1);
}

paso(3, 'Armando el paquete');
const APP = path.join(SALIDA, 'app');
await mkdir(APP, { recursive: true });

// 1) El servidor autocontenido, con la estructura del monorepo que espera.
await cp(standalone, APP, { recursive: true });

// 2) Los estáticos y el /public NO los copia el standalone: van aparte, y en
//    las mismas rutas relativas, o el sitio carga sin CSS.
await cp(path.join(WEB, '.next/static'), path.join(APP, 'apps/web/.next/static'), {
  recursive: true,
});
await cp(path.join(WEB, 'public'), path.join(APP, 'apps/web/public'), { recursive: true });

/* ── Configuraciones del servidor ───────────────────────────────────────── */

paso(4, 'Generando configuraciones de servidor');
const CONF = path.join(SALIDA, 'config');
await mkdir(CONF, { recursive: true });

await writeFile(
  path.join(CONF, 'nginx.conf'),
  `# LeyAntilavado.org — proxy inverso para Nginx
#
# La app de Next ya envía sus propias cabeceras de seguridad (CSP, HSTS,
# X-Frame-Options...). NO las repitas aquí: dos cabeceras Content-Security-Policy
# se intersectan y el resultado suele ser más restrictivo de lo que ninguna de
# las dos pretendía, con fallos difíciles de diagnosticar.

upstream leyantilavado {
    server 127.0.0.1:${PUERTO};
    keepalive 32;
}

server {
    listen 80;
    server_name ${DOMINIO} www.${DOMINIO};
    return 301 https://${DOMINIO}$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.${DOMINIO};
    # ServerAvatar coloca aquí los certificados de Let's Encrypt.
    return 301 https://${DOMINIO}$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMINIO};

    # --- TLS: lo gestiona ServerAvatar ---
    # ssl_certificate     /etc/letsencrypt/live/${DOMINIO}/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/${DOMINIO}/privkey.pem;

    client_max_body_size 2m;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;

    # Los estáticos con hash en el nombre son inmutables: se sirven desde disco
    # sin pasar por Node.
    location /_next/static/ {
        alias /var/www/leyantilavado/apps/web/.next/static/;
        access_log off;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /icons/ {
        alias /var/www/leyantilavado/apps/web/public/icons/;
        expires 30d;
        access_log off;
    }

    # El service worker NUNCA se cachea: si se queda pegado, sirve un bundle
    # viejo y la app falla con errores que no existen en el código.
    location = /sw.js {
        proxy_pass http://leyantilavado;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    location / {
        proxy_pass http://leyantilavado;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        # Sin esto la app cree que sirve por HTTP y arma URLs equivocadas.
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
`,
);

await writeFile(
  path.join(CONF, 'openlitespeed.md'),
  `# LeyAntilavado.org en OpenLiteSpeed

OpenLiteSpeed no usa un archivo de texto como Nginx: se configura desde su panel
(puerto 7080) o desde ServerAvatar. Estos son los valores a capturar.

## 1. External App (el proceso de Node)

\`Server Configuration → External App → Add → Web Server\`

| Campo | Valor |
|---|---|
| Name | \`leyantilavado\` |
| Address | \`127.0.0.1:${PUERTO}\` |
| Max Connections | \`100\` |
| Initial Request Timeout | \`60\` |
| Retry Timeout | \`0\` |
| Response Buffering | \`No\` |

\`Response Buffering: No\` importa: con buffering activado se rompe el streaming
de React y las páginas tardan en aparecer aunque el servidor ya respondió.

## 2. Contexto de estáticos (antes que el proxy)

\`Virtual Host → Context → Add → Static\`

| Campo | Valor |
|---|---|
| URI | \`/_next/static/\` |
| Location | \`/var/www/leyantilavado/apps/web/.next/static/\` |
| Accessible | \`Yes\` |
| Expires | \`Enable\`, 1 año |

Sirve los archivos con hash directamente desde disco, sin despertar a Node.

## 3. Contexto proxy (todo lo demás)

\`Virtual Host → Context → Add → Proxy\`

| Campo | Valor |
|---|---|
| URI | \`/\` |
| Web Server | \`leyantilavado\` |

El orden importa: OpenLiteSpeed evalúa los contextos de arriba abajo y el
primero que coincide gana. Si \`/\` queda antes que \`/_next/static/\`, todo pasa
por Node y se pierde la ventaja.

## 4. Rewrite para forzar HTTPS

\`Virtual Host → Rewrite → Enable Rewrite: Yes\`

\`\`\`
RewriteCond %{HTTPS} !=on
RewriteRule ^(.*)$ https://${DOMINIO}/$1 [R=301,L]
\`\`\`

## 5. Cabeceras

**No agregues cabeceras de seguridad aquí.** La app ya envía CSP, HSTS,
X-Frame-Options, Referrer-Policy y Permissions-Policy. Duplicarlas provoca que
el navegador aplique la intersección de ambas, que casi nunca es lo que se
quería.
`,
);

await writeFile(
  path.join(CONF, 'leyantilavado.service'),
  `# systemd — /etc/systemd/system/leyantilavado.service
#
#   sudo systemctl daemon-reload
#   sudo systemctl enable --now leyantilavado
#   sudo journalctl -u leyantilavado -f

[Unit]
Description=LeyAntilavado.org
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/leyantilavado
ExecStart=/usr/bin/node apps/web/server.js
Restart=always
RestartSec=5

Environment=NODE_ENV=production
Environment=PORT=${PUERTO}
Environment=HOSTNAME=127.0.0.1
EnvironmentFile=-/var/www/leyantilavado/.env.production

# Endurecimiento: el proceso no necesita nada de esto.
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
# Único directorio con escritura: ahí caen los envíos de formularios
# mientras Supabase no esté conectado.
ReadWritePaths=/var/www/leyantilavado/.data

[Install]
WantedBy=multi-user.target
`,
);

await writeFile(
  path.join(SALIDA, '.env.production.ejemplo'),
  `# Copiar a /var/www/leyantilavado/.env.production
#
# OJO: NEXT_PUBLIC_SITE_URL y NEXT_PUBLIC_SITE_INDEXABLE se incrustan en el
# bundle DURANTE EL BUILD. Cambiarlas aquí no tiene efecto: hay que volver a
# empaquetar. Este paquete se compiló con:
#   NEXT_PUBLIC_SITE_URL=https://${DOMINIO}
#   NEXT_PUBLIC_SITE_INDEXABLE=${INDEXABLE}

NODE_ENV=production
PORT=${PUERTO}
HOSTNAME=127.0.0.1

# Protege /api/cron/monitor-fuentes. Genera una cadena larga y aleatoria:
#   openssl rand -hex 32
CRON_SECRET=

# ── Opcionales: el sitio público funciona sin ellas ──────────────────────
# Sin estas variables, el área privada muestra una pantalla que explica qué
# falta, en lugar de romperse.
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=
`,
);

/* ── Instrucciones ──────────────────────────────────────────────────────── */

await writeFile(
  path.join(SALIDA, 'LEEME.md'),
  `# Subir LeyAntilavado.org al VPS

Paquete generado el ${new Date().toISOString().slice(0, 10)}.
Compilado para **https://${DOMINIO}** e **${INDEXABLE ? 'INDEXABLE por buscadores' : 'NO indexable'}**.

## Qué trae

\`\`\`
app/                      la aplicación lista para correr (no requiere npm install)
config/nginx.conf         proxy inverso para el VPS con Nginx
config/openlitespeed.md   los valores a capturar en el panel de OpenLiteSpeed
config/leyantilavado.service   servicio systemd
.env.production.ejemplo   variables de entorno
\`\`\`

## Pasos

**1. Subir**

Descomprime y sube el contenido de \`app/\` a \`/var/www/leyantilavado/\`.
Desde tu máquina:

\`\`\`bash
rsync -avz --delete app/ usuario@tu-vps:/var/www/leyantilavado/
\`\`\`

**2. Node 20 o superior**

\`\`\`bash
node -v   # debe decir v20 o más
\`\`\`

**3. Variables de entorno**

\`\`\`bash
cp .env.production.ejemplo /var/www/leyantilavado/.env.production
nano /var/www/leyantilavado/.env.production   # generar CRON_SECRET
\`\`\`

**4. Directorio de datos**

Ahí caen las suscripciones al boletín y las solicitudes del directorio mientras
Supabase no esté conectado. Contiene datos personales.

\`\`\`bash
mkdir -p /var/www/leyantilavado/.data
chown -R www-data:www-data /var/www/leyantilavado
chmod 750 /var/www/leyantilavado/.data
\`\`\`

**5. Servicio**

\`\`\`bash
cp config/leyantilavado.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now leyantilavado
systemctl status leyantilavado
\`\`\`

**6. Servidor web**

- **Nginx:** copia \`config/nginx.conf\` al sitio en ServerAvatar, ajusta las
  rutas de los certificados y recarga con \`nginx -t && systemctl reload nginx\`.
- **OpenLiteSpeed:** sigue \`config/openlitespeed.md\`. Son cuatro pantallas del panel.

**7. Comprobar**

\`\`\`bash
curl -sI https://${DOMINIO} | grep -i 'content-security\\|strict-transport\\|x-frame'
curl -s https://${DOMINIO}/robots.txt
\`\`\`

${
  INDEXABLE
    ? `\`robots.txt\` debe permitir el rastreo. Si dice \`Disallow: /\`, el paquete se
compiló sin indexar: vuelve a generarlo sin \`--sin-indexar\`.`
    : `\`robots.txt\` dirá \`Disallow: /\`. Cuando termine la revisión jurídica, vuelve a
empaquetar sin \`--sin-indexar\` y sube de nuevo.`
}

## Después de publicar

1. Envía \`https://${DOMINIO}/sitemap.xml\` a Google Search Console y a Bing.
2. Programa el monitor regulatorio (una vez al día):
   \`\`\`
   0 7 * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://${DOMINIO}/api/cron/monitor-fuentes
   \`\`\`
3. Respalda \`/var/www/leyantilavado/.data\` — ahí viven los correos de los
   suscriptores hasta que se migren a Supabase.

## Actualizar

Vuelve a generar el paquete y repite el paso 1, luego:

\`\`\`bash
systemctl restart leyantilavado
\`\`\`

## Antes de dar por publicado

Revisa \`DESPLIEGUE.md\` del repositorio. Hay tres pendientes que **no son técnicos**:
completar los datos legales del responsable, la revisión jurídica humana firmada
y la decisión de abrir la indexación.
`,
);

/* ── Comprimir ──────────────────────────────────────────────────────────── */

paso(5, 'Comprimiendo');
const fecha = new Date().toISOString().slice(0, 10);
const nombreZip = `leyantilavado-${fecha}${INDEXABLE ? '' : '-noindex'}.zip`;

correr(
  'zip',
  ['-rq', nombreZip, 'app', 'config', 'LEEME.md', '.env.production.ejemplo', '-x', '*.DS_Store'],
  SALIDA,
);

const { size } = await import('node:fs').then((fs) => fs.promises.stat(path.join(SALIDA, nombreZip)));
const mb = (size / 1024 / 1024).toFixed(1);

console.log(`\n✓ dist/${nombreZip}  (${mb} MB)`);
console.log(`  dominio:   https://${DOMINIO}`);
console.log(`  indexable: ${INDEXABLE ? 'SÍ' : 'no'}`);
console.log(`  puerto:    ${PUERTO}\n`);
