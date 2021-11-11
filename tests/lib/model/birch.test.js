import { jest } from '@jest/globals'
jest.retryTimes(3)

import { Matrix } from '../../../lib/util/math.js'
import BIRCH from '../../../lib/model/birch.js'

test('clustering', () => {
	const model = new BIRCH(null, 20, 0.2, 10000)
	const n = 50
	const x = Matrix.random(n, 2, 0, 1).concat(Matrix.random(n, 2, 3, 4)).concat(Matrix.random(n, 2, 6, 7)).toArray()

	model.fit(x)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	let acc = 0
	const expCls = []
	for (let k = 0; k < x.length / n; k++) {
		const counts = {}
		let max_count = 0
		let max_cls = null
		for (let i = k * n; i < (k + 1) * n; i++) {
			counts[y[i]] = (counts[y[i]] || 0) + 1
			if (max_count < counts[y[i]]) {
				max_count = counts[y[i]]
				max_cls = y[i]
			}
		}
		acc += max_count

		expCls[k] = max_cls
		for (let t = 0; t < k; t++) {
			expect(max_cls).not.toBe(expCls[t])
		}
	}
	expect(acc / y.length).toBeGreaterThan(0.9)
})
