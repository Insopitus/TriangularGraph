// const test = require('tape')
import test from 'tape'
// const test = require('tape')
// const {getCanvas2DCoord} = require('../src/Coordinate')
import { getCanvas2DCoord } from '../src/TriangularGraph'
test('coordinate system test', t => {
  t.plan(3)
  t.deepEqual(getCanvas2DCoord(1,0,0),[1,0])
  t.deepEqual(getCanvas2DCoord(0,1,0),[0.5000000000000001, 0.8660254037844386])
  t.deepEqual(getCanvas2DCoord(0,0,1),[0,0])
  // t.equals(roughlyEqual(1,1.00000000000001),true)
})



