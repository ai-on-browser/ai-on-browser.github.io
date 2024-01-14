import Matrix from '../../../lib/util/matrix.js'
import Thompson from '../../../lib/model/thompson.js'

describe('anomaly detection', () => {
	test('default', () => {
		const model = new Thompson(1)
		const x = Matrix.random(100, 2, 0, 0.2).toArray()
		x.push([10, 10])
		const y = model.predict(x)
		for (let i = 0; i < y.length - 1; i++) {
			expect(y[i]).toBe(false)
		}
		expect(y[y.length - 1]).toBe(true)
	})

	test('small data', () => {
		const model = new Thompson(1)
		const x = Matrix.random(2, 2, 0, 0.2).toArray()
		const y = model.predict(x)
		expect(y).toEqual([false, false])
	})
})
