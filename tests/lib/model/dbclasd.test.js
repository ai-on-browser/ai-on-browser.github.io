import { randIndex } from '../../../lib/evaluate/clustering.js'
import DBCLASD from '../../../lib/model/dbclasd.js'
import Matrix from '../../../lib/util/matrix.js'

test('clustering', { retry: 3 }, () => {
	const model = new DBCLASD()
	const n = 100
	const x = Matrix.concat(
		Matrix.concat(Matrix.randn(n, 5, 0, 0.2), Matrix.randn(n, 5, 5, 0.2)),
		Matrix.randn(n, 5, [0, 5, -5, 5, 0], 0.2)
	).toArray()

	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})

test('clustering pass add candidate condition', () => {
	const model = new DBCLASD()
	const x = [
		[-0.4, -0.52],
		[0.01, 0.02],
		[0.17, -0.86],
		[-0.19, -0.17],
		[0.02, 0.12],
		[-0.33, -0.74],
		[1.03, 0.84],
		[-0.2, 0.18],
		[0.21, -0.8],
		[-0.36, 0.11],
		[0.04, -0.01],
		[-0.23, -0.23],
		[-0.15, 0.22],
		[-0.24, 0],
		[0.16, -0.76],
		[-0.21, 0.27],
		[-0.12, -0.53],
		[0.03, 0.01],
		[0, 0.13],
		[-0.28, 0.2],
		[-0.07, 0.49],
		[-0.11, -0.44],
		[-0.24, -0.04],
		[0.03, -0.57],
		[-0.2, -0.32],
		[-0.79, 0.28],
		[-0.16, -0.15],
		[-0.16, -0.56],
		[-0.23, -0.02],
		[-0.06, -0.08],
		[-0.66, -0.4],
		[-0.28, -0.7],
		[-0.45, 0.08],
	]

	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const t = Array.from({ length: x.length }, () => 0)
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})
