import SOS from '../../../lib/model/sos.js'
import Matrix from '../../../lib/util/matrix.js'

test('anomaly detection', { retry: 3 }, () => {
	const model = new SOS(4.5)
	const x = Matrix.random(100, 2, -1, 1).toArray()
	x.push([10, 10])
	const threshold = 0.98
	const y = model.predict(x).map(v => v > threshold)
	for (let i = 0; i < y.length - 1; i++) {
		expect(y[i]).toBe(false)
	}
	expect(y[y.length - 1]).toBe(true)
})
