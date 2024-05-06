/**
 * Adaptive Metric Nearest Neighbor
 */
export default class ADAMENN {
	// Adaptive Metric Nearest Neighbor Classification
	// https://cs.gmu.edu/~carlotta/publications/cvpr.pdf
	/**
	 * @param {number} [k0] The number of neighbors of the test point
	 * @param {number} [k1] The number of neighbors in N1 for estimation
	 * @param {number} [k2] The size of the neighborhood N2 for each of the k0 neighbors for estimation
	 * @param {number} [l] The number of points within the delta intervals
	 * @param {number} [k] The number of neighbors in the final nearest neighbor rule
	 * @param {number} [c] The positive factor for the exponential weighting scheme
	 */
	constructor(k0 = null, k1 = 3, k2 = null, l = null, k = 3, c = 0.5) {
		this._k0 = k0
		this._k1 = k1
		this._k2 = k2
		this._l = l
		this._k = k
		this._c = c

		this._itr = 2
	}

	_d(a, b, w) {
		return Math.sqrt(a.reduce((s, v, i) => s + w[i] * (v - b[i]) ** 2, 0))
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {*[]} y Target values
	 */
	fit(x, y) {
		this._x = x
		this._y = y
		this._classes = [...new Set(y)]

		if (!this._k0) {
			this._k0 = Math.ceil(this._x.length * 0.1)
		}
		if (!this._k2) {
			this._k2 = Math.ceil(this._x.length * 0.15)
		}
		if (!this._l) {
			this._l = Math.ceil(this._k2 / 2)
		}
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(datas) {
		const n = this._x.length
		const q = this._x[0].length
		return datas.map(x0 => {
			const w = Array(q).fill(1 / q)
			for (let it = 0; it < this._itr; it++) {
				const d = []
				for (let j = 0; j < n; j++) {
					d[j] = { i: j, d: this._d(x0, this._x[j], w) }
				}
				d.sort((a, b) => a.d - b.d)

				const nd = []
				const prhat = Array.from({ length: this._classes.length }, () => [])
				const prbar = Array.from({ length: this._classes.length }, () => Array.from({ length: q }, () => []))
				for (let k0 = 0; k0 < this._k0; k0++) {
					const zi = d[k0 + 1].i
					nd[zi] = []
					for (let j = 0; j < n; j++) {
						if (j === zi) {
							nd[zi][j] = { i: j, d: 0 }
						} else {
							nd[zi][j] = { i: j, d: this._d(this._x[zi], this._x[j], w) }
						}
					}
					nd[zi].sort((a, b) => a.d - b.d)
					for (let c = 0; c < this._classes.length; c++) {
						prhat[c][k0] = 0
						for (let k1 = 0; k1 < this._k1; k1++) {
							if (this._y[nd[zi][k1 + 1].i] === this._classes[c]) {
								prhat[c][k0]++
							}
						}
						prhat[c][k0] /= this._k1
					}

					for (let t = 0; t < q; t++) {
						const fd = []
						for (let j = 0; j < n; j++) {
							fd[j] = { i: j, d: Math.abs(this._x[zi][t] - this._x[j][t]) }
						}
						fd.sort((a, b) => a.d - b.d)

						const tidx = []
						for (let l = 0; l < n - 1 && tidx.length < this._l; l++) {
							for (let k2 = 0; k2 < this._k2; k2++) {
								if (fd[l + 1].i === nd[zi][k2 + 1].i) {
									tidx.push(fd[l + 1].i)
									break
								}
							}
						}
						for (let c = 0; c < this._classes.length; c++) {
							prbar[c][t][k0] = 0
							for (let j = 0; j < tidx.length; j++) {
								if (this._y[tidx[j]] === this._classes[c]) {
									prbar[c][t][k0]++
								}
							}
							prhat[c][k0] /= tidx.length
						}
					}
				}

				const r = Array(q).fill(0)
				for (let t = 0; t < q; t++) {
					for (let k0 = 0; k0 < this._k0; k0++) {
						for (let c = 0; c < this._classes.length; c++) {
							if (prbar[c][t][k0] > 0) {
								r[t] += (prhat[c][k0] - prbar[c][t][k0]) ** 2 / prbar[c][t][k0]
							}
						}
					}
					r[t] /= this._k0
				}
				const er = r.map(v => Math.exp(this._c / v))
				const sumer = er.reduce((s, v) => s + v, 0)
				const oldw = w.concat()
				for (let t = 0; t < q; t++) {
					w[t] = er[t] / sumer
				}
				const e = oldw.reduce((s, v, t) => s + (v - w[t]) ** 2, 0)
				if (e < 1.0e-32) {
					break
				}
			}

			const d = []
			for (let i = 0; i < n; i++) {
				d[i] = { i, d: this._d(x0, this._x[i], w) }
			}
			d.sort((a, b) => a.d - b.d)

			const clss = {}
			for (let i = 0; i < this._k; i++) {
				const cat = this._y[d[i + 1].i]
				if (!clss[cat]) {
					clss[cat] = {
						category: cat,
						count: 1,
						min_d: d[i + 1].d,
					}
				} else {
					clss[cat].count += 1
					clss[cat].min_d = Math.min(clss[cat].min_d, d[i + 1].d)
				}
			}
			let max_count = 0
			let min_dist = -1
			let target_cat = null
			for (const k of Object.keys(clss)) {
				if (max_count < clss[k].count || (max_count === clss[k].count && clss[k].min_d < min_dist)) {
					max_count = clss[k].count
					min_dist = clss[k].min_d
					target_cat = clss[k].category
				}
			}
			return target_cat
		})
	}
}
