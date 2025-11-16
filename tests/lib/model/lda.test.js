import Matrix from '../../../lib/util/matrix.js'
import {
	LinearDiscriminant,
	FishersLinearDiscriminant,
	MulticlassLinearDiscriminant,
	LinearDiscriminantAnalysis,
} from '../../../lib/model/lda.js'

import { accuracy } from '../../../lib/evaluate/classification.js'
import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

describe('classification', () => {
	test('lda', { retry: 3 }, () => {
		const model = new LinearDiscriminant()
		const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / 50) * 2 - 1
		}
		model.init(x, t)
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})

	test('fda', { retry: 3 }, () => {
		const model = new FishersLinearDiscriminant()
		const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / 50) * 2 - 1
		}
		model.init(x, t)
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})

	test('multiclass', { retry: 3 }, () => {
		const model = new MulticlassLinearDiscriminant()
		const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
		}

		for (let i = 0; i < 100; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})
})

describe('dimensionality reduction', () => {
	test.each([undefined, 0, 1, 3])('%d', { retry: 3 }, d => {
		const n = 50
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}

		const y = new LinearDiscriminantAnalysis(d).predict(x, t)
		expect(y[0]).toHaveLength(Math.min(d || 2, 2))
		const q = coRankingMatrix(x, y, 30, 20)
		expect(q).toBeGreaterThan(0.9)
	})
})
