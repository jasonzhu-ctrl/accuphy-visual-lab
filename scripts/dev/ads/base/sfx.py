# Synthesized sound for the Base Mini film (#225: sonar pings, pop, water, auger; no music, nothing licensed).
# Everything is generated here with numpy, so there is nothing to clear. usage: python3 sfx.py <cues.json> <out.wav>
# cues.json: { "duration": s, "cues": [ { "t": s, "kind": "ping|pingLong|pop|water|auger|whoosh", "gain": 0..1, "dur": s } ] }
import json, sys, math
import numpy as np
SR = 48000
rng = np.random.default_rng(7)

def env(n, a, d, sustain=0.0, r=None):
    """attack a, decay d, optional sustain level then release r (seconds)"""
    t = np.arange(n) / SR
    e = np.minimum(t / max(a, 1e-4), 1.0)
    dec = np.exp(-np.maximum(t - a, 0) / max(d, 1e-4))
    e = e * (sustain + (1 - sustain) * dec)
    if r: e *= np.clip((n / SR - t) / r, 0, 1)
    return e

def lowpass(x, fc):
    a = math.exp(-2 * math.pi * fc / SR); y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x): acc = a * acc + (1 - a) * v; y[i] = acc
    return y

def ping(dur=0.9, f=2400.0, tail=0.35, gain=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    # a short sine with a slightly falling pitch and a second harmonic, then a soft echo
    body = np.sin(2 * np.pi * (f * t - 60 * t * t)) * env(n, 0.003, 0.12) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * env(n, 0.002, 0.05)
    echo = np.zeros(n); d = int(0.18 * SR)
    if d < n: echo[d:] = 0.35 * body[: n - d] * np.exp(-np.arange(n - d) / SR / tail)
    return gain * (body + echo)

def whoosh(dur=0.5, gain=1.0, up=True):
    n = int(dur * SR); t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    # a band of noise whose centre sweeps up (the phone popping up) or down (it leaving)
    fc = (300 + 2200 * (t / dur if up else 1 - t / dur))
    y = np.zeros(n); acc = 0.0
    for i in range(n):
        a = math.exp(-2 * math.pi * fc[i] / SR); acc = a * acc + (1 - a) * noise[i]; y[i] = noise[i] - acc  # crude high-pass of a low-pass
    return gain * y * env(n, 0.05, dur * 0.6) * 0.9

def water(dur=4.0, gain=0.3):
    n = int(dur * SR)
    y = lowpass(rng.standard_normal(n), 900) * 2.5
    # a slow swell, like a hull moving through water
    t = np.arange(n) / SR; sw = 0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * t)
    return gain * y * sw * env(n, 0.4, dur, sustain=1.0, r=0.6)

def auger(dur=1.6, gain=0.6):
    n = int(dur * SR); t = np.arange(n) / SR
    motor = 0.5 * np.sign(np.sin(2 * np.pi * 95 * t)) + 0.3 * np.sin(2 * np.pi * 190 * t)
    grind = lowpass(rng.standard_normal(n), 2500) * 1.6
    return gain * (0.6 * motor + 0.5 * grind) * env(n, 0.15, dur, sustain=1.0, r=0.3)

MAKERS = {'ping': lambda d, g: ping(d or 0.9, gain=g), 'pingLong': lambda d, g: ping(d or 1.8, f=2000, tail=0.9, gain=g),
          'pop': lambda d, g: whoosh(d or 0.45, g, up=True), 'whoosh': lambda d, g: whoosh(d or 0.5, g, up=False),
          'water': lambda d, g: water(d or 4.0, g), 'auger': lambda d, g: auger(d or 1.6, g)}
spec = json.load(open(sys.argv[1]))
N = int(spec['duration'] * SR); mix = np.zeros(N)
for c in spec['cues']:
    y = MAKERS[c['kind']](c.get('dur'), c.get('gain', 1.0)); i = int(c['t'] * SR)
    y = y[: max(0, N - i)]; mix[i:i + len(y)] += y
peak = np.abs(mix).max() or 1.0
mix = np.tanh(mix / peak * 1.4) * 0.8  # soft limit
pcm = (mix * 32767).astype('<i2')
import wave
with wave.open(sys.argv[2], 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('wrote', sys.argv[2], f'{spec["duration"]} s', len(spec['cues']), 'cues')
