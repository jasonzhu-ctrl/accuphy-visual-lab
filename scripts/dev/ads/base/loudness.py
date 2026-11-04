# Loudness of an ad mix without ffmpeg (this Mac has none): ITU-R BS.1770-4 integrated loudness (K-weighting, 400 ms blocks,
# 75 % overlap, −70 LUFS absolute and −10 LU relative gates), loudness range is not computed; true peak by 4× oversampling
# (BS.1770 Annex 2 style, polyphase FIR). Optionally writes a copy with a gain so it lands on a target.
# usage: loudness.py <in.wav> [--target -14 --tp -1 --out out.wav]
# Numbers only: nobody here can hear the result (PingLive ad r1, 2026-11-05).
import sys, wave
import numpy as np
from scipy.signal import lfilter, resample_poly

def read(p):
    w = wave.open(p); sr = w.getframerate(); ch = w.getnchannels(); assert w.getsampwidth() == 2, 'PCM 16-bit only'
    x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
    return x.reshape(-1, ch), sr

def kweight(x, sr):
    # the two BS.1770 biquads (shelf + high-pass), coefficients derived for any sample rate (as in pyloudnorm)
    import math
    G, Q, fc = 3.99984385397, 0.7071752369554193, 1681.9744509555319
    K = math.tan(math.pi * fc / sr); Vh = 10 ** (G / 20); Vb = Vh ** 0.499666774155
    a0 = 1 + K / Q + K * K
    b1 = [(Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0]
    a1 = [1, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0]
    Q2, fc2 = 0.5003270373253953, 38.13547087613982; K = math.tan(math.pi * fc2 / sr)
    b2 = [1, -2, 1]; a2 = [1, 2 * (K * K - 1) / (1 + K / Q2 + K * K), (1 - K / Q2 + K * K) / (1 + K / Q2 + K * K)]
    return lfilter(b2, a2, lfilter(b1, a1, x, axis=0), axis=0)

def integrated(x, sr):
    y = kweight(x, sr); n = int(0.4 * sr); hop = int(0.1 * sr)
    z = np.array([(y[i:i + n] ** 2).mean(0).sum() for i in range(0, len(y) - n + 1, hop)])
    l = -0.691 + 10 * np.log10(z + 1e-15)
    z1 = z[l > -70]; g = -0.691 + 10 * np.log10(z1.mean()) - 10
    return -0.691 + 10 * np.log10(z1[(-0.691 + 10 * np.log10(z1 + 1e-15)) > g].mean())

def true_peak(x):
    return 20 * np.log10(max(np.abs(resample_poly(x[:, c], 4, 1)).max() for c in range(x.shape[1])) + 1e-15)

if __name__ == '__main__':
    a = sys.argv[1:]; x, sr = read(a[0])
    I, tp, sp = integrated(x, sr), true_peak(x), 20 * np.log10(np.abs(x).max() + 1e-15)
    print(f'{a[0]}: integrated {I:.1f} LUFS, true peak {tp:.1f} dBTP, sample peak {sp:.1f} dBFS, {len(x) / sr:.2f} s')
    if '--out' in a:
        tgt = float(a[a.index('--target') + 1]) if '--target' in a else -14.0; tpmax = float(a[a.index('--tp') + 1]) if '--tp' in a else -1.0
        g = tgt - I
        if tp + g > tpmax: g = tpmax - tp; print(f'gain limited by the true peak: {g:+.2f} dB')
        y = np.clip(x * 10 ** (g / 20), -1, 32767 / 32768)
        w = wave.open(a[a.index('--out') + 1], 'wb'); w.setnchannels(x.shape[1]); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((y * 32768).round().astype(np.int16).tobytes()); w.close()
        print(f'gain {g:+.2f} dB → integrated {integrated(y, sr):.1f} LUFS, true peak {true_peak(y):.1f} dBTP')
