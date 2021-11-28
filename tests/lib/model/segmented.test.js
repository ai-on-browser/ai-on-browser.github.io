import { Matrix } from '../../../lib/util/math.js'
import SegmentedRegression from '../../../lib/model/segmented.js'

test('fit', () => {
	const model = new SegmentedRegression(3)
	const x = Matrix.randn(50, 1, 0, 5).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + (Math.random() - 0.5) / 10]
	}
	model.fit(x, t)
	const y = model.predict(x)
	let err = 0
	for (let i = 0; i < t.length; i++) {
		err += (y[i][0] - t[i][0]) ** 2
	}
	expect(Math.sqrt(err / t.length)).toBeLessThan(0.5)
})
