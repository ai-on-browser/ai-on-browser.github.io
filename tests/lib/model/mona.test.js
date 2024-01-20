import MONA from '../../../lib/model/mona.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

describe('clustering', () => {
	test('3 clusters', () => {
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
		expect(model.size).toBe(3)
		const y = model.predict()
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})

	test('4 clusters', () => {
		const model = new MONA()
		const n = 100
		const x = []
		for (let i = 0; i < n * 4; i++) {
			const v = Array(4).fill(0)
			for (let j = 0; j <= Math.floor(i / n); j++) {
				v[j] = 1
			}
			x.push(v)
		}

		model.init(x)
		model.fit()
		model.fit()
		expect(model.size).toBe(4)
		const y = model.predict()
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.8)
	})
})
