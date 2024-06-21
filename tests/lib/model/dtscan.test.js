import Matrix from '../../../lib/util/matrix.js'
import DTSCAN from '../../../lib/model/dtscan.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

describe('clustering', () => {
	test('default', () => {
		const model = new DTSCAN()
		const n = 200
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
			Matrix.randn(n, 2, [-5, 5], 0.1)
		).toArray()
		x[0] = [0, -10]

		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.85)
	})

	test('invalid dimension', () => {
		const model = new DTSCAN()
		const x = [
			[1, 1, 1],
			[0, 0, 0],
		]

		expect(() => model.predict(x)).toThrow('Only 2d data can apply for current implementation.')
	})
})
