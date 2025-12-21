import { rmse } from '../../../lib/evaluate/regression.js'
import Autoencoder from '../../../lib/model/autoencoder.js'
import Matrix from '../../../lib/util/matrix.js'

test('reconstruct', { retry: 3 }, () => {
	const x = Matrix.randn(1000, 3, 0, 0.2).toArray()
	const model = new Autoencoder(
		3,
		2,
		[{ type: 'full', out_size: 5, activation: 'tanh' }],
		[{ type: 'full', out_size: 5, activation: 'tanh' }],
		'adam'
	)
	for (let i = 0; i < 100; i++) {
		model.fit(x, 1, 0.01, 10, 0.01)
		expect(model.epoch).toBe(i + 1)
	}
	const y = model.predict(x)
	const err = rmse(x, y)
	for (let i = 0; i < err.length; i++) {
		expect(err[i]).toBeLessThan(0.5)
	}
})

test('reduce', () => {
	const x = Matrix.randn(1000, 3, 0, 0.2).toArray()
	const model = new Autoencoder(
		3,
		2,
		[{ type: 'full', out_size: 5, activation: 'tanh' }],
		[{ type: 'full', out_size: 5, activation: 'tanh' }],
		'adam'
	)
	for (let i = 0; i < 100; i++) {
		model.fit(x, 1, 0.01, 10, 0.01)
		expect(model.epoch).toBe(i + 1)
	}
	const y = model.reduce(x)
	expect(y).toHaveLength(x.length)
	for (let i = 0; i < x.length; i++) {
		expect(y[i]).toHaveLength(2)
	}
})
