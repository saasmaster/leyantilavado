#!/usr/bin/env bash
# Genera los 13 que faltan (5 seg + 8 tool) + las 10 nuevas en español.
# Convierte todo a WebP al final.
set +e

DEST="/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/auditoria/imagenes-propuestas"
LOG=/tmp/img-final.log
> "$LOG"

S_REAL="photorealistic editorial photography, shot on 35mm film, natural light, soft warm tones, deep navy and petrol teal palette, clean composition, professional, no text, no logos, no watermark, no cartoon, no illustration, 4K, high quality"

cat > /tmp/_prompts3.py <<'PYEOF'
import json

S_REAL = "photorealistic editorial photography, shot on 35mm film, natural light, soft warm tones, deep navy and petrol teal palette, clean composition, professional, no text, no logos, no watermark, no cartoon, no illustration, 4K, high quality"

# 5 segmentos faltantes
seg_missing = [
    "A physical representation of a blockchain: small wooden blocks connected by string, marfil background, soft natural light, editorial photography",
    "A small framed abstract painting hanging on a marfil wall, soft natural light, editorial photography, warm tones",
    "Two open hands offering a small contribution toward each other, marfil background, soft natural light, editorial photography, warm tones, shallow depth of field",
    "A miniature construction crane and folded architectural plans on a wooden desk, soft natural light, editorial photography, deep navy and petrol teal",
    "A single brass key resting on a marfil envelope, soft window light, editorial photography, warm tones, shallow depth of field",
]
seg_missing_files = [
    "seg-06-cripto.jpg","seg-07-galerias-arte.jpg","seg-08-donatarias.jpg",
    "seg-09-constructoras.jpg","seg-10-arrendadores.jpg",
]

# 8 herramientas faltantes
tool_missing = [
    "A vintage mechanical calculator on a marfil desk, soft natural light, editorial photography, warm tones, deep navy and petrol teal palette",
    "A small wooden abacus on a marfil surface, soft natural light, editorial photography, warm tones, shallow depth of field",
    "A clipboard with a paper form showing four multiple-choice questions, a wooden pencil resting on it, marfil background, soft natural light, editorial photography",
    "Six small Mexican peso coins in a row on marfil linen, soft natural light, editorial photography, warm tones, shallow depth of field",
    "A small printed ticket or fine notice on a marfil surface with a wooden stamp next to it, soft natural light, editorial photography, warm tones",
    "A small desktop calendar showing day 17 circled, on a marfil desk, soft natural light, editorial photography, warm tones, shallow depth of field",
    "Three nested wooden boxes of decreasing size on a marfil surface, soft natural light, editorial photography, warm tones",
    "A desktop calendar with the next 30 days visible, a small circle marking day 30, soft natural light, editorial photography, warm tones",
]
tool_missing_files = [
    "tool-01-calculadora-umbrales.jpg","tool-02-conversor-uma.jpg","tool-03-cuestionario.jpg",
    "tool-04-acumulacion.jpg","tool-05-multas.jpg","tool-06-fecha-limite.jpg",
    "tool-07-beneficiario.jpg","tool-08-plan-30-nov.jpg",
]

# 10 nuevas en español (imágenes con texto español integrado)
# Las imágenes SIN texto son preferibles para producción, pero aquí el usuario
# pidió imágenes en español — las siguientes llevan texto en español integrado
# en la composición (estilo tarjeta social / OG card).
es_news = [
    "A 16:9 social card with bold Spanish text CUMPLIR LA LEY in deep navy and petrol teal on an ivory marfil background, with subtle Mexican peso coin silhouettes in the corner, clean editorial typography, professional, no watermark",
    "A 16:9 social card with bold Spanish text ENTENDER LA LEY in deep navy and petrol teal on an ivory marfil background, with subtle minimalist legal book icon, clean editorial typography, professional, no watermark",
    "A 16:9 social card with bold Spanish text UMBRALES 2026 in deep navy and petrol teal on an ivory marfil background, with a numeric row 325 645 805 1285 visible, clean editorial typography, professional, no watermark",
    "A 16:9 social card with bold Spanish text MULTAS Y SANCIONES in deep navy and petrol teal on an ivory marfil background, with a subtle gavel silhouette, clean editorial typography, professional, no watermark",
    "A 16:9 social card with bold Spanish text DIRECTORIO PROFESIONAL in deep navy and petrol teal on an ivory marfil background, with subtle abstract community of circles, clean editorial typography, professional, no watermark",
    "A 16:9 social card with bold Spanish text HERRAMIENTAS GRATIS in deep navy and petrol teal on an ivory marfil background, with subtle minimalist calculator icon, clean editorial typography, professional, no watermark",
    "A 16:9 social card with bold Spanish text GUIA COMPLETA in deep navy and petrol teal on an ivory marfil background, with a subtle open book icon, clean editorial typography, professional, no watermark",
    "A 16:9 social card with bold Spanish text FUENTES OFICIALES in deep navy and petrol teal on an ivory marfil background, with a subtle stamped document icon, clean editorial typography, professional, no watermark",
    "A 16:9 social card with bold Spanish text FECHA LIMITE in deep navy and petrol teal on an ivory marfil background, with a circled day 17 on a calendar, clean editorial typography, professional, no watermark",
    "A 16:9 social card with bold Spanish text REFORMA 2026 in deep navy and petrol teal on an ivory marfil background, with abstract reform arrows from 2025 to 2026, clean editorial typography, professional, no watermark",
]
es_files = [
    "es-01-cumplir-ley.jpg","es-02-entender-ley.jpg","es-03-umbrales-2026.jpg",
    "es-04-multas-sanciones.jpg","es-05-directorio.jpg","es-06-herramientas-gratis.jpg",
    "es-07-guia-completa.jpg","es-08-fuentes-oficiales.jpg","es-09-fecha-limite.jpg",
    "es-10-reforma-2026.jpg",
]

# 4 batches
def mk(prompts, files, ratios=None):
    if ratios is None:
        ratios = ["16:9"] * len(prompts)
    return [{"prompt": p, "aspect_ratio": r, "resolution": "2K", "output_file": f} for p, r, f in zip(prompts, ratios, files)]

batches = []
batches.append(mk(seg_missing, seg_missing_files))  # 5
batches.append(mk(tool_missing, tool_missing_files, ["4:3"]*8))  # 8
batches.append(mk(es_news[:5], es_files[:5]))  # 5
batches.append(mk(es_news[5:], es_files[5:]))  # 5

for i, b in enumerate(batches, start=1):
    with open(f"/tmp/final_{i}.json", "w") as fp:
        fp.write(json.dumps({"requests": b}))
print("OK 4 batches, total:", sum(len(b) for b in batches))
PYEOF

python3 /tmp/_prompts3.py
ls -la /tmp/final_*.json

descargar() {
  local etiqueta="$1" nodo="$2" nombre="$3"
  local url
  url=$(mcode-tools get-asset-url "$nodo" 2>/dev/null | sed -n 's/.*"download_url": "\([^"]*\)".*/\1/p')
  if [ -z "$url" ]; then
    echo "  X $etiqueta: sin URL" | tee -a "$LOG"
    return 1
  fi
  curl -sSfL "$url" -o "$DEST/$nombre"
  local tam
  tam=$(stat -f%z "$DEST/$nombre" 2>/dev/null || echo 0)
  if [ "$tam" -lt 1000 ]; then
    echo "  X $etiqueta: archivo muy pequeño ($tam bytes)" | tee -a "$LOG"
    return 1
  fi
  echo "  OK $etiqueta -> $nombre ($tam bytes)" | tee -a "$LOG"
}

procesar() {
  local etiqueta="$1" jsonfile="$2"
  echo "" | tee -a "$LOG"
  echo "=== $etiqueta ===" | tee -a "$LOG"
  local args
  args=$(cat "$jsonfile")
  local respuesta
  respuesta=$(mcode-tools connector call connector__matrix__generate_image --args "$args" 2>&1)
  local ok fail
  ok=$(echo "$respuesta" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("total_success",0))' 2>/dev/null || echo "?")
  fail=$(echo "$respuesta" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("total_failed",0))' 2>/dev/null || echo "?")
  echo "  resultados: $ok ok, $fail fallidos" | tee -a "$LOG"
  echo "$respuesta" | python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
    for it in data.get("success_items", []):
        print(it["node_id"] + "|" + it["file_name"])
except Exception as e:
    print("ERROR", e, file=sys.stderr)
' | while IFS='|' read -r nodo nombre; do
    [ -z "$nodo" ] && continue
    descargar "$etiqueta" "$nodo" "$nombre"
  done
}

procesar "F1 (5 seg faltantes)" /tmp/final_1.json
procesar "F2 (8 tool faltantes)" /tmp/final_2.json
procesar "F3 (5 es-news parte 1)" /tmp/final_3.json
procesar "F4 (5 es-news parte 2)" /tmp/final_4.json

echo "" | tee -a "$LOG"
echo "=== Conteo ===" | tee -a "$LOG"
ls "$DEST" | wc -l | tee -a "$LOG"

# Conversión a WebP
echo "" | tee -a "$LOG"
echo "=== Conversión a WebP ===" | tee -a "$LOG"
python3 - "$DEST" <<'PY'
import sys, os, glob
from PIL import Image
dest = sys.argv[1]
files = sorted([f for f in glob.glob(os.path.join(dest, "*")) if f.lower().endswith((".jpg", ".jpeg", ".png"))])
ok = 0
err = 0
for f in files:
    try:
        out = os.path.splitext(f)[0] + ".webp"
        im = Image.open(f).convert("RGB")
        if im.width > 1600:
            ratio = 1600 / im.width
            im = im.resize((1600, int(im.height * ratio)), Image.LANCZOS)
        im.save(out, "WEBP", quality=82, method=6)
        if os.path.exists(out):
            os.remove(f)
            print(f"  {os.path.basename(f)} -> {os.path.basename(out)} ({os.path.getsize(out)} bytes)")
            ok += 1
    except Exception as e:
        print(f"  X {os.path.basename(f)}: {e}")
        err += 1
print(f"Convertidos: {ok}, errores: {err}")
PY

echo "" | tee -a "$LOG"
echo "=== Resumen final ===" | tee -a "$LOG"
ls -lh "$DEST" | tail -30
echo "" | tee -a "$LOG"
echo "Total: $(ls "$DEST" | wc -l) archivos" | tee -a "$LOG"
