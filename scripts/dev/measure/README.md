# Sonar picture measurements (decision #129, `docs/sonar-style.md` §7.20)

`meas.py` turns a sonar picture back into numbers: echo index 0..1 per pixel through the `garmin_amber` LUT, polar
coordinates (range in ft, angle) around the transducer, connected lit patches with their size across the ray and along
it, peak and mean. Works on LiveScope frames, the app's frames and the engine's `window.__sonarSnap(W, H)` snapshots.

- Reference frames: read the apex pixel and the px/ft scale off the frame's own grid.
- Engine: `__sonarSnap(W, H)` with W/H = box metres × the same px/m; `window.__sonar.mat.uniforms.uBox0.value`
  (x0, y0, w, h in metres, apex at 0,0) gives apex px = (−x0/w·W, −y0/h·H).
- Needs numpy, pillow, scipy: `pip install --target <scratch>/pylib numpy pillow scipy` then `PYTHONPATH=<scratch>/pylib`.
