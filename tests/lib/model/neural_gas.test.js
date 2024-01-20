import Matrix from '../../../lib/util/matrix.js'
import NeuralGas from '../../../lib/model/neural_gas.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test('clustering', () => {
	const model = new NeuralGas()
	const n = 50
	const x = Matrix.concat(
		Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
		Matrix.randn(n, 2, [0, 5], 0.1)
	).toArray()

	model.add(x)
	model.add(x)
	model.add(x)
	for (let i = 0; i < 100; i++) {
		model.fit(x)
	}
	expect(model.size).toBe(3)
	expect(model.centroids).toHaveLength(3)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})

test('clear', () => {
	const model = new NeuralGas()
	const x = [
		[0, 0],
		[1, 1],
	]

	model.add(x)
	expect(model.size).toBe(1)
	model.clear()
	expect(model.size).toBe(0)
})

test('fit before init', () => {
	const model = new NeuralGas()
	const x = Matrix.randn(50, 2, 0, 0.1).toArray()
	const d = model.fit(x)
	expect(d).toBe(0)
})

test('predict before fit', () => {
	const model = new NeuralGas()
	const x = Matrix.randn(50, 2, 0, 0.1).toArray()
	expect(() => model.predict(x)).toThrow('Call fit before predict.')
})
