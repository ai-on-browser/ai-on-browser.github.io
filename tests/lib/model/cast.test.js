import Matrix from '../../../lib/util/matrix.js'
import CAST from '../../../lib/model/cast.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test('cast', () => {
	const model = new CAST(0.5)
	const n = 50
	const x = Matrix.concat(
		Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
		Matrix.randn(n, 2, [0, 5], 0.1)
	).toArray()

	model.fit(x)
	expect(model.size).toBeGreaterThanOrEqual(3)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})
