import { Matrix } from '../../../lib/util/math.js'
import SmirnovGrubbs from '../../../lib/model/smirnov_grubbs.js'

test('anomaly detection', () => {
	const model = new SmirnovGrubbs(1)
	const x = Matrix.random(100, 2, 0, 0.2).toArray()
	x.push([10, 10])
	const y = model.predict(x)
	for (let i = 0; i < y.length - 1; i++) {
		expect(y[i]).toBe(false)
	}
	expect(y[y.length - 1]).toBe(true)
})
