import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'
import GPLVM from '../../../lib/model/gplvm.js'
import Matrix from '../../../lib/util/matrix.js'

describe('dimension reduction', () => {
	test('default', { timeout: 10000 }, () => {
		const model = new GPLVM(3, 1)
		const x = Matrix.randn(50, 10, 0, Matrix.diag([1.0, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 1.0, 0.5])).toArray()

		model.init(x)
		const llh = model.llh()
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		expect(model.llh()).toBeLessThan(llh)
		const y = model.predict()
		const q = coRankingMatrix(x, y, 30, 20)
		expect(q).toBeGreaterThan(0.9)
	})

	test('kernel with params', { timeout: 10000 }, () => {
		const model = new GPLVM(3, 1, 1, 0.005, 0.1, { name: 'gaussian', a: 0.2, b: 1 })
		const x = Matrix.randn(50, 10, 0, Matrix.diag([1.0, 0.1, 1.0, 0.1, 0.1, 0.1, 0.1, 0.1, 1.0, 0.1])).toArray()

		model.init(x)
		const llh = model.llh()
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		expect(model.llh()).toBeLessThan(llh)
		const y = model.predict()
		const q = coRankingMatrix(x, y, 30, 20)
		expect(q).toBeGreaterThan(0.9)
	})
})

test('reconstruct', { timeout: 10000 }, () => {
	const model = new GPLVM(3, 1)
	const x = Matrix.randn(50, 10, 0, Matrix.diag([1.0, 0.1, 1.0, 0.1, 0.1, 0.1, 0.1, 0.1, 1.0, 0.1])).toArray()

	model.init(x)
	for (let i = 0; i < 100; i++) {
		model.fit()
	}

	const z = Matrix.randn(10, 3).toArray()
	const y = model.reconstruct(z)
	expect(y).toHaveLength(z.length)
	for (let i = 0; i < z.length; i++) {
		expect(y[i]).toHaveLength(10)
	}
})
