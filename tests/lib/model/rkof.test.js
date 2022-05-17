import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import RKOF from '../../../lib/model/rkof.js'

test.each(['gaussian', 'volcano'])('anomaly detection %s', kernel => {
	const model = new RKOF(5, 0.5, 0.5, kernel)
	const x = Matrix.randn(100, 2, 0, 0.2).toArray()
	x.push([10, 10])
	const threshold = 5
	const y = model.predict(x).map(v => v > threshold)
	for (let i = 0; i < y.length - 1; i++) {
		expect(y[i]).toBe(false)
	}
	expect(y[y.length - 1]).toBe(true)
})

test.each(['epanechnikov'])('anomaly detection %s', kernel => {
	const model = new RKOF(5, 0.5, 0.5, kernel)
	const x = Matrix.randn(100, 2, 0, 0.2).toArray()
	x.push([10, 10])
	const threshold = 100
	const y = model.predict(x).map(v => v > threshold)
	for (let i = 0; i < y.length - 1; i++) {
		expect(y[i]).toBe(false)
	}
	expect(y[y.length - 1]).toBe(true)
})
