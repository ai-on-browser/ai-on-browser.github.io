import { GBRBM, RBM } from '../../../lib/model/rbm.js'
import Matrix from '../../../lib/util/matrix.js'

describe('reconstruct RBM', () => {
	test('default', { retry: 5 }, () => {
		const model = new RBM(10)
		const x = [
			[1, 1, 1, 1, 0, 0, 0],
			[0, 0, 0, 0, 1, 1, 1],
		]
		model.fit(x)
		const oldenergy = model.energy(x[0], model._h([x[0]], false)[0])
		for (let i = 0; i < 10000; i++) {
			model.fit(x)
		}
		const newenergy = model.energy(x[0], model._h([x[0]], false)[0])
		expect(newenergy).toBeLessThanOrEqual(oldenergy)
		const y = model.predict([
			[1, 0, 1, 1, 0, 0, 0],
			[0, 1, 0, 0, 1, 1, 1],
		])
		expect(y).toEqual(x)
	})

	test('k=2', { retry: 5 }, () => {
		const model = new RBM(10)
		model._k = 2
		const x = [
			[1, 1, 1, 1, 0, 0, 0],
			[0, 0, 0, 0, 1, 1, 1],
		]
		model.fit(x)
		const oldenergy = model.energy(x[0], model._h([x[0]], false)[0])
		for (let i = 0; i < 10000; i++) {
			model.fit(x)
		}
		const newenergy = model.energy(x[0], model._h([x[0]], false)[0])
		expect(newenergy).toBeLessThanOrEqual(oldenergy)
		const y = model.predict([
			[1, 0, 1, 1, 0, 0, 0],
			[0, 1, 0, 0, 1, 1, 1],
		])
		expect(y).toEqual(x)
	})
})

test('reconstruct GBRBM', { retry: 5 }, () => {
	const model = new GBRBM(10)
	const x = Matrix.randn(50, 3, 1, 0.3).toArray()
	model.fit(x)
	const oldenergy = model.energy(x[0], model._h([x[0]], false)[0])
	for (let i = 0; i < 1000; i++) {
		model.fit(x)
	}
	const newenergy = model.energy(x[0], model._h([x[0]], false)[0])
	expect(newenergy).toBeLessThanOrEqual(oldenergy)
	const y = Matrix.fromArray(model.predict(x))
	expect(y.mean()).toBeCloseTo(1, 0)
	expect(y.variance()).toBeCloseTo(0.3, 0)
})
