import Matrix from '../../../lib/util/matrix.js'
import Banditron from '../../../lib/model/banditron.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

test.each([undefined, 0.1])('predict gamma: %p', gamma => {
	const model = new Banditron(gamma)
	const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
	}
	for (let i = 0; i < 100; i++) {
		model.fit(x, t)
	}
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	const acc = accuracy(y, t)
	expect(acc).toBeGreaterThan(0.9)
})
