import GeneralizedESD from '../../../lib/model/generalized_esd.js'

describe('anomaly detection', () => {
	test.each([1, 2, 3])('r: %d', k => {
		const model = new GeneralizedESD(1, k)
		const x = []
		for (let i = 0; i < 100; i++) {
			x[i] = Math.random() * 0.2
		}
		x.push(10)
		const y = model.predict(x)
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
		const x = [0.15, 0.17, 0.1, 0.15, 0.19, 10]
		const y = model.predict(x)
		expect(y[5]).toBe(true)
	})

	test('n is 1', () => {
		const model = new GeneralizedESD(3, 1)
		const y = model.predict([0, 1, 5])
		expect(y).toEqual([false, false, true])
	})

	test('n is 2', () => {
		const model = new GeneralizedESD(2, 1)
		const y = model.predict([0, 1, 2, 5])
		expect(y).toEqual([false, false, false, true])
	})

	test('p is 1', () => {
		const model = new GeneralizedESD(6, 1)
		const y = model.predict([0, 1, 5])
		expect(y).toEqual([false, false, true])
	})

	test('p is over 0.5', () => {
		const model = new GeneralizedESD(5, 1)
		const y = model.predict([0, 1, 5])
		expect(y).toEqual([false, false, true])
	})
})
