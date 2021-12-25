import { Matrix } from '../../../lib/util/math.js'
import MaximumLikelihoodEstimator from '../../../lib/model/maximum_likelihood.js'

import { correlation } from '../../../lib/evaluate/regression.js'

test('density estimation', () => {
	const model = new MaximumLikelihoodEstimator()
	const n = 10000
	const x = Matrix.randn(n, 2, 0, 0.1).toArray()

	model.fit(x)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	for (let i = 0; i < x.length; i++) {
		const p = Math.exp(-x[i].reduce((s, v) => s + v ** 2, 0) / (2 * 0.1)) / (2 * Math.PI * 0.1)
		expect(y[i]).toBeCloseTo(p, 1)
	}
})