import { randIndex } from '../../../lib/evaluate/clustering.js'
import DensityPeak from '../../../lib/model/density_peak.js'
import Matrix from '../../../lib/util/matrix.js'

describe.each(Array(1000).fill(0))('clustering', () => {
	test.each([
		undefined,
		'euclid',
		'manhattan',
		'chebyshev',
		(a, b) => a.reduce((s, v, i) => s + Math.exp((v - b[i]) ** 2) - 1, 0),
	])('%s', { retry: 10 }, metric => {
		const model = new DensityPeak(0.5, metric)
		const n = 50
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()

		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.8)
	})
})
