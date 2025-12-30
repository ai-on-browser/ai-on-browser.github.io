import MCD from '../../../lib/model/mcd.js'
import Matrix from '../../../lib/util/matrix.js'

test('anomaly detection', () => {
	const x = Matrix.randn(100, 2, 0, 0.2).toArray()
	x.push([10, 10])
	const model = new MCD(x, 0.8)
	for (let i = 0; i < 10; i++) {
		model.fit()
	}
	const threshold = 10
	const y = model.predict(x).map(v => v > threshold)
	let c = 0
	for (let i = 0; i < y.length - 1; i++) {
		if (y[i]) {
			c++
		}
	}
	expect(c / (y.length - 1)).toBeLessThan(0.1)
	expect(y[y.length - 1]).toBe(true)
})
