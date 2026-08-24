#!/usr/bin/env bash
# Regenera los 8 calendarios de uno en uno, descarga y convierte a webp.
set +e

DEST="/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/auditoria/imagenes-propuestas"
LOG=/tmp/img-cal-uno.log
> "$LOG"

specs=(
  "es-11-calendario-espanol|16:9|A 16:9 photo of a Spanish language wall calendar, marfil tones, soft natural light, photorealistic editorial photography, deep navy and petrol teal palette, professional, no watermark, 4K"
  "tool-06-fecha-limite|4:3|A 4:3 photo of a small Spanish desk calendar with a circled day, marfil tones, soft light, photorealistic editorial photography, deep navy and petrol teal palette, professional, no watermark, 4K"
  "tool-08-plan-30-nov|4:3|A 4:3 photo of a Spanish desk calendar showing the next 30 days, marfil tones, soft light, photorealistic editorial photography, deep navy and petrol teal palette, professional, no watermark, 4K"
  "og-05-calendario|16:9|A 16:9 photo of a Spanish language calendar open to November, marfil tones, soft light, photorealistic editorial photography, deep navy and petrol teal palette, professional, no watermark, 4K"
  "es-12-plazos-importantes|16:9|A 16:9 photo of a chalkboard with Spanish dates written in chalk, navy and teal tones, photorealistic editorial photography, professional, no watermark, 4K"
  "es-13-que-aplica-para-ti|16:9|A 16:9 photo of a hand holding a Spanish printed checklist, marfil tones, soft light, photorealistic editorial photography, deep navy and petrol teal palette, professional, no watermark, 4K"
  "hero-02-timeline-uma|16:9|A 16:9 photo of a blackboard timeline with years 2016 to 2026, navy and teal tones, photorealistic editorial photography, professional, no watermark, 4K"
  "es-09-fecha-limite|16:9|A 16:9 photo of a Spanish desk calendar with a red circled date, marfil tones, soft light, photorealistic editorial photography, deep navy and petrol teal palette, professional, no watermark, 4K"
)

for spec in "${specs[@]}"; do
  IFS='|' read -r fname ratio prompt <<< "$spec"
  echo "" | tee -a "$LOG"
  echo "=== $fname ===" | tee -a "$LOG"
  args=$(python3 -c "import json,sys; print(json.dumps({'requests':[{'prompt':sys.argv[1],'aspect_ratio':sys.argv[2],'resolution':'2K','output_file':sys.argv[3]+'.jpg'}]}))" "$prompt" "$ratio" "$fname")
  respuesta=$(mcode-tools connector call connector__matrix__generate_image --args "$args" 2>&1)
  ok=$(echo "$respuesta" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("total_success",0))' 2>/dev/null || echo "?")
  echo "  ok: $ok" | tee -a "$LOG"
  if [ "$ok" = "0" ]; then
    echo "  detalle: $(echo "$respuesta" | head -c 200)" | tee -a "$LOG"
    sleep 5
    continue
  fi
  nodo=$(echo "$respuesta" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d["success_items"][0]["node_id"])')
  url=$(mcode-tools get-asset-url "$nodo" 2>/dev/null | sed -n 's/.*"download_url": "\([^"]*\)".*/\1/p')
  if [ -z "$url" ]; then
    echo "  X sin URL" | tee -a "$LOG"
    continue
  fi
  tmp="/tmp/_dl_${nodo}.jpg"
  curl -sSfL "$url" -o "$tmp"
  mv "$tmp" "$DEST/${fname}.jpg"
  echo "  OK -> $fname.jpg ($(stat -f%z "$DEST/${fname}.jpg") bytes)" | tee -a "$LOG"
  sleep 3
done

# Conversión a WebP
echo "" | tee -a "$LOG"
echo "=== Conversión a WebP ===" | tee -a "$LOG"
python3 - "$DEST" <<'PY'
import sys, os, glob
from PIL import Image
dest = sys.argv[1]
files = sorted([f for f in glob.glob(os.path.join(dest, "*")) if f.lower().endswith((".jpg", ".png")) and (
    "es-1" in os.path.basename(f) or
    "calendario" in os.path.basename(f) or
    "hero-02" in os.path.basename(f) or
    "og-05" in os.path.basename(f) or
    "tool-06" in os.path.basename(f) or
    "tool-08" in os.path.basename(f)
)])
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
ls -lh "$DEST" | grep -E "(es-1[1-3]|og-05|hero-02|tool-06|tool-08|es-09)" | tee -a "$LOG"
