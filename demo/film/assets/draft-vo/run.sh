cd "$(dirname "$0")"
while IFS='|' read -r id text; do
  npx hyperframes tts "$text" -v am_michael -s 1.0 -o "$id.wav" 2>&1 | grep -v "^\[hyperframes\] .env" | tail -2
done < lines.txt
echo DONE
