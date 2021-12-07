// import { jest } from '@jest/globals'
// jest.retryTimes(3)

import { Matrix } from '../../../lib/util/math.js'
import BayesianNetwork from '../../../lib/model/bayesian_network.js'

test('fit', () => {
	const model = new BayesianNetwork(1)
	const x = Matrix.randn(50, 2, 0, 0.2).concat(Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / 50)
		x[i].push(t[i])
	}

	model.fit(x)
	const yt = model.probability(x)
	expect(yt).toHaveLength(x.length)
	for (let i = 0; i < x.length; i++) {
		x[i][x[i].length - 1] = Math.floor(Math.random() * (x.length / 50 - 1))
		if (t[i] <= x[i][x[i].length - 1]) {
			x[i][x[i].length - 1]++
		}
	}
	const yn = model.probability(x)
	let acc = 0
	for (let i = 0; i < t.length; i++) {
		if (yt[i] > yn[i]) {
			acc++
		}
	}
	expect(acc / yt.length).toBeGreaterThan(0.95)
})
