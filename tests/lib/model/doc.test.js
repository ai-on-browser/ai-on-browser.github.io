import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import { DOC, FastDOC } from '../../../lib/model/doc.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

describe('doc', () => {
	test('small alpha', () => {
		const model = new DOC(0.1, 0.2, 1.0)
		const n = 100
		const x = Matrix.concat(Matrix.randn(n, 3, [0, 5, 0], 0.1), Matrix.randn(n, 3, [10, 5, 10], 0.1)).toArray()

		model.fit(x)
		const y = model.predict()
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})

	test('big alpha', () => {
		const model = new DOC(0.9, 0.2, 1.0)
		const n = 50
		const x = Matrix.concat(Matrix.randn(n, 3, 0, 0.1), Matrix.randn(n, 3, 10, 0.1)).toArray()

		model.fit(x)
		const y = model.predict()
		expect(y).toHaveLength(x.length)
	})
})

describe('fastdoc', () => {
	test('small alpha', () => {
		const model = new FastDOC(0.1, 0.2, 1.0, 100, 2)
		const n = 100
		const x = Matrix.concat(Matrix.randn(n, 3, [0, 5, 0], 0.1), Matrix.randn(n, 3, [10, 5, 10], 0.1)).toArray()

		model.fit(x)
		const y = model.predict()
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})
})
