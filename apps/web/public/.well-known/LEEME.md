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

## Resuelto el 4 de noviembre de 2026

El archivo llevaba **sólo la huella del certificado de subida** (alias `upload`,
`F6:46:...`). Con Firma de apps de Google Play, el APK que llega al teléfono va
firmado por Google, y Android verifica contra **el certificado del APK
instalado**, así que la verificación falló desde que la app se publicó. Play lo
reportó el 2 de noviembre: *"One deep link may be failing because your web
domains aren't associated with your app"*.

Ahora lleva las cuatro, tomadas de Play Console → Firma de apps:

| Huella | Qué es |
|---|---|
| `28:39:B7:03:…` | **Certificado de firma de apps, en uso.** Es la que decide. |
| `DA:6F:4F:A9:…` | Clave de firma anterior (rotada el 13 ago 2026). |
| `FA:CB:7C:0E:…` | Clave de firma anterior. |
| `F6:46:3F:D5:…` | Certificado de subida. Para APK instalados a mano o de Prueba interna. |

Las de firma anteriores van porque un teléfono con una versión vieja instalada
todavía lleva ese certificado. La de subida no estorba y cubre `flutter build`.

**Esto sólo surte efecto al desplegar el sitio.** Android revalida al instalar o
actualizar, no al instante.

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
