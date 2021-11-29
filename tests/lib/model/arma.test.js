import { jest } from '@jest/globals'
jest.retryTimes(3)

import ARMA from '../../../lib/model/arma.js'

test('linear', () => {
	const model = new ARMA(5, 2)
	const x = []
	for (let i = 0; i < 100; i++) {
		x[i] = i / 10 + (Math.random() - 0.5) / 100
	}

	for (let i = 0; i < 100; i++) {
		model.fit(x)
	}
	const future = model.predict(x, 20)
	expect(future).toHaveLength(20)
	for (let i = 0; i < 20; i++) {
		expect(future[i]).toBeCloseTo(10 + i / 10, 0)
	}
})

test('sin', () => {
	const model = new ARMA(15, 2)
	const x = []
	for (let i = 0; i < 100; i++) {
		x[i] = Math.sin(i / 10) + (Math.random() - 0.5) / 100
	}

	for (let i = 0; i < 100; i++) {
		model.fit(x)
	}
	const future = model.predict(x, 50)
	expect(future).toHaveLength(50)
	for (let i = 0; i < 50; i++) {
		expect(future[i]).toBeCloseTo(Math.sin(10 + i / 10), 1)
	}
})
