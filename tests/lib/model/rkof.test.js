import { jest } from '@jest/globals'
jest.retryTimes(5)

import Matrix from '../../../lib/util/matrix.js'
import RKOF from '../../../lib/model/rkof.js'

describe('anomaly detection', () => {
	test.each([undefined, 'gaussian', { name: 'gaussian' }, 'volcano', { name: 'volcano' }])('kernel %s', kernel => {
		const model = new RKOF(5, 0.5, 0.5, kernel)
		const x = Matrix.randn(100, 2, 0, 0.2).toArray()
		x.push([10, 10])
		const threshold = 5
		const y = model.predict(x).map(v => v > threshold)
		for (let i = 0; i < y.length - 1; i++) {
			expect(y[i]).toBe(false)
		}
		expect(y[y.length - 1]).toBe(true)
	})

	test.each(['epanechnikov', { name: 'epanechnikov', beta: 0.9 }])('kernel %s', kernel => {
		const model = new RKOF(5, 0.5, 0.5, kernel)
		const x = Matrix.randn(100, 2, 0, 0.2).toArray()
		x.push([10, 10])
		const threshold = 100
		const y = model.predict(x).map(v => v > threshold)
		for (let i = 0; i < y.length - 1; i++) {
			expect(y[i]).toBe(false)
		}
		expect(y[y.length - 1]).toBe(true)
	})

	test('custom kernel', () => {
		const model = new RKOF(5, 0.5, 0.5, x => (x.reduce((s, v) => s + v ** 2, 0) < 1 ? 1 : 0))
		const x = Matrix.randn(100, 2, 0, 0.2).toArray()
		x.push([10, 10])
		const threshold = 100
		const y = model.predict(x).map(v => v > threshold)
		for (let i = 0; i < y.length - 1; i++) {
			expect(y[i]).toBe(false)
		}
		expect(y[y.length - 1]).toBe(true)
	})
})
