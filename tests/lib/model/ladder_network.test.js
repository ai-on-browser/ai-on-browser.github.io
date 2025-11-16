import Matrix from '../../../lib/util/matrix.js'
import LadderNetwork from '../../../lib/model/ladder_network.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

test('semi-classifier', { retry: 3, timeout: 30000 }, () => {
	const model = new LadderNetwork([5], [0.001, 0.0001, 0.0001], 'tanh', 'adam')
	const n = 20
	const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)).toArray()
	const t = []
	const t_org = []
	for (let i = 0; i < x.length; i++) {
		t_org[i] = t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / n))
		if (Math.random() < 0.5) {
			t[i] = null
		}
	}
	for (let i = 0; i < 5; i++) {
		model.fit(x, t, 100, 0.001)
		expect(model.epoch).toBe((i + 1) * 100)
	}
	const y = model.predict(x)
	const acc = accuracy(y, t_org)
	expect(acc).toBeGreaterThan(0.95)
})

test('semi-classifier learn only', () => {
	const model = new LadderNetwork([5], [0.001, 0.0001, 0.0001], 'tanh', 'adam')
	const x = [
		[0, 0],
		[1, 1],
	]
	const t = ['a', 'a']
	model.fit([[0, 0]], ['a'], 1, 0.001)
	model.fit([[1, 1]], [null], 1, 0.001)
	const y = model.predict(x)
	const acc = accuracy(y, t)
	expect(acc).toBeGreaterThan(0.95)
})
