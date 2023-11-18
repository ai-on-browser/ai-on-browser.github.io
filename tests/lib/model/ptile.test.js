import Matrix from '../../../lib/util/matrix.js'
import PTile from '../../../lib/model/ptile.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

describe('clustering', () => {
	test.each([undefined, 0.5])('%p', p => {
		const model = new PTile(p)
		const n = 50
		const x = Matrix.concat(Matrix.randn(n, 1, 0, 0.1), Matrix.randn(n, 1, 5, 0.1)).value

		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})

	test('0', () => {
		const model = new PTile(0)
		const n = 50
		const x = Matrix.concat(Matrix.randn(n, 1, 0, 0.1), Matrix.randn(n, 1, 5, 0.1)).value

		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		for (let i = 0; i < x.length; i++) {
			expect(y[i]).toBe(1)
		}
	})

	test('1', () => {
		const model = new PTile(1)
		const n = 50
		const x = Matrix.concat(Matrix.randn(n, 1, 0, 0.1), Matrix.randn(n, 1, 5, 0.1)).value
		const max = x.reduce((m, v) => Math.max(m, v))

		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		for (let i = 0; i < x.length; i++) {
			expect(y[i]).toBe(x[i] === max ? 1 : 0)
		}
	})
})
