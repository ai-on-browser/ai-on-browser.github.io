import { Matrix } from '../../../lib/util/math.js'
import CLARANS from '../../../lib/model/clarans.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test('clarans', () => {
	const model = new CLARANS(3)
	const n = 50
	const x = Matrix.randn(n, 2, 0, 0.1)
		.concat(Matrix.randn(n, 2, 5, 0.1))
		.concat(Matrix.randn(n, 2, [0, 5], 0.1))
		.toArray()

	model.init(x)
	for (let i = 0; i < 20; i++) {
		model.fit(10, 100)
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
