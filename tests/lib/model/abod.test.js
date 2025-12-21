import ABOD, { LBABOD } from '../../../lib/model/abod.js'
import Matrix from '../../../lib/util/matrix.js'

describe('anomaly detection', () => {
	test('default', { retry: 3 }, () => {
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

	test('FastABOD', { retry: 3 }, () => {
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

	test('LB-ABOD', { retry: 3 }, () => {
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

	test('LB-ABOD default', { retry: 3 }, () => {
		const model = new LBABOD()
		const x = Matrix.randn(100, 2, 0, 0.2).toArray()
		x.push([10, 10])
		x.push([10, -10])
		x.push([10, 20])
		x.push([10, -20])
		x.push([10, 30])
		const y = model.predict(x)
		for (let i = 0; i < y.length - 5; i++) {
			expect(y[i]).toBe(false)
		}
		for (let i = y.length - 5; i < y.length; i++) {
			expect(y[i]).toBe(true)
		}
	})

	test('LB-ABOD many outliers', () => {
		const model = new LBABOD(10, 2)
		const x = [
			[-0.5, 0],
			[-1.0, 0.5],
			[0.5, -0.1],
			[0.4, -0.2],
			[-0.6, -0.8],
			[10, 10],
			[-10, 10],
			[10, -10],
		]
		const y = model.predict(x)
		for (let i = 0; i < y.length - 3; i++) {
			expect(y[i]).toBe(false)
		}
		let c = 0
		for (let i = y.length - 3; i < y.length; i++) {
			if (y[i]) c++
		}
		expect(c).toBe(2)
	})
})
