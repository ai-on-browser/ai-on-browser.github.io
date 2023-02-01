import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import RDF from '../../../lib/model/rdf.js'

test('anomaly detection', () => {
	const model = new RDF(1)
	const x = Matrix.randn(100, 2, 0, 0.2).toArray()
	x.push([1.2, 1.2])
	const threshold = 5
	const y = model.predict(x).map(v => v > threshold)
	let c = 0
	for (let i = 0; i < y.length - 1; i++) {
		if (y[i]) {
			c++
		}
	}
	expect(c).toBeLessThanOrEqual(2)
	expect(y[y.length - 1]).toBe(true)
})
