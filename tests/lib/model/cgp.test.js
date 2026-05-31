import { expect } from 'vitest'
import { rmse } from '../../../lib/evaluate/regression.js'
import CartesianGeneticProgramming from '../../../lib/model/cgp.js'
import Matrix from '../../../lib/util/matrix.js'

test('fit', { retry: 5 }, () => {
	const model = new CartesianGeneticProgramming(2, 10)
	const x = Matrix.randn(50, 2, 0, 5).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10 + 5]
	}
	model.init(x, t)
	for (let i = 0; i < 200; i++) {
		const loss = model.fit()
		if (loss < 0.2) {
			break
		}
	}
	const y = model.predict(x)
	const err = rmse(y, t)[0]
	expect(err).toBeLessThan(0.5)
})

test('fit custom function', { retry: 10 }, () => {
	const model = new CartesianGeneticProgramming(2, 10, ['+', '-', '*', '/', Math.tanh])
	const x = Matrix.randn(50, 2, 0, 5).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + Math.tanh(x[i][1]) + (Math.random() - 0.5) / 10 + 5]
	}
	model.init(x, t)
	for (let i = 0; i < 200; i++) {
		const loss = model.fit()
		if (loss < 0.2) {
			break
		}
	}
	const y = model.predict(x)
	const err = rmse(y, t)[0]
	expect(err).toBeLessThan(0.5)
})

test.each([
	['+', (a, b) => a + b, /[+()0-9.x ]+/],
	['-', (a, b) => a - b, /[-()0-9.x ]+/],
	['*', (a, b) => a * b, /[*()0-9.x ]+/],
	['/', (a, b) => a / b, /[/()0-9.x ]+/],
	[Math.sin, (a, b) => a + Math.sin(b), /[()0-9.xsin ]+/],
])('fit toString %s', (fn, tf, re) => {
	const model = new CartesianGeneticProgramming(2, 10, [fn])
	const x = Matrix.randn(50, 2, 0, 5).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [tf(x[i][0], x[i][1])]
	}
	model.init(x, t)
	const strExpr = model.bestProgram.toString()[0]
	expect(strExpr).toMatch(re)
})
