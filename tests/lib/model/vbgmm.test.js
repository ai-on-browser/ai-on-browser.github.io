import { randIndex } from '../../../lib/evaluate/clustering.js'
import VBGMM from '../../../lib/model/vbgmm.js'
import Matrix from '../../../lib/util/matrix.js'

describe('clustering', () => {
	test('many data', { retry: 3 }, () => {
		const model = new VBGMM(0.001, 0.001, 5)
		const n = 20
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)).toArray()

		model.init(x)
		for (let i = 0; i < 2; i++) {
			model.fit()
		}
		expect(model.means.sizes).toEqual([5, 2])
		expect(model.covs).toHaveLength(5)
		for (let i = 0; i < model.covs.length; i++) {
			expect(model.covs[i].sizes).toEqual([2, 2])
		}
		expect(model.effectivity).toHaveLength(5)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})

	test('few data', () => {
		const model = new VBGMM(0.001, 0.001, 1)
		const x = [
			[0, 0],
			[1, 1],
		]

		model.init(x)
		model.fit()

		const y = model.predict(x)
		expect(y).toEqual([0, 0])
	})

	test('single data', () => {
		const model = new VBGMM(0.001, 0.001, 1)
		const x = [[0, 0]]

		model.init(x)
		model.fit()

		const y = model.predict(x)
		expect(y).toEqual([0])
	})
})
