import test from 'node:test'
import assert from 'node:assert/strict'
import { setBoatTarget, nudgeBoat } from '../../src/experiments/2026-09-23-sonar-lake-3d/boatControls.js'

test('pointer targets and keyboard nudges stay inside the same lake boundary', () => {
  const s = { boat: { x: 2, z: 3 }, target: { x: 57, z: -57 }, dragging: false }
  nudgeBoat(s, 2, -2)
  assert.deepEqual(s.target, { x: 58, z: -58 })
  assert.deepEqual(s.boat, { x: 2, z: 3 }) // the render loop remains the only boat-position integrator
  assert.equal(s.dragging, false)
  assert.equal(s.hasDragged, true)
  setBoatTarget(s, -99, 99)
  assert.deepEqual(s.target, { x: -58, z: 58 })
})

test('invalid input leaves the current target intact', () => {
  const s = { target: { x: 4, z: 6 } }
  assert.equal(setBoatTarget(s, NaN, 20), false)
  assert.equal(setBoatTarget(s, 20, Infinity), false)
  assert.deepEqual(s.target, { x: 4, z: 6 })
})

test('ordinary drag positions are not rounded or snapped to keyboard steps', () => {
  const s = { target: { x: 0, z: 0 } }
  setBoatTarget(s, -12.345, 5.678)
  assert.deepEqual(s.target, { x: -12.345, z: 5.678 })
  nudgeBoat(s, 2, 0)
  assert.equal(s.target.x, -10.345)
  assert.equal(s.target.z, 5.678)
})
