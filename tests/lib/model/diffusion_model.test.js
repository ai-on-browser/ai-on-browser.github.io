import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import DiffusionModel from '../../../lib/model/diffusion_model.js'

test('sample', async () => {
	const model = new DiffusionModel(100, [
		{ type: 'full', out_size: 8, l2_decay: 0.001, activation: 'tanh' },
		{ type: 'full', out_size: 4, l2_decay: 0.001, activation: 'tanh' },
		{ type: 'full', out_size: 8, l2_decay: 0.001, activation: 'tanh' },
	])
	const x = Matrix.randn(1000, 2, 2, 0.1).toArray()
	for (let i = 0; i < 10; i++) {
		const loss = model.fit(x, 10, 0.01, 10)
		expect(model.epoch).toBe(10 * (i + 1))
		const s = Matrix.fromArray(model.generate(100))
		const curMean = s.mean()
		const curStd = s.std()
		if (loss[0] < 1 && Math.abs(curMean - 2) < 0.5 && curStd < 0.5) {
			break
		}
	}

	const s = Matrix.fromArray(model.generate(100))
	expect(s.mean()).toBeCloseTo(2, 0)
})
