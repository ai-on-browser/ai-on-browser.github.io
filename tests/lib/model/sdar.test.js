import SDAR from '../../../lib/model/sdar.js'

describe('probability', () => {
	test('linear', () => {
		const model = new SDAR(10, 0.1)
		const x = []
		for (let i = 0; i < 100; i++) {
			x[i] = i / 10
		}

		const prob = model.probability(x)
		expect(prob).toHaveLength(100)
	})
})

describe('predict', () => {
	test('linear', () => {
		const model = new SDAR(10, 0.1)
		const x = []
		for (let i = 0; i < 1000; i++) {
			x[i] = i / 10
		}

		const future = model.predict(x, 20)
		expect(future).toHaveLength(20)
	})

	test('sin', () => {
		const model = new SDAR(50)
		const x = []
		for (let i = 0; i < 1000; i++) {
			x[i] = Math.sin(i / 10)
		}

		const future = model.predict(x, 50)
		expect(future).toHaveLength(50)
	})
})
