import { randIndex } from '../../../lib/evaluate/clustering.js'
import RidlerCalvardThresholding from '../../../lib/model/ridler_calvard.js'
import Matrix from '../../../lib/util/matrix.js'

test('clustering', () => {
	const model = new RidlerCalvardThresholding()
	const n = 50
	const x = Matrix.concat(Matrix.randn(n, 1, 0, 0.1), Matrix.randn(n, 1, 5, 0.1)).value

	model.init(x)
	model.fit()
	const y = model.predict()
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})

test('clustering skew', () => {
	const model = new RidlerCalvardThresholding()
	const x = [0.5, 0.1, 4.6, 5.2, 5.3, 4.9]
	const t = [0, 0, 1, 1, 1, 1]

	model.init(x)
	model.fit()
	model.fit()
	const y = model.predict()
	expect(y).toHaveLength(x.length)

	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})
