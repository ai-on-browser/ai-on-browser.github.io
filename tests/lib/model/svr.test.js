import { jest } from '@jest/globals'
jest.retryTimes(3)

import { Matrix } from '../../../lib/util/math.js'
import SVR from '../../../lib/model/svr.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test.each([
	['gaussian', [2]],
	['linear', []],
])('fit %s %p', (kernel, args) => {
	const model = new SVR(kernel, args)
	const x = Matrix.random(50, 2, -2, 2).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
	}
	model.init(x, t)
	for (let i = 0; i < 100; i++) {
		model.fit()
	}
	const y = model.predict(x)
	const err = rmse(
		y,
		t.map(v => v[0])
	)
	expect(err).toBeLessThan(0.5)
})
