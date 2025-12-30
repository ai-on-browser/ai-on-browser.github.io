import NOF from '../../../lib/model/nof.js'
import Matrix from '../../../lib/util/matrix.js'

describe('anomaly detection', () => {
	test('default', () => {
		const model = new NOF(5)
		const x = Matrix.randn(100, 2, 0, 0.2).toArray()
		x.push([10, 10])
		const threshold = 5
		const y = model.predict(x).map(v => v > threshold)
		for (let i = 0; i < y.length - 1; i++) {
			expect(y[i]).toBe(false)
		}
		expect(y[y.length - 1]).toBe(true)
	})

	test('no parameters', { retry: 3 }, () => {
		const model = new NOF()
		const x = Matrix.randn(100, 2, 0, 0.2).toArray()
		x.push([10, 10])
		const threshold = 5
		const y = model.predict(x).map(v => v > threshold)
		for (let i = 0; i < y.length - 1; i++) {
			expect(y[i]).toBe(false)
		}
		expect(y[y.length - 1]).toBe(true)
	})
})
