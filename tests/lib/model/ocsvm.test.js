import Matrix from '../../../lib/util/matrix.js'
import OCSVM from '../../../lib/model/ocsvm.js'

describe('anomaly detection', () => {
	test('default', () => {
		const model = new OCSVM(1, 'gaussian')
		const x = Matrix.randn(100, 2, 0, 0.2).toArray()
		x.push([10, 10])
		model.init(x)
		for (let i = 0; i < 10; i++) {
			model.fit()
		}
		const threshold = -0.5
		const y = model.predict(x).map(v => v < threshold)
		let c = 0
		for (let i = 0; i < y.length - 1; i++) {
			if (y[i]) {
				c++
			}
		}
		expect(c / (y.length - 1)).toBeLessThan(0.1)
		expect(y[y.length - 1]).toBe(true)
	})

	test('custom kernel', () => {
		const model = new OCSVM(1, (a, b) => Math.exp(-2 * a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2))
		const x = Matrix.randn(100, 2, 0, 0.2).toArray()
		x.push([10, 10])
		model.init(x)
		for (let i = 0; i < 10; i++) {
			model.fit()
		}
		const threshold = -0.5
		const y = model.predict(x).map(v => v < threshold)
		let c = 0
		for (let i = 0; i < y.length - 1; i++) {
			if (y[i]) {
				c++
			}
		}
		expect(c / (y.length - 1)).toBeLessThan(0.1)
		expect(y[y.length - 1]).toBe(true)
	})
})
