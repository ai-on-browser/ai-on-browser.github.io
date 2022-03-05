import { jest } from '@jest/globals'
jest.retryTimes(20)

import Matrix from '../../../lib/util/matrix.js'
import PossibilisticCMeans from '../../../lib/model/pcm.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test('predict', () => {
	const model = new PossibilisticCMeans(3)
	const n = 50
	const x = Matrix.concat(
		Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
		Matrix.randn(n, 2, [0, 5], 0.1)
	).toArray()

	model.init(x)
	model.add()
	model.add()
	model.add()
	for (let i = 0; i < 20; i++) {
		model.fit()
	}
	const p = model.predict()
	expect(p).toHaveLength(x.length)
	for (let i = 0; i < p.length; i++) {
		expect(p[i]).toHaveLength(3)
	}
	const y = Matrix.fromArray(p).argmax(1).value

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})
