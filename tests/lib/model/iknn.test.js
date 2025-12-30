import { accuracy } from '../../../lib/evaluate/classification.js'
import IKNN from '../../../lib/model/iknn.js'
import Matrix from '../../../lib/util/matrix.js'

test('predict', () => {
	const model = new IKNN(10, 5)
	const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
	}

	model.fit(x, t)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	const acc = accuracy(y, t)
	expect(acc).toBeGreaterThan(0.9)
})

test('same number of class choice', () => {
	const model = new IKNN(2, 2)
	const x = [
		[-1, -1],
		[1, 1],
	]
	const t = ['a', 'b']

	model.fit(x, t)
	const y = model.predict([
		[-1, -1],
		[1, 1],
	])
	expect(y).toEqual(['a', 'b'])
})
