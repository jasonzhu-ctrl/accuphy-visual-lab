# The Base Mini film's sound (r7, Jason 11-03: 用 artlist 做一下字幕旁白和背景音乐): the Artlist voice-over lines placed on their
# caption beats over the Artlist music bed, ducked under the voice; a 48 kHz stereo WAV for muxaudio.swift.
# usage: mix-base.py <plan.json> <out.wav>
#   plan.json: { "voDir": ".../vo", "music": ".../track-mono48.wav", "musicIn": 144.5, "musicGainDb": -17, "duckDb": -9,
#                "fadeIn": 1.5, "fadeOut": 2.5, "length": 34, "lines": [{ "key": "open", "file": "open.wav", "at": 0.6 }, ...] }
# Prints the table of where each line's speech starts and ends (for the timing sheet).
import json, sys, wave
import numpy as np
plan = json.load(open(sys.argv[1])); out = sys.argv[2]
SR = 48000; N = int(plan['length'] * SR)
def rd(p):
    w = wave.open(p); assert w.getframerate() == SR and w.getnchannels() == 1, p
    return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
def bounds(x, thr=-40):  # first / last 10 ms window above thr dBFS
    win = SR // 100; n = len(x) // win; r = 20 * np.log10(np.sqrt((x[:n * win].reshape(n, win) ** 2).mean(1)) + 1e-9)
    on = np.where(r > thr)[0]; return on[0] * 0.01, (on[-1] + 1) * 0.01
voice = np.zeros(N, np.float32); rows = []
for L in plan['lines']:
    x = rd(f"{plan['voDir']}/{L['file']}"); t0, t1 = bounds(x)
    x = x / (abs(x).max() + 1e-9) * 10 ** (plan.get('voPeakDb', -3) / 20)   # every line to the same peak
    s = int(L['at'] * SR); e = min(N, s + len(x)); voice[s:e] += x[:e - s]
    rows.append((L['key'], L['at'] + t0, L['at'] + t1))
# the music bed: a window of the track, faded in and out, ducked under the voice (envelope follower on the voice)
m = rd(plan['music']); s = int(plan['musicIn'] * SR)
if s < 0: m = np.concatenate([np.zeros(-s, np.float32), m]); s = 0   # negative musicIn: the track starts that late (r10)
bed = m[s:s + N]
if len(bed) < N: bed = np.concatenate([bed, np.zeros(N - len(bed), np.float32)])
rms = np.sqrt((bed ** 2).mean()); bed = bed / (rms + 1e-9) * 10 ** (plan['musicGainDb'] / 20)
fi, fo = int(plan['fadeIn'] * SR), int(plan['fadeOut'] * SR)
bed[:fi] *= np.linspace(0, 1, fi); bed[N - fo:] *= np.linspace(1, 0, fo) ** 1.5
for t, db in plan.get('bedSteps', []):   # optional [[t, dB], ...]: bed gain change from t on, 0.2 s ramp (r10: the 808 drop)
    i = int(t * SR); g = np.ones(N, np.float32); r = int(0.2 * SR); tgt = 10 ** (db / 20)
    g[i:i + r] = np.linspace(1, tgt, min(r, N - i)); g[i + r:] = tgt; bed *= g
env = np.zeros(N, np.float32); a_att, a_rel = np.exp(-1 / (0.05 * SR)), np.exp(-1 / (0.35 * SR))
lvl = 0.0; av = np.abs(voice)
# block-wise follower (fast enough in numpy): 5 ms blocks
blk = SR // 200; nb = N // blk; pk = av[:nb * blk].reshape(nb, blk).max(1); e = np.zeros(nb, np.float32)
for i in range(nb):
    lvl = pk[i] if pk[i] > lvl else lvl * (a_rel ** blk) + pk[i] * (1 - a_rel ** blk); e[i] = lvl
env[:nb * blk] = np.repeat(e, blk); env[nb * blk:] = e[-1]
duck = 1 - (1 - 10 ** (plan['duckDb'] / 20)) * np.clip(env / 0.1, 0, 1)
mix = voice + bed * duck
mix = np.tanh(mix * 1.1) / np.tanh(1.1)   # soft limiter
st = np.stack([mix, mix], 1); w = wave.open(out, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
print('voice peak', f'{20*np.log10(abs(voice).max()+1e-9):.1f}', 'bed rms', f'{20*np.log10(np.sqrt((bed**2).mean())+1e-9):.1f}', 'mix peak', f'{20*np.log10(abs(mix).max()+1e-9):.1f}')
for k, a, b in rows: print(f'{k:6s} {a:6.2f} – {b:6.2f}')
