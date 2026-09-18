"""
Genera 5 social images (1200x630) para los 5 hubs principales
+ 3 diagramas originales en español con texto integrado.

Constraints del PENDIENTES.md:
- Sociales: SIN texto (el sitio lo sobrepone en build).
- Diagramas: ESOS sí llevan texto en español (es parte del diagrama).
"""
import json
import os

BASE = "/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/auditoria/imagenes-propuestas"
HUBS = f"{BASE}/hubs"
DIAGRAMAS = f"{BASE}/diagramas"
os.makedirs(HUBS, exist_ok=True)
os.makedirs(DIAGRAMAS, exist_ok=True)

# ───────────────────────────────────────────────────────────────────
# Estilos
# ───────────────────────────────────────────────────────────────────
S_PHOTO = "photorealistic editorial photography, shot on 35mm film, natural light, soft warm tones, deep navy and petrol teal palette, Mexican editorial aesthetic, no visible text no numbers no dates no logos no watermarks no signs no lettering no readable documents no stamps no seals, professional, 4K"

# Estilo diagrama — limpio, esquemático, con tipografía intención
S_DIAG = "clean flat technical diagram on ivory white background, vector illustration style, sans-serif typography in Spanish, deep navy and petrol teal accents, professional editorial design, information graphic, minimal, clear, legible labels in Spanish, high contrast, 4K"

# ───────────────────────────────────────────────────────────────────
# 5 sociales para los 5 hubs principales
# ───────────────────────────────────────────────────────────────────
sociales = [
    ("A close-up macro of a printed compliance table on heavy paper with shallow depth of field, deep navy and petrol teal palette, soft natural light, completely out of focus so no readable text, no numbers, no markings, professional editorial background",
     "16:9", "hubs-umbrales.jpg", "umbrales"),
    ("A close-up of an accordion file folder open on a wooden desk with neat paper dividers, soft natural light, no visible labels, no readable text, no stickers, just the texture of the dividers",
     "16:9", "hubs-obligaciones.jpg", "obligaciones"),
    ("A clean abstract background photograph of a polished wooden surface with soft natural light and shadows, deep navy and petrol teal palette, no text, no objects, no readable markings",
     "16:9", "hubs-multas.jpg", "multas"),
    ("A macro photograph of Mexican peso coins and small banknotes scattered on a marfil linen surface, soft natural light, shallow depth of field, no readable numbers on the bills, no readable text",
     "16:9", "hubs-limites-efectivo.jpg", "limites-efectivo"),
    ("A close-up of a leather-bound desk calendar with a leather strap, soft natural light, the dates are not visible, the page is blank, no month name visible, no numbers visible, just the texture of the leather and the paper",
     "16:9", "hubs-calendario.jpg", "calendario-cumplimiento"),
]

# ───────────────────────────────────────────────────────────────────
# 3 diagramas originales (texto intencional en español)
# ───────────────────────────────────────────────────────────────────
diagramas = [
    # 1) Acumulación 6 meses
    (
        "Diagrama técnico plano sobre fondo marfil claro. Título en la parte superior: ACUMULACIÓN SEIS MESES. Debajo una línea horizontal dividida en seis segmentos iguales etiquetados MES 1, MES 2, MES 3, MES 4, MES 5, MES 6. Sobre los segmentos, pequeñas marcas de peso acumulándose. En la parte inferior una línea horizontal con la etiqueta UMBRAL DE AVISO y una flecha que indica que al sumar las operaciones del mismo cliente en seis meses se cruza el umbral. Texto pequeño al pie: 'Misma persona, mismo acto u operación'. Acentos en azul marino profundo y verde petrol. Sin otras imágenes, sin marcas, sin logos. Ilustración vectorial limpia, tipografía sans-serif legible en español.",
        "16:9", "diagrama-acumulacion-6-meses.jpg",
        "Diagrama de acumulación de seis meses: una línea horizontal dividida en seis meses muestra cómo las operaciones del mismo cliente se suman y eventualmente cruzan el umbral de aviso del artículo 17 de la LFPIORPI."
    ),
    # 2) Identificación vs Aviso
    (
        "Diagrama técnico plano sobre fondo marfil claro. Título superior: IDENTIFICACIÓN FRENTE A AVISO. Dos columnas paralelas. Columna izquierda titulada IDENTIFICAR AL CLIENTE con una descripción: desde el umbral más bajo; integrar expediente; conservar diez años. Columna derecha titulada PRESENTAR AVISO con: además de identificar, reportar la operación al SAT dentro de los plazos. Una flecha horizontal en la parte inferior va de la columna izquierda a la derecha con la leyenda 'el segundo exige el primero'. Acentos azul marino profundo y verde petrol. Sin otras imágenes, sin marcas. Ilustración vectorial limpia, tipografía sans-serif legible en español.",
        "16:9", "diagrama-identificacion-vs-aviso.jpg",
        "Diagrama comparativo entre identificación y aviso: dos columnas explican que el umbral de identificación siempre es igual o más bajo que el de aviso, y que el aviso exige además haber identificado al cliente."
    ),
    # 3) Identificación vs Límite de efectivo (árbol de decisión)
    (
        "Diagrama técnico plano sobre fondo marfil claro. Título superior: IDENTIFICACIÓN FRENTE A LÍMITE DE EFECTIVO. Árbol de decisión que parte de una caja superior con la pregunta ¿Cobra o paga en efectivo?. Rama izquierda a una caja con la leyenda IDENTIFICAR AL CLIENTE si el acto es actividad vulnerable, con una sub-rama con la palabra 'artículo 17'. Rama derecha a una caja con la leyenda RESPETAR EL LÍMITE DE EFECTIVO si el pago es en dinero, con una sub-rama con la palabra 'artículo 32'. Una caja final inferior reúne ambas con la nota 'son obligaciones independientes: cumplir una no exime de la otra'. Acentos azul marino profundo y verde petrol. Ilustración vectorial limpia, tipografía sans-serif legible en español.",
        "16:9", "diagrama-identificacion-vs-limite-efectivo.jpg",
        "Diagrama de decisión que distingue las obligaciones de identificación del artículo 17 (actividades vulnerables) de las prohibiciones al pago en efectivo del artículo 32 de la LFPIORPI: son independientes."
    ),
]

# ───────────────────────────────────────────────────────────────────
# Construcción de requests
# ───────────────────────────────────────────────────────────────────
def social_req(prompt, ratio, fname):
    return {"prompt": prompt + ", " + S_PHOTO, "aspect_ratio": ratio, "resolution": "2K", "output_file": os.path.join(HUBS, fname)}

def diag_req(prompt, ratio, fname):
    return {"prompt": prompt + ", " + S_DIAG, "aspect_ratio": ratio, "resolution": "2K", "output_file": os.path.join(DIAGRAMAS, fname)}

# 5 sociales en un batch, 3 diagramas en otro
reqs_sociales = [social_req(p, r, f) for (p, r, f, _) in sociales]
reqs_diagramas = [diag_req(p, r, f) for (p, r, f, _) in diagramas]

with open("/tmp/hubs_sociales.json", "w") as fp:
    fp.write(json.dumps({"requests": reqs_sociales}))
with open("/tmp/hubs_diagramas.json", "w") as fp:
    fp.write(json.dumps({"requests": reqs_diagramas}))

print(f"5 sociales -> /tmp/hubs_sociales.json")
print(f"3 diagramas -> /tmp/hubs_diagramas.json")

# ───────────────────────────────────────────────────────────────────
# Manifest con alt text
# ───────────────────────────────────────────────────────────────────
manifest = {
    "hubs": [],
    "diagramas": [],
}

for (p, r, fname, slug) in sociales:
    alts = {
        "umbrales": "Fondo fotográfico para la tarjeta social de la página de umbrales de la Ley Antilavado. Imagen sin texto: el título y la cifra los compone el sitio en tiempo de build a partir de los datos del motor de reglas.",
        "obligaciones": "Fondo fotográfico para la tarjeta social de la página de obligaciones del artículo 18 de la LFPIORPI. Sin texto.",
        "multas": "Fondo fotográfico abstracto para la tarjeta social de la página de multas y sanciones de la Ley Antilavado. Sin texto ni objetos reconocibles.",
        "limites-efectivo": "Fondo fotográfico para la tarjeta social de la página de límites de efectivo del artículo 32 de la LFPIORPI. Sin texto, las cifras no son legibles.",
        "calendario-cumplimiento": "Fondo fotográfico para la tarjeta social del calendario de cumplimiento 2026-2029. Sin texto ni fechas visibles.",
    }
    manifest["hubs"].append({
        "filename": f"hubs/{fname}",
        "ruta_destino": f"/{slug}",
        "aspecto": "1200x630 (16:9, recorte social)",
        "alt": alts[slug],
    })

for (p, r, fname, alt) in diagramas:
    manifest["diagramas"].append({
        "filename": f"diagramas/{fname}",
        "aspecto": "1600x900 (16:9)",
        "alt": alt,
    })

with open(f"{BASE}/hubs-y-diagramas-manifest.json", "w") as fp:
    fp.write(json.dumps(manifest, indent=2, ensure_ascii=False))

print(f"\nManifest -> {BASE}/hubs-y-diagramas-manifest.json")
