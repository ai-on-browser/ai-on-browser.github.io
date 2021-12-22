import { Matrix } from '../../../lib/util/math.js'
import AutomaticThresholding from '../../../lib/model/automatic_thresholding.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test('clustering', () => {
	const model = new AutomaticThresholding(3)
	const n = 50
	const x = Matrix.randn(n, 1, 0, 0.1).concat(Matrix.randn(n, 1, 5, 0.1)).value

	model.fit(x)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})
