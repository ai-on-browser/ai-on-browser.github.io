import Matrix from '../../../lib/util/matrix.js'
import MT from '../../../lib/model/mt.js'

test('anomaly detection', { retry: 3 }, () => {
	const model = new MT()
	const x = Matrix.randn(100, 2, 0, 0.2).toArray()
	x.push([10, 10])
	model.fit(x)
	const threshold = 10
	const y = model.predict(x).map(v => v > threshold)
	for (let i = 0; i < y.length - 1; i++) {
		expect(y[i]).toBe(false)
	}
	expect(y[y.length - 1]).toBe(true)
})
