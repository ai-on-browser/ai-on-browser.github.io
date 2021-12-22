import { Matrix } from '../../../lib/util/math.js'
import Standardization from '../../../lib/model/standardization.js'

test('fit', () => {
	const model = new Standardization()
	const x = Matrix.randn(50, 2, 1, 0.2)
	model.fit(x.toArray())
	const y = model.predict(x.toArray())

	const mean = x.mean(0).value
	const std = x.std(0).value
	const s = Array(2).fill(0)
	const v = Array(2).fill(0)
	for (let i = 0; i < x.rows; i++) {
		for (let k = 0; k < x.cols; k++) {
			expect(y[i][k]).toBeCloseTo((x.at(i, k) - mean[k]) / std[k], 1)
			s[k] += y[i][k]
			v[k] += y[i][k] ** 2
		}
	}
	for (let k = 0; k < s.length; k++) {
		expect(s[k] / x.rows).toBeCloseTo(0)
	}
	for (let k = 0; k < v.length; k++) {
		expect(v[k] / x.rows).toBeCloseTo(1)
	}
})
