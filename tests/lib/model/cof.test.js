import Matrix from '../../../lib/util/matrix.js'
import COF from '../../../lib/model/cof.js'

test('anomaly detection', () => {
	const model = new COF(5)
	const x = Matrix.randn(100, 2, 0, 0.2).toArray()
	x.push([10, 10])
	const threshold = 5
	const y = model.predict(x).map(v => v > threshold)
	for (let i = 0; i < y.length - 1; i++) {
		expect(y[i]).toBe(false)
	}
	expect(y[y.length - 1]).toBe(true)
})
