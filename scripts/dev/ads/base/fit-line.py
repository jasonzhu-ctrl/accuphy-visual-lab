# Fit a voice-over line into its caption beat (HQ 11-03: 读不下就读慢一点或稍微压短停顿, the picture's timing never changes):
# 1) pauses longer than `pause` s are shortened to `pause` s; 2) if still too long, a WSOLA time-stretch (pitch kept) by at
# most `maxSpeed`. usage: fit-line.py <in.wav> <out.wav> <targetSeconds> [pause=0.14] [maxSpeed=1.15]
import sys, wave
import numpy as np
inp, out, target = sys.argv[1], sys.argv[2], float(sys.argv[3])
pause = float(sys.argv[4]) if len(sys.argv) > 4 else 0.14; maxSpeed = float(sys.argv[5]) if len(sys.argv) > 5 else 1.15
w = wave.open(inp); SR = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
win = SR // 100; n = len(x) // win; r = 20 * np.log10(np.sqrt((x[:n * win].reshape(n, win) ** 2).mean(1)) + 1e-9)
on = np.where(r > -40)[0]; x = x[on[0] * win: (on[-1] + 1) * win]  # trim the ends
# 1) shorten the inner pauses
n = len(x) // win; r = 20 * np.log10(np.sqrt((x[:n * win].reshape(n, win) ** 2).mean(1)) + 1e-9); quiet = r < -42
keep = np.ones(n, bool); i = 0; cut = 0
while i < n:
    if quiet[i]:
        j = i
        while j < n and quiet[j]: j += 1
        L = j - i
        if L * 0.01 > pause: k = int(pause / 0.01); keep[i + k // 2: j - (k - k // 2)] = False; cut += (L - k) * 0.01
        i = j
    else: i += 1
y = np.concatenate([x[i * win:(i + 1) * win] for i in range(n) if keep[i]])
d1 = len(y) / SR
# 2) WSOLA if still longer than the target
speed = 1.0
if d1 > target:
    speed = min(maxSpeed, d1 / target)
    N = 2048; H = N // 4; Hs = int(H * speed); tol = 512
    outl = int(len(y) / speed) + N; z = np.zeros(outl, np.float32); norm = np.zeros(outl, np.float32); hann = np.hanning(N).astype(np.float32)
    pos_in = 0; pos_out = 0; prev = None
    while pos_out + N < outl and pos_in + N + tol < len(y):
        if prev is not None:  # pick the input offset (± tol) whose segment best continues the previous one
            best, bo = -1e9, 0
            cand = y[max(0, pos_in - tol): pos_in + tol + N]
            seg_ref = prev[H:H + N - H]
            for o in range(-tol, tol + 1, 32):
                s = pos_in + o
                if s < 0 or s + N > len(y): continue
                c = np.dot(y[s:s + N - H], seg_ref)
                if c > best: best, bo = c, o
            pos_in += bo
        seg = y[pos_in:pos_in + N] * hann
        z[pos_out:pos_out + N] += seg; norm[pos_out:pos_out + N] += hann; prev = y[pos_in:pos_in + N]
        pos_out += H; pos_in += Hs - (pos_in - pos_in)  # advance by the stretched hop (the offset search re-aligns next round)
    y = (z / np.maximum(norm, 1e-3))[:pos_out]
y = y / (abs(y).max() + 1e-9) * 0.9
ww = wave.open(out, 'wb'); ww.setnchannels(1); ww.setsampwidth(2); ww.setframerate(SR); ww.writeframes((y * 32767).astype(np.int16).tobytes()); ww.close()
print(f'{inp.split("/")[-1]}: {len(x)/SR:.2f}s → pauses cut {cut:.2f}s → {d1:.2f}s → speed {speed:.2f} → {len(y)/SR:.2f}s (target {target})')
