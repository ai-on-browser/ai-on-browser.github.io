import { Matrix } from '../../../lib/util/math.js'
import TukeysFences from '../../../lib/model/tukeys_fences.js'

test('anomaly detection', () => {
	const model = new TukeysFences(1.5)
	const x = Matrix.randn(100, 2, 0, 0.2).toArray()
	x.push([10, 10])
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
