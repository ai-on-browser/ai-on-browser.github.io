import { jest } from '@jest/globals'
jest.retryTimes(3)

import { Matrix } from '../../../lib/util/math.js'
import ProjectionPursuit from '../../../lib/model/ppr.js'

test('fit', () => {
	const model = new ProjectionPursuit(5)
	const x = Matrix.random(50, 2, -2, 2).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [Math.exp(-(x[i][0] ** 2 + x[i][1] ** 2) / 2) + (Math.random() - 0.5) / 100]
	}
	for (let i = 0; i < 100; i++) {
		model.fit(x, t)
	}
	const y = model.predict(x)
	let err = 0
	for (let i = 0; i < t.length; i++) {
		err += (y[i][0] - t[i][0]) ** 2
	}
	expect(Math.sqrt(err / t.length)).toBeLessThan(0.5)
})
