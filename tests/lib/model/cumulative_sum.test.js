import Matrix from '../../../lib/util/matrix.js'
import CumSum from '../../../lib/model/cumulative_sum.js'

test('anomaly detection', () => {
	const n = 50
	const x = Matrix.concat(Matrix.random(n, 1, 0, 1), Matrix.random(n, 1, 5, 6)).value
	const model = new CumSum()
	model.init(x)
	model.fit()
	const p = model.predict()

	const range = 2
	let c = 0
	for (let i = 0; i < p.length; i++) {
		if (i <= n + range && n - range <= i) {
			if (p[i]) {
				c++
			}
			continue
		}
		expect(p[i]).toBeFalsy()
	}
	expect(c).toBeGreaterThan(0)
})
