import Matrix from '../../../lib/util/matrix.js'
import BIRCH from '../../../lib/model/birch.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

describe('clustering', () => {
	test('parameters', { retry: 3 }, () => {
		const model = new BIRCH(null, 20, 0.2, 10000)
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.random(n, 2, 0, 1), Matrix.random(n, 2, 3, 4)),
			Matrix.random(n, 2, 6, 7)
		).toArray()

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

	test('default', { retry: 3 }, () => {
		const model = new BIRCH()
		const n = 50
		const x = Matrix.concat(Matrix.random(n, 2, 0, 1), Matrix.random(n, 2, 3, 4)).toArray()

		model.fit(x)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.7)
	})

	test('single cluster', () => {
		const model = new BIRCH(null, 100, 1)
		const n = 50
		const x = Matrix.random(n, 2, 0, 1).toArray()

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
})
