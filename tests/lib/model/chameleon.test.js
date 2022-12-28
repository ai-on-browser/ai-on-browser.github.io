import { jest } from '@jest/globals'
jest.retryTimes(20)

import Matrix from '../../../lib/util/matrix.js'
import CHAMELEON from '../../../lib/model/chameleon.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test('clustering', () => {
	const model = new CHAMELEON(5)
	const n = 20
	const x = Matrix.concat(
		Matrix.random(n, 2, 0, 1),
		Matrix.add(Matrix.random(n, 2, 0, 1), new Matrix(1, 2, [2, 0]))
	).toArray()
	x.push([0.5, 1.4])
	x.push([0.5, 1.6])

	model.fit(x)
	const y = model.predict(2)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.8)
})
