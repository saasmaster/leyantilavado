#!/usr/bin/env bash
# Genera 5 sociales hubs + 3 diagramas y los convierte a webp.
set +e

BASE="/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/auditoria/imagenes-propuestas"
HUBS="$BASE/hubs"
DIAGRAMAS="$BASE/diagramas"
LOG=/tmp/hubs-diag.log
> "$LOG"

descargar() {
  local etiqueta="$1" nodo="$2" dest_dir="$3" nombre="$4"
  local url
  url=$(mcode-tools get-asset-url "$nodo" 2>/dev/null | sed -n 's/.*"download_url": "\([^"]*\)".*/\1/p')
  if [ -z "$url" ]; then
    echo "  X $etiqueta: sin URL" | tee -a "$LOG"
    return 1
  fi
  curl -sSfL "$url" -o "$dest_dir/$nombre"
  local tam
  tam=$(stat -f%z "$dest_dir/$nombre" 2>/dev/null || echo 0)
  if [ "$tam" -lt 1000 ]; then
    echo "  X $etiqueta: muy pequeño" | tee -a "$LOG"
    return 1
  fi
  echo "  OK $etiqueta -> $nombre ($tam bytes)" | tee -a "$LOG"
}

procesar() {
  local etiqueta="$1" jsonfile="$2" dest_dir="$3"
  echo "" | tee -a "$LOG"
  echo "=== $etiqueta ===" | tee -a "$LOG"
  local args
  args=$(cat "$jsonfile")
  local respuesta
  respuesta=$(mcode-tools connector call connector__matrix__generate_image --args "$args" 2>&1)
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
    descargar "$etiqueta" "$nodo" "$dest_dir" "$nombre"
  done
}

procesar "5 SOCIALES HUBS" /tmp/hubs_sociales.json "$HUBS"
sleep 3
procesar "3 DIAGRAMAS" /tmp/hubs_diagramas.json "$DIAGRAMAS"

echo "" | tee -a "$LOG"
echo "=== Conteo ===" | tee -a "$LOG"
ls "$HUBS" | wc -l | tee -a "$LOG"
ls "$DIAGRAMAS" | wc -l | tee -a "$LOG"

# Conversión a WebP
echo "" | tee -a "$LOG"
echo "=== Conversión a WebP ===" | tee -a "$LOG"
python3 - "$HUBS" "$DIAGRAMAS" <<'PY'
import sys, os, glob
from PIL import Image
for dest in sys.argv[1:]:
    files = sorted([f for f in glob.glob(os.path.join(dest, "*")) if f.lower().endswith((".jpg", ".jpeg", ".png"))])
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
    print(f"  {os.path.basename(dest)}: {ok} convertidos")
PY

echo "" | tee -a "$LOG"
echo "=== Listado final ===" | tee -a "$LOG"
ls -lh "$HUBS" | tee -a "$LOG"
ls -lh "$DIAGRAMAS" | tee -a "$LOG"
