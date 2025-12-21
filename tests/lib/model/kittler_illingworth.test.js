import { randIndex } from '../../../lib/evaluate/clustering.js'
import KittlerIllingworthThresholding from '../../../lib/model/kittler_illingworth.js'
import Matrix from '../../../lib/util/matrix.js'

test('clustering', () => {
	const model = new KittlerIllingworthThresholding()
	const n = 50
	const x = Matrix.concat(Matrix.randn(n, 1, 0, 0.1), Matrix.randn(n, 1, 5, 0.1)).value

	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})
