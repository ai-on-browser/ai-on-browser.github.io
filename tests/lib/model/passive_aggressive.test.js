import { Matrix } from '../../../lib/util/math.js'
import PA from '../../../lib/model/passive_aggressive'

describe.each([0, 1, 2])('version %i', v => {
	test('default', () => {
		const model = new PA(v)
		expect(model._c).toBe(0.1)
	})

	test('fit', () => {
		const model = new PA(v)
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
})
