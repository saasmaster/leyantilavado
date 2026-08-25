# `assetlinks.json` — App Links de la app Android

La app declara en su manifiesto:

```xml
<intent-filter android:autoVerify="true">
  <data android:scheme="https" android:host="leyantilavado.org" android:pathPrefix="/app" />
</intent-filter>
```

Con `autoVerify`, Android descarga `https://leyantilavado.org/.well-known/assetlinks.json`
al instalar y comprueba que el sitio autoriza a esa app. Si el archivo no está, o
si la huella no coincide, **la verificación falla en silencio**: los enlaces a
`leyantilavado.org/app/...` abren el navegador en vez de la app y no aparece
ningún error en ninguna parte. Estuvo dando 404 desde que la app se publicó.

## Falta una huella, y es la que decide

El archivo lleva hoy **la huella del certificado de subida** (alias `upload`),
que es la que estaba documentada en el proyecto de la app.

**Si la app usa Firma de apps de Google Play** —obligatorio para apps nuevas
desde agosto de 2021, así que casi con seguridad es el caso—, el APK que llega
al teléfono NO va firmado con esa llave, sino con la de Google. Y Android
verifica contra **la del APK instalado**. Con sólo la de subida, la verificación
seguirá fallando.

Para cerrarlo hace falta añadir la otra huella:

1. Play Console → la app → **Prueba y versiones → Firma de apps**.
2. Copiar el **SHA-256 del certificado de firma de apps** (no el de subida).
3. Añadirlo al array `sha256_cert_fingerprints`, junto al que ya está.

Se dejan las dos a propósito: la de subida sirve para los APK que se instalan
directamente desde `flutter build` o desde Prueba interna, y la de Google para
lo que se descarga de la tienda. Tener ambas es lo normal y no rompe nada.

## Comprobar que quedó bien

```
https://developers.google.com/digital-asset-links/tools/generator
```

o, desde un teléfono con la app instalada:

```
adb shell pm get-app-links org.leyantilavado.mx
```

Debe decir `verified` para `leyantilavado.org`.

## Por qué el archivo vive en `public/`

Next sirve `public/` tal cual, así que `public/.well-known/assetlinks.json` sale
en la URL exacta que Android pide. No hace falta configurar nada en nginx.
