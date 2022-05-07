import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import SliceSampling from '../../../lib/model/slice_sampling.js'

test('sample', () => {
	const model = new SliceSampling(x => Math.exp(-((x[0] - 3) ** 2) / 2), 1)

	const s = Matrix.fromArray(model.sample(10000))
	expect(s.mean()).toBeCloseTo(3, 1)
	expect(s.variance()).toBeCloseTo(1, 1)
})
