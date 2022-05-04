import Matrix from '../../../lib/util/matrix.js'
import LoOP from '../../../lib/model/loop.js'

test('anomaly detection', () => {
	const model = new LoOP(5)
	const x = Matrix.randn(100, 2, 0, 0.2).toArray()
	x.push([10, 10])
	const threshold = 0.8
	const y = model.predict(x).map(v => v > threshold)
	for (let i = 0; i < y.length - 1; i++) {
		expect(y[i]).toBe(false)
	}
	expect(y[y.length - 1]).toBe(true)
})
