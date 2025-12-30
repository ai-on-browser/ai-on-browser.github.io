import { randIndex } from '../../../lib/evaluate/clustering.js'
import ISODATA from '../../../lib/model/isodata.js'
import Matrix from '../../../lib/util/matrix.js'

test('clustering', { retry: 3 }, () => {
	const model = new ISODATA(5, 1, 20, 10, 1, 0.8)
	const n = 50
	const x = Matrix.concat(
		Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
		Matrix.randn(n, 2, [-2, 5], 0.1)
	).toArray()

	model.init(x)
	for (let i = 0; i < 10; i++) {
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

test('large init k', () => {
	const model = new ISODATA(100, 1, 20, 10, 1, 0.8)
	const n = 50
	const x = Matrix.concat(
		Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
		Matrix.randn(n, 2, [-2, 5], 0.1)
	).toArray()

	model.init(x)
	for (let i = 0; i < 100; i++) {
		model.fit(x)
	}
	expect(model.size).toBeGreaterThanOrEqual(3)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.75)
})

test('small init k', () => {
	const model = new ISODATA(1, 3, 20, 10, 0.1, 0.8)
	const n = 50
	const x = Matrix.concat(
		Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
		Matrix.randn(n, 2, [-2, 5], 0.1)
	).toArray()

	model.init(x)
	for (let i = 0; i < 10; i++) {
		model.fit(x)
	}
	expect(model.size).toBeGreaterThanOrEqual(3)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.75)
})

test('predict before fit', () => {
	const model = new ISODATA(5, 1, 20, 10, 1, 0.8)
	const x = Matrix.randn(50, 2, 0, 0.1).toArray()
	expect(() => model.predict(x)).toThrow('Call fit before predict.')
})
