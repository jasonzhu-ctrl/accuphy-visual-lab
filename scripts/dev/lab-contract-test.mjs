// Offline semantic checks for the existing Lab contract; no browser, network or real analytics.
// Run: node --test scripts/dev/lab-contract-test.mjs
import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { DEVICES, FT, ICE_MODES } from '../../src/experiments/2026-09-23-sonar-beam/devices.js'
import { wedgeSpecs, wedgeGeometry } from '../../src/experiments/2026-09-23-beam-shapes-3d/wedge.js'

const embedUrl = new URL('../../src/experiments/2026-09-23-sonar-lake-3d/embed.js', import.meta.url)
// Vite supplies this flag. Replace only that compile-time flag for Node; the application module stays unchanged on disk.
const loader = registerHooks({
  load(url, context, nextLoad) {
    const result = nextLoad(url, context)
    if (url.split('?')[0] !== embedUrl.href) return result
    const source = typeof result.source === 'string' ? result.source : Buffer.from(result.source).toString('utf8')
    assert.equal(source.split('import.meta.env.DEV').length - 1, 1, 'review the Node adapter if the Vite flags change')
    return { ...result, source: source.replace('import.meta.env.DEV', 'false') }
  },
})
after(() => loader.deregister())

const near = (actual, expected, epsilon = 1e-6) => assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`)
const bounds = (spec) => {
  const geometry = wedgeGeometry(spec)
  try {
    const positions = geometry.getAttribute('position')
    assert.ok(positions.count > 0)
    assert.ok([...positions.array].every(Number.isFinite), 'geometry must remain finite')
    geometry.computeBoundingBox()
    return geometry.boundingBox.clone()
  } finally { geometry.dispose() }
}

test('product identities, physical/display angle distinction, limits and public mode sets remain stable', () => {
  assert.equal(FT, 0.3048)
  assert.deepEqual(Object.keys(DEVICES), ['PL', 'PLM'])
  assert.equal(DEVICES.PL.name, 'PingLive')
  assert.equal(DEVICES.PLM.name, 'PingLive Mini')
  assert.deepEqual([DEVICES.PL.beamDeg, DEVICES.PL.thickDeg, DEVICES.PL.maxRangeFt, DEVICES.PL.maxDepthFt], [135, 20, 240, 240])
  assert.deepEqual([DEVICES.PLM.beamDeg, DEVICES.PLM.displayBeamDeg, DEVICES.PLM.thickDeg, DEVICES.PLM.maxRangeFt, DEVICES.PLM.maxDepthFt], [39, 43, 18, 200, 200])
  assert.deepEqual(DEVICES.PL.modes, ['down', 'forward', 'panoramic'])
  assert.deepEqual(DEVICES.PLM.modes, ['down', 'forward', 'combo'])
  assert.deepEqual(ICE_MODES, ['liveice', 'forward', 'down', 'combo'])
  assert.ok(!ICE_MODES.includes('ice'), 'legacy Ice Fishing is an engine path, not an offered view')
})

for (const id of ['PL', 'PLM']) {
  test(`${id} Down is below the transducer and symmetric across both sides`, () => {
    const [spec] = wedgeSpecs(DEVICES[id], 'down', 20)
    const box = bounds(spec)
    near(box.max.y, 0)
    near(box.min.y, -20)
    near(box.min.x, -box.max.x)
    near(box.min.z, -box.max.z)
    near(spec.frame.c.length(), 1)
    near(spec.frame.c.dot(spec.frame.h), 0)
    near(spec.frame.c.dot(spec.frame.n), 0)
  })
  test(`${id} Forward has a surface-leading edge and finite width`, () => {
    const [spec] = wedgeSpecs(DEVICES[id], 'forward', 20)
    const box = bounds(spec)
    near(box.max.x, 20)
    near(box.max.y, 0)
    assert.ok(box.min.y < 0)
    assert.ok(box.max.z > 0)
    near(box.min.z, -box.max.z)
  })
}

test('Mini Combo contains the same Down and Forward fans; creating specs does not mutate product data', () => {
  const before = JSON.stringify(DEVICES)
  assert.deepEqual(wedgeSpecs(DEVICES.PLM, 'combo', 30), [
    ...wedgeSpecs(DEVICES.PLM, 'down', 30),
    ...wedgeSpecs(DEVICES.PLM, 'forward', 30),
  ])
  assert.equal(JSON.stringify(DEVICES), before)
})

for (const mode of ['liveice', 'ice']) {
  test(`${mode} keeps the Mini's Down geometry through the hole`, () => {
    assert.deepEqual(wedgeSpecs(DEVICES.PLM, mode, 18), wedgeSpecs(DEVICES.PLM, 'down', 18))
  })
}

test('PingLive Panoramic remains a horizontal fan below the surface', () => {
  const [spec] = wedgeSpecs(DEVICES.PL, 'panoramic', 20)
  const box = bounds(spec)
  assert.ok(spec.frame.c.x > 0 && spec.frame.c.y < 0)
  near(spec.frame.h.y, 0)
  assert.ok(box.max.y <= 1e-6)
  assert.ok(box.max.z > 0)
  near(box.min.z, -box.max.z)
  assert.equal(spec.s0, 0)
  assert.equal(spec.s1, 1)
})

test('Forward screen clipping keeps the rendered fan inside the specified physical box', () => {
  const [spec] = wedgeSpecs(DEVICES.PL, 'forward', 30)
  const box = bounds({ ...spec, box: { xMin: -5, xMax: 20, yMax: 12 } })
  assert.ok(box.min.x >= -5 - 1e-5)
  assert.ok(box.max.x <= 20 + 1e-5)
  assert.ok(box.min.y >= -12 - 1e-5)
  assert.ok(box.max.y <= 1e-5)
  near(box.max.x, 20)
  near(box.min.y, -12)
})

let instance = 0
async function browser(options, run) {
  const saved = new Map(['window', 'document', 'CustomEvent', 'setTimeout', 'fetch'].map(k => [k, Object.getOwnPropertyDescriptor(globalThis, k)]))
  const address = new URL(options.url || 'https://lab.accuphy.ca/')
  const messages = [], published = [], local = [], timers = []
  const w = {
    location: { href: address.href, origin: address.origin, search: address.search, ancestorOrigins: options.ancestor ? [options.ancestor] : [] },
    dispatchEvent(event) { local.push({ type: event.type, detail: event.detail }) },
  }
  w.self = w
  w.top = options.iframe ? { location: { href: 'https://shop.accuphy.com/pages/lab' } } : w
  w.parent = options.iframe ? { postMessage(message, target) { messages.push({ message, target }) } } : w
  if (options.native) w.Shopify = { analytics: { publish(name, data) { published.push({ name, data }); if (options.refuse) throw new Error('test receiver refused') } } }
  try {
    globalThis.window = w
    globalThis.document = { referrer: options.referrer || '' }
    globalThis.CustomEvent = class { constructor(type, { detail }) { this.type = type; this.detail = detail } }
    globalThis.fetch = () => { throw new Error('network forbidden in contract tests') }
    const api = await import(`${embedUrl.href}?contract=${++instance}`)
    globalThis.setTimeout = (callback, delay) => { timers.push({ callback, delay }); return timers.length }
    await run({ api, w, messages, published, local, timers })
  } finally {
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else delete globalThis[key]
    }
  }
}

test('native Shopify publishing takes priority and keeps the existing event payload', async () => {
  await browser({ native: true, iframe: true }, ({ api, messages, published, local }) => {
    const data = { view: 'forward', product: 'pinglive-mini', source: 'home' }
    api.labEvent('view', data)
    assert.equal(api.EVENT_NAME, 'accuphy:lab')
    assert.deepEqual(published, [{ name: 'accuphy:lab', data: { event: 'view', ...data } }])
    assert.deepEqual(messages, [])
    assert.deepEqual(local, [{ type: 'accuphy-lab', detail: { event: 'view', data } }])
  })
})

test('iframe publishing keeps its exact message envelope and emits a local event', async () => {
  await browser({ iframe: true }, ({ api, messages, published, local }) => {
    const data = { product: 'pinglive-sonar', placement: 'panel', lang: 'en' }
    api.labEvent('shop_click', data)
    assert.deepEqual(messages, [{ message: { source: 'accuphy-lab', event: 'shop_click', data }, target: '*' }])
    assert.deepEqual(published, [])
    assert.equal(local.length, 1)
  })
})

test('once is per event name and module lifetime, while repeat view actions are retained', async () => {
  await browser({ native: true }, ({ api, published, local }) => {
    api.labEvent('ready', {}, { once: true })
    api.labEvent('ready', { retry: true }, { once: true })
    api.labEvent('first_drag', {}, { once: true })
    api.labEvent('first_drag', {}, { once: true })
    api.labEvent('view', { view: 'down' })
    api.labEvent('view', { view: 'down' })
    assert.deepEqual(published.map(e => e.data.event), ['ready', 'first_drag', 'view', 'view'])
    assert.equal(local.length, 4)
    assert.deepEqual([...api.sentEvents], ['ready', 'first_drag'])
  })
})

test('standalone events stay local when neither Shopify nor an embedding parent exists', async () => {
  await browser({}, ({ api, messages, published, local }) => {
    api.labEvent('view', { view: 'forward' })
    assert.deepEqual(messages, [])
    assert.deepEqual(published, [])
    assert.equal(local.length, 1)
    assert.equal(api.inStore(), false)
  })
})

test('a refusing native receiver does not crash, retry once events, or double-send to the parent', async () => {
  await browser({ native: true, iframe: true, refuse: true }, ({ api, messages, published, local }) => {
    assert.doesNotThrow(() => api.labEvent('ready', {}, { once: true }))
    assert.doesNotThrow(() => api.labEvent('ready', {}, { once: true }))
    assert.equal(published.length, 1)
    assert.equal(local.length, 1)
    assert.deepEqual(messages, [])
  })
})

test('iframe product links follow the parent origin and preserve its ad attribution', async () => {
  await browser({ iframe: true, ancestor: 'https://store.example', url: 'https://lab.accuphy.ca/?shop=%2Fen-us&utm_source=lab-test' }, ({ api }) => {
    assert.equal(api.shopUrl('PL'), 'https://store.example/en-us/products/pinglive-sonar')
    assert.equal(api.shopUrl('PLM'), 'https://store.example/en-us/products/pinglive-mini')
    assert.equal(api.inStore(), true)
  })
})

test('iframe origin falls back to a distinct referrer, then the store, without leaking referrer query data', async () => {
  await browser({ iframe: true, referrer: 'https://store.example/fr/pages/lab?campaign=test', url: 'https://lab.accuphy.ca/?lang=fr' }, ({ api }) => {
    assert.equal(api.shopUrl('PL'), 'https://store.example/fr/products/pinglive-sonar')
  })
  await browser({ iframe: true, referrer: 'https://lab.accuphy.ca/previous' }, ({ api }) => {
    assert.equal(api.shopUrl('PL'), 'https://shop.accuphy.com/products/pinglive-sonar')
  })
})

test('native mounting uses its own store origin rather than an ad referrer', async () => {
  await browser({ native: true, url: 'https://store.example/pages/lab?shop=%2Fde-de&utm_source=ad', referrer: 'https://ads.example/click' }, ({ api }) => {
    assert.equal(api.shopUrl('PLM'), 'https://store.example/de-de/products/pinglive-mini')
  })
})

test('standalone links forward only existing UTM fields, or use the established default referral tags', async () => {
  await browser({ url: 'https://lab.accuphy.ca/?utm_source=campaign&utm_campaign=lake&fbclid=test&lang=fr' }, ({ api }) => {
    const link = new URL(api.shopUrl('PL'))
    assert.equal(link.pathname, '/fr/products/pinglive-sonar')
    assert.deepEqual([...link.searchParams], [['utm_source', 'campaign'], ['utm_campaign', 'lake']])
  })
  await browser({}, ({ api }) => {
    assert.equal(api.shopUrl('unknown'), 'https://shop.accuphy.com/products/pinglive-mini?utm_source=accuphy_lab&utm_medium=referral&utm_campaign=bf2026_lab_ca')
  })
})

test('native mount options override an iframe-style query prefix and can be cleared back to it', async () => {
  await browser({ native: true, url: 'https://store.example/pages/lab?shop=%2Ffr&lang=fr' }, ({ api }) => {
    api.setEmbedOptions({ shop: ' /EN-US ' })
    assert.equal(api.shopUrl('PL'), 'https://store.example/en-us/products/pinglive-sonar')
    api.setEmbedOptions({ shop: '/' })
    assert.equal(api.shopUrl('PL'), 'https://store.example/products/pinglive-sonar')
    api.setEmbedOptions({ shop: undefined })
    assert.equal(api.shopUrl('PL'), 'https://store.example/fr/products/pinglive-sonar')
  })
})

test('Shop emits its product event before scheduling one 150 ms top-window navigation', async () => {
  await browser({ iframe: true, ancestor: 'https://store.example', url: 'https://lab.accuphy.ca/?lang=fr' }, ({ api, w, messages, timers }) => {
    const before = w.top.location.href
    api.openShop('PLM', 'frame-top')
    assert.deepEqual(messages[0], { message: { source: 'accuphy-lab', event: 'shop_click', data: { product: 'pinglive-mini', placement: 'frame-top', lang: 'fr' } }, target: '*' })
    assert.equal(w.top.location.href, before)
    assert.equal(timers.length, 1)
    assert.equal(timers[0].delay, 150)
    timers[0].callback()
    assert.equal(w.top.location.href, 'https://store.example/fr/products/pinglive-mini')
  })
})

test('blocked top-window navigation falls back to the current frame', async () => {
  await browser({ iframe: true, ancestor: 'https://store.example' }, ({ api, w, timers }) => {
    Object.defineProperty(w.top, 'location', { get() { throw new Error('test cross-origin denial') } })
    api.openShop('PL', 'panel')
    assert.doesNotThrow(() => timers[0].callback())
    assert.equal(w.location.href, 'https://store.example/products/pinglive-sonar')
  })
})
