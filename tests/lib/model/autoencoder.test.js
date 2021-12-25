import { Matrix } from '../../../lib/util/math.js'
import Autoencoder from '../../../lib/model/autoencoder.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('reconstruct', () => {
	const x = Matrix.randn(1000, 3, 0, 0.2).toArray()
	const model = new Autoencoder(
		3,
		2,
		[{ type: 'full', out_size: 5, activation: 'tanh' }],
		[{ type: 'full', out_size: 5, activation: 'tanh' }],
		'adam'
	)
	for (let i = 0; i < 1000; i++) {
		model.fit(x, 1, 0.01, 10, 0.01)
	}
	const y = model.predict(x)
	const err = rmse(x, y)
	for (let i = 0; i < err.length; i++) {
		expect(err[i]).toBeLessThan(0.5)
	}
})
