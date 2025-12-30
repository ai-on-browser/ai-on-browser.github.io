import MaximumLikelihoodEstimator from '../../../lib/model/maximum_likelihood.js'
import Matrix from '../../../lib/util/matrix.js'

test('density estimation', { retry: 3 }, () => {
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

test('invalid distribution', () => {
	const model = new MaximumLikelihoodEstimator('hoge')
	const x = Matrix.randn(50, 2, 0, 0.1).toArray()
	model.fit(x)
	expect(() => model.predict(x)).toThrow('Invalid distribution hoge.')
})
