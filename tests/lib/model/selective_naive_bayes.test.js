import Matrix from '../../../lib/util/matrix.js'
import SelectiveNaiveBayes from '../../../lib/model/selective_naive_bayes.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

test('predict', () => {
	const model = new SelectiveNaiveBayes()
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
