// Render the actual phone chrome in Node. JSX is compiled in memory; no browser,
// generated files, application source replacement, or analytics calls are used.
// Run: node --test scripts/dev/lab-chrome-test.mjs
import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { registerHooks } from 'node:module'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { transformSync } from 'rolldown/experimental'

const loader = registerHooks({
  resolve(specifier, context, nextResolve) {
    try { return nextResolve(specifier, context) } catch (error) {
      if (specifier.startsWith('.') && !/\.\w+$/.test(specifier)) return nextResolve(specifier + '.js', context)
      throw error
    }
  },
  load(url, context, nextLoad) {
    if (url.endsWith('.css')) return { format: 'module', source: '', shortCircuit: true }
    if (url.endsWith('.jsx')) {
      const result = transformSync(url, readFileSync(new URL(url), 'utf8'), { jsx: { runtime: 'automatic' } })
      assert.equal(result.errors.length, 0, 'The actual component must compile before its semantics are checked')
      return { format: 'module', source: result.code, shortCircuit: true }
    }
    return nextLoad(url, context)
  },
})
after(() => loader.deregister())
const { default: SonarChrome } = await import('../../src/experiments/2026-09-23-sonar-lake-3d/SonarChrome.jsx')
const { t } = await import('../../src/experiments/2026-09-23-sonar-lake-3d/i18n.js')

const noop = () => {}
const render = (props = {}) => renderToStaticMarkup(createElement(SonarChrome, {
  layout: { box0: { x0: -10, y0: 0, w: 20, h: 30 }, split: false },
  deviceId: 'PL', mode: 'down', rangeFt: 100, depthFt: 100,
  imperial: true, gain: .4, phone: true, autoRange: true, autoDepth: true,
  onRange: noop, onHome: noop,
  app: { onDepth: noop, onGain: noop, onPause: noop, paused: false },
  ...props,
}))
const button = (html, key) => {
  const matches = [...html.matchAll(/<button\b[^>]*>/g)].map(match => match[0])
    .filter(tag => tag.includes(`aria-label="${t(key)}"`))
  assert.equal(matches.length, 1, `Expected one ${key} control`)
  return matches[0]
}
const assertRangeDisabled = html => {
  for (const key of ['sonar_range_shorter', 'sonar_range_longer']) {
    assert.match(button(html, key), /\sdisabled=""/, 'Range remains unavailable while following the depth axis')
  }
}

test('manual Down depth removes AUTO while both range buttons remain disabled', () => {
  for (const deviceId of ['PL', 'PLM']) {
    const html = render({ deviceId, autoDepth: false })
    assert.doesNotMatch(html, />AUTO</)
    assertRangeDisabled(html)
  }
})

test('automatic Down depth shows AUTO without enabling either range button', () => {
  for (const deviceId of ['PL', 'PLM']) {
    const html = render({ deviceId, autoDepth: true })
    assert.equal((html.match(/>AUTO</g) || []).length, 1)
    assertRangeDisabled(html)
  }
})

test('Mini Forward retains temperature and voltage but has no depth readout or depth controls', () => {
  const html = render({ deviceId: 'PLM', mode: 'forward', autoRange: false })
  assert.doesNotMatch(html, /— —/)
  assert.doesNotMatch(html, />AUTO</)
  assert.ok(!html.includes(`aria-label="${t('sonar_depth_shallower')}"`))
  assert.ok(!html.includes(`aria-label="${t('sonar_depth_deeper')}"`))
  assert.match(html, /21\.8 °C/)
  assert.match(html, /12\.6 V/)
  for (const key of ['sonar_range_shorter', 'sonar_range_longer']) assert.doesNotMatch(button(html, key), /\sdisabled=/)
  // Positive control: the other product's Forward view does expose depth.
  const full = render({ deviceId: 'PL', mode: 'forward', autoRange: false })
  assert.match(full, /— —/)
  button(full, 'sonar_depth_shallower')
  button(full, 'sonar_depth_deeper')
})
