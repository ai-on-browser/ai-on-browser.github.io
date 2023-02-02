import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import ABOD, { LBABOD } from '../../../lib/model/abod.js'

describe('anomaly detection', () => {
	test('default', () => {
		const model = new ABOD()
		const x = Matrix.randn(100, 2, 0, 0.2).toArray()
		x.push([10, 10])
		const threshold = 0.01
		const y = model.predict(x).map(v => v < threshold)
		for (let i = 0; i < y.length - 1; i++) {
			expect(y[i]).toBe(false)
		}
		expect(y[y.length - 1]).toBe(true)
	})

	test('FastABOD', () => {
		const model = new ABOD(10)
		const x = Matrix.randn(100, 2, 0, 0.2).toArray()
		x.push([10, 10])
		const threshold = 0.01
		const y = model.predict(x).map(v => v < threshold)
		for (let i = 0; i < y.length - 1; i++) {
			expect(y[i]).toBe(false)
		}
		expect(y[y.length - 1]).toBe(true)
	})

	test('LB-ABOD', () => {
		const model = new LBABOD(10, 2)
		const x = Matrix.randn(100, 2, 0, 0.2).toArray()
		x.push([10, 10])
		x.push([10, -10])
		const y = model.predict(x)
		for (let i = 0; i < y.length - 2; i++) {
			expect(y[i]).toBe(false)
		}
		expect(y[y.length - 2]).toBe(true)
		expect(y[y.length - 1]).toBe(true)
	})
})
