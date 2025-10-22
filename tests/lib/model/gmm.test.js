import { jest } from '@jest/globals'
jest.retryTimes(20)

import Matrix from '../../../lib/util/matrix.js'
import { GMM, GMR, SemiSupervisedGMM } from '../../../lib/model/gmm.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'
import { accuracy } from '../../../lib/evaluate/classification.js'
import { rmse } from '../../../lib/evaluate/regression.js'

describe('clustering', () => {
	test('predict', () => {
		const model = new GMM()
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
			Matrix.randn(n, 2, [0, 5], 0.1)
		).toArray()

		model.add()
		model.add()
		model.add()
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

	test('too large value', () => {
		const model = new GMM()
		const x = [[Infinity, Infinity]]

		model.add()
		model.fit(x)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
		expect(y).toEqual([-1])
	})

	test('clear', () => {
		const model = new GMM()
		const x = [
			[0, 0],
			[1, 1],
		]
		model.add()
		model.add()
		for (let i = 0; i < 100; i++) {
			model.fit(x)
		}
		expect(model._k).toBe(2)
		model.clear()
		expect(model._k).toBe(0)
	})

	test('probability', () => {
		const model = new GMM()
		const n = 50
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()

		model.add()
		model.add()
		for (let i = 0; i < 100; i++) {
			model.fit(x)
		}

		const p = model.probability([
			[0, 0],
			[-1, -1],
		])
		for (let c = 0; c < 2; c++) {
			expect(p[0][c]).toBeGreaterThan(p[1][c])
		}
	})
})

describe('regression', () => {
	test('predict', () => {
		const model = new GMR()
		const x = Matrix.randn(50, 2, 0, 5).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
		}
		model.add()
		model.add()
		model.add()
		for (let i = 0; i < 20; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const err = rmse(y, t)[0]
		expect(err).toBeLessThan(0.5)
	})

	test('clear', () => {
		const model = new GMR()
		const x = [
			[0, 0],
			[1, 1],
		]
		const t = [[0], [1]]
		model.add()
		model.add()
		model.fit(x, t)
		expect(model._k).toBe(2)
		model.clear()
		expect(model._k).toBe(0)
	})

	test('probability', () => {
		const model = new GMR()
		const x = Matrix.randn(50, 2, 0, 5).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
		}

		model.add()
		model.add()
		for (let i = 0; i < 100; i++) {
			model.fit(x, t)
		}

		const p = model.probability(
			[
				[0, 0],
				[-1, -1],
			],
			[[0], [-1]]
		)
		for (let c = 0; c < 2; c++) {
			expect(p[0][c]).toBeGreaterThanOrEqual(p[1][c])
		}
	})
})

describe('semi-classifier', () => {
	test('predict', () => {
		const model = new SemiSupervisedGMM()
		const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
		const t = []
		const t_org = []
		for (let i = 0; i < x.length; i++) {
			t_org[i] = t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
			if (Math.random() < 0.5) {
				t[i] = null
			}
		}
		model.init(x, t)
		for (let i = 0; i < 20; i++) {
			model.fit(x, t)
		}
		const categories = model.categories.concat()
		categories.sort()
		expect(categories).toEqual(['a', 'b'])
		const y = model.predict(x)
		const acc = accuracy(y, t_org)
		expect(acc).toBeGreaterThan(0.95)
	})

	test('too large value', () => {
		const model = new SemiSupervisedGMM()
		const x = [
			[0, 0],
			[Infinity, Infinity],
		]
		const t = [1, null]

		model.init(x, t)
		model.fit(x, t)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
		expect(y).toEqual([undefined, undefined])
	})
})
