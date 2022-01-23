import Matrix from '../../../lib/util/matrix.js'
import MetropolisHastings from '../../../lib/model/mh.js'

test('sample', () => {
	const model = new MetropolisHastings(x => Math.exp(-((x[0] - 3) ** 2) / 2), 1)

	const s = Matrix.fromArray(model.sample(10000, 10))
	expect(s.mean()).toBeCloseTo(3, 1)
	expect(s.variance()).toBeCloseTo(1, 1)
})
