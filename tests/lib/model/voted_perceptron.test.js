import Matrix from '../../../lib/util/matrix.js'
import VotedPerceptron from '../../../lib/model/voted_perceptron.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

test('fit', () => {
	const model = new VotedPerceptron()
	const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
	x[50] = [0.1, 0.1]
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / 50) * 2 - 1
	}
	for (let i = 0; i < 10; i++) {
		model.fit(x, t)
	}
	const y = model.predict(x)
	const acc = accuracy(y, t)
	expect(acc).toBeGreaterThan(0.95)
})
