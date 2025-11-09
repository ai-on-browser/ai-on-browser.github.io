import Matrix from '../../../lib/util/matrix.js'
import MultivariateKernelDensityEstimator from '../../../lib/model/multivariate_kernel_density_estimator.js'

import { correlation } from '../../../lib/evaluate/regression.js'

describe('density estimation', () => {
	test.each([undefined, 'silverman', 'scott'])('%j', { retry: 3 }, method => {
		const model = new MultivariateKernelDensityEstimator(method)
		const sgm = Matrix.fromArray([
			[0.1, 0],
			[0, 0.5],
		])
		const x = Matrix.randn(500, 2, 0, sgm.toArray()).toArray()

		model.fit(x)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const p = []
		for (let i = 0; i < x.length; i++) {
			const pi =
				Math.exp(-x[i].reduce((s, v, d) => s + v ** 2 / sgm.at(d, d), 0) / 2) /
				Math.sqrt((2 * Math.PI) ** 2 * sgm.det())
			p[i] = pi / 2
		}
		const corr = correlation(y, p)
		expect(corr).toBeGreaterThan(0.9)
	})
})
