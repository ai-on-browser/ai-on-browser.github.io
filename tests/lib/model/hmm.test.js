import Matrix from '../../../lib/util/matrix.js'
import { HMMClassifier } from '../../../lib/model/hmm.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

test('classifier', () => {
	const model = new HMMClassifier(['a', 'b'], 5)
	const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
	}

	for (let i = 0; i < 100; i++) {
		model.fit(x, t, i % 2 === 0)
	}
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	const acc = accuracy(y, t)
	expect(acc).toBeGreaterThan(0.95)
})
