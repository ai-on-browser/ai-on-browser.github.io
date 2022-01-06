import { jest } from '@jest/globals'
jest.retryTimes(5)

import { Matrix } from '../../../lib/util/math.js'
import NICE from '../../../lib/model/nice.js'

test('generate', () => {
	const model = new NICE(5, 'adam')
	const xmean = [4, -2, -5]
	const xvar = 2
	const x = Matrix.randn(2000, 3, [4, -2, -5], 2).toArray()
	for (let i = 0; i < 100; i++) {
		model.fit(x, 1, 0.001, 10)
	}

	const z = model.predict(x)
	expect(z).toHaveLength(x.length)
	expect(z[0]).toHaveLength(x[0].length)
	const zmean = Matrix.fromArray(z).mean(0).value
	const zvar = Matrix.fromArray(z).variance(0).value
	for (let i = 0; i < 3; i++) {
		expect(zmean[i]).toBeCloseTo(0, 0)
		expect(zvar[i]).toBeCloseTo(1, -0.5)
	}
	const x2 = model.generate(z)
	expect(x2).toHaveLength(z.length)
	expect(x2[0]).toHaveLength(z[0].length)
	for (let i = 0; i < x.length; i++) {
		for (let j = 0; j < x[i].length; j++) {
			expect(x2[i][j]).toBeCloseTo(x[i][j])
		}
	}

	const y = Matrix.randn(10000, 3, 0, 1).toArray()
	const p = model.generate(y)
	expect(p).toHaveLength(y.length)
	expect(p[0]).toHaveLength(y[0].length)
	const pmean = Matrix.fromArray(p).mean(0).value
	const pvar = Matrix.fromArray(p).variance(0).value
	for (let i = 0; i < 3; i++) {
		expect(pmean[i]).toBeCloseTo(xmean[i], 0)
		expect(pvar[i]).toBeCloseTo(xvar, -0.5)
	}
})
