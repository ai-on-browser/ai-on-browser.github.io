import { Matrix } from '../../../lib/util/math.js'
import IsotonicRegression from '../../../lib/model/isotonic.js'

test('fit', () => {
	const model = new IsotonicRegression()
	const x = Matrix.random(50, 1, 0, 5).value
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = x[i] + (Math.random() - 0.5) / 10
	}
	model.fit(x, t)
	const y = model.predict(x)
	let err = 0
	for (let i = 0; i < t.length; i++) {
		err += (y[i] - t[i]) ** 2
	}
	expect(Math.sqrt(err / t.length)).toBeLessThan(0.5)
})
