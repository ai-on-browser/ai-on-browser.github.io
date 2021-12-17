import { RandomForestClassifier, RandomForestRegressor } from '../../../lib/model/random_forest.js'
import { Matrix } from '../../../lib/util/math.js'

describe('classifier', () => {
	test.each(['CART', 'ID3'])('method %s', method => {
		const model = new RandomForestClassifier(10, 0.8, method)
		const x = Matrix.randn(20, 10).toArray()
		const t = []
		for (let i = 0; i < 20; i++) {
			t[i] = Math.floor(i / 5)
		}
		model.init(x, t)
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
		let acc = 0
		for (let i = 0; i < t.length; i++) {
			if (y[i] === t[i]) {
				acc++
			}
		}
		expect(acc / y.length).toBeGreaterThan(0.95)
	})
})

describe('regression', () => {
	test('fit', () => {
		const model = new RandomForestRegressor(100, 0.8)
		const x = Matrix.random(20, 10, -2, 2).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = x[i][0] + x[i][1] + (Math.random() - 0.5) / 10
		}
		model.init(x, t)
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		const y = model.predict(x)
		let err = 0
		for (let i = 0; i < t.length; i++) {
			err += (y[i] - t[i]) ** 2
		}
		expect(Math.sqrt(err / t.length)).toBeLessThan(0.5)
	})
})
