import Thompson from '../../../lib/model/thompson.js'

describe('anomaly detection', () => {
	test('default', () => {
		const model = new Thompson(1)
		const x = []
		for (let i = 0; i < 100; i++) {
			x[i] = Math.random() * 0.2
		}
		x.push(10)
		const y = model.predict(x)
		for (let i = 0; i < y.length - 1; i++) {
			expect(y[i]).toBe(false)
		}
		expect(y[y.length - 1]).toBe(true)
	})

	test('small data', () => {
		const model = new Thompson(1)
		const x = [Math.random(), Math.random()]
		const y = model.predict(x)
		expect(y).toEqual([false, false])
	})

	test('no outlier', () => {
		const model = new Thompson(1)
		const x = []
		for (let i = 0; i < 10000; i++) {
			x.push(i)
		}
		const y = model.predict(x)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBe(false)
		}
	})

	test('p is 1', () => {
		const model = new Thompson(3)
		const y = model.predict([0, 1, 2])
		expect(y).toEqual([false, false, false])
	})

	test('p is over 0.5', () => {
		const model = new Thompson(2)
		const y = model.predict([0, 1, 2])
		expect(y).toEqual([true, false, false])
	})

	test('n is 2', () => {
		const model = new Thompson(2)
		const y = model.predict([0, 1, 2, 3])
		expect(y).toEqual([true, false, false, false])
	})
})
