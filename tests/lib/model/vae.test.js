import { jest } from '@jest/globals'
jest.retryTimes(3)

import { Matrix } from '../../../lib/util/math.js'
import VAE from '../../../lib/model/vae.js'

test('sample', () => {
	const model = new VAE(
		3,
		2,
		[{ type: 'full', out_size: 7, activation: 'tanh' }],
		[{ type: 'full', out_size: 7, activation: 'tanh' }],
		'adam',
		'sgd',
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
