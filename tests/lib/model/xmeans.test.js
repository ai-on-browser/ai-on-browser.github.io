import Matrix from '../../../lib/util/matrix.js'
import XMeans from '../../../lib/model/xmeans.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test('predict', () => {
	const model = new XMeans()
	const n = 50
	const x = Matrix.randn(n, 2, 0, 0.1)
		.concat(Matrix.randn(n, 2, [2, 5], 0.1))
		.concat(Matrix.randn(n, 2, [-2, 5], 0.1))
		.toArray()

	for (let i = 0; i < 20; i++) {
		model.fit(x)
	}
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})
