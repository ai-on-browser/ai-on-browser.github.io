import Matrix from '../../../lib/util/matrix.js'
import BudgetPerceptron from '../../../lib/model/budget_perceptron.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

test.each([undefined, 0, 2])('fit %i', n => {
	const model = new BudgetPerceptron(1, n)
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

test.only.each([0, 2])('fit replace sv n: %p', n => {
	const model = new BudgetPerceptron(1, n)
	const x = [
		[0.44, 0.43],
		[-0.32, 0.01],
		[5.63, 5.04],
		[4.33, 4.63],
	]
	const t = [-1, -1, 1, 1]
	for (let i = 0; i < 10; i++) {
		model.fit(x, t)
	}
	const y = model.predict(x)
	const acc = accuracy(y, t)
	expect(acc).toBeGreaterThan(0.95)
})
