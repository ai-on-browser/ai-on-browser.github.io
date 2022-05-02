import Matrix from '../../../lib/util/matrix.js'
import NaiveBayes from '../../../lib/model/naive_bayes.js'

import { accuracy } from '../../../lib/evaluate/classification.js'
import { rmse } from '../../../lib/evaluate/regression.js'

test('predict', () => {
	const model = new NaiveBayes()
	const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
	}

	model.fit(x, t)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	const acc = accuracy(y, t)
	expect(acc).toBeGreaterThan(0.95)
})

test('probability', () => {
	const model = new NaiveBayes()
	const n = 10000
	const s = 0.2
	const x = Matrix.concat(Matrix.randn(n, 2, 0, s), Matrix.randn(n, 2, 5, s)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / n))
	}

	model.fit(x, t)

	const p = []
	for (let i = 0; i < x.length; i++) {
		const p1 = Math.exp(-x[i].reduce((s, v) => s + v ** 2, 0) / (2 * s)) / (2 * Math.PI * s)
		const p2 = Math.exp(-x[i].reduce((s, v) => s + (v - 5) ** 2, 0) / (2 * s)) / (2 * Math.PI * s)
		p[i] = [p1 / 2, p2 / 2]
	}
	const y = model.probability(x)
	expect(y).toHaveLength(x.length)
	const acc = rmse(y, p)
	for (let i = 0; i < acc.length; i++) {
		expect(acc[i]).toBeLessThan(0.1)
	}
})
