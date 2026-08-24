"""
Genera las 24 imágenes pendientes según PENDIENTES.md.
Restricciones absolutas:
  - Sin texto legible (ni cifras, ni fechas, ni sellos, ni membretes).
  - Sin logos de autoridades (SAT, UIF, SHCP).
  - Sin marcas de casino, navieras, software, etc.
  - Estilo fotográfico realista, marfil/petroleo/marino.
"""
import json
import os

DEST = "/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/auditoria/imagenes-propuestas/pendientes"
os.makedirs(DEST, exist_ok=True)

# Estilo común
S = "photorealistic editorial photography, shot on 35mm film, natural light, soft warm tones, deep navy and petrol teal palette, Mexican editorial aesthetic, no visible text no numbers no dates no logos no watermarks no signs no lettering no readable documents no stamps no seals, central subject with air above and below for cropping, professional, 4K"

specs = []

# ───────────────────────────────────────────────────────────────────
# SECCIÓN 1 — 8 oficios sin foto (16:9, 1800x1000, motivo centrado)
# ───────────────────────────────────────────────────────────────────
specs += [
    ("A Mexican notarial protocol book bound in dark green leather with a red silk ribbon bookmark, lying closed on a wooden desk, warm natural light from the left, shallow depth of field, no readable text on the cover, no visible seals, no lettering",
     "16:9", "oficio-notarias-protocolo.jpg"),
    ("A Mexican mercantile póliza, folded and tied with cotton string, lying next to a fountain pen and a small leather blotter, on a wooden desk, soft natural light, no visible text on the document, no visible letterhead",
     "16:9", "oficio-corredores-poliza.jpg"),
    ("A clean accountant desk with a vintage mechanical calculator, a stack of three ring binders in muted colors, and a ceramic coffee cup, soft natural light from a window, no logos on the binders, no software boxes, no visible labels",
     "16:9", "oficio-contadores-escritorio.jpg"),
    ("A tall wooden bookshelf filled with leather-bound legal code books in burgundy and dark green, side light from a window casting long shadows, the spines have no readable titles, no visible lettering, the books look old and well used",
     "16:9", "oficio-abogados-librero.jpg"),
    ("Cardboard shipping boxes sealed with clear packing tape, one with a red rubber stamp mark, on a wooden pallet in a bright warehouse, soft natural light, no shipping company names, no readable labels, no barcodes",
     "16:9", "oficio-agentes-aduanales-cajas.jpg"),
    ("A cross section sample of laminated security glass with multiple layers, resting on a workshop bench, a metal ruler beside it for scale, soft industrial light, no text, no visible labels, professional industrial photography",
     "16:9", "oficio-blindadoras-vidrio.jpg"),
    ("A heavy silver metal briefcase with a combination padlock, closed, sitting on a dark wooden table, soft natural light, no visible logos, no readable numbers on the lock dial, professional editorial photography",
     "16:9", "oficio-traslado-valores-maletin.jpg"),
    ("A stack of plain cream-colored casino chips and a small leather dice cup on green felt, warm warm light, no casino brand names, no text on the chips, no markings, just the textured surface of the chips and the wood of the cup",
     "16:9", "oficio-casinos-fichas.jpg"),
]

# ───────────────────────────────────────────────────────────────────
# SECCIÓN 2 — 10 imágenes sociales (16:9, 1200x630 ≈ 1.9:1)
# Las más próximas son 16:9; el sitio recorta a 21:9, el motivo central.
# ───────────────────────────────────────────────────────────────────
specs += [
    ("An abstract macro photograph of the edge of a legal compliance table on heavy paper, soft focus, deep navy and petrol teal palette, no readable text, no numbers, no labels, professional editorial background",
     "16:9", "social-umbrales.jpg"),
    ("A close-up of an accordion file folder open on a wooden desk with neat paper dividers, soft natural light, no visible labels, no readable text, no stickers",
     "16:9", "social-obligaciones.jpg"),
    ("A clean abstract background photograph of a polished wooden surface with soft natural light and shadows, deep navy and petrol teal palette, no text, no objects, no readable markings",
     "16:9", "social-multas.jpg"),
    ("A macro photograph of Mexican peso coins and small banknotes scattered on a marfil linen surface, soft natural light, shallow depth of field, no readable numbers on the bills, no readable text",
     "16:9", "social-limites-efectivo.jpg"),
    ("A close-up of a leather-bound desk calendar with a leather strap, soft natural light, the dates are not visible, the page is blank, no month name visible, no numbers visible, just the texture of the leather and the paper",
     "16:9", "social-calendario.jpg"),
    ("Two open hardcover law books side by side on a wooden desk, soft natural light, no readable text on the pages, no visible titles on the spines, just the typography texture without any legible letters",
     "16:9", "social-reforma.jpg"),
    ("A clean desk with a fountain pen and a blank sheet of marfil paper, soft natural light, no text on the paper, no readable markings, professional editorial background",
     "16:9", "social-faq.jpg"),
    ("A close-up of a stack of hardcover dictionaries with a magnifying glass on top, on a wooden surface, soft natural light, no readable text on the books, no visible titles, no readable words",
     "16:9", "social-glosario.jpg"),
    ("An abstract photograph of three ceramic coffee cups on a round wooden table, soft natural light, no text, no readable markings, warm editorial aesthetic",
     "16:9", "social-directorio.jpg"),
    ("A clean abstract background of a marfil linen surface with a vintage brass ruler, soft natural light, no text, no readable numbers, no markings, professional editorial background",
     "16:9", "social-herramientas.jpg"),
]

# ───────────────────────────────────────────────────────────────────
# SECCIÓN 3 — 3 bandas a sangre (16:9, 2560x1440)
# Mitad izquierda tranquila (sin motivo) para superponer texto.
# ───────────────────────────────────────────────────────────────────
specs += [
    ("A wide horizontal photograph of an open leather agenda on a wooden desk, the right half of the frame has the agenda with soft natural light, the left half of the frame is mostly clean marfil linen surface with very soft light, no readable text on the pages, no numbers, no dates, just the texture",
     "16:9", "banda-calendario.jpg"),
    ("A wide horizontal photograph of two thick law books on a wooden desk, one open and one closed, the left half of the frame is mostly clean marfil wooden surface with very soft light, no readable text, no visible titles, no numbers",
     "16:9", "banda-reforma.jpg"),
    ("A wide horizontal photograph of an accordion file folder with multiple paper dividers, the left half of the frame is mostly clean wooden surface with very soft light, the right half has the file, no visible labels, no readable text, no markings",
     "16:9", "banda-obligaciones.jpg"),
]

# ───────────────────────────────────────────────────────────────────
# SECCIÓN 4 — 3 reemplazos herramientas (4:3, 1600x1200)
# ───────────────────────────────────────────────────────────────────
specs += [
    ("A blank paper form on a wooden clipboard with a wooden pencil resting on it, soft natural light, the form has empty boxes and lines but no readable text, no question text, no titles, just the abstract structure of a form",
     "4:3", "tool-cuestionario.jpg"),
    ("A small brass balance scale next to a few Mexican peso coins on a marfil linen surface, soft natural light, no readable numbers, no text, no readable markings, professional editorial photography",
     "4:3", "tool-calculadora-multas.jpg"),
    ("A small desktop calendar with a blank page, no month name visible, no numbers visible, no dates, just the texture of the paper and the stand, soft natural light, professional editorial",
     "4:3", "tool-plan-30-nov.jpg"),
]

# Construir las requests
reqs = [{"prompt": p + ", " + S, "aspect_ratio": r, "resolution": "2K", "output_file": os.path.join(DEST, f)} for (p, r, f) in specs]

# Guardar en 3 batches de 8
for i in range(0, len(reqs), 8):
    batch = reqs[i:i+8]
    out_path = f"/tmp/pend_batch_{i//8 + 1}.json"
    with open(out_path, "w") as fp:
        fp.write(json.dumps({"requests": batch}))
    print(f"  batch {i//8 + 1}: {len(batch)} items -> {out_path}")

print(f"\nTotal: {len(reqs)} imágenes en {len(reqs)//8 + (1 if len(reqs)%8 else 0)} batches")
