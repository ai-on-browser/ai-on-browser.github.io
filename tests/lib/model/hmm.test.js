import { Matrix } from '../../../lib/util/math.js'
import { HMMClassifier } from '../../../lib/model/hmm.js'

test('classifier', () => {
	const model = new HMMClassifier([0, 1], 5)
	const x = Matrix.randn(50, 2, 0, 0.2).concat(Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [Math.floor(i / 50)]
	}

	for (let i = 0; i < 100; i++) {
		model.fit(x, t, i % 2 === 0)
	}
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	let acc = 0
	for (let i = 0; i < t.length; i++) {
		if (y[i] === t[i][0]) {
			acc++
		}
	}
	expect(acc / y.length).toBeGreaterThan(0.95)
})
