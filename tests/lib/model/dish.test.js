import { randIndex } from '../../../lib/evaluate/clustering.js'
import DiSH from '../../../lib/model/dish.js'
import Matrix from '../../../lib/util/matrix.js'

describe('clustering', () => {
	test('default', () => {
		const model = new DiSH(5, 2.0)
		const n = 50
		const x = Matrix.concat(Matrix.randn(n, 6, 0, 0.1), Matrix.randn(n, 6, 5, 0.1)).toArray()

		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})

	test('small near size', () => {
		const model = new DiSH(5, 2.0)
		const x = [
			[0.19, -0.23, -0.17],
			[0.23, 0.41, 0],
			[-0.22, -0.49, 0.51],
			[0.05, -0.23, -0.22],
			[0.39, -0.23, 0.12],
			[0, -0.01, -0.51],
			[0.33, -0.18, -0.41],
			[-0.15, 0.22, -0.21],
			[0.03, -0.36, 0.36],
			[-0.22, -0.33, -0.12],
			[5.05, 5.06, 4.79],
			[5.26, 4.98, 4.89],
			[4.89, 4.86, 4.51],
			[5.5, 5.24, 4.33],
			[5.3, 4.64, 3.76],
			[5, 5.48, 4.85],
			[4.88, 5.17, 4.57],
			[4.73, 5.1, 5.81],
			[4.5, 4.88, 4.91],
			[4.57, 4.82, 5.08],
		]

		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / (x.length / 2))
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})

	test('some data has no neighbor', () => {
		const model = new DiSH(2, 10.0)
		const x = [
			[0, 0],
			[1, 1],
			[0, 1],
			[100, 100],
		]

		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const ri = randIndex(y, [0, 0, 0, 1])
		expect(ri).toBeGreaterThan(0.9)
	})
})
