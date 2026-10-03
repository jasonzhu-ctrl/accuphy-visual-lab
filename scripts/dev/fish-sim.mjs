// Fish safety check (decision #64): builds the population, then drives a boat over the lake and checks EVERY fish
// EVERY frame — no structure hit, not into the bottom, not out of the water — and counts the behaviours seen.
// Usage: node --import ./scripts/dev/node-register.mjs scripts/dev/fish-sim.mjs [minutes=15]
const base = new URL('../../src/experiments/2026-09-23-sonar-lake-3d/', import.meta.url).href
const { makePopulation, fishPose, stepBehaviours, drawnLen } = await import(base + 'fish.js')
const { buildObstacles, toCircles } = await import(base + 'obstacles.js')
const { bedY } = await import(base + 'terrain.js')
const minutes = +(process.argv[2] || 15)
const circles = toCircles(buildObstacles()), pop = makePopulation(bedY, circles), o = {}
const viol = { struct: 0, bottom: 0, surface: 0 }, who = {}, kinds = {}, seen = new WeakMap()
let minGap = 1e9
for (const f of pop) { if (!f.radius) continue; for (let t = 0; t < (2 * Math.PI) / f.speed; t += 0.5) { fishPose(f, t, o); minGap = Math.min(minGap, o.y - 0.12 * drawnLen(f) - bedY(o.x, o.z)) } }
const path = []; for (let z = -58; z <= 30; z += 10) { path.push([-55, z]); path.push([58, z]) }
const apex = { x: 0, y: -0.93, z: 0 }; let seg = 0, t = 0, sx = path[0][0], sz = path[0][1]; const dt = 1 / 30
while (t < minutes * 60) {
  const [tx, tz] = path[(seg + 1) % path.length], d = Math.hypot(tx - sx, tz - sz)
  if (Math.floor(t / 20) % 4 !== 0) { if (d < 0.1) seg++; else { const v = Math.min(2 * dt, d); sx += ((tx - sx) / d) * v; sz += ((tz - sz) / d) * v } }
  apex.x = sx + 2.99; apex.z = sz + 0.47
  stepBehaviours(pop, t, dt, apex, circles, bedY)
  for (const f of pop) {
    if (!f.radius) continue
    if (f.act && seen.get(f) !== f.act) { seen.set(f, f.act); kinds[f.species + ':' + f.act.kind] = (kinds[f.species + ':' + f.act.kind] || 0) + 1 }
    fishPose(f, t, o)
    const Ld = drawnLen(f), cl = 0.34 * Ld, hy = 0.12 * Ld + 0.25, tag = f.species + ':' + (f.act ? f.act.kind : 'loop')
    if (o.y - 0.12 * Ld - bedY(o.x, o.z) < 0.05) { viol.bottom++; who[tag + ':bottom'] = (who[tag + ':bottom'] || 0) + 1 }
    if (o.y > -0.9) viol.surface++
    for (const c of circles) if (o.y + hy > c.y0 && o.y - hy < c.y1 && Math.hypot(o.x - c.x, o.z - c.z) < c.r + cl * 0.8) { viol.struct++; who[tag + ':struct'] = (who[tag + ':struct'] || 0) + 1; break }
  }
  t += dt
}
console.log('lowest belly-to-bottom gap on any loop:', minGap.toFixed(2), 'm')
console.log(`behaviours in ${minutes} simulated minutes:`, JSON.stringify(kinds))
console.log('violations (fish-frames, want all 0):', JSON.stringify(viol), JSON.stringify(who))
