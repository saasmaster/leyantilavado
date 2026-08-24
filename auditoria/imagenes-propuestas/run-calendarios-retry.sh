#!/usr/bin/env bash
# Reintenta los 8 calendarios en español en 4 mini-batches de 2.
set +e

DEST="/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/auditoria/imagenes-propuestas"
LOG=/tmp/img-calendarios2.log
> "$LOG"

python3 - <<'PY' > /tmp/_cal_split.py
import json
with open("/tmp/calendarios.json") as f:
    data = json.load(f)
reqs = data["requests"]
# Split en 4 batches de 2
for i in range(0, 8, 2):
    with open(f"/tmp/cal_{i//2+1}.json", "w") as fp:
        fp.write(json.dumps({"requests": reqs[i:i+2]}))
print("Split OK")
PY
python3 /tmp/_cal_split.py
ls -la /tmp/cal_*.json

descargar() {
  local etiqueta="$1" nodo="$2" nombre="$3"
  local url
  url=$(mcode-tools get-asset-url "$nodo" 2>/dev/null | sed -n 's/.*"download_url": "\([^"]*\)".*/\1/p')
  if [ -z "$url" ]; then
    echo "  X $etiqueta: sin URL" | tee -a "$LOG"
    return 1
  fi
  local tmp="/tmp/_dl_${nodo}.jpg"
  curl -sSfL "$url" -o "$tmp"
  local tam
  tam=$(stat -f%z "$tmp" 2>/dev/null || echo 0)
  if [ "$tam" -lt 1000 ]; then
    echo "  X $etiqueta: muy pequeño" | tee -a "$LOG"
    return 1
  fi
  local final="${nombre%.webp}.jpg"
  mv "$tmp" "$DEST/$final"
  echo "  OK -> $final ($tam bytes)" | tee -a "$LOG"
}

procesar() {
  local etiqueta="$1" jsonfile="$2"
  echo "" | tee -a "$LOG"
  echo "=== $etiqueta ===" | tee -a "$LOG"
  local args
  args=$(cat "$jsonfile")
  local respuesta
  respuesta=$(mcode-tools connector call connector__matrix__generate_image --args "$args" 2>&1)
  echo "$respuesta" > "/tmp/_resp_${etiqueta// /_}.json"
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

procesar "CAL1" /tmp/cal_1.json
procesar "CAL2" /tmp/cal_2.json
procesar "CAL3" /tmp/cal_3.json
procesar "CAL4" /tmp/cal_4.json

# Conversión a WebP (solo los nuevos .jpg que matchean calendario/es-)
echo "" | tee -a "$LOG"
echo "=== Conversión a WebP ===" | tee -a "$LOG"
python3 - "$DEST" <<'PY'
import sys, os, glob
from PIL import Image
dest = sys.argv[1]
# Solo los nuevos: es-11, es-12, es-13
files = sorted([f for f in glob.glob(os.path.join(dest, "es-1[1-3]*.jpg"))])
ok = 0
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
print(f"Convertidos: {ok}")
PY

echo "" | tee -a "$LOG"
echo "=== Listado final ===" | tee -a "$LOG"
ls -lh "$DEST" | grep -E "(es-1[1-3]|calendario)" | tee -a "$LOG
