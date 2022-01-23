import Matrix from '../../../lib/util/matrix.js'
import GeneralizedESD from '../../../lib/model/generalized_esd.js'

test.each([1, 2, 3])('anomaly detection %d', k => {
	const model = new GeneralizedESD(1, k)
	const x = Matrix.random(100, 2, 0, 0.2).toArray()
	x.push([10, 10])
	const y = model.predict(x, 0.1)
	let c = 0
	for (let i = 0; i < y.length - 1; i++) {
		if (c < k - 1) {
			if (y[i]) {
				c++
			}
		} else {
			expect(y[i]).toBe(false)
		}
	}
	expect(y[y.length - 1]).toBe(true)
})
