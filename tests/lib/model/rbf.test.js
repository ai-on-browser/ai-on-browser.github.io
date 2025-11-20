import Matrix from '../../../lib/util/matrix.js'
import RadialBasisFunctionNetwork from '../../../lib/model/rbf.js'

import { rmse } from '../../../lib/evaluate/regression.js'

describe.each([
	undefined,
	'linear',
	'gaussian',
	'multiquadric',
	'inverse quadratic',
	'inverse multiquadric',
	'thin plate',
	'bump',
])('fit %s', rbf => {
	test('default', () => {
		const model = new RadialBasisFunctionNetwork(rbf)
		const x = Matrix.randn(50, 2, 0, 5).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
		}
		model.fit(x, t)
		const y = model.predict(x)
		const err = rmse(
			y,
			t.map(v => v[0])
		)
		expect(err).toBeLessThan(0.5)
	})

	test('l 0.01', { retry: 5 }, () => {
		const model = new RadialBasisFunctionNetwork(rbf, undefined, 0.01)
		const x = Matrix.random(50, 2, 0, 3).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [Math.sin(x[i][0] + x[i][1])]
		}
		model.fit(x, t)
		const y = model.predict(x)
		const err = rmse(
			y,
			t.map(v => v[0])
		)
		expect(err).toBeLessThan(0.5)
	})
})
