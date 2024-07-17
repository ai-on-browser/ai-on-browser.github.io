import Matrix from '../../../lib/util/matrix.js'
import DiSH from '../../../lib/model/dish.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test('clustering', () => {
	const model = new DiSH(5, 2.0)
	const n = 50
	const x = Matrix.concat(Matrix.randn(n, 6, 0, 0.1), Matrix.randn(n, 6, 5, 0.1)).toArray()

	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})
