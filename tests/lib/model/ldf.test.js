import LDF from '../../../lib/model/ldf.js'
import Matrix from '../../../lib/util/matrix.js'

test('anomaly detection', () => {
	const model = new LDF(5)
	const x = Matrix.randn(100, 2, 0, 0.2).toArray()
	x.push([10, 10])
	const threshold = 8
	const y = model.predict(x).map(v => v > threshold)
	let c = 0
	for (let i = 0; i < y.length - 1; i++) {
		if (y[i]) {
			c++
		}
	}
	expect(c / (y.length - 1)).toBeLessThan(0.2)
	expect(y[y.length - 1]).toBe(true)
})
