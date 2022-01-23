import Matrix from '../../../lib/util/matrix.js'
import OtsusThresholding from '../../../lib/model/otsu.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test('clustering', () => {
	const model = new OtsusThresholding()
	const n = 50
	const x = Matrix.randn(n, 1, 0, 0.1).concat(Matrix.randn(n, 1, 5, 0.1)).value

	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})
