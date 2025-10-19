import Matrix from '../../../lib/util/matrix.js'
import CURE from '../../../lib/model/cure.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test('clustering', () => {
	const model = new CURE(10)
	const n = 20
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

test('clustering only one data', () => {
	const model = new CURE(10)
	const x = [[0, 0]]

	model.fit(x)
	const y = model.predict(2)
	expect(y).toHaveLength(x.length)
	expect(y).toEqual([0])
})
