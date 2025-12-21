import { randIndex } from '../../../lib/evaluate/clustering.js'
import AutomaticThresholding from '../../../lib/model/automatic_thresholding.js'
import Matrix from '../../../lib/util/matrix.js'

test('clustering', () => {
	const model = new AutomaticThresholding(3)
	const n = 50
	const x = Matrix.concat(Matrix.randn(n, 1, 0, 0.1), Matrix.randn(n, 1, 5, 0.1)).value

	for (let i = 0; i < 2; i++) {
		model.fit(x)
	}
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})
