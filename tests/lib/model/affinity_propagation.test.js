import { jest } from '@jest/globals'
jest.retryTimes(3)

import { Matrix } from '../../../lib/util/math.js'
import AffinityPropagation from '../../../lib/model/affinity_propagation.js'

test('predict', () => {
	const model = new AffinityPropagation()
	const n = 10
	const x = Matrix.randn(n, 2, 0, 0.1).concat(Matrix.randn(n, 2, 5, 0.1)).toArray()

	model.init(x)
	for (let i = 0; i < 20; i++) {
		model.fit()
		if (model.categories.length <= 2) {
			break
		}
	}
	const y = model.predict()
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
