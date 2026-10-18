import KNNDD from '../../../lib/model/knndd.js'
import Matrix from '../../../lib/util/matrix.js'

test('anomaly detection', () => {
	const model = new KNNDD(5)
	const x = Matrix.random(100, 2, -1, 1).toArray()
	x.push([10, 10])
	const threshold = 10
	const y = model.predict(x).map(v => v > threshold)
	for (let i = 0; i < y.length - 1; i++) {
		expect(y[i]).toBe(false)
	}
	expect(y[y.length - 1]).toBe(true)
})
