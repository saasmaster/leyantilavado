#!/usr/bin/env bash
# Re-genera los 34 que faltan (10 illus og + 15 hero+seg + 1 flujo-06 + 8 tool).
# Convierte a WebP al final.
set +e

DEST="/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/auditoria/imagenes-propuestas"
LOG=/tmp/img-retry.log
> "$LOG"

descargar() {
  local etiqueta="$1" nodo="$2" nombre="$3"
  local url
  url=$(mcode-tools get-asset-url "$nodo" 2>/dev/null | sed -n 's/.*"download_url": "\([^"]*\)".*/\1/p')
  if [ -z "$url" ]; then
    echo "  X $etiqueta: sin URL para nodo $nodo" | tee -a "$LOG"
    return 1
  fi
  curl -sSfL "$url" -o "$DEST/$nombre"
  local tam
  tam=$(stat -f%z "$DEST/$nombre" 2>/dev/null || echo 0)
  if [ "$tam" -lt 1000 ]; then
    echo "  X $etiqueta: archivo muy pequeño ($tam bytes) -> $nombre" | tee -a "$LOG"
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
  # Guardar respuesta cruda para diagnóstico
  echo "$respuesta" > /tmp/_last_resp.json
  local ok fail
  ok=$(echo "$respuesta" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("total_success",0))' 2>/dev/null || echo "?")
  fail=$(echo "$respuesta" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("total_failed",0))' 2>/dev/null || echo "?")
  echo "  resultados: $ok ok, $fail fallidos" | tee -a "$LOG"
  echo "$respuesta" | python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
    for it in data.get("success_items", []):
        nid = it["node_id"]
        fnm = it["file_name"]
        print(nid + "|" + fnm)
except Exception as e:
    print("ERROR", e, file=sys.stderr)
' | while IFS='|' read -r nodo nombre; do
    [ -z "$nodo" ] && continue
    descargar "$etiqueta" "$nodo" "$nombre"
  done
}

procesar "R1 (10 illus og)" /tmp/regen_1.json
procesar "R2 (5 hero+seg parte 1)" /tmp/regen_2.json
procesar "R3 (5 hero+seg parte 2)" /tmp/regen_3.json
procesar "R4 (5 hero+seg parte 3)" /tmp/regen_4.json
procesar "R5 (1 flujo-06)" /tmp/regen_5.json
procesar "R6 (8 tools)" /tmp/regen_6.json

echo "" | tee -a "$LOG"
echo "=== Conteo post-descarga ===" | tee -a "$LOG"
ls "$DEST" | wc -l | tee -a "$LOG"

# Conversión a WebP
echo "" | tee -a "$LOG"
echo "=== Conversión a WebP (Pillow) ===" | tee -a "$LOG"
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
            tam_nuevo = os.path.getsize(out)
            print(f"  {os.path.basename(f)} -> {os.path.basename(out)} ({tam_nuevo} bytes)")
            ok += 1
    except Exception as e:
        print(f"  X {os.path.basename(f)}: {e}")
        err += 1
print(f"Convertidos: {ok}, errores: {err}")
PY

echo "" | tee -a "$LOG"
echo "=== Resumen final ===" | tee -a "$LOG"
ls -lh "$DEST" | tee -a "$LOG"
echo "" | tee -a "$LOG"
echo "Total: $(ls "$DEST" | wc -l) archivos" | tee -a "$LOG"
