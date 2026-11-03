#!/bin/zsh
# The Base Mini film, from recorded passes to an MP4 with sound (#225). usage: make-preview.sh <passes dir> <work dir> <fps> <out.mp4>
# <passes dir> holds one folder per pass from film-base.mjs (open drag phone angle combo ice), each with its PNG frames
# and frames.json. Needs: playwright-core linked from the parent of this script's copy, frames2mp4 (../frames2mp4.swift) and
# muxaudio (muxaudio.swift) built in $TOOLS,
# Creative Cloud running (Eurostile Heavy). Runs: grade → merge info → comp (type) → sfx → encode → contact sheet.
set -e
PASSES=$1; WORK=$2; FPS=$3; OUT=$4
HERE=${0:a:h}; REPO=${REPO:-${HERE:h:h:h:h}}; TOOLS=${TOOLS:-$HERE}; STYLE=${STYLE:-A}  # run a copy from a folder whose parent links node_modules (playwright-core); then pass REPO=<repo root>
mkdir -p $WORK/comp/bg $WORK/comp/fonts $WORK/final
for d in $PASSES/*(-/); do python3 -I $REPO/scripts/dev/ads/v3/grade.py $d $WORK/comp/bg; done
node -e "const fs=require('fs');let all=[];for(const d of fs.readdirSync('$PASSES')){const f='$PASSES/'+d+'/frames.json';if(fs.existsSync(f))all=all.concat(JSON.parse(fs.readFileSync(f,'utf8')))}fs.writeFileSync('$WORK/comp/info.json',JSON.stringify(all));console.log(all.length,'frames of info')"
cp $HERE/overlay-base.html $WORK/comp/; cp "$REPO/public/brand/fonts/InstrumentSans-Variable.ttf" $WORK/comp/fonts/
cp "$REPO/public/brand/logo/White Accuphy Logo.png" $WORK/comp/logo.png
cp "$REPO/src/experiments/2026-09-23-sonar-lake-3d/assets/tour/finger.svg" $WORK/comp/finger.svg
STYLE=$STYLE node $HERE/comp-base.mjs $WORK/comp $WORK/final $FPS
# picture first with the proven encoder, then the sound muxed in (a single two-input writer stalled on long films);
# SOUND=0 leaves the film silent (round 3: Jason confirms the picture first, the voice-over and music come after)
$TOOLS/frames2mp4 $WORK/final $WORK/video.mp4 $FPS 10000000
$TOOLS/frames2mp4 $WORK/final $WORK/video-small.mp4 $FPS 4500000   # a copy under 30 MB for phones / the feedback page (HQ 11-03)
if [[ ${SOUND:-1} == 1 ]]; then
  python3 -I $HERE/sfx.py $HERE/cues-base.json $WORK/sfx.wav
  $TOOLS/muxaudio $WORK/video.mp4 $WORK/sfx.wav $OUT
  $TOOLS/muxaudio $WORK/video-small.mp4 $WORK/sfx.wav ${OUT:r}-small.mp4
else
  cp $WORK/video.mp4 $OUT; cp $WORK/video-small.mp4 ${OUT:r}-small.mp4
fi
# the contact sheet (one frame a second, the Reels zones drawn): next to the MP4
NUMS=$(node -e "const fs=require('fs');const n=fs.readdirSync('$WORK/final').filter(f=>f.endsWith('.jpg')).map(f=>+f.slice(1,6)).sort((a,b)=>a-b);const step=Math.round(30*${SHEET_STEP:-1});console.log(n.filter(x=>x%step===0).join(','))")
python3 -I $REPO/scripts/dev/ads/v3/sheet3.py $WORK/final ${OUT:r}-sheet.jpg $NUMS --reels --cols 6
echo "done: $OUT and ${OUT:r}-sheet.jpg"
