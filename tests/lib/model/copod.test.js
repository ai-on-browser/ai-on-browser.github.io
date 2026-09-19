import COPOD from '../../../lib/model/copod.js'
import Matrix from '../../../lib/util/matrix.js'

test('anomaly detection', () => {
	const model = new COPOD()
	const x = Matrix.randn(100, 2, 0, 0.1).toArray()
	x.push([10, -10])
	const threshold = 9
	const y = model.predict(x).map(v => v > threshold)
	for (let i = 0; i < y.length - 1; i++) {
		expect(y[i]).toBe(false)
	}
	expect(y[y.length - 1]).toBe(true)
})
