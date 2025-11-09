import Matrix from '../../../lib/util/matrix.js'
import PELT from '../../../lib/model/pelt.js'

describe('change point detection', () => {
	test.each([undefined, 'rbf'])('cost %j', { retry: 3 }, cost => {
		const model = new PELT(0, cost)
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.random(n, 1, 0, 1), Matrix.random(n, 1, 3, 4)),
			Matrix.random(n, 1, 6, 7)
		).toArray()
		const p = model.predict(x)

		for (let i = 0; i < p.length; i++) {
			expect(p[i]).toBe(i === 50 || i === 100)
		}
	})

	test.each([
		'l1',
		'l2',
		(d, s, e) => {
			const mean = Array.from(d[0], (_, i) => d.slice(s, e).reduce((s, v) => s + v[i], 0) / (e - s))
			return d.slice(s, e).reduce((s, r) => s + r.reduce((t, v, i) => t + Math.abs(v - mean[i]), 0), 0)
		},
	])('cost %j', { retry: 3 }, cost => {
		const model = new PELT(1.0, cost)
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.random(n, 1, 0, 1), Matrix.random(n, 1, 5, 6)),
			Matrix.random(n, 1, 10, 11)
		).toArray()
		const p = model.predict(x)

		const range = 5
		let c = 0
		let o = 0
		for (let i = 0; i < p.length; i++) {
			if (i > n - range && (i % n < range || i % n >= n - range)) {
				if (p[i]) {
					c++
				}
			}
			if (p[i]) {
				o++
			}
		}
		expect(c).toBeGreaterThanOrEqual(2)
		expect(o / x.length).toBeLessThan(0.05)
	})
})
