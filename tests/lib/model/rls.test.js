import { Matrix } from '../../../lib/util/math.js'
import RecursiveLeastSquares from '../../../lib/model/rls.js'

test('default', () => {
	const model = new RecursiveLeastSquares()
})

test('fit', () => {
	const model = new RecursiveLeastSquares()
	const x = Matrix.randn(50, 2, 0, 5).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = x[i][0] + x[i][1] + (Math.random() - 0.5) / 10
	}
	model.fit(x, t)
	const y = model.predict(x)
	let err = 0
	for (let i = 0; i < t.length; i++) {
		err += (y[i] - t[i]) ** 2
	}
	expect(Math.sqrt(err / t.length)).toBeLessThan(0.5)
})
