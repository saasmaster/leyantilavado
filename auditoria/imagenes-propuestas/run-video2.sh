#!/usr/bin/env bash
# Genera 3 clips de video educativo en español con audio nativo (MiniMax-H3)
# y los concatena en un MP4 final con ffmpeg.
set +e

DEST="/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/auditoria/imagenes-propuestas"
LOG=/tmp/video2.log
> "$LOG"

# ───────────────────────────────────────────────────────────────────
# Definir los 3 clips en archivos separados para evitar arrays asoc.
# ───────────────────────────────────────────────────────────────────
TMP=/tmp/video_state
mkdir -p "$TMP"

# Definir los 3 clips en JSON-like. Nombre|duracion|frame
cat > "$TMP/clips.tsv" <<'EOF'
clip-01-que-es	12	og-01-umbrales.webp
clip-02-aplica	12	hero-04-actividades-vulnerables.webp
clip-03-cierre	10	hero-05-cumplimiento.webp
EOF

# Prompts en archivos separados
cat > "$TMP/prompt-01.txt" <<'EOF'
A slow cinematic close-up of a printed compliance table on a wooden desk, deep navy and petrol teal palette, soft natural window light. A hand slowly slides across the page. A calm authoritative male Spanish voice-over says in Spanish: 'La LFPIORPI, también conocida como Ley Antilavado, es la ley mexicana que obliga a ciertos negocios a identificar a sus clientes y reportar operaciones que superen ciertos montos.' Soft ambient office sounds, gentle paper rustling. Photorealistic, professional, no watermark.
EOF

cat > "$TMP/prompt-02.txt" <<'EOF'
A grid of sixteen small business icons appearing one by one in a 4 by 4 layout on a marfil surface, deep navy and petrol teal palette, soft natural light. A calm authoritative male Spanish voice-over says in Spanish: 'Aplica a veintidos actividades vulnerables. Notarias, inmobiliarias, joyerias, casinos, agencias de autos, y muchas mas. Si tu negocio esta en la lista, tienes obligaciones que cumplir.' Soft keyboard typing, gentle chime as each icon appears. Photorealistic, professional, no watermark.
EOF

cat > "$TMP/prompt-03.txt" <<'EOF'
A polished metal shield with a checkmark on a marfil background, with a small desk calendar showing 30 de noviembre de 2026 appearing in the corner, deep navy and petrol teal palette, soft natural light. A calm authoritative male Spanish voice-over says in Spanish: 'Preparate antes del treinta de noviembre de dos mil veintiseis, cuando entran en vigor las nuevas reglas.' Soft ambient music, gentle closing chime. Photorealistic, professional, no watermark.
EOF

# ───────────────────────────────────────────────────────────────────
# 1) Subir los first-frames
# ───────────────────────────────────────────────────────────────────
echo "=== Subiendo first-frames ===" | tee -a "$LOG"
> "$TMP/uploaded.tsv"
while IFS=$'\t' read -r fname dur frame; do
  full_path="$DEST/$frame"
  if [ ! -f "$full_path" ]; then
    echo "  X $frame: no existe" | tee -a "$LOG"
    continue
  fi
  resp=$(mcode-tools upload-temp-url "$full_path" 2>&1)
  url=$(echo "$resp" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("temp_url",""))' 2>/dev/null)
  if [ -z "$url" ]; then
    echo "  X $frame: upload fallo: $(echo "$resp" | head -c 200)" | tee -a "$LOG"
    continue
  fi
  echo -e "${fname}\t${url}" >> "$TMP/uploaded.tsv"
  echo "  OK $frame -> url:80=${url:0:80}" | tee -a "$LOG"
done < "$TMP/clips.tsv"

# ───────────────────────────────────────────────────────────────────
# 2) Submit cada video
# ───────────────────────────────────────────────────────────────────
echo "" | tee -a "$LOG"
echo "=== Submit videos ===" | tee -a "$LOG"
> "$TMP/tasks.tsv"
while IFS=$'\t' read -r fname dur frame; do
  url=$(awk -F'\t' -v f="$fname" '$1==f{print $2}' "$TMP/uploaded.tsv")
  if [ -z "$url" ]; then
    echo "  X $fname sin url, skip" | tee -a "$LOG"
    continue
  fi
  num=$(echo "$fname" | sed 's/clip-0//;s/-.*//')
  prompt=$(cat "$TMP/prompt-0${num}.txt")
  args=$(python3 -c "
import json, sys
print(json.dumps({
    'model': 'MiniMax-H3',
    'prompt': sys.argv[1],
    'duration': int(sys.argv[2]),
    'ratio': '16:9',
    'resolution': '768P',
    'input_image': {'url': sys.argv[3], 'mime_type': 'image/webp'},
    'reference_type': 'first_frame',
}))
" "$prompt" "$dur" "$url")
  resp=$(mcode-tools connector call connector__matrix__submit_video_generation --args "$args" 2>&1)
  task_id=$(echo "$resp" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("task_id", d.get("data",{}).get("task_id","")))' 2>/dev/null)
  if [ -z "$task_id" ]; then
    echo "  X $fname submit fallo: $(echo "$resp" | head -c 200)" | tee -a "$LOG"
    continue
  fi
  echo -e "${fname}\t${task_id}" >> "$TMP/tasks.tsv"
  echo "  OK $fname -> task_id=$task_id" | tee -a "$LOG"
done < "$TMP/clips.tsv"

# ───────────────────────────────────────────────────────────────────
# 3) Polling
# ───────────────────────────────────────────────────────────────────
echo "" | tee -a "$LOG"
echo "=== Esperando terminacion (puede tardar varios minutos) ===" | tee -a "$LOG"
> "$TMP/videos.tsv"
while IFS=$'\t' read -r fname task_id; do
  echo "  polling $fname ($task_id)..." | tee -a "$LOG"
  done_flag=""
  for i in $(seq 1 90); do
    qargs=$(python3 -c "import json; print(json.dumps({'task_id':'$task_id','model':'MiniMax-H3'}))")
    qresp=$(mcode-tools connector call connector__matrix__query_video_generation --args "$qargs" 2>&1)
    status=$(echo "$qresp" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("status", d.get("data",{}).get("status","?")))' 2>/dev/null)
    case "$status" in
      succeeded)
        vurl=$(echo "$qresp" | python3 -c 'import json,sys; d=json.load(sys.stdin); v=d.get("video_url") or d.get("data",{}).get("video_url",""); print(v)' 2>/dev/null)
        echo -e "${fname}\t${vurl}" >> "$TMP/videos.tsv"
        echo "    $fname: $status" | tee -a "$LOG"
        done_flag="yes"
        break
        ;;
      failed|cancelled)
        echo "    $fname: $status" | tee -a "$LOG"
        done_flag="yes"
        break
        ;;
      *)
        sleep 5
        ;;
    esac
  done
  if [ -z "$done_flag" ]; then
    echo "    $fname: TIMEOUT" | tee -a "$LOG"
  fi
done < "$TMP/tasks.tsv"

# ───────────────────────────────────────────────────────────────────
# 4) Descargar cada video
# ───────────────────────────────────────────────────────────────────
echo "" | tee -a "$LOG"
echo "=== Descargando videos ===" | tee -a "$LOG"
> "$LIST" 2>/dev/null
LIST=/tmp/_cliplist2.txt
> "$LIST"
while IFS=$'\t' read -r fname vurl; do
  if [ -z "$vurl" ]; then
    echo "  X $fname sin url" | tee -a "$LOG"
    continue
  fi
  out="$DEST/${fname}.mp4"
  curl -sSfL "$vurl" -o "$out"
  tam=$(stat -f%z "$out" 2>/dev/null || echo 0)
  echo "  OK $fname -> $out ($tam bytes)" | tee -a "$LOG"
  echo "file '$out'" >> "$LIST"
done < "$TMP/videos.tsv"

# ───────────────────────────────────────────────────────────────────
# 5) Concatenar con ffmpeg
# ───────────────────────────────────────────────────────────────────
echo "" | tee -a "$LOG"
echo "=== Concatenando con ffmpeg ===" | tee -a "$LOG"
cat "$LIST" | tee -a "$LOG"
FINAL="$DEST/video-educativo-lfpiorpi.mp4"
ffmpeg -y -f concat -safe 0 -i "$LIST" -c copy "$FINAL" 2>&1 | tail -10 | tee -a "$LOG"

if [ -f "$FINAL" ]; then
  tam=$(stat -f%z "$FINAL")
  dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$FINAL" 2>/dev/null)
  echo "" | tee -a "$LOG"
  echo "=== Video final ===" | tee -a "$LOG"
  echo "  ruta: $FINAL" | tee -a "$LOG"
  echo "  tam:  $tam bytes" | tee -a "$LOG"
  echo "  dur:  $dur s" | tee -a "$LOG"
fi
