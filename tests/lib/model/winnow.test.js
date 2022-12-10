import Winnow from '../../../lib/model/winnow.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

test.each([1, 2])('fit %i', version => {
	const model = new Winnow(1.1, null, version)
	const x = []
	const n = 50
	for (let i = 0; i < n * 2; i++) {
		const v = Array(10).fill(0)
		for (let j = 0; j < 5; j++) {
			v[j + Math.floor(i / n) * 5] = Math.random() < 0.9 ? 1 : 0
		}
		x.push(v)
	}
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / 50) * 2 - 1
	}
	for (let i = 0; i < 10; i++) {
		model.fit(x, t)
	}
	const y = model.predict(x)
	const acc = accuracy(y, t)
	expect(acc).toBeGreaterThan(0.95)
})
