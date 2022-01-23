import Matrix from '../../../lib/util/matrix.js'
import MixtureDiscriminant from '../../../lib/model/mda.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

test('predict', () => {
	const model = new MixtureDiscriminant(5)
	const x = Matrix.randn(50, 2, 0, 0.2).concat(Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
	}

	model.init(x, t)
	for (let i = 0; i < 10; i++) {
		model.fit()
	}
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	const acc = accuracy(y, t)
	expect(acc).toBeGreaterThan(0.95)
})
