import Matrix from '../../../lib/util/matrix.js'
import Percentile from '../../../lib/model/percentile.js'

test.each([undefined, 'data', 'normal'])('anomaly detection %s', dist => {
	const model = new Percentile(0.005, dist)
	const x = Matrix.randn(100, 2, 0, 0.2).toArray()
	x.push([10, 10])
	model.fit(x)
	const y = model.predict(x)
	let c = 0
	for (let i = 0; i < y.length - 1; i++) {
		if (y[i]) {
			c++
		}
	}
	expect(c / (y.length - 1)).toBeLessThan(0.1)
	expect(y[y.length - 1]).toBe(true)
})
