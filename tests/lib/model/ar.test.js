import { jest } from '@jest/globals'
jest.retryTimes(5)

import AR from '../../../lib/model/ar.js'

test.each([undefined, 'lsm', 'householder'])('linear %s', method => {
	const model = new AR(5, method)
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

test.each([undefined, 'lsm', 'householder'])('sin %s', method => {
	const model = new AR(10, method)
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

test.each(['yuleWalker', 'levinson'])('sin %s', method => {
	const model = new AR(10, method)
	const x = []
	for (let i = 0; i < 100; i++) {
		x[i] = Math.sin(i / 10) + (Math.random() - 0.5) / 100
	}

	model.fit(x)
	const future = model.predict(x, 30)
	expect(future).toHaveLength(30)
	for (let i = 0; i < 30; i++) {
		expect(future[i]).toBeCloseTo(Math.sin(10 + i / 10), 0)
	}
})
