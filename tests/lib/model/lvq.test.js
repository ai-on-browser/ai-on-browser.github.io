import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import { LVQClassifier, LVQCluster } from '../../../lib/model/lvq.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'
import { accuracy } from '../../../lib/evaluate/classification.js'

describe('clustering', () => {
	test('fit predict', () => {
		const model = new LVQCluster(3)
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
			Matrix.randn(n, 2, [0, 5], 0.1)
		).toArray()

		for (let i = 0; i < 100; i++) {
			model.fit(x)
		}
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})

	test('predict before fit', () => {
		const model = new LVQCluster(3)
		const x = Matrix.randn(50, 2, 0, 0.1).toArray()
		expect(() => model.predict(x)).toThrow('Call fit before predict.')
	})
})

describe.each([1, 2, 3])('classification type %i', type => {
	test('default', () => {
		const model = new LVQClassifier(type)
		const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
		x[50] = [0.1, 0.1]
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
		}
		for (let i = 0; i < 100; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.9)
	})

	test('predict before fit', () => {
		const model = new LVQClassifier(type)
		const x = Matrix.randn(50, 2, 0, 0.1).toArray()
		expect(() => model.predict(x)).toThrow('Call fit before predict.')
	})
})
