import { Matrix } from '../../../lib/util/math.js'
import MinmaxNormalization from '../../../lib/model/minmax.js'

test('fit', () => {
	const model = new MinmaxNormalization()
	const x = Matrix.randn(50, 2, 1, 0.2)
	model.fit(x.toArray())
	const y = model.predict(x.toArray())

	const xmin = x.min(0).value
	const xmax = x.max(0).value
	const min = Array(2).fill(Infinity)
	const max = Array(2).fill(-Infinity)
	for (let i = 0; i < x.rows; i++) {
		for (let k = 0; k < x.cols; k++) {
			expect(y[i][k]).toBeCloseTo((x.at(i, k) - xmin[k]) / (xmax[k] - xmin[k]))
			min[k] = Math.min(min[k], y[i][k])
			max[k] = Math.max(max[k], y[i][k])
		}
	}
	for (let k = 0; k < min.length; k++) {
		expect(min[k]).toBeCloseTo(0)
	}
	for (let k = 0; k < max.length; k++) {
		expect(max[k]).toBeCloseTo(1)
	}
})
