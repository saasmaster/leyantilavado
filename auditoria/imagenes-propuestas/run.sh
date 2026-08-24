#!/usr/bin/env bash
# Re-genera los 10 og-* illustration perdidos + los 40 realistas restantes
# (seg/flujo/tool/bg/cover). Convierte todo a WebP al final.
set +e

DEST="/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/auditoria/imagenes-propuestas"
LOG=/tmp/img-generate2.log
> "$LOG"

# Estilo ilustración (para recuperar los 10 og-* perdidos)
S_ILLU="editorial illustration for a Mexican legal compliance website, soft ivory background, deep navy and petrol teal accents, minimalist line art with subtle texture, professional corporate aesthetic, no text, no logos, no stock photos, no people in stock pose, 4K quality"

# Estilo realista (para los 40 restantes)
S_REAL="photorealistic editorial photography, shot on 35mm film, natural light, soft warm tones, deep navy and petrol teal palette, clean composition, professional, no text, no logos, no watermark, no cartoon, no illustration, 4K, high quality"

cat > /tmp/_prompts2.py <<'PYEOF'
import json

S_ILLU = "editorial illustration for a Mexican legal compliance website, soft ivory background, deep navy and petrol teal accents, minimalist line art with subtle texture, professional corporate aesthetic, no text, no logos, no stock photos, no people in stock pose, 4K quality"
S_REAL = "photorealistic editorial photography, shot on 35mm film, natural light, soft warm tones, deep navy and petrol teal palette, clean composition, professional, no text, no logos, no watermark, no cartoon, no illustration, 4K, high quality"

# 10 og-* illustration (recuperación)
illus_og = [
    "A 16:9 social card illustration, abstract table of numbers in cool teal and deep navy tones, soft ivory background, rows of stylised UMA thresholds like 325 645 805 1285, professional editorial style",
    "A 16:9 social card illustration, abstract checklist of obligations represented by clean line icons (identification file, calendar, audit, training), deep navy and petrol teal, ivory background",
    "A 16:9 social card illustration, a minimalist wooden gavel above scattered pesos, deep navy and petrol teal palette, ivory background, editorial style",
    "A 16:9 social card illustration, stacks of Mexican peso bills in a restrained palette of deep navy and petrol teal, ivory background, abstract and editorial, not photorealistic",
    "A 16:9 social card illustration, an abstract calendar grid with circled dates 30 Nov 2026, 1 Mar 2027 and 17 of each month, deep navy and petrol teal, ivory background",
    "A 16:9 social card illustration, an open law book with abstract reform arrows from 2025 to 2026 in deep navy and petrol teal, ivory background, editorial",
    "A 16:9 social card illustration, an official government document on a desk seen from above, deep navy and petrol teal accents, ivory background, editorial",
    "A 16:9 social card illustration, a stack of dictionary pages with letter tiles A B C, deep navy and petrol teal, ivory background, editorial",
    "A 16:9 social card illustration, three speech bubbles with question marks, deep navy and petrol teal, ivory background, editorial",
    "A 16:9 social card illustration, an abstract community of circles forming a network, deep navy and petrol teal, ivory background, editorial",
]
illus_files = [
    "og-01-umbrales.jpg","og-02-obligaciones.jpg","og-03-multas.jpg","og-04-limites-efectivo.jpg",
    "og-05-calendario.jpg","og-06-reforma-2026.jpg","og-07-acuerdo-115.jpg","og-08-glosario.jpg",
    "og-09-faq.jpg","og-10-directorio.jpg",
]

# 15 realistas (heroes + 10 segmentos)
real_15 = [
    "An abstract composition of a balance scale with pesos on one side and a vintage calculator on the other, marfil background, soft natural light, editorial photography, deep navy and petrol teal palette",
    "A horizontal timeline drawn in chalk on a dark navy blackboard, ascending bars labelled with years 2016 to 2026, soft natural light, editorial photography",
    "A paper flowchart pinned to a corkboard with a single yes-no decision at the top, soft warm light, editorial photography, deep navy and petrol teal",
    "Sixteen small ceramic tiles arranged in a 4x4 grid on a marfil background, each with a single hand-drawn icon, soft window light, editorial photography, deep navy and petrol teal",
    "A polished metal shield-shaped object resting on folded documents, soft natural light, editorial photography, deep navy and petrol teal palette",
    "A wooden notary stamp and a brass seal pressed into marfil paper, soft natural light, editorial photography, warm tones",
    "A set of architectural model buildings in a row on a wooden desk, soft window light, editorial photography, deep navy and petrol teal tones",
    "A single gold ring and a small polished gem on marfil linen, soft natural light, editorial photography, warm tones, shallow depth of field",
    "A close-up of vintage car keys resting on the hood of a classic car, soft natural light, editorial photography, deep navy and petrol teal palette",
    "A hand holding a small personal item like a watch toward the camera against a soft marfil background, editorial photography, warm tones, shallow depth of field",
    "A physical representation of a blockchain: small wooden blocks connected by string, marfil background, soft natural light, editorial photography",
    "A small framed abstract painting hanging on a marfil wall, soft natural light, editorial photography, warm tones",
    "Two open hands offering a small contribution toward each other, marfil background, soft natural light, editorial photography, warm tones, shallow depth of field",
    "A miniature construction crane and folded architectural plans on a wooden desk, soft natural light, editorial photography, deep navy and petrol teal",
    "A single brass key resting on a marfil envelope, soft window light, editorial photography, warm tones, shallow depth of field",
]
real_15_files = [
    "hero-01-portada.jpg","hero-02-timeline-uma.jpg","hero-03-decision-tree.jpg",
    "hero-04-actividades-vulnerables.jpg","hero-05-cumplimiento.jpg",
    "seg-01-notarias.jpg","seg-02-inmobiliarias.jpg","seg-03-joyerias.jpg",
    "seg-04-agencias-autos.jpg","seg-05-casas-empeno.jpg","seg-06-cripto.jpg",
    "seg-07-galerias-arte.jpg","seg-08-donatarias.jpg","seg-09-constructoras.jpg",
    "seg-10-arrendadores.jpg",
]

# 8 procesos realistas
real_proc = [
    "Four small wooden cards in a row connected by string, each with a single icon, on a marfil surface, soft natural light, editorial photography, deep navy and petrol teal",
    "A horizontal row of five envelopes, the last one sealed and stamped, on a marfil desk, soft window light, editorial photography, warm tones",
    "Six small ceramic tiles in a row on a marfil background, each marking a month, with small coin marks accumulating, soft natural light, editorial photography",
    "A three-level wooden nesting box set, each smaller box inside the next, on a marfil surface, soft natural light, editorial photography, warm tones",
    "A circular arrangement of twelve small wooden pegs on a marfil surface, one circled in red, soft natural light, editorial photography, deep navy and petrol teal",
    "Five small documents arranged in a circle on a marfil desk, connected by a thin string, soft natural light, editorial photography, deep navy and petrol teal",
    "A paper form being filled out with a fountain pen on a marfil desk, soft natural light, editorial photography, warm tones, shallow depth of field",
    "A leather-bound three-year planner open to March 2029, soft natural light, editorial photography, deep navy and petrol teal palette",
]
real_proc_files = [
    "flujo-01-identificacion.jpg","flujo-02-aviso.jpg","flujo-03-acumulacion-6m.jpg",
    "flujo-04-beneficiario.jpg","flujo-05-capacitacion.jpg","flujo-06-auditoria.jpg",
    "flujo-07-alta-sppld.jpg","flujo-08-dictamen.jpg",
]

# 8 herramientas realistas
real_tool = [
    "A vintage mechanical calculator on a marfil desk, soft natural light, editorial photography, warm tones, deep navy and petrol teal palette",
    "A small wooden abacus on a marfil surface, soft natural light, editorial photography, warm tones, shallow depth of field",
    "A clipboard with a paper form showing four multiple-choice questions, a wooden pencil resting on it, marfil background, soft natural light, editorial photography",
    "Six small Mexican peso coins in a row on marfil linen, soft natural light, editorial photography, warm tones, shallow depth of field",
    "A small printed ticket or fine notice on a marfil surface with a wooden stamp next to it, soft natural light, editorial photography, warm tones",
    "A small desktop calendar showing day 17 circled, on a marfil desk, soft natural light, editorial photography, warm tones, shallow depth of field",
    "Three nested wooden boxes of decreasing size on a marfil surface, soft natural light, editorial photography, warm tones",
    "A desktop calendar with the next 30 days visible, a small circle marking day 30, soft natural light, editorial photography, warm tones",
]
real_tool_files = [
    "tool-01-calculadora-umbrales.jpg","tool-02-conversor-uma.jpg","tool-03-cuestionario.jpg",
    "tool-04-acumulacion.jpg","tool-05-multas.jpg","tool-06-fecha-limite.jpg",
    "tool-07-beneficiario.jpg","tool-08-plan-30-nov.jpg",
]

# 5 fondos + 4 covers realistas
real_bg = [
    ("An abstract photograph of light refracting through deep teal water, soft natural light, no objects, suitable as a website hero background, editorial photography", "16:9", "bg-01-petroleo-gradient.jpg"),
    ("A close-up of marfil linen paper texture with soft creases, natural light, editorial photography, warm tones", "16:9", "bg-02-paper-texture.jpg"),
    ("A top-down view of a marfil grid paper with thin lines, soft natural light, editorial photography, warm tones", "16:9", "bg-03-grid-cumplimiento.jpg"),
    ("An abstract photograph of fine ivory fabric with subtle petrol teal particles, soft natural light, editorial photography", "16:9", "bg-04-noise-ivory.jpg"),
    ("An abstract night-time photograph of distant city lights forming lines on a dark navy background, soft natural light, editorial photography", "16:9", "bg-05-data-flow.jpg"),
    ("A vintage brass typewriter seen from above on a marfil desk, soft natural light, editorial photography, warm tones, deep navy and petrol teal palette", "1:1", "cover-01-llms-txt.jpg"),
    ("A small group of ceramic coffee cups on a round wooden table seen from above, soft natural light, editorial photography, warm tones", "1:1", "cover-02-directorio.jpg"),
    ("A stack of three sealed official documents on a marfil desk, soft natural light, editorial photography, deep navy and petrol teal palette", "1:1", "cover-03-fuentes-oficiales.jpg"),
    ("A brass magnifying glass resting on a printed checklist, marfil surface, soft natural light, editorial photography, warm tones, shallow depth of field", "1:1", "cover-04-metodologia.jpg"),
]

# Empaquetar en 5 batches: A (10 illus og), B (15 hero+seg), C (8 proc), D (8 tool), E (9 bg+cover)
def mk(prompts, files, style, ratios=None):
    if ratios is None:
        ratios = ["16:9"] * len(prompts)
    return [{"prompt": p + ", " + style, "aspect_ratio": r, "resolution": "2K", "output_file": f} for p, r, f in zip(prompts, ratios, files)]

batches = []

# A: 10 illus og
batches.append(mk(illus_og, illus_files, S_ILLU))

# B: 15 hero+seg realistas (16:9)
batches.append(mk(real_15, real_15_files, S_REAL))

# C: 8 procesos (16:9)
batches.append(mk(real_proc, real_proc_files, S_REAL))

# D: 8 tools (4:3)
batches.append(mk(real_tool, real_tool_files, S_REAL, ["4:3"]*8))

# E: 9 bg+cover
batches.append(mk([p for p,_,_ in real_bg], [f for _,_,f in real_bg], S_REAL, [r for _,r,_ in real_bg]))

for i, b in enumerate(batches, start=1):
    with open(f"/tmp/batchA_{i}.json", "w") as fp:
        fp.write(json.dumps({"requests": b}))
print("OK 5 batches listos en /tmp/batchA_*.json")
PYEOF

python3 /tmp/_prompts2.py
ls -la /tmp/batchA_*.json

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

procesar "BATCH A1 (10 og ilustración)" /tmp/batchA_1.json
procesar "BATCH A2 (15 hero+seg)" /tmp/batchA_2.json
procesar "BATCH A3 (8 flujos)" /tmp/batchA_3.json
procesar "BATCH A4 (8 tools)" /tmp/batchA_4.json
procesar "BATCH A5 (9 bg+cover)" /tmp/batchA_5.json

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
