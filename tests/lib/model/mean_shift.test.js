import Matrix from '../../../lib/util/matrix.js'
import MeanShift from '../../../lib/model/mean_shift.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test('clustering', () => {
	const model = new MeanShift(3, 1)
	expect(model.h).toBe(3)
	const n = 50
	const x = Matrix.concat(
		Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
		Matrix.randn(n, 2, [0, 5], 0.1)
	).toArray()

	model.init(x)
	for (let i = 0; i < 10; i++) {
		model.fit()
	}
	const y = model.predict()
	expect(y).toHaveLength(x.length)
	expect(model.categories).toBe(3)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})

test('no data', () => {
	const model = new MeanShift(3, 1)

	model.init([])
	model.fit()
	const y = model.predict()
	expect(y).toEqual([])
})
