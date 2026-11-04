# r11 (Jason 11-04: 每一句停下来再开始语气都会变 很糟糕): the voice-over is ONE continuous Artlist take; this cuts it at the
# pauses between the lines only (never inside a line), keeps each line exactly as read (no speed change, no edit inside),
# and writes one WAV per line plus a mix plan that moves each line's start onto its picture beat.
# usage: split-take.py <take (wav/mp3)> <out dir> <plan-template.json> <plan out.json>
#   the template is a mix-base.py plan; its lines' "key" order is the reading order and "speech" the wanted speech onset (s).
# Cut points: the middle of the 8 longest pauses (≥ 0.3 s). Each piece keeps 0.12 s before its first sound and 0.15 s after its
# last (the breath stays with its line), with 15 ms fades at the cut so nothing clicks.
import json, subprocess, sys, tempfile, wave
import numpy as np
take, outd, tmpl, planout = sys.argv[1:5]
SR = 48000
tmp = tempfile.mktemp(suffix='.wav'); subprocess.run(['afconvert', '-f', 'WAVE', '-d', f'LEI16@{SR}', '-c', '1', take, tmp], check=True)
w = wave.open(tmp); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
P = json.load(open(tmpl)); keys = [L['key'] for L in P['lines']]
h = SR // 100; n = len(a) // h; db = 20 * np.log10(np.sqrt((a[:n * h].reshape(n, h) ** 2).mean(1)) + 1e-9); act = db > db.max() - 38
gaps = []; i = int(np.argmax(act))
while i < n:
    if not act[i]:
        j = i
        while j < n and not act[j]: j += 1
        if j < n: gaps.append((i, j))
        i = j
    else: i += 1
need = len(keys) - 1
big = sorted(sorted(gaps, key=lambda g: g[1] - g[0])[-need:])
assert len(big) == need and min(g[1] - g[0] for g in big) >= 30, f'need {need} pauses ≥ 0.3 s between the lines, found {[(g[0]/100, (g[1]-g[0])/100) for g in big]}'
on = [int(np.argmax(act))] + [g[1] for g in big]; off = [g[0] for g in big] + [n - int(np.argmax(act[::-1]))]
rows = []
for k, s, e, L in zip(keys, on, off, P['lines']):
    s0 = max(0, int((s / 100 - 0.12) * SR)); e0 = min(len(a), int((e / 100 + 0.15) * SR)); x = a[s0:e0].copy()
    f = int(0.015 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    ow = wave.open(f'{outd}/{k}.wav', 'wb'); ow.setnchannels(1); ow.setsampwidth(2); ow.setframerate(SR); ow.writeframes((x * 32767).astype(np.int16).tobytes()); ow.close()
    lead = s / 100 - s0 / SR; L['file'] = f'{k}.wav'; L['at'] = round(L['speech'] - lead, 3)
    rows.append((k, s / 100, e / 100, (e - s) / 100, L['speech'], L['speech'] + (e - s) / 100))
P['voDir'] = outd; json.dump(P, open(planout, 'w'), indent=1)
print(f"{'line':6s} {'in take':>13s} {'len':>5s}   {'in film':>13s}")
for k, a0, a1, d, f0, f1 in rows: print(f'{k:6s} {a0:6.2f}–{a1:6.2f} {d:5.2f}   {f0:6.2f}–{f1:6.2f}')
print('pauses kept inside lines:', [round(g[0] / 100, 2) for g in gaps if g not in big and g[1] - g[0] >= 10])
