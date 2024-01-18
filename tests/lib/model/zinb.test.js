import { jest } from '@jest/globals'
jest.retryTimes(3)

import ZeroInflatedNegativeBinomial from '../../../lib/model/zinb.js'

const random_negative_binomial = (r, p) => {
	let rand = Math.random()
	let k = 0
	while (true) {
		let c = (1 - p) ** r * p ** k
		for (let i = 0; i < k; i++) {
			c *= k + r - 1 - i
			c /= i + 1
		}
		rand -= c
		if (rand < 0) {
			return k
		}
		k++
	}
}

test('density estimation', () => {
	const model = new ZeroInflatedNegativeBinomial()
	const r = 10
	const prob = 0.5
	const zero_prob = 0.4
	const x = []
	for (let i = 0; i < 10000; i++) {
		const zr = Math.random()
		if (zr < zero_prob) {
			x.push(0)
		} else {
			x.push(random_negative_binomial(r, prob))
		}
	}

	model.fit(x)

	const y = []
	const p = []
	p[0] = zero_prob
	for (let t = 0; t < 20; t++) {
		let c = (1 - prob) ** r * prob ** t
		for (let i = 0; i < t; i++) {
			c *= t + r - 1 - i
			c /= i + 1
		}
		y[t] = t
		if (t === 0) {
			p[0] = zero_prob + c * (1 - zero_prob)
		} else {
			p[t] = c * (1 - zero_prob)
		}
	}

	const pred = model.probability(y)
	for (let i = 0; i < y.length; i++) {
		expect(pred[i]).toBeCloseTo(p[i])
	}
})
