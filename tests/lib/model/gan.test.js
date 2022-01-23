import { jest } from '@jest/globals'
jest.retryTimes(5)

import Matrix from '../../../lib/util/matrix.js'
import GAN from '../../../lib/model/gan.js'

test('sample', () => {
	const model = new GAN(
		3,
		[{ type: 'full', out_size: 5, activation: 'tanh' }],
		[{ type: 'full', out_size: 5, activation: 'tanh' }],
		'adam',
		'sgd',
		null,
		''
	)
	const x = Matrix.randn(1000, 2, 2, 0.5).toArray()
	for (let i = 0; i < 100; i++) {
		model.fit(x, null, 1, 0.01, 0.01, 10)
	}

	const s = Matrix.fromArray(model.generate(10000))
	expect(s.mean()).toBeCloseTo(2, -0.5)
})
