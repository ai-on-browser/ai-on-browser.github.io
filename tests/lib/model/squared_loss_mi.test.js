import { jest } from '@jest/globals'
jest.retryTimes(5)

import Matrix from '../../../lib/util/matrix.js'
import SquaredLossMICPD from '../../../lib/model/squared_loss_mi.js'
import { uLSIF } from '../../../lib/model/ulsif.js'

test('anomaly detection', () => {
	const sigmas = []
	const lambdas = []
	for (let i = -3; i <= 3; i += 0.5) {
		sigmas.push(10 ** i)
		lambdas.push(10 ** i)
	}
	const ulsif = new uLSIF(sigmas, lambdas, 50)

	const w = 10
	const model = new SquaredLossMICPD(ulsif, w)
	const n = 50
	const x = Matrix.concat(Matrix.random(n, 1, 0, 1), Matrix.random(n, 1, 10, 11)).value
	const p = model.predict(x)

	const threshold = 0.1
	const range = w * 2
	let c = 0
	for (let i = 0; i < p.length; i++) {
		if (i <= n && n - range <= i) {
			if (p[i] >= threshold) {
				c++
			}
			continue
		}
		expect(p[i]).toBeLessThan(threshold)
	}
	expect(c).toBeGreaterThan(0)
})
