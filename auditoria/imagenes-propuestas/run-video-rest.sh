#!/usr/bin/env bash
# Reintenta los 2 clips restantes (02 y 03) y reconstruye el video final.
set +e

DEST="/Users/jorgeaguilar/Documents/Claude/Projects/leyantilavado/auditoria/imagenes-propuestas"
LOG=/tmp/video-rest.log
> "$LOG"
TMP=/tmp/video_state

echo "=== Re-submit clip 02 ===" | tee -a "$LOG"
sleep 3
url2=$(awk -F'\t' '$1=="clip-02-aplica"{print $2}' "$TMP/uploaded.tsv")
prompt2=$(cat "$TMP/prompt-02.txt")
args=$(python3 -c "
import json, sys
print(json.dumps({
    'model': 'MiniMax-H3',
    'prompt': sys.argv[1],
    'duration': 12,
    'ratio': '16:9',
    'resolution': '768P',
    'input_image': {'url': sys.argv[2], 'mime_type': 'image/webp'},
    'reference_type': 'first_frame',
}))
" "$prompt2" "$url2")
resp=$(mcode-tools connector call connector__matrix__submit_video_generation --args "$args" 2>&1)
task2=$(echo "$resp" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("task_id",""))' 2>/dev/null)
echo "  clip-02-aplica -> $task2" | tee -a "$LOG"
[ -z "$task2" ] && echo "  fallo: $(echo "$resp" | head -c 200)" | tee -a "$LOG"

echo "" | tee -a "$LOG"
echo "=== Re-submit clip 03 ===" | tee -a "$LOG"
sleep 3
url3=$(awk -F'\t' '$1=="clip-03-cierre"{print $2}' "$TMP/uploaded.tsv")
prompt3=$(cat "$TMP/prompt-03.txt")
args=$(python3 -c "
import json, sys
print(json.dumps({
    'model': 'MiniMax-H3',
    'prompt': sys.argv[1],
    'duration': 10,
    'ratio': '16:9',
    'resolution': '768P',
    'input_image': {'url': sys.argv[2], 'mime_type': 'image/webp'},
    'reference_type': 'first_frame',
}))
" "$prompt3" "$url3")
resp=$(mcode-tools connector call connector__matrix__submit_video_generation --args "$args" 2>&1)
task3=$(echo "$resp" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("task_id",""))' 2>/dev/null)
echo "  clip-03-cierre -> $task3" | tee -a "$LOG"
[ -z "$task3" ] && echo "  fallo: $(echo "$resp" | head -c 200)" | tee -a "$LOG"

# Polling
echo "" | tee -a "$LOG"
echo "=== Polling ===" | tee -a "$LOG"
> "$TMP/videos2.tsv"
for entry in "clip-02-aplica|$task2|12" "clip-03-cierre|$task3|10"; do
  IFS='|' read -r fname tid dur <<< "$entry"
  if [ -z "$tid" ]; then continue; fi
  echo "  polling $fname ($tid)..." | tee -a "$LOG"
  for i in $(seq 1 90); do
    qargs=$(python3 -c "import json; print(json.dumps({'task_id':'$tid','model':'MiniMax-H3'}))")
    qresp=$(mcode-tools connector call connector__matrix__query_video_generation --args "$qargs" 2>&1)
    status=$(echo "$qresp" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("status","?"))' 2>/dev/null)
    case "$status" in
      succeeded)
        vurl=$(echo "$qresp" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("video_url",""))' 2>/dev/null)
        echo -e "${fname}\t${vurl}" >> "$TMP/videos2.tsv"
        echo "    $fname: succeeded" | tee -a "$LOG"
        break
        ;;
      failed|cancelled)
        echo "    $fname: $status" | tee -a "$LOG"
        break
        ;;
      *)
        sleep 5
        ;;
    esac
  done
done

# Descargar
echo "" | tee -a "$LOG"
echo "=== Descargando ===" | tee -a "$LOG"
while IFS=$'\t' read -r fname vurl; do
  out="$DEST/${fname}.mp4"
  curl -sSfL "$vurl" -o "$out"
  tam=$(stat -f%z "$out" 2>/dev/null || echo 0)
  echo "  OK $fname -> $tam bytes" | tee -a "$LOG"
done < "$TMP/videos2.tsv"

# Concatenar los 3
echo "" | tee -a "$LOG"
echo "=== Concatenando 3 clips ===" | tee -a "$LOG"
LIST=/tmp/_cliplist3.txt
> "$LIST"
for f in clip-01-que-es clip-02-aplica clip-03-cierre; do
  p="$DEST/${f}.mp4"
  if [ -f "$p" ]; then
    echo "file '$p'" >> "$LIST"
  fi
done
cat "$LIST" | tee -a "$LOG"
FINAL="$DEST/video-educativo-lfpiorpi.mp4"
rm -f "$FINAL"
ffmpeg -y -f concat -safe 0 -i "$LIST" -c copy "$FINAL" 2>&1 | tail -5 | tee -a "$LOG"

if [ -f "$FINAL" ]; then
  tam=$(stat -f%z "$FINAL")
  dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$FINAL" 2>/dev/null)
  echo "" | tee -a "$LOG"
  echo "=== Video final ===" | tee -a "$LOG"
  echo "  ruta: $FINAL" | tee -a "$LOG"
  echo "  tam:  $tam bytes" | tee -a "$LOG"
  echo "  dur:  $dur s" | tee -a "$LOG"
fi
