// Dumps every plant, rock and fish position as JSON, to prove a terrain change moved nothing but heights
// (decision #64). Run before and after, then diff x/z. Usage: node --import ./scripts/dev/node-register.mjs scripts/dev/layout-dump.mjs > before.json
const base = new URL('../../src/experiments/2026-09-23-sonar-lake-3d/', import.meta.url).href
const { placeAll } = await import(base + 'vegetation.js')
const { makePopulation } = await import(base + 'fish.js')
const { buildObstacles, toCircles } = await import(base + 'obstacles.js')
const { bedY } = await import(base + 'terrain.js')
const veg = placeAll(), pop = makePopulation(bedY, toCircles(buildObstacles()))
process.stdout.write(JSON.stringify({ veg: Object.fromEntries(Object.entries(veg).map(([k, v]) => [k, v.map((o) => [o.x, o.z, o.y, o.s])])), fish: pop.map((f) => [f.species, f.home[0], f.home[1], f.home[2], f.radius, f.clear]) }))
