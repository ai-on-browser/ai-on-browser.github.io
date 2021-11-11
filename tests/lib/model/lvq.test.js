import { jest } from '@jest/globals'
jest.retryTimes(3)

import { Matrix } from '../../../lib/util/math.js'
import { LVQClassifier, LVQCluster } from '../../../lib/model/lvq.js'

test('clustering', () => {
	const model = new LVQCluster(3)
	const n = 50
	const x = Matrix.randn(n, 2, 0, 0.1)
		.concat(Matrix.randn(n, 2, 5, 0.1))
		.concat(Matrix.randn(n, 2, [0, 5], 0.1))
		.toArray()

	for (let i = 0; i < 100; i++) {
		model.fit(x)
	}
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

test.each([1, 2, 3])('classification type %i', type => {
	const model = new LVQClassifier(type)
	const x = Matrix.randn(50, 2, 0, 0.2).concat(Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / 50)
	}
	for (let i = 0; i < 100; i++) {
		model.fit(x, t)
	}
	const y = model.predict(x)
	let acc = 0
	for (let i = 0; i < t.length; i++) {
		if (y[i] === t[i]) {
			acc++
		}
	}
	expect(acc / y.length).toBeGreaterThan(0.9)
})
