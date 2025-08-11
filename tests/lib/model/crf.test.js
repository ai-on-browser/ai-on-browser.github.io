import { jest } from '@jest/globals'
jest.retryTimes(3)

import CRF from '../../../lib/model/crf.js'

test('fit', () => {
	const model = new CRF()
	const x = [['a', 'b', 'c', 'c', 'b', 'a', 'd']]
	const y = [[2, 0, 1, 1, 2, 1, 0]]

	for (let i = 0; i < 1000; i++) {
		model.fit(x, y)
	}

	const tx = [['a', 'b', 'c', 'b', 'a']]
	const ty = [[2, 0, 1, 2, 1]]
	const p = model.predict(tx)
	expect(p).toEqual(ty)
	const prob = model.probability(tx[0], ty[0])
	expect(prob).toBeGreaterThan(0.4)
	expect(prob).toBeLessThanOrEqual(1)
})

test('fit unknown predict label', () => {
	const model = new CRF()
	const x = [['a', 'b', 'c']]
	const y = [[2, 0, 1]]

	for (let i = 0; i < 100; i++) {
		model.fit(x, y)
	}

	const tx = [['a', 'd', 'c']]
	const ty = [[2, 0, 1]]
	const p = model.predict(tx)
	expect(p).toEqual(ty)
	const prob = model.probability(tx[0], ty[0])
	expect(prob).toBeGreaterThan(0.4)
	expect(prob).toBeLessThanOrEqual(1)
})
