import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import ProjectionPursuit from '../../../lib/model/ppr.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test.each([undefined, 5])('fit %p', r => {
	const model = new ProjectionPursuit(r)
	const x = Matrix.random(50, 2, -2, 2).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [Math.exp(-(x[i][0] ** 2 + x[i][1] ** 2) / 2) + (Math.random() - 0.5) / 100]
	}
	for (let i = 0; i < 100; i++) {
		model.fit(x, t)
	}
	const y = model.predict(x)
	const err = rmse(y, t)[0]
	expect(err).toBeLessThan(0.5)
})
