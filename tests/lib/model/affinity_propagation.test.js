import { Matrix } from '../../../lib/util/math.js'
import AffinityPropagation from '../../../lib/model/affinity_propagation.js'

test('predict', () => {
	const model = new AffinityPropagation()
	const x = Matrix.randn(10, 2, 0, 0.1).concat(Matrix.randn(10, 2, 5, 0.1)).toArray()

	model.init(x)
	for (let i = 0; i < 20; i++) {
		model.fit()
		if (model.categories.length <= 2) {
			break
		}
	}
	const y = model.predict()
	expect(y).toHaveLength(x.length)
	let acc = 0
	for (let i = 0; i < 10; i++) {
		if (y[i] === y[0]) {
			acc++
		}
	}
	for (let i = 10; i < 20; i++) {
		if (y[i] === y[10]) {
			acc++
		}
	}
	expect(acc / y.length).toBeGreaterThan(0.9)
})
