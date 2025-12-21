import { accuracy } from '../../../lib/evaluate/classification.js'
import ShiftingPerceptron from '../../../lib/model/shifting_perceptron.js'
import Matrix from '../../../lib/util/matrix.js'

test('fit', { retry: 3 }, () => {
	const model = new ShiftingPerceptron(1)
	const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
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
