import CBLOF from '../../../lib/model/cblof.js'
import Matrix from '../../../lib/util/matrix.js'

class KMeans {
	constructor(x, k) {
		this._x = x
		this._k = k

		const n = this._x.length
		const idx = []
		for (let i = 0; i < this._k; i++) {
			idx.push(Math.floor(Math.random() * (n - i)))
		}
		for (let i = idx.length - 1; i >= 0; i--) {
			for (let j = idx.length - 1; j > i; j--) {
				if (idx[i] <= idx[j]) {
					idx[j]++
				}
			}
		}
		this._c = idx.map(v => this._x[v])
		this._d = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	fit() {
		let isChanged = true
		while (isChanged) {
			const p = this.predict()

			const c = this._c.map(p => Array.from(p, () => 0))
			const count = Array(this._k).fill(0)
			const n = this._x.length
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < this._x[i].length; j++) {
					c[p[i]][j] += this._x[i][j]
				}
				count[p[i]]++
			}
			isChanged = false
			for (let k = 0; k < this._k; k++) {
				const mc = c[k].map(v => v / count[k])
				isChanged |= mc.some((v, i) => v !== this._c[k][i])
				this._c[k] = mc
			}
		}
	}

	predict() {
		return this._x.map(x => {
			let min_d = Infinity
			let p = -1
			for (let k = 0; k < this._k; k++) {
				const d = this._d(x, this._c[k])
				if (d < min_d) {
					min_d = d
					p = k
				}
			}
			return p
		})
	}
}

describe('anomaly detection', () => {
	test.each([
		undefined,
		'min',
		(v, c) => c.reduce((s, ci) => s + v.reduce((s, a, j) => s + (a - ci[j]) ** 2, 0), 0) / c.length,
	])('distance %s', dist => {
		const model = new CBLOF(
			0.5,
			1.1,
			v => {
				const mdl = new KMeans(v, 5)
				mdl.fit()
				return mdl.predict()
			},
			dist
		)
		const x = Matrix.randn(100, 2, 0, 0.2).toArray()
		x.push([10, 10])
		const threshold = 100
		const y = model.predict(x).map(v => v > threshold)
		for (let i = 0; i < y.length - 1; i++) {
			expect(y[i]).toBe(false)
		}
		expect(y[y.length - 1]).toBe(true)
	})
})
