import Matrix from '../../../lib/util/matrix.js'
import GeneralizedESD from '../../../lib/model/generalized_esd.js'

describe('anomaly detection', () => {
	test.each([1, 2, 3])('r: %d', k => {
		const model = new GeneralizedESD(1, k)
		const x = Matrix.random(100, 2, 0, 0.2).toArray()
		x.push([10, 10])
		const y = model.predict(x, 0.1)
		let c = 0
		for (let i = 0; i < y.length - 1; i++) {
			if (c < k - 1) {
				if (y[i]) {
					c++
				}
				continue
			}
			expect(y[i]).toBe(false)
		}
		expect(y[y.length - 1]).toBe(true)
	})

	test('oidx correction', () => {
		const model = new GeneralizedESD(1, 3)
		const x = [
			[0.06, 0.13],
			[0.01, 0.06],
			[0.1, 0],
			[0.07, 0.01],
			[0.12, 0.15],
			[10, 10],
		]
		const y = model.predict(x, 0.1)
		expect(y[5]).toBe(true)
	})
})
