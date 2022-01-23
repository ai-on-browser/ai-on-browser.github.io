import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import GaussianProcess from '../../../lib/model/gaussian_process.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('regression', () => {
	const model = new GaussianProcess()
	const x = Matrix.random(50, 2, -2, 2).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
	}
	model.init(x, t)
	for (let i = 0; i < 10; i++) {
		model.fit(0.001)
	}
	const y = model.predict(x)
	const err = rmse(y, t)[0]
	expect(err).toBeLessThan(0.5)
})
