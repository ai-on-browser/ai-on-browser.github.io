import Matrix from '../../../lib/util/matrix.js'
import ROCK from '../../../lib/model/rock.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

describe('clustering', () => {
	test('default', () => {
		const model = new ROCK(0.5)
		const n = 50
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

	test('many clusters', () => {
		const model = new ROCK(0.5)
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
			Matrix.randn(n, 2, [0, 5], 0.1)
		).toArray()

		model.fit(x)
		const y = model.predict(100)
		expect(y).toHaveLength(x.length)

		const t = new Set()
		for (let i = 0; i < x.length; i++) {
			t.add(y[i])
		}
		expect(t.size).toBe(100)
	})
})
