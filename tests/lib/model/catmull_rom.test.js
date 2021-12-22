import { Matrix } from '../../../lib/util/math.js'
import { CatmullRomSplines, CentripetalCatmullRomSplines } from '../../../lib/model/catmull_rom.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('CatmullRomSplines', () => {
	const model = new CatmullRomSplines()
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

test('CentripetalCatmullRomSplines', () => {
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
