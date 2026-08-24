#!/usr/bin/env bash
# Genera 3 clips de video educativo en español con audio nativo (MiniMax-H3)
# y los concatena en un MP4 final con ffmpeg.
set +e

DEST="/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/auditoria/imagenes-propuestas"
LOG=/tmp/video.log
> "$LOG"

# Definir los 3 clips: nombre, duración, primer frame local, prompt en español
declare -a CLIPS=(
  "clip-01-que-es|12|og-01-umbrales.webp"
  "clip-02-aplica|12|hero-04-actividades-vulnerables.webp"
  "clip-03-cierre|10|hero-05-cumplimiento.webp"
)

# Prompts en español con audio nativo (voz, ambiente, diálogo)
declare -A PROMPTS=(
  ["clip-01-que-es"]="A slow cinematic close-up of a printed compliance table on a wooden desk, deep navy and petrol teal palette, soft natural window light. A hand slowly slides across the page. A calm authoritative male Spanish voice-over says in Spanish: 'La LFPIORPI, también conocida como Ley Antilavado, es la ley mexicana que obliga a ciertos negocios a identificar a sus clientes y reportar operaciones que superen ciertos montos.' Soft ambient office sounds, gentle paper rustling. Photorealistic, professional, no watermark."
  ["clip-02-aplica"]="A grid of sixteen small business icons appearing one by one in a 4 by 4 layout on a marfil surface, deep navy and petrol teal palette, soft natural light. A calm authoritative male Spanish voice-over says in Spanish: 'Aplica a veintidós actividades vulnerables. Notarías, inmobiliarias, joyerías, casinos, agencias de autos, y muchas más. Si tu negocio está en la lista, tienes obligaciones que cumplir.' Soft keyboard typing, gentle chime as each icon appears. Photorealistic, professional, no watermark."
  ["clip-03-cierre"]="A polished metal shield with a checkmark on a marfil background, with a small desk calendar showing 30 de noviembre de 2026 appearing in the corner, deep navy and petrol teal palette, soft natural light. A calm authoritative male Spanish voice-over says in Spanish: 'Prepárate antes del treinta de noviembre de dos mil veintiséis, cuando entran en vigor las nuevas reglas.' Soft ambient music, gentle closing chime. Photorealistic, professional, no watermark."
)

# 1) Subir las imágenes first-frame
echo "=== Subiendo first-frames ===" | tee -a "$LOG"
declare -A TEMP_URLS
for entry in "${CLIPS[@]}"; do
  IFS='|' read -r fname dur frame <<< "$entry"
  full_path="$DEST/$frame"
  if [ ! -f "$full_path" ]; then
    echo "  X $frame: no existe" | tee -a "$LOG"
    continue
  fi
  resp=$(mcode-tools upload-temp-url "$full_path" 2>&1)
  url=$(echo "$resp" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("temp_url",""))')
  TEMP_URLS[$fname]="$url"
  echo "  OK $frame -> ${url:0:80}..." | tee -a "$LOG"
done

# 2) Submit cada video
echo "" | tee -a "$LOG"
echo "=== Submit videos ===" | tee -a "$LOG"
declare -A TASK_IDS
for entry in "${CLIPS[@]}"; do
  IFS='|' read -r fname dur frame <<< "$entry"
  url="${TEMP_URLS[$fname]}"
  if [ -z "$url" ]; then
    echo "  X $fname sin url, skip" | tee -a "$LOG"
    continue
  fi
  prompt="${PROMPTS[$fname]}"
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
  task_id=$(echo "$resp" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("task_id",d.get("data",{}).get("task_id","")))' 2>/dev/null)
  TASK_IDS[$fname]="$task_id"
  echo "  OK $fname -> task_id=$task_id" | tee -a "$LOG"
done

# 3) Polling hasta que terminen
echo "" | tee -a "$LOG"
echo "=== Esperando terminación (puede tardar varios minutos) ===" | tee -a "$LOG"
declare -A VIDEO_URLS
declare -A STATUS
for entry in "${CLIPS[@]}"; do
  IFS='|' read -r fname dur frame <<< "$entry"
  task_id="${TASK_IDS[$fname]}"
  if [ -z "$task_id" ]; then
    STATUS[$fname]="skipped"
    continue
  fi
  echo "  polling $fname ($task_id)..." | tee -a "$LOG"
  for i in $(seq 1 60); do
    qargs=$(python3 -c "import json; print(json.dumps({'task_id':'$task_id','model':'MiniMax-H3'}))")
    qresp=$(mcode-tools connector call connector__matrix__query_video_generation --args "$qargs" 2>&1)
    status=$(echo "$qresp" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("status",d.get("data",{}).get("status","?")))' 2>/dev/null)
    case "$status" in
      succeeded)
        vurl=$(echo "$qresp" | python3 -c 'import json,sys; d=json.load(sys.stdin); v=d.get("video_url") or d.get("data",{}).get("video_url",""); print(v)' 2>/dev/null)
        VIDEO_URLS[$fname]="$vurl"
        STATUS[$fname]="succeeded"
        echo "    $fname: $status -> $vurl" | tee -a "$LOG"
        break
        ;;
      failed|cancelled)
        STATUS[$fname]="$status"
        echo "    $fname: $status" | tee -a "$LOG"
        break
        ;;
      *)
        sleep 5
        ;;
    esac
  done
done

# 4) Descargar cada video
echo "" | tee -a "$LOG"
echo "=== Descargando videos ===" | tee -a "$LOG"
for entry in "${CLIPS[@]}"; do
  IFS='|' read -r fname dur frame <<< "$entry"
  url="${VIDEO_URLS[$fname]}"
  if [ -z "$url" ]; then
    echo "  X $fname sin url" | tee -a "$LOG"
    continue
  fi
  out="$DEST/${fname}.mp4"
  curl -sSfL "$url" -o "$out"
  tam=$(stat -f%z "$out" 2>/dev/null || echo 0)
  echo "  OK $fname -> $out ($tam bytes)" | tee -a "$LOG"
done

# 5) Concatenar con ffmpeg
echo "" | tee -a "$LOG"
echo "=== Concatenando con ffmpeg ===" | tee -a "$LOG"
LIST=/tmp/_cliplist.txt
> "$LIST"
for entry in "${CLIPS[@]}"; do
  IFS='|' read -r fname dur frame <<< "$entry"
  echo "file '$DEST/${fname}.mp4'" >> "$LIST"
done
cat "$LIST" | tee -a "$LOG"

FINAL="$DEST/video-educativo-lfpiorpi.mp4"
ffmpeg -y -f concat -safe 0 -i "$LIST" -c copy "$FINAL" 2>&1 | tail -20 | tee -a "$LOG"

if [ -f "$FINAL" ]; then
  tam=$(stat -f%z "$FINAL")
  dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$FINAL" 2>/dev/null)
  echo "" | tee -a "$LOG"
  echo "=== Video final ===" | tee -a "$LOG"
  echo "  ruta: $FINAL" | tee -a "$LOG"
  echo "  tam: $tam bytes" | tee -a "$LOG"
  echo "  dur: $dur s" | tee -a "$LOG"
fi
