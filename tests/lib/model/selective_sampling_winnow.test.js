import SelectiveSamplingWinnow from '../../../lib/model/selective_sampling_winnow.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

test('fit', () => {
	const model = new SelectiveSamplingWinnow(1, 1)
	const x = []
	const n = 50
	for (let i = 0; i < n * 2; i++) {
		const v = Array(10).fill(0)
		for (let j = 0; j < 5; j++) {
			v[j + Math.floor(i / n) * 5] = Math.random() < 0.9 ? 1 : -1
		}
		x.push(v)
	}
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / 50) * 2 - 1
	}
	model.init(x, t)
	for (let i = 0; i < 100; i++) {
		model.fit()
	}
	const y = model.predict(x)
	const acc = accuracy(y, t)
	expect(acc).toBeGreaterThan(0.95)
})
