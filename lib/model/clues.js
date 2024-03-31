/**
 * CLUstEring based on local Shrinking
 */
export default class CLUES {
	// CLUES: A Non-parametric Clustering Method Based on Local Shrinking
	// https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.116.4507&rep=rep1&type=pdf
	// https://rdrr.io/cran/clues/man/clues.html
	/**
	 * @param {number} [alpha] Speed factor
	 */
	constructor(alpha = 0.05) {
		this._alpha = alpha
		this._m = 20
		this._eps = 1.0e-4
	}

	/**
	 * Number of clusters
	 *
	 * @type {number}
	 */
	get size() {
		const y = this.predict()
		return new Set(y).size
	}

	_d(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 */
	fit(datas) {
		const n = datas.length
		let k = Math.max(1, Math.round(this._alpha * n))
		const delta = Math.max(1, Math.round(this._alpha * n))
		const T = Math.max(1, Math.round(this._alpha * n))
		let smax = -Infinity

		let clusters_star = Array(n).fill(0)
		let g_star = Infinity
		let y = datas
		for (let t = 1; t <= T; t++) {
			y = this._shrinking(y, k)
			const clusters = this._partitioin(y)
			const g = new Set(clusters).size
			if (g === 1) {
				break
			}

			const a = Array(n).fill(0)
			const b = Array(n).fill(Infinity)
			const na = Array(g).fill(0)
			const dist = Array.from({ length: n }, () => [])
			for (let i = 0; i < n; i++) {
				dist[i][i] = { i, d: 0 }
				for (let j = i + 1; j < n; j++) {
					const di = this._d(y[i], y[j])
					dist[i][j] = { i: j, d: di }
					dist[j][i] = { i, d: di }
				}
				dist[i].sort((a, b) => a.d - b.d)

				for (let j = 1; j < n; j++) {
					if (clusters[i] === clusters[dist[i][j].i]) {
						a[i] += dist[i][j].d
					} else {
						b[i] = Math.min(b[i], dist[i][j].d)
					}
				}
				na[clusters[i]]++
			}
			let s = 0
			for (let i = 0; i < n; i++) {
				if (a[i] > 0) {
					a[i] /= na[clusters[i]] - 1
				}
				s += (b[i] - a[i]) / Math.max(a[i], b[i])
			}
			s /= n
			if (t === 1) {
				smax = s
				clusters_star = clusters
				g_star = g
			} else {
				const minna = Math.min(...na)
				if (minna >= T) {
					if (s > smax) {
						smax = s
						clusters_star = clusters
						g_star = g
					} else if (g === 2 || g_star === 2) {
						break
					}
				}
			}

			k += delta
		}
		this._c = clusters_star
	}

	_shrinking(data, k) {
		const n = data.length
		const p = data[0].length

		let y = data.concat()
		const dist = Array.from({ length: n }, () => [])
		for (let t = 0; t < this._m; t++) {
			const ny = []
			let d = 0
			for (let i = 0; i < n; i++) {
				dist[i][i] = { i, d: 0 }
				for (let j = i + 1; j < n; j++) {
					const di = this._d(y[i], y[j])
					dist[i][j] = { i: j, d: di }
					dist[j][i] = { i, d: di }
				}
				dist[i].sort((a, b) => a.d - b.d)

				const knns = dist[i].slice(1, k + 1).map(v => y[v.i])
				ny[i] = Array(p)
				for (let s = 0; s < p; s++) {
					const ds = knns.map(v => v[s])
					ds.sort((a, b) => a - b)
					if (knns.length % 2 === 0) {
						ny[i][s] = (ds[knns.length / 2] + ds[knns.length / 2 - 1]) / 2
					} else {
						ny[i][s] = ds[(knns.length - 1) / 2]
					}
				}
				for (let j = 0; j < ny[i].length; j++) {
					d = Math.max(d, Math.abs(ny[i][j] - y[i][j]))
				}
			}
			y = ny
			if (d < this._eps) {
				break
			}
		}

		return y
	}

	_partitioin(y) {
		const n = y.length
		const dist = Array.from({ length: n }, () => [])
		for (let i = 0; i < n; i++) {
			dist[i][i] = { i, d: 0 }
			for (let j = i + 1; j < n; j++) {
				const di = this._d(y[i], y[j])
				dist[i][j] = { i: j, d: di }
				dist[j][i] = { i, d: di }
			}
			dist[i].sort((a, b) => a.d - b.d)
		}

		let a = 0
		const su = [a]
		const db = [0]
		const checked = Array(n).fill(false)
		for (let i = 0; i < n - 1; i++) {
			checked[a] = true
			for (let j = 1; j < n; j++) {
				if (!checked[dist[a][j].i]) {
					db.push(dist[a][j].d)
					su.push(dist[a][j].i)
					a = dist[a][j].i
					break
				}
			}
		}

		const db_tmp = db.concat()
		db_tmp.sort((a, b) => a - b)
		const q = p => {
			const np = (db_tmp.length - 1) * p
			const np_l = Math.floor(np)
			const np_h = Math.ceil(np)
			return db_tmp[np_l] + (np - np_l) * (db_tmp[np_h] - db_tmp[np_l])
		}
		const iqr = q(0.75) - q(0.25)

		const r = db.reduce((s, v) => s + v, 0) / (n - 1) + 1.5 * iqr

		const clusters = []
		let c = 0
		for (let i = 0; i < n; i++) {
			if (db[i] > r) {
				c++
			}
			clusters[su[i]] = c
		}
		return clusters
	}

	/**
	 * Returns predicted categories.
	 *
	 * @returns {number[]} Predicted values
	 */
	predict() {
		return this._c
	}
}
