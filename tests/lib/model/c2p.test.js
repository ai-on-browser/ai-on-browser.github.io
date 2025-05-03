import Matrix from '../../../lib/util/matrix.js'
import C2P from '../../../lib/model/c2p.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

describe('clustering', () => {
	test('default', () => {
		const model = new C2P(10, 50)
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

	test('no cutoff', () => {
		const model = new C2P(10, 50)
		model._cutoff_scale = 0
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
})
