import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import VAE from '../../../lib/model/vae.js'

test('sample', () => {
	const model = new VAE(
		3,
		2,
		[{ type: 'full', out_size: 7, activation: 'tanh' }],
		[{ type: 'full', out_size: 7, activation: 'tanh' }],
		'adam',
		null,
		''
	)
	const x = Matrix.randn(1000, 3, 2, 0.5).toArray()
	for (let i = 0; i < 100; i++) {
		model.fit(x, null, 1, 0.01, 10)
	}

	const s = Matrix.fromArray(model.predict(x))
	expect(s.mean()).toBeCloseTo(2, 0)
})

test('conditional sample', () => {
	const model = new VAE(
		3,
		2,
		[{ type: 'full', out_size: 7, activation: 'tanh' }],
		[{ type: 'full', out_size: 7, activation: 'tanh' }],
		'adam',
		2,
		'conditional'
	)
	const n = 100
	const x = Matrix.concat(Matrix.randn(n, 3, 0, 0.2), Matrix.randn(n, 3, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [Math.floor(i / n)]
	}
	for (let i = 0; i < 100; i++) {
		model.fit(x, t, 1, 0.01, 10)
	}

	const s = Matrix.fromArray(model.predict(x, t))
	expect(s.slice(0, n).mean()).toBeCloseTo(0, 0)
	expect(s.slice(n).mean()).toBeCloseTo(5, 0)
})
