import { Matrix } from '../../../lib/util/math.js'
import ALMA from '../../../lib/model/alma.js'

test('default', () => {
	const model = new ALMA()
	expect(model._p).toBe(2)
	expect(model._alpha).toBe(1)
	expect(model._b).toBe(1)
	expect(model._c).toBe(1)
})

test('fit', () => {
	const model = new ALMA()
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
		if (y[i] === t[i]) {
			acc++
		}
	}
	expect(acc / y.length).toBeGreaterThan(0.95)
})
