import { jest } from '@jest/globals'
jest.retryTimes(5)

import Matrix from '../../../lib/util/matrix.js'
import KDEOS from '../../../lib/model/kdeos.js'

describe('anomaly detection', () => {
	test('default', () => {
		const model = new KDEOS(5, 10)
		const x = Matrix.randn(100, 2, 0, 0.1).toArray()
		x.push([10, 10])
		const threshold = 0.7
		const y = model.predict(x).map(v => v > threshold)
		let c = 0
		for (let i = 0; i < y.length - 1; i++) {
			if (y[i]) {
				c++
			}
		}
		expect(c / (y.length - 1)).toBeLessThan(0.2)
		expect(y[y.length - 1]).toBe(true)
	})

	test('custom kernel', () => {
		const model = new KDEOS(5, 20, (u, h, d) => (u / h / d < 1 ? 1 / h : 0))
		const x = Matrix.randn(100, 2, 0, 0.1).toArray()
		x.push([10, 10])
		const threshold = 0.7
		const y = model.predict(x).map(v => v > threshold)
		let c = 0
		for (let i = 0; i < y.length - 1; i++) {
			if (y[i]) {
				c++
			}
		}
		expect(c / (y.length - 1)).toBeLessThan(0.2)
		expect(y[y.length - 1]).toBe(true)
	})
})
