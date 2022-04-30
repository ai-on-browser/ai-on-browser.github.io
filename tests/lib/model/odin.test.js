import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import ODIN from '../../../lib/model/odin.js'

test('anomaly detection', () => {
	const model = new ODIN(5, 0)
	const x = Matrix.random(100, 2, 0, 0.2).toArray()
	x.push([10, 10])
	const y = model.predict(x, 0.1)
	for (let i = 0; i < y.length - 1; i++) {
		expect(y[i]).toBe(false)
	}
	expect(y[y.length - 1]).toBe(true)
})
