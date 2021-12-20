import { jest } from '@jest/globals'
jest.retryTimes(3)

import { Matrix } from '../../../lib/util/math.js'
import VBGMM from '../../../lib/model/vbgmm.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test('clustering', () => {
	const model = new VBGMM(0.001, 0.001, 5)
	const n = 20
	const x = Matrix.randn(n, 2, 0, 0.2).concat(Matrix.randn(n, 2, 5, 0.2)).toArray()

	model.init(x)
	for (let i = 0; i < 2; i++) {
		model.fit()
	}
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})
