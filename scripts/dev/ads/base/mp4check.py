# mp4check.py <file.mp4> [fps=30] [seconds]: reads the MP4 boxes and fails unless the video track is exactly <fps>: every stts entry one
# frame long (1/fps), media duration = frames / fps (and = <seconds> if given). PingLive ad (Lab HQ 11-05: r1 read 29.94 fps because the
# mux stretched the last frame). Prints the video and sound tracks.
import struct, sys
path = sys.argv[1]; FPS = float(sys.argv[2]) if len(sys.argv) > 2 else 30.0; SEC = float(sys.argv[3]) if len(sys.argv) > 3 else None
f = open(path, 'rb'); f.seek(0, 2); END = f.tell()
def boxes(off, end):
    while off < end:
        f.seek(off); h = f.read(16); size, typ = struct.unpack('>I4s', h[:8]); hs = 8
        if size == 1: size = struct.unpack('>Q', h[8:16])[0]; hs = 16
        elif size == 0: size = end - off
        yield typ.decode('latin1'), off + hs, off + size; off += size
def rd(o, n): f.seek(o); return f.read(n)
tracks = []
def walk(b, e, info):
    for t, b2, e2 in boxes(b, e):
        if t in ('mdia', 'minf', 'stbl'): walk(b2, e2, info)
        elif t == 'hdlr': info['hdlr'] = rd(b2 + 8, 4).decode()
        elif t == 'mdhd':
            v = rd(b2, 1)[0]; d = rd(b2, 36); info['ts'], info['dur'] = struct.unpack('>II', d[12:20]) if v == 0 else struct.unpack('>IQ', d[20:32])
        elif t == 'stts': n = struct.unpack('>I', rd(b2 + 4, 4))[0]; info['stts'] = [struct.unpack('>II', rd(b2 + 8 + 8 * i, 8)) for i in range(n)]
        elif t == 'stsz': info['n'] = struct.unpack('>I', rd(b2 + 8, 4))[0]
for t, b, e in boxes(0, END):
    if t == 'moov':
        for t2, b2, e2 in boxes(b, e):
            if t2 == 'trak': info = {}; walk(b2, e2, info); tracks.append(info)
ok = True
for tr in tracks:
    sec = tr['dur'] / tr['ts']
    if tr.get('hdlr') == 'vide':
        one = tr['ts'] / FPS; even = all(abs(d - one) < 1e-6 for _, d in tr['stts']); fps = tr['n'] / sec
        good = even and abs(fps - FPS) < 1e-3 and (SEC is None or abs(sec - SEC) < 1e-3)
        print(f"video: {tr['n']} frames, {sec:.4f} s, {fps:.3f} fps, frame durations {sorted(set(d for _, d in tr['stts']))}/{tr['ts']} → {'OK' if good else 'NOT OK'}")
        ok &= good
    else: print(f"{tr.get('hdlr')}: {sec:.4f} s (timescale {tr['ts']}, {tr.get('n')} samples)")
sys.exit(0 if ok else 1)
