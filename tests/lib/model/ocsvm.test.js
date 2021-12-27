import { Matrix } from '../../../lib/util/math.js'
import OCSVM from '../../../lib/model/ocsvm.js'

test('anomaly detection', () => {
	const model = new OCSVM(1, 'gaussian')
	const x = Matrix.randn(100, 2, 0, 0.2).toArray()
	x.push([10, 10])
	model.init(x)
	for (let i = 0; i < 10; i++) {
		model.fit()
	}
	const threshold = -0.5
	const y = model.predict(x).map(v => v < threshold)
	let c = 0
	for (let i = 0; i < y.length - 1; i++) {
		if (y[i]) {
			c++
		}
	}
	expect(c / (y.length - 1)).toBeLessThan(0.1)
	expect(y[y.length - 1]).toBe(true)
})
