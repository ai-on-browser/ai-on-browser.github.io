import { Matrix } from '../../../lib/util/math.js'
import RadialBasisFunctionNetwork from '../../../lib/model/rbf.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test.each(['linear', 'gaussian', 'multiquadric', 'inverse quadratic', 'inverse multiquadric', 'thin plate', 'bump'])(
	'fit %s',
	rbf => {
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
	}
)
