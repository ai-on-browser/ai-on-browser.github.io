import { randIndex } from '../../../lib/evaluate/clustering.js'
import ART from '../../../lib/model/art.js'
import Matrix from '../../../lib/util/matrix.js'

test.each([undefined, 0.5])('clustering %j', th => {
	const model = new ART(th)
	const n = 50
	const x = Matrix.concat(
		Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
		Matrix.randn(n, 2, [0, 5], 0.1)
	).toArray()

	model.fit(x)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.8)
})

test('clustering out', () => {
	const model = new ART()
	const n = 50
	const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()

	model.fit(x)
	const y = model.predict([[-10, -10]])
	expect(y[0]).toBe(-1)
})
