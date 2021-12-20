import { Matrix } from '../../../lib/util/math.js'
import DIANA from '../../../lib/model/diana.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test('clustering', () => {
	const model = new DIANA()
	const n = 50
	const x = Matrix.randn(n, 2, 0, 0.1).concat(Matrix.randn(n, 2, 5, 0.1)).toArray()

	model.init(x)
	model.fit()
	const y = model.predict()
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})
