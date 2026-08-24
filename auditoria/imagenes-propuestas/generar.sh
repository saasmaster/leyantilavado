#!/usr/bin/env bash
# Genera 50 imágenes realistas para leyantilavado.org y las descarga a
# auditoria/imagenes-propuestas/. Después convierte todo a WebP.
set +e

DEST="/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/auditoria/imagenes-propuestas"
mkdir -p "$DEST"

# Estilo realista. Sin "ilustración", con fotografía editorial.
S="photorealistic editorial photography, shot on 35mm film, natural light, soft warm tones, deep navy and petrol teal palette, clean composition, professional, no text, no logos, no watermark, no cartoon, no illustration, 4K, high quality"

cat > /tmp/_prompts.py <<'PYEOF'
import json

S = "photorealistic editorial photography, shot on 35mm film, natural light, soft warm tones, deep navy and petrol teal palette, clean composition, professional, no text, no logos, no watermark, no cartoon, no illustration, 4K, high quality"

specs = [
    # --- BATCH 1: 10 OG cards (16:9) ---
    ("A close-up of a hand holding a printed compliance table on a wooden desk, soft natural window light, deep navy and petrol teal palette, shallow depth of field, editorial photography", "16:9", "og-01-umbrales.jpg"),
    ("A neat stack of official documents on a marfil ivory desk, a pair of reading glasses on top, soft window light from the left, editorial photography, warm tones", "16:9", "og-02-obligaciones.jpg"),
    ("A wooden gavel resting on a polished legal desk next to a stack of papers, soft natural light, deep navy and petrol teal tones, editorial photography", "16:9", "og-03-multas.jpg"),
    ("A few Mexican peso bills and coins on an ivory ceramic plate, soft window light, shallow depth of field, editorial photography, warm tones", "16:9", "og-04-limites-efectivo.jpg"),
    ("A leather-bound desk calendar open to November 2026, with the 30th circled in pen, soft warm light, editorial photography, deep navy and petrol teal", "16:9", "og-05-calendario.jpg"),
    ("An open hardcover legal book on a wooden desk with a coffee cup nearby, soft morning light, editorial photography, warm tones", "16:9", "og-06-reforma-2026.jpg"),
    ("A signed official document on a marfil desk with a stamp, soft natural light, deep navy and petrol teal tones, editorial photography, shallow depth of field", "16:9", "og-07-acuerdo-115.jpg"),
    ("A stack of well-worn dictionaries on a wooden surface, soft warm light, editorial photography, deep navy and petrol teal palette", "16:9", "og-08-glosario.jpg"),
    ("Two ceramic coffee cups facing each other on a small table, soft window light, editorial photography suggesting a conversation or consultation, warm tones", "16:9", "og-09-faq.jpg"),
    ("A diverse group of professionals in a modern co-working space seen from above, blurred, soft natural light, editorial photography, warm tones", "16:9", "og-10-directorio.jpg"),
    # --- BATCH 2: 5 heroes + 10 segments (16:9) ---
    ("An abstract composition of a balance scale with pesos on one side and a vintage calculator on the other, marfil background, soft natural light, editorial photography, deep navy and petrol teal palette", "16:9", "hero-01-portada.jpg"),
    ("A horizontal timeline drawn in chalk on a dark navy blackboard, ascending bars labelled with years 2016 to 2026, soft natural light, editorial photography", "16:9", "hero-02-timeline-uma.jpg"),
    ("A paper flowchart pinned to a corkboard with a single yes-no decision at the top, soft warm light, editorial photography, deep navy and petrol teal", "16:9", "hero-03-decision-tree.jpg"),
    ("Sixteen small ceramic tiles arranged in a 4x4 grid on a marfil background, each with a single hand-drawn icon, soft window light, editorial photography, deep navy and petrol teal", "16:9", "hero-04-actividades-vulnerables.jpg"),
    ("A polished metal shield-shaped object resting on folded documents, soft natural light, editorial photography, deep navy and petrol teal palette", "16:9", "hero-05-cumplimiento.jpg"),
    ("A wooden notary stamp and a brass seal pressed into marfil paper, soft natural light, editorial photography, warm tones", "16:9", "seg-01-notarias.jpg"),
    ("A set of architectural model buildings in a row on a wooden desk, soft window light, editorial photography, deep navy and petrol teal tones", "16:9", "seg-02-inmobiliarias.jpg"),
    ("A single gold ring and a small polished gem on marfil linen, soft natural light, editorial photography, warm tones, shallow depth of field", "16:9", "seg-03-joyerias.jpg"),
    ("A close-up of vintage car keys resting on the hood of a classic car, soft natural light, editorial photography, deep navy and petrol teal palette", "16:9", "seg-04-agencias-autos.jpg"),
    ("A hand holding a small personal item like a watch toward the camera against a soft marfil background, editorial photography, warm tones, shallow depth of field", "16:9", "seg-05-casas-empeno.jpg"),
    ("A physical representation of a blockchain: small wooden blocks connected by string, marfil background, soft natural light, editorial photography", "16:9", "seg-06-cripto.jpg"),
    ("A small framed abstract painting hanging on a marfil wall, soft natural light, editorial photography, warm tones", "16:9", "seg-07-galerias-arte.jpg"),
    ("Two open hands offering a small contribution toward each other, marfil background, soft natural light, editorial photography, warm tones, shallow depth of field", "16:9", "seg-08-donatarias.jpg"),
    ("A miniature construction crane and folded architectural plans on a wooden desk, soft natural light, editorial photography, deep navy and petrol teal", "16:9", "seg-09-constructoras.jpg"),
    ("A single brass key resting on a marfil envelope, soft window light, editorial photography, warm tones, shallow depth of field", "16:9", "seg-10-arrendadores.jpg"),
    # --- BATCH 3: 8 process flows (16:9) ---
    ("Four small wooden cards in a row connected by string, each with a single icon, on a marfil surface, soft natural light, editorial photography, deep navy and petrol teal", "16:9", "flujo-01-identificacion.jpg"),
    ("A horizontal row of five envelopes, the last one sealed and stamped, on a marfil desk, soft window light, editorial photography, warm tones", "16:9", "flujo-02-aviso.jpg"),
    ("Six small ceramic tiles in a row on a marfil background, each marking a month, with small coin marks accumulating, soft natural light, editorial photography", "16:9", "flujo-03-acumulacion-6m.jpg"),
    ("A three-level wooden nesting box set, each smaller box inside the next, on a marfil surface, soft natural light, editorial photography, warm tones", "16:9", "flujo-04-beneficiario.jpg"),
    ("A circular arrangement of twelve small wooden pegs on a marfil surface, one circled in red, soft natural light, editorial photography, deep navy and petrol teal", "16:9", "flujo-05-capacitacion.jpg"),
    ("Five small documents arranged in a circle on a marfil desk, connected by a thin string, soft natural light, editorial photography, deep navy and petrol teal", "16:9", "flujo-06-auditoria.jpg"),
    ("A paper form being filled out with a fountain pen on a marfil desk, soft natural light, editorial photography, warm tones, shallow depth of field", "16:9", "flujo-07-alta-sppld.jpg"),
    ("A leather-bound three-year planner open to March 2029, soft natural light, editorial photography, deep navy and petrol teal palette", "16:9", "flujo-08-dictamen.jpg"),
    # --- BATCH 4: 8 tool illustrations (4:3) ---
    ("A vintage mechanical calculator on a marfil desk, soft natural light, editorial photography, warm tones, deep navy and petrol teal palette", "4:3", "tool-01-calculadora-umbrales.jpg"),
    ("A small wooden abacus on a marfil surface, soft natural light, editorial photography, warm tones, shallow depth of field", "4:3", "tool-02-conversor-uma.jpg"),
    ("A clipboard with a paper form showing four multiple-choice questions, a wooden pencil resting on it, marfil background, soft natural light, editorial photography", "4:3", "tool-03-cuestionario.jpg"),
    ("Six small Mexican peso coins in a row on marfil linen, soft natural light, editorial photography, warm tones, shallow depth of field", "4:3", "tool-04-acumulacion.jpg"),
    ("A small printed ticket or fine notice on a marfil surface with a wooden stamp next to it, soft natural light, editorial photography, warm tones", "4:3", "tool-05-multas.jpg"),
    ("A small desktop calendar showing day 17 circled, on a marfil desk, soft natural light, editorial photography, warm tones, shallow depth of field", "4:3", "tool-06-fecha-limite.jpg"),
    ("Three nested wooden boxes of decreasing size on a marfil surface, soft natural light, editorial photography, warm tones", "4:3", "tool-07-beneficiario.jpg"),
    ("A desktop calendar with the next 30 days visible, a small circle marking day 30, soft natural light, editorial photography, warm tones", "4:3", "tool-08-plan-30-nov.jpg"),
    # --- BATCH 5: 5 backgrounds (16:9) + 4 covers (1:1) ---
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

batches = [specs[i:i+10] for i in range(0, len(specs), 10)]
for idx, batch in enumerate(batches, start=1):
    reqs = [{"prompt": p + ", " + S, "aspect_ratio": r, "resolution": "2K", "output_file": f} for (p, r, f) in batch]
    with open(f"/tmp/batch_{idx}.json", "w") as fp:
        fp.write(json.dumps({"requests": reqs}))
print("OK", len(specs), "specs in", len(batches), "batches")
PYEOF

python3 /tmp/_prompts.py
echo "Batches listos:"
ls -la /tmp/batch_*.json
