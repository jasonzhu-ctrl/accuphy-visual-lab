#!/bin/zsh
# The PingLive ad (r1, 2026-11-05), from recorded passes to the MP4s with sound. A copy of make-preview.sh (the Mini's, unchanged) for
# the PingLive files: film-pl.mjs passes → grade (v3/grade.py) → merge info → comp-pl.mjs (overlay-pl.html, lines-pl.json,
# beats-pl.json) → frames2mp4 → muxaudio with the finished mix (mix-base.py + loudness.py) → contact sheet.
# usage: make-pl.sh <passes dir> <work dir> <mix.wav> <out.mp4>
# Needs: playwright-core linked from the parent of the folder this runs from (run a copy, then pass REPO=<repo root>), frames2mp4 and
# muxaudio built in $TOOLS, Creative Cloud running (Eurostile Heavy).
set -e
PASSES=$1; WORK=$2; MIX=$3; OUT=$4; FPS=30
HERE=${0:a:h}; REPO=${REPO:-${HERE:h:h:h:h}}; TOOLS=${TOOLS:-$HERE}; SRC=$REPO/scripts/dev/ads/base
mkdir -p $WORK/comp/bg $WORK/comp/fonts $WORK/final
for d in $PASSES/*(-/); do python3 -I $REPO/scripts/dev/ads/v3/grade.py $d $WORK/comp/bg; done
node -e "const fs=require('fs');let all=[];for(const d of fs.readdirSync('$PASSES')){const f='$PASSES/'+d+'/frames.json';if(fs.existsSync(f))all=all.concat(JSON.parse(fs.readFileSync(f,'utf8')))}fs.writeFileSync('$WORK/comp/info.json',JSON.stringify(all));console.log(all.length,'frames of info')"
cp $SRC/overlay-pl.html $WORK/comp/; cp "$REPO/public/brand/fonts/InstrumentSans-Variable.ttf" $WORK/comp/fonts/
cp "$REPO/public/brand/logo/White Accuphy Logo.png" $WORK/comp/logo.png
cp "$REPO/src/experiments/2026-09-23-sonar-lake-3d/assets/tour/finger.svg" $WORK/comp/finger.svg
BEATS=$SRC/beats-pl.json AD_LINES_FILE=$SRC/lines-pl.json node $HERE/comp-pl.mjs $WORK/comp $WORK/final $FPS
$TOOLS/frames2mp4 $WORK/final $WORK/video.mp4 $FPS 34000000      # for Meta (the Mini r17 final is ~34 Mbit/s)
$TOOLS/frames2mp4 $WORK/final $WORK/video-small.mp4 $FPS 6000000 # for review on a phone
$TOOLS/muxaudio $WORK/video.mp4 $MIX $OUT
$TOOLS/muxaudio $WORK/video-small.mp4 $MIX ${OUT:r}-small.mp4
NUMS=$(node -e "const fs=require('fs');const n=fs.readdirSync('$WORK/final').filter(f=>f.endsWith('.jpg')).map(f=>+f.slice(1,6)).sort((a,b)=>a-b);console.log(n.filter(x=>x%30===0).join(','))")
python3 -I $REPO/scripts/dev/ads/v3/sheet3.py $WORK/final ${OUT:r}-sheet.jpg $NUMS --reels --cols 6
echo "done: $OUT and ${OUT:r}-sheet.jpg"
