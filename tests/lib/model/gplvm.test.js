import { Matrix } from '../../../lib/util/math.js'
import GPLVM from '../../../lib/model/gplvm.js'

test('gplvm', () => {
	const model = new GPLVM(3, 1)
	const x = Matrix.randn(100, 10, 0, Matrix.diag([1.0, 0.1, 1.0, 0.1, 0.1, 0.1, 0.1, 0.1, 1.0, 0.1])).toArray()

	model.init(x)
	let lastLLH = model.llh()
	for (let i = 0; i < 10; i++) {
		model.fit()
		const llh = model.llh()
		expect(llh).toBeLessThanOrEqual(lastLLH)
		lastLLH = llh
	}
})
