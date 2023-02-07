/**
 * PROjected CLUStering algorithm
 */
export default class PROCLUS {
	// Fast Algorithms for Projected Clustering
	// https://dl.acm.org/doi/pdf/10.1145/304181.304188
	/**
	 * @param {number} k Number of clusters
	 * @param {number} a Number to multiply the number of clusters for sample size
	 * @param {number} b Number to multiply the number of clusters for final set size
	 * @param {number} l Average dimensions
	 * @param {number} [minDeviation=0.1] Minimum deviation to check the medoid is bad
	 */
	constructor(k, a, b, l, minDeviation = 0.1) {
		this._k = k
		this._a = a
		this._b = b
		this._l = l
		this._minDeviation = minDeviation

		this._d = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	_sample(n, k) {
		const idx = []
		for (let i = 0; i < k && i < n; i++) {
			idx.push(Math.floor(Math.random() * (n - i)))
		}
		for (let i = idx.length - 1; i >= 0; i--) {
			for (let j = idx.length - 1; j > i; j--) {
				if (idx[i] <= idx[j]) {
					idx[j]++
				}
			}
		}
		return idx
	}

	/**
	 * Initialize model.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 */
	init(datas) {
		this._x = datas
		this._dists = []
		for (let i = 0; i < this._x.length; i++) {
			this._dists[i] = []
			this._dists[i][i] = 0
			for (let j = 0; j < i; j++) {
				this._dists[i][j] = this._dists[j][i] = this._d(this._x[i], this._x[j])
			}
		}
		const idx = this._sample(this._x.length, this._k * this._a)

		this._m = [idx[Math.floor(Math.random() * idx.length)]]
		const dist = Array(idx.length).fill(Infinity)
		for (let i = 1; i < this._k * this._b; i++) {
			let max_k = -1
			let max_d = 0
			const xi = this._m[this._m.length - 1]
			for (let k = 0; k < idx.length; k++) {
				dist[k] = Math.min(dist[k], this._dists[xi][idx[k]])
				if (max_d < dist[k]) {
					max_d = dist[k]
					max_k = idx[k]
				}
			}
			this._m.push(max_k)
		}

		this._bestObjective = Infinity
		this._mcurrent = this._sample(this._m.length, this._k).map(i => this._m[i])
	}

	/**
	 * Fit model.
	 */
	fit() {
		const n = this._x.length
		const L = []
		for (let i = 0; i < this._k; i++) {
			let di = Infinity
			for (let k = 0; k < this._k; k++) {
				if (i === k) continue
				const d = this._dists[this._mcurrent[i]][this._mcurrent[k]]
				if (d < di) {
					di = d
				}
			}
			L[i] = []
			for (let k = 0; k < n; k++) {
				if (k === this._mcurrent[i]) continue
				if (this._dists[this._mcurrent[i]][k] < di) {
					L[i].push(k)
				}
			}
		}

		const D = this._findDimensions(this._mcurrent, L)
		const C = this._assignPoints(this._mcurrent, D)

		const w = Array(this._k).fill(0)
		for (let k = 0; k < this._k; k++) {
			for (let i = 0; i < C[k].length; i++) {
				for (const d of D[k]) {
					w[k] += Math.abs(this._x[C[k][i]][d] - this._x[this._mcurrent[k]][d])
				}
			}
			w[k] /= D[k].length
		}
		const of = w.reduce((s, v) => s + v, 0) / n
		if (of < this._bestObjective) {
			this._bestObjective = of
			this._mbest = this._mcurrent
			this._clusters = C
		}
		this._mcurrent = this._mbest.concat()
		for (let k = 0; k < this._k; k++) {
			if (this._clusters[k].length < (n / this._k) * this._minDeviation) {
				for (let t = 0; t < 100; t++) {
					const i = this._m[Math.floor(Math.random() * this._m.length)]
					if (this._mcurrent.indexOf(i) < 0) {
						this._mcurrent[k] = i
						break
					}
				}
			}
		}
	}

	_findDimensions(m, L) {
		const dim = this._x[0].length

		const D = []
		const Z = []
		for (let i = 0; i < this._k; i++) {
			const x = Array(dim).fill(0)
			for (let k = 0; k < L[i].length; k++) {
				for (let d = 0; d < dim; d++) {
					x[d] += Math.abs(this._x[m[i]][d] - this._x[L[i][k]][d])
				}
			}
			for (let d = 0; d < dim; d++) {
				x[d] /= L[i].length
			}

			const y = x.reduce((s, v) => s + v, 0) / dim
			D[i] = []
			const s = Math.sqrt(x.reduce((s, v) => s + (v - y) ** 2, 0) / (dim - 1))
			for (let d = 0; d < dim; d++) {
				Z.push([i, d, (x[d] - y) / s])
			}
		}
		Z.sort((a, b) => a[2] - b[2])
		let extValues = this._k * (this._l - 2)
		for (let i = 0; i < Z.length; i++) {
			if (D[Z[i][0]].length < 2) {
				D[Z[i][0]].push(Z[i][1])
			} else if (extValues > 0) {
				D[Z[i][0]].push(Z[i][1])
				extValues--
			}
		}
		return D
	}

	_assignPoints(m, D) {
		const C = Array.from({ length: this._k }, () => [])
		for (let i = 0; i < this._x.length; i++) {
			let min_d = Infinity
			let min_k = -1
			for (let k = 0; k < this._k; k++) {
				const d = D[k].reduce((s, d) => s + Math.abs(this._x[i][d] - this._x[m[k]][d]), 0)
				if (d < min_d) {
					min_d = d
					min_k = k
				}
			}
			C[min_k].push(i)
		}
		return C
	}

	/**
	 * Returns predicted categories.
	 *
	 * @returns {number[]} Predicted values
	 */
	predict() {
		this._D = this._findDimensions(this._mbest, this._clusters)
		const C = this._assignPoints(this._mbest, this._D)
		const p = []
		for (let k = 0; k < C.length; k++) {
			for (let i = 0; i < C[k].length; i++) {
				p[C[k][i]] = k
			}
		}
		return p
	}

	/**
	 * Returns a list of the data predicted as outliers or not.
	 *
	 * @returns {boolean[]} Predicted values
	 */
	outliers() {
		this._D = this._findDimensions(this._mbest, this._clusters)
		const C = this._assignPoints(this._mbest, this._D)
		const outliers = Array(this._x.length).fill(false)
		for (let k = 0; k < this._k; k++) {
			let min_d = Infinity
			for (let j = 0; j < this._k; j++) {
				if (k === j) continue
				const d = this._D[k].reduce(
					(s, d) => s + Math.abs(this._x[this._mbest[k]][d] - this._x[this._mbest[j]][d]),
					0
				)
				if (d < min_d) {
					min_d = d
				}
			}
			for (let i = 0; i < C[k].length; i++) {
				const d = this._D[k].reduce((s, d) => s + Math.abs(this._x[this._mbest[k]][d] - this._x[C[k][i]][d]), 0)
				if (d > min_d) {
					outliers[C[k][i]] = true
				}
			}
		}
		return outliers
	}
}
