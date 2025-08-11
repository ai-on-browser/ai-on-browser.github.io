import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import { ConfidenceWeighted, SoftConfidenceWeighted } from '../../../lib/model/confidence_weighted.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

describe('ConfidenceWeighted', () => {
	test('normal eta', () => {
		const model = new ConfidenceWeighted(0.9)
		const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / 50) * 2 - 1
		}
		model.init(x, t)
		model.fit()
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})

	test.each([1, 0.5, 0])('eta %p', eta => {
		const model = new ConfidenceWeighted(eta)
		const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / 50) * 2 - 1
		}
		model.init(x, t)
		model.fit()
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeCloseTo(0.5)
	})
})

test.each([1, 2])('SoftConfidenceWeighted %d', version => {
	const model = new SoftConfidenceWeighted(0.9, 1, version)
	const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / 50) * 2 - 1
	}
	model.init(x, t)
	model.fit()
	const y = model.predict(x)
	const acc = accuracy(y, t)
	expect(acc).toBeGreaterThan(0.95)
})
