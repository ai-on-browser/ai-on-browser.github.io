import Matrix from '../../../lib/util/matrix.js'
import {
	SingleLinkageAgglomerativeClustering,
	CompleteLinkageAgglomerativeClustering,
	GroupAverageAgglomerativeClustering,
	WardsAgglomerativeClustering,
	CentroidAgglomerativeClustering,
	WeightedAverageAgglomerativeClustering,
	MedianAgglomerativeClustering,
} from '../../../lib/model/agglomerative.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

describe.each([
	SingleLinkageAgglomerativeClustering,
	CompleteLinkageAgglomerativeClustering,
	GroupAverageAgglomerativeClustering,
	WardsAgglomerativeClustering,
	CentroidAgglomerativeClustering,
	WeightedAverageAgglomerativeClustering,
	MedianAgglomerativeClustering,
])('clustering %p', agglomerativeCls => {
	test.each([undefined, 'euclid', 'manhattan', 'chebyshev'])('metric %s', metric => {
		const model = new agglomerativeCls(metric)
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
			Matrix.randn(n, 2, [0, 5], 0.1)
		).toArray()

		model.fit(x)
		const y = model.predict(3)
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})
})
