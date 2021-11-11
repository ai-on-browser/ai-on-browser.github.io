import { Matrix } from '../../../lib/util/math.js'
import { LinearDiscriminant, FishersLinearDiscriminant, MulticlassLinearDiscriminant } from '../../../lib/model/lda.js'

describe('classification', () => {
	test('lda', () => {
		const model = new LinearDiscriminant()
		const x = Matrix.randn(50, 2, 0, 0.2).concat(Matrix.randn(50, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / 50) * 2 - 1
		}
		model.init(x, t)
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		const y = model.predict(x)
		let acc = 0
		for (let i = 0; i < t.length; i++) {
			if (Math.sign(y[i]) === Math.sign(t[i])) {
				acc++
			}
		}
		expect(acc / y.length).toBeGreaterThan(0.95)
	})

	test('fda', () => {
		const model = new FishersLinearDiscriminant()
		const x = Matrix.randn(50, 2, 0, 0.2).concat(Matrix.randn(50, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / 50) * 2 - 1
		}
		model.init(x, t)
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		const y = model.predict(x)
		let acc = 0
		for (let i = 0; i < t.length; i++) {
			if (Math.sign(y[i]) === Math.sign(t[i])) {
				acc++
			}
		}
		expect(acc / y.length).toBeGreaterThan(0.95)
	})

	test('multiclass', () => {
		const model = new MulticlassLinearDiscriminant()
		const x = Matrix.randn(50, 2, 0, 0.2).concat(Matrix.randn(50, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / 50)
		}

		for (let i = 0; i < 100; i++) {
			model.fit(x, t)
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
