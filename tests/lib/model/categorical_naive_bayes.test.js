import CategoricalNaiveBayes from '../../../lib/model/categorical_naive_bayes.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

test('predict', () => {
	const model = new CategoricalNaiveBayes()
	const n = 50
	const x = []
	for (let i = 0; i < n; i++) {
		const xi = []
		for (let k = 0; k < 5; k++) {
			xi[k] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(Math.random() * 10))
		}
		x.push(xi)
	}
	for (let i = 0; i < n; i++) {
		const xi = []
		for (let k = 0; k < 5; k++) {
			xi[k] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(Math.random() * 10 + 9))
		}
		x.push(xi)
	}
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / n))
	}

	model.fit(x, t)

	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	const acc = accuracy(y, t)
	expect(acc).toBeGreaterThan(0.95)
})
