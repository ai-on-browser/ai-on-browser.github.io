import Matrix from '../../../lib/util/matrix.js'
import IsolationForest from '../../../lib/model/isolation_forest.js'

describe('anomaly detection', () => {
	test('default', () => {
		const x = Matrix.randn(200, 2, 0, 0.2).toArray()
		x.push([10, 10])
		const model = new IsolationForest()
		model.fit(x)
		const threshold = 0.5
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

	test('parameter', () => {
		const x = Matrix.randn(200, 2, 0, 0.2).toArray()
		x.push([10, 10])
		const model = new IsolationForest(100, 0.8)
		model.fit(x)
		const threshold = 0.5
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
