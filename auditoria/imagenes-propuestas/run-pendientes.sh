#!/usr/bin/env bash
# Genera las 24 imágenes pendientes y las convierte a webp.
set +e

DEST="/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/auditoria/imagenes-propuestas/pendientes"
LOG=/tmp/pend.log
> "$LOG"

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
    echo "  X $etiqueta: muy pequeño" | tee -a "$LOG"
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
  echo "$respuesta" > /tmp/_pend_resp.json
  local ok fail
  ok=$(echo "$respuesta" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("total_success",0))' 2>/dev/null || echo "?")
  fail=$(echo "$respuesta" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("total_failed",0))' 2>/dev/null || echo "?")
  echo "  $ok ok, $fail fallidos" | tee -a "$LOG"
  if [ "$ok" = "0" ]; then
    echo "  detalle: $(echo "$respuesta" | head -c 300)" | tee -a "$LOG"
  fi
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

procesar "BATCH 1 (1-8)" /tmp/pend_batch_1.json
procesar "BATCH 2 (9-16)" /tmp/pend_batch_2.json
procesar "BATCH 3 (17-24)" /tmp/pend_batch_3.json

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
for f in files:
    try:
        out = os.path.splitext(f)[0] + ".webp"
        im = Image.open(f).convert("RGB")
        # Para bandas 2560x1440 mantener tamaño; para los demás tope 1600
        if im.width > 2560:
            ratio = 2560 / im.width
            im = im.resize((2560, int(im.height * ratio)), Image.LANCZOS)
        elif im.width > 1600:
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
echo "=== Listado final ===" | tee -a "$LOG"
ls -lh "$DEST" | tail -30
