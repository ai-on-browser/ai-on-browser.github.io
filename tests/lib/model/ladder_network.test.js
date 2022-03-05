import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import LadderNetwork from '../../../lib/model/ladder_network.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

test('semi-classifier', () => {
	const model = new LadderNetwork([5], [0.001, 0.0001, 0.0001], 'tanh', 'adam')
	const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	const t_org = []
	for (let i = 0; i < x.length; i++) {
		t_org[i] = t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
		if (Math.random() < 0.5) {
			t[i] = null
		}
	}
	for (let i = 0; i < 5; i++) {
		model.fit(x, t, 100, 0.001)
	}
	const y = model.predict(x)
	const acc = accuracy(y, t_org)
	expect(acc).toBeGreaterThan(0.95)
})
