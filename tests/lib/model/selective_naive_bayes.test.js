import { accuracy } from '../../../lib/evaluate/classification.js'
import SelectiveNaiveBayes from '../../../lib/model/selective_naive_bayes.js'
import Matrix from '../../../lib/util/matrix.js'

test('predict', () => {
	const model = new SelectiveNaiveBayes()
	const x = Matrix.concat(Matrix.randn(25, 2, 0, 0.2), Matrix.randn(75, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = String.fromCharCode('a'.charCodeAt(0) + (i < 25 ? 0 : 1))
	}

	model.fit(x, t)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	const acc = accuracy(y, t)
	expect(acc).toBeGreaterThan(0.95)
})
