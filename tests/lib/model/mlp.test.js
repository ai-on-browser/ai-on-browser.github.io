import { accuracy } from '../../../lib/evaluate/classification.js'
import { rmse } from '../../../lib/evaluate/regression.js'
import { MLPClassifier, MLPRegressor } from '../../../lib/model/mlp.js'
import NeuralNetwork from '../../../lib/model/neuralnetwork.js'
import Matrix from '../../../lib/util/matrix.js'

describe('regression', () => {
	test.each([
		undefined,
		'elu',
		'gaussian',
		'leaky_relu',
		'relu',
		'sigmoid',
		'softplus',
		'softsign',
		'tanh',
		'identity',
	])('%s', { retry: 5 }, activation => {
		const model = new MLPRegressor([5], activation)
		const x = Matrix.randn(30, 2, 0, 5).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
		}
		for (let i = 0; i < 40; i++) {
			const loss = model.fit(x, t, 10, 0.01, 10)
			expect(model.epoch).toBe((i + 1) * 10)
			if (loss < 1.0e-3) {
				break
			}
		}
		const y = model.predict(x)
		const err = rmse(y, t)[0]
		expect(err).toBeLessThan(0.5)
	})

	test('toObject', () => {
		const model = new MLPRegressor([10, 7])
		const x = Matrix.randn(50, 2, 0, 5).toArray()
		const t = Matrix.randn(50, 1).toArray()
		model.fit(x, t, 1)
		const y = model.predict(x)

		const obj = model.toObject()
		expect(obj).toHaveLength(5)
		const nn = NeuralNetwork.fromObject(obj)
		const p = nn.predict(x)
		for (let i = 0; i < y.length; i++) {
			for (let j = 0; j < y[i].length; j++) {
				expect(p[i][j]).toBeCloseTo(y[i][j])
			}
		}
	})
})

describe('classifier', () => {
	test.each([
		undefined,
		'elu',
		'gaussian',
		'leaky_relu',
		'relu',
		'sigmoid',
		'softplus',
		'softsign',
		'tanh',
		'identity',
	])('%s', { retry: 5 }, activation => {
		const model = new MLPClassifier([3], activation)
		const x = Matrix.concat(Matrix.randn(20, 2, 0, 0.2), Matrix.randn(20, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 20))
		}

		for (let i = 0; i < 10; i++) {
			const loss = model.fit(x, t, 10, 0.01, 10)
			expect(model.epoch).toBe((i + 1) * 10)
			if (loss < 1.0e-3) {
				break
			}
		}
		expect(model.categories.toSorted()).toEqual(['a', 'b'])
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})

	test('probability', () => {
		const model = new MLPClassifier([3])
		const x = Matrix.concat(Matrix.randn(20, 2, 0, 0.2), Matrix.randn(20, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 20))
		}

		for (let i = 0; i < 100; i++) {
			model.fit(x, t, 1, 0.01, 10)
			expect(model.epoch).toBe(i + 1)
		}
		const y = model.predict(x)
		const p = model.probability(x)
		const c = model.categories
		for (let i = 0; i < p.length; i++) {
			let pi = -Infinity
			let cat = null
			for (let j = 0; j < p[i].length; j++) {
				expect(p[i][j]).toBeGreaterThanOrEqual(0)
				expect(p[i][j]).toBeLessThanOrEqual(1)
				if (pi < p[i][j]) {
					pi = p[i][j]
					cat = j
				}
			}
			expect(c[cat]).toBe(y[i])
		}
	})

	test('toObject', () => {
		const model = new MLPClassifier([10, 7])
		const x = Matrix.randn(50, 2, 0, 5).toArray()
		const t = [...Array(25).fill(1), ...Array(25).fill(2)]
		model.fit(x, t, 1)
		const y = model.probability(x)

		const obj = model.toObject()
		expect(obj).toHaveLength(6)
		const nn = NeuralNetwork.fromObject(obj)
		const p = nn.predict(x)
		for (let i = 0; i < y.length; i++) {
			for (let j = 0; j < y[i].length; j++) {
				expect(p[i][j]).toBeCloseTo(y[i][j])
			}
		}
	})
})
