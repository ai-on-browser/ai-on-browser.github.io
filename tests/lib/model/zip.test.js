import { jest } from '@jest/globals'
jest.retryTimes(5)

import ZeroInflatedPoisson from '../../../lib/model/zip.js'

const random_poisson = l => {
	const L = Math.exp(-l)
	let k = 0
	let p = 1
	while (p > L) {
		k++
		p *= Math.random()
	}
	return k - 1
}

describe('density estimation', () => {
	test.each([undefined, 'moments', 'maximum_likelihood'])('%s', method => {
		const model = new ZeroInflatedPoisson(method)
		const x = []
		for (let i = 0; i < 10000; i++) {
			const r = Math.random()
			x.push(r < 0.5 ? 0 : random_poisson(1))
		}

		model.fit(x)

		const y = [0, 1, 2, 3, 4, 5]
		const p = Array(y.length).fill(0)
		p[0] += 0.5
		for (let i = 0; i < y.length; i++) {
			let f = 1
			for (let k = 2; k <= i; k++) {
				f *= k
			}
			p[i] += ((1 / f) * Math.exp(-1)) / 2
		}

		const pred = model.probability(y)
		for (let i = 0; i < y.length; i++) {
			expect(pred[i]).toBeCloseTo(p[i])
		}
	})
})
