/**
 * a Fast and INtelligent subspace clustering algorithm using DImension voting
 */
export default class FINDIT {
	// FINDIT: a fast and intelligent subspace clustering algorithm using dimension voting
	// https://citeseerx.ist.psu.edu/document?repid=rep1&type=pdf&doi=78b445444ff16bc18f637922165c0e64ecfba6ba
	/**
	 * @param {number} minsize Mininum size of clusters
	 * @param {number} mindist Merge threshold
	 */
	constructor(minsize, mindist) {
		this._cminsize = minsize
		this._dmindist = mindist

		this._sminsize = 30
		this._mminsize = 1
		this._delta = 0.01
		this._rho = 1

		this._V = 20

		this._penaltyDim = 2
		this._avgdThreshold = 0.95
	}

	/**
	 * Number of clusters
	 *
	 * @type {number}
	 */
	get size() {
		return this._mcs?.length ?? 0
	}

	_chernoffBounds(xi, k, rho, delta) {
		const krho = k * rho
		const ln1d = Math.log(1 / delta)
		return xi * krho + krho * ln1d + krho * Math.sqrt(ln1d ** 2 + 2 * xi * ln1d)
	}

	_sample(n, k) {
		k = Math.min(n, k)
		const idx = []
		for (let i = 0; i < k; i++) {
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

	_binomial(k, n, p) {
		let v = 1
		for (let i = 0; i < k; i++) {
			v *= n - i
			v /= i + 1
		}
		return v * p ** k * (1 - p) ** (n - k)
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 */
	fit(datas) {
		const x = datas
		const dim = x[0].length

		const k = x.length / this._cminsize
		const sbound = this._chernoffBounds(this._sminsize, k, this._rho, this._delta)
		const mbound = this._chernoffBounds(this._mminsize, k, this._rho, this._delta)

		const s = this._sample(x.length, sbound)
		const m = this._sample(x.length, mbound)

		this._m = m.map(v => x[v])

		const valuedomain = Array.from({ length: dim }, () => [Infinity, -Infinity])
		for (let i = 0; i < x.length; i++) {
			for (let d = 0; d < dim; d++) {
				valuedomain[d][0] = Math.min(valuedomain[d][0], x[i][d])
				valuedomain[d][1] = Math.max(valuedomain[d][1], x[i][d])
			}
		}
		const valuerange = valuedomain.map(vd => vd[1] - vd[0])
		let best_soundness = 0
		let best_e = null
		let best_mcs = null
		let best_kd = null
		for (let t = 1; t <= 25; t++) {
			const e = valuerange.map(vr => (vr * t) / 100)

			const kd = []
			for (let k = 0; k < m.length; k++) {
				const dod = []
				for (let i = 0; i < s.length; i++) {
					dod[i] = { i, d: dim, vote: Array(dim) }
					for (let d = 0; d < dim; d++) {
						dod[i].vote[d] = Math.abs(x[m[k]][d] - x[s[i]][d]) <= e[d]
						if (dod[i].vote[d]) {
							dod[i].d--
						}
					}
				}
				dod.sort((a, b) => a.d - b.d)

				let th = this._V
				let cumsum = 0
				for (; th >= 0; th--) {
					cumsum += this._binomial(th, this._V, (2 * t) / 100)
					if (cumsum >= 1.0e-8) {
						break
					}
				}

				kd[k] = []
				for (let d = 0; d < dim; d++) {
					let votes = 0
					for (let i = 0; i < this._V; i++) {
						if (dod[i].vote[d]) {
							votes++
						}
					}
					if (votes > th) {
						kd[k].push(d)
					}
				}
			}

			const assign = Array.from(m, () => [])
			for (let i = 0; i < s.length; i++) {
				let min_dod = Infinity
				let min_k = -1
				for (let k = 0; k < m.length; k++) {
					let dod_dir = kd[k].length
					for (const d of kd[k]) {
						if (Math.abs(x[s[i]][d] - x[m[k]][d]) <= e[d]) {
							dod_dir--
						}
					}
					if (dod_dir === 0) {
						let dod = dim
						for (let d = 0; d < dim; d++) {
							if (Math.abs(x[s[i]][d] - x[m[k]][d]) <= e[d]) {
								dod--
							}
						}
						if (dod < min_dod) {
							min_dod = dod
							min_k = k
						}
					}
				}
				if (min_k >= 0) {
					assign[min_k].push(i)
				}
			}

			const dod_m = Array.from(m, () => [])
			const dod_mc = Array.from(m, () => [])
			for (let i = 0; i < m.length; i++) {
				dod_m[i][i] = dod_mc[i][i] = 0
				for (let j = 0; j < i; j++) {
					let count = 0
					for (const d of kd[i]) {
						if (kd[j].indexOf(d) >= 0 && Math.abs(x[m[i]][d] - x[m[j]][d]) <= e[d]) {
							count++
						}
					}
					if (count <= this._penaltyDim) {
						dod_m[i][j] = dod_m[j][i] = dim
					} else {
						dod_m[i][j] = dod_m[j][i] = Math.max(kd[i].length, kd[j].length) - count
					}
					dod_mc[i][j] = dod_mc[j][i] = dod_m[i][j]
				}
			}
			const mcs = Array.from(m, (_, i) => [i])
			while (true) {
				let min_dod = Infinity
				let min_a = -1
				let min_b = -1
				for (let a = 0; a < mcs.length; a++) {
					for (let b = 0; b < a; b++) {
						if (dod_mc[a][b] < min_dod && dod_mc[a][b] <= this._dmindist) {
							min_dod = dod_mc[a][b]
							min_a = a
							min_b = b
						}
					}
				}
				if (min_a < 0 || min_b < 0) {
					break
				}
				mcs[min_b] = mcs[min_b].concat(mcs[min_a])
				for (let a = 0; a < mcs.length; a++) {
					if (a === min_a || a === min_b) continue
					let dod = 0
					for (const i of mcs[min_b]) {
						for (const j of mcs[a]) {
							dod += assign[i].length * assign[j].length * dod_m[i][j]
						}
					}
					dod /=
						mcs[min_b].reduce((s, v) => s + assign[v].length, 0) *
						mcs[a].reduce((s, v) => s + assign[v].length, 0)
					dod_mc[min_b][a] = dod_mc[a][min_b] = dod
					dod_mc[a].splice(min_a, 1)
				}
				dod_mc[min_b].splice(min_a, 1)
				mcs.splice(min_a, 1)
				dod_mc.splice(min_a, 1)
			}

			const kd_mc = []
			for (let k = 0; k < mcs.length; k++) {
				kd_mc[k] = []
				const counts = Array(dim).fill(0)
				for (let i = 0; i < mcs[k].length; i++) {
					for (const d of kd[mcs[k][i]]) {
						counts[d]++
					}
				}
				for (let d = 0; d < dim; d++) {
					if (counts[d] / mcs[k].length >= this._avgdThreshold) {
						kd_mc[k].push(d)
					}
				}
			}

			const merged = Array(mcs.length).fill(-1)
			const orgMcs = mcs.map(v => v.concat())
			for (let a = mcs.length - 1; a >= 0; a--) {
				for (let b = a + 1; b < mcs.length; b++) {
					if (merged[b] === a) continue
					let dod = 0
					for (const i of orgMcs[a]) {
						for (const j of orgMcs[b]) {
							let count = 0
							for (const d of kd_mc[a]) {
								if (kd_mc[b].indexOf(d) >= 0 && Math.abs(x[m[i]][d] - x[m[j]][d]) <= e[d]) {
									count++
								}
							}
							let dod_m =
								count <= this._penaltyDim ? dim : Math.max(kd_mc[a].length, kd_mc[b].length) - count
							dod += assign[i].length * assign[j].length * dod_m
						}
					}
					dod /=
						orgMcs[a].reduce((s, v) => s + assign[v].length, 0) *
						orgMcs[b].reduce((s, v) => s + assign[v].length, 0)
					if (dod <= this._dmindist) {
						if (merged[b] >= 0) {
							mcs[a] = mcs[a].concat(mcs[merged[b]])
							for (let c = a + 1; c < mcs.length; c++) {
								if (c === b) continue
								if (merged[c] === merged[b]) {
									merged[c] = a
								}
							}
							merged[merged[b]] = a
						} else {
							mcs[a] = mcs[a].concat(mcs[b])
							for (let c = a + 1; c < mcs.length; c++) {
								if (merged[c] === b) {
									merged[c] = a
								}
							}
						}
						merged[b] = a
					}
				}
			}

			let soundness = 0
			for (let k = mcs.length - 1; k >= 0; k--) {
				if (merged[k] >= 0 || mcs[k].length < this._sminsize) {
					mcs.splice(k, 1)
					kd_mc.splice(k, 1)
					continue
				}
				kd_mc[k] = []
				const counts = Array(dim).fill(0)
				for (let i = 0; i < mcs[k].length; i++) {
					for (const d of kd[mcs[k][i]]) {
						counts[d]++
					}
				}
				for (let d = 0; d < dim; d++) {
					if (counts[d] / mcs[k].length >= this._avgdThreshold) {
						kd_mc[k].push(d)
					}
				}
				soundness += mcs[k].reduce((s, v) => s + assign[v].length, 0) * kd_mc[k].length
			}
			if (best_soundness < soundness) {
				best_soundness = soundness
				best_e = e
				best_mcs = mcs
				best_kd = kd_mc
			}
		}

		this._e = best_e
		this._mcs = best_mcs
		this._kd = best_kd
	}

	/**
	 * Returns predicted categories.
	 *
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {number[]} Predicted categories
	 */
	predict(x) {
		const dim = this._m[0].length
		const p = Array(x.length).fill(-1)
		if (!this._mcs) {
			return p
		}
		for (let i = 0; i < x.length; i++) {
			let min_dod = Infinity
			let min_k = -1
			for (let k = 0; k < this._mcs.length; k++) {
				for (let j = 0; j < this._mcs[k].length; j++) {
					let dod_dir = this._kd[k].length
					for (const d of this._kd[k]) {
						if (Math.abs(x[i][d] - this._m[this._mcs[k][j]][d]) <= this._e[d]) {
							dod_dir--
						}
					}
					if (dod_dir === 0) {
						let dod = dim
						for (let d = 0; d < dim; d++) {
							if (Math.abs(x[i][d] - this._m[this._mcs[k][j]][d]) <= this._e[d]) {
								dod--
							}
						}
						if (dod < min_dod) {
							min_dod = dod
							min_k = k
						}
					}
				}
			}
			p[i] = min_k
		}
		return p
	}
}
