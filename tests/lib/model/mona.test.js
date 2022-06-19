import MONA from '../../../lib/model/mona.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test('clustering', () => {
	const model = new MONA()
	const n = 100
	const x = []
	for (let i = 0; i < n * 3; i++) {
		const v = Array(3).fill(0)
		v[Math.floor(i / n)] = Math.random() < 0.98 ? 1 : 0
		x.push(v)
	}

	model.init(x)
	model.fit()
	model.fit()
	const y = model.predict()
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})
