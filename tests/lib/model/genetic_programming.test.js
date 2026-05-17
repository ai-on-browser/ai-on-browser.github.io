import { expect } from 'vitest'
import { rmse } from '../../../lib/evaluate/regression.js'
import GeneticProgramming from '../../../lib/model/genetic_programming.js'
import Matrix from '../../../lib/util/matrix.js'

test('fit', { retry: 5 }, () => {
	const model = new GeneticProgramming()
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
	const model = new GeneticProgramming(['+', '-', '*', '/', Math.tanh])
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
	['+', /[+()0-9.x ]+/],
	['-', /[-()0-9.x ]+/],
	['*', /[*()0-9.x ]+/],
	['/', /[/()0-9.x ]+/],
	[Math.sin, /[()0-9.xsin ]+/],
])('fit toString %s', (fn, re) => {
	const model = new GeneticProgramming([fn])
	const x = Matrix.randn(50, 2, 0, 5).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + Math.sin(x[i][1])]
	}
	model.init(x, t)
	for (const prog of model.bestPrograms) {
		const strExpr = prog.toString()
		expect(strExpr).toMatch(re)
	}
})
