import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import { LSIF } from '../../../lib/model/lsif.js'

test('LSIF', () => {
	const sigmas = []
	const lambdas = []
	for (let i = -3; i <= 3; i += 1) {
		sigmas.push(10 ** i)
		lambdas.push(10 ** i)
	}
	const model = new LSIF(sigmas, lambdas, 5, 100)

	const x1 = Matrix.randn(300, 1, 0).toArray()
	const x2 = Matrix.randn(200, 1, 0).toArray()
	model.fit(x1, x2)

	const r = model.predict(x2)
	for (let i = 0; i < x2.length; i++) {
		expect(r[i]).toBeCloseTo(1, 0)
	}
})
