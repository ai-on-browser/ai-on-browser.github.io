import { jest } from '@jest/globals'
jest.retryTimes(3)

import AR from '../../../lib/model/ar.js'

test('linear', () => {
	const model = new AR(5)
	const x = []
	for (let i = 0; i < 100; i++) {
		x[i] = i / 10 + (Math.random() - 0.5) / 100
	}

	model.fit(x)
	const future = model.predict(x, 20)
	expect(future).toHaveLength(20)
	for (let i = 0; i < 20; i++) {
		expect(future[i]).toBeCloseTo(10 + i / 10, 1)
	}
})

test('sin', () => {
	const model = new AR(10)
	const x = []
	for (let i = 0; i < 100; i++) {
		x[i] = Math.sin(i / 10) + (Math.random() - 0.5) / 100
	}

	model.fit(x)
	const future = model.predict(x, 50)
	expect(future).toHaveLength(50)
	for (let i = 0; i < 50; i++) {
		expect(future[i]).toBeCloseTo(Math.sin(10 + i / 10), 1)
	}
})
