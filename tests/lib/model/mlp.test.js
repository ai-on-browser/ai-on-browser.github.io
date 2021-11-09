import { Matrix } from '../../../lib/util/math.js'
import MLP from '../../../lib/model/mlp.js'

test('default', () => {
	const model = new MLP(1, [], 'adam')
})

test('regression', () => {
	const model = new MLP(null, [{ type: 'full', out_size: 10, activation: 'tanh' }], 'adam')
	const x = Matrix.randn(50, 2, 0, 5).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
	}
	for (let i = 0; i < 1000; i++) {
		model.fit(x, t, 1, 0.01, 10)
	}
	const y = model.predict(x)
	let err = 0
	for (let i = 0; i < t.length; i++) {
		err += (y[i][0] - t[i][0]) ** 2
	}
	expect(Math.sqrt(err / t.length)).toBeLessThan(0.5)
})

test('classifier', () => {
	const model = new MLP(2, [{ type: 'full', out_size: 10, activation: 'tanh' }], 'adam')
	const x = Matrix.randn(50, 2, 0, 0.2).concat(Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / 50)
	}

	for (let i = 0; i < 1000; i++) {
		model.fit(x, t, 1, 0.01, 10)
	}
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	let acc = 0
	for (let i = 0; i < t.length; i++) {
		if (y[i].indexOf(Math.max(...y[i])) === t[i]) {
			acc++
		}
	}
	expect(acc / y.length).toBeGreaterThan(0.95)
})
