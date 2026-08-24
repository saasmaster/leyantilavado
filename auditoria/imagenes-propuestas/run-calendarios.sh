#!/usr/bin/env bash
# Regenera los 8 imágenes de calendario en español.
set +e

DEST="/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/auditoria/imagenes-propuestas"
LOG=/tmp/img-calendarios.log
> "$LOG"

args=$(cat /tmp/calendarios.json)
respuesta=$(mcode-tools connector call connector__matrix__generate_image --args "$args" 2>&1)

ok=$(echo "$respuesta" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("total_success",0))' 2>/dev/null || echo "?")
fail=$(echo "$respuesta" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("total_failed",0))' 2>/dev/null || echo "?")
echo "resultados: $ok ok, $fail fallidos" | tee -a "$LOG"

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
  url=$(mcode-tools get-asset-url "$nodo" 2>/dev/null | sed -n 's/.*"download_url": "\([^"]*\)".*/\1/p')
  if [ -z "$url" ]; then
    echo "  X sin URL" | tee -a "$LOG"
    continue
  fi
  # Las salidas ya tienen nombre .webp, así que las guardamos como .jpg
  # y luego el script Pillow las convierte a webp con el nombre final.
  tmp_jpg="/tmp/_dl_${nodo}.jpg"
  curl -sSfL "$url" -o "$tmp_jpg"
  tam=$(stat -f%z "$tmp_jpg" 2>/dev/null || echo 0)
  if [ "$tam" -lt 1000 ]; then
    echo "  X $nombre: muy pequeño ($tam)" | tee -a "$LOG"
    continue
  fi
  final="${nombre%.webp}.jpg"
  mv "$tmp_jpg" "$DEST/$final"
  echo "  OK -> $final ($tam bytes)" | tee -a "$LOG"
done

# Conversión a WebP
echo "" | tee -a "$LOG"
echo "=== Conversión a WebP ===" | tee -a "$LOG"
python3 - "$DEST" <<'PY'
import sys, os, glob
from PIL import Image
dest = sys.argv[1]
files = sorted([f for f in glob.glob(os.path.join(dest, "*")) if f.lower().endswith((".jpg", ".jpeg", ".png")) and ("es-" in os.path.basename(f) or "calendario" in os.path.basename(f) or "hero-02" in os.path.basename(f) or "og-05" in os.path.basename(f) or "tool-06" in os.path.basename(f) or "tool-08" in os.path.basename(f))])
ok = 0
for f in files:
    try:
        out = os.path.splitext(f)[0] + ".webp"
        if os.path.exists(out):
            os.remove(out)
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
print(f"Convertidos: {ok}")
PY

echo "" | tee -a "$LOG"
echo "=== Estado final ===" | tee -a "$LOG"
ls -lh "$DEST" | grep -E "(es-|og-05|hero-02|tool-06|tool-08)" | tee -a "$LOG"
