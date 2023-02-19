import { jest } from '@jest/globals'
jest.retryTimes(5)

import ZeroTruncatedPoisson from '../../../lib/model/ztp.js'

const random_zero_truncated_poisson = l => {
	const u = Math.random()
	let k = 1
	let t = (Math.exp(-l) / (1 - Math.exp(-l))) * l
	let s = t
	while (s < u) {
		k++
		t *= l / k
		s += t
	}
	return k
}

test('density estimation', () => {
	const model = new ZeroTruncatedPoisson()
	const lambda = 1
	const x = []
	for (let i = 0; i < 10000; i++) {
		x.push(random_zero_truncated_poisson(lambda))
	}

	model.fit(x)

	const y = [1, 2, 3, 4, 5]
	const p = Array(y.length).fill(0)
	for (let i = 0; i < y.length; i++) {
		let f = 1
		for (let k = 2; k <= y[i]; k++) {
			f *= k
		}
		p[i] = lambda ** y[i] / ((Math.exp(lambda) - 1) * f)
	}

	const pred = model.probability(y)
	for (let i = 0; i < y.length; i++) {
		expect(pred[i]).toBeCloseTo(p[i])
	}
})
