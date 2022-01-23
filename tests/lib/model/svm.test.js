import Matrix from '../../../lib/util/matrix.js'
import SVM from '../../../lib/model/svm.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

test('default', () => {
	const model = new SVM('gaussian', [])
})

test.each([
	['gaussian', [0.2]],
	['linear', []],
])('fit %p', (kernel, args) => {
	const model = new SVM(kernel, args)
	const x = Matrix.randn(50, 2, 0, 0.2).concat(Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / 50) * 2 - 1
	}
	model.init(x, t)
	for (let i = 0; i < 100; i++) {
		model.fit()
	}
	const y = model.predict(x)
	const acc = accuracy(y.map(Math.sign), t.map(Math.sign))
	expect(acc).toBeGreaterThan(0.9)
})
