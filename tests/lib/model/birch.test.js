import { jest } from '@jest/globals'
jest.retryTimes(3)

import { Matrix } from '../../../lib/util/math.js'
import BIRCH from '../../../lib/model/birch.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test('clustering', () => {
	const model = new BIRCH(null, 20, 0.2, 10000)
	const n = 50
	const x = Matrix.random(n, 2, 0, 1).concat(Matrix.random(n, 2, 3, 4)).concat(Matrix.random(n, 2, 6, 7)).toArray()

	model.fit(x)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})
