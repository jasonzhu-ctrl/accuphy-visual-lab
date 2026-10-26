#!/bin/sh
# BF ad clips (decision #168): record the three 9:16 clips, make the 4:5 frames, burn the captions, encode the 18 MP4s.
# Needs the dev server on :5173 (npm run dev; the clips use its dev hooks __jig / __chase) and Playwright Chromium
# (playwright-core is not a repo dependency: run rec.mjs from a folder where it is installed). Frames go to $WORK (default /tmp/accuphy-ads); videos to OUT.
#   sh scripts/dev/ads/make.sh            record + encode everything
#   SKIP_REC=1 sh scripts/dev/ads/make.sh only re-burn captions and re-encode (after captions.json changes)
set -e
HERE=$(cd "$(dirname "$0")" && pwd); ROOT=$(cd "$HERE/../../.." && pwd)
WORK=${WORK:-/tmp/accuphy-ads}; OUT=${OUT:-$ROOT/reference/ads/2026-11-bf}; CJ=$OUT/captions.json
mkdir -p "$WORK" "$OUT"
[ -x "$WORK/frames2mp4" ] || swiftc -O "$HERE/frames2mp4.swift" -o "$WORK/frames2mp4"
for c in ice boat mini; do
  [ -n "$SKIP_REC" ] || { rm -rf "$WORK/$c-916"; node "$HERE/rec.mjs" "$c" 916 "$WORK/$c-916" 15; }
  rm -rf "$WORK/$c-45"; python3 -I "$HERE/to45.py" "$WORK/$c-916" "$WORK/$c-45"
  for a in 916 45; do
    "$WORK/frames2mp4" "$WORK/$c-$a" "$OUT/$c-$a-clean.mp4" 30 10000000
    for L in en:2 fr:3; do
      l=${L%%:*}; i=${L##*:}; rm -rf "$WORK/burn"
      python3 -I "$HERE/burn.py" "$WORK/$c-$a" "$WORK/burn" "$CJ" "$c" "$i" "$a" > /dev/null
      "$WORK/frames2mp4" "$WORK/burn" "$OUT/$c-$a-$l.mp4" 30 10000000
    done
  done
done
