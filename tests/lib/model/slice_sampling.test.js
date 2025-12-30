import SliceSampling from '../../../lib/model/slice_sampling.js'
import Matrix from '../../../lib/util/matrix.js'

test('sample', { retry: 3 }, () => {
	const model = new SliceSampling(x => Math.exp(-((x[0] - 3) ** 2) / 2), 1)

	const s = Matrix.fromArray(model.sample(10000))
	expect(s.mean()).toBeCloseTo(3, 1)
	expect(s.variance()).toBeCloseTo(1, 1)
})
