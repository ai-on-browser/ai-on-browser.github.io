import { Matrix } from '../../../lib/util/math.js'
import LabelSpreading from '../../../lib/model/label_spreading.js'

test('semi-classifier', () => {
	const model = new LabelSpreading()
	const x = Matrix.randn(50, 2, 0, 0.2).concat(Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	const t_org = []
	for (let i = 0; i < x.length; i++) {
		t_org[i] = t[i] = Math.floor(i / 50) * 2 - 1
		if (Math.random() < 0.5) {
			t[i] = null
		}
	}
	model.init(x, t)
	for (let i = 0; i < 20; i++) {
		model.fit()
	}
	const y = model.predict(x)
	let acc = 0
	for (let i = 0; i < t.length; i++) {
		if (y[i] === t_org[i]) {
			acc++
		}
	}
	expect(acc / y.length).toBeGreaterThan(0.95)
})
