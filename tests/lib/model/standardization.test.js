import { Matrix } from '../../../lib/util/math.js'
import Standardization from '../../../lib/model/standardization.js'

test('fit', () => {
	const model = new Standardization()
	const x = Matrix.randn(50, 2, 1, 0.2).toArray()
	model.fit(x)
	const y = model.predict(x)

	const s = Array(2).fill(0)
	const v = Array(2).fill(0)
	for (let i = 0; i < x.length; i++) {
		for (let k = 0; k < x[i].length; k++) {
			s[k] += y[i][k]
			v[k] += y[i][k] ** 2
		}
	}
	for (let k = 0; k < s.length; k++) {
		expect(s[k] / x.length).toBeCloseTo(0)
	}
	for (let k = 0; k < v.length; k++) {
		expect(v[k] / x.length).toBeCloseTo(1)
	}
})
