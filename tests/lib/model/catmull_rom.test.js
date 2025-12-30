import { rmse } from '../../../lib/evaluate/regression.js'
import { CatmullRomSplines, CentripetalCatmullRomSplines } from '../../../lib/model/catmull_rom.js'
import Matrix from '../../../lib/util/matrix.js'

describe('CatmullRomSplines', () => {
	test('random', () => {
		const model = new CatmullRomSplines()
		const x = Matrix.random(50, 1, -2, 2).value
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.sin(x[i])
		}
		model.fit(x, t)

		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t[i])
		}

		const x0 = Matrix.random(100, 1, -2, 2).value
		const y0 = model.predict(x0)
		const err = rmse(y0, x0.map(Math.sin))
		expect(err).toBeLessThan(0.1)
	})

	test('cover all pattern', { retry: 5 }, () => {
		const model = new CatmullRomSplines()
		const x = [-0.43, 1.43, -1.45]
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.sin(x[i])
		}
		model.fit(x, t)

		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t[i])
		}

		const x0 = Matrix.random(100, 1, -2, 2).value
		const y0 = model.predict(x0)
		const err = rmse(y0, x0.map(Math.sin))
		expect(err).toBeLessThan(0.1)
	})
})

describe('CentripetalCatmullRomSplines', () => {
	test('default', () => {
		const model = new CentripetalCatmullRomSplines()
		const x = Matrix.random(20, 1, -2, 2).value
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.sin(x[i])
		}
		model.fit(x, t)

		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t[i])
		}

		const x0 = Matrix.random(100, 1, -2, 2).value
		const y0 = model.predict(x0)
		const err = rmse(y0, x0.map(Math.sin))
		expect(err).toBeLessThan(0.1)
	})

	test('predict second largest value', () => {
		const model = new CentripetalCatmullRomSplines()
		const x = [0, 2]
		const t = [0, 1]
		model.fit(x, t)

		const y = model.predict([1])
		expect(y[0]).toBeCloseTo(0.5)
	})
})
