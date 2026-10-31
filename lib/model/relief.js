const range = x => {
	const n = x.length
	const a = x[0].length
	const range = []
	for (let j = 0; j < a; j++) {
		let max = -Infinity
		let min = Infinity
		for (let i = 0; i < n; i++) {
			if (typeof x[i][j] !== 'number') continue
			max = Math.max(x[i][j], max)
			min = Math.min(x[i][j], min)
		}
		range[j] = max - min
	}
	return range
}

/**
 * Relief
 */
export default class Relief {
	// https://en.wikipedia.org/wiki/Relief_(feature_selection)
	// A Practical Approach to Feature selection
	// https://sci2s.ugr.es/keel/pdf/algorithm/congreso/kira1992.pdf
	// Relief-Based Feature Selection: Introduction and Review
	// https://arxiv.org/pdf/1711.08421
	/**
	 * @param {number} m Number of random training instances
	 * @param {number} tau Relevance threshold
	 */
	constructor(m, tau) {
		this._m = m
		this._tau = tau
	}

	_diffAll(x1, x2, r) {
		return x1.reduce((s, _, i) => s + this._diff(x1[i], x2[i], r[i]), 0)
	}

	_diff(x1, x2, r) {
		if (typeof x1 === 'number' && typeof x2 === 'number') {
			return Math.abs(x1 - x2) / r
		}
		return x1 === x2 ? 0 : 1
	}

	/**
	 * Fit model.
	 * @param {Array<Array<*>>} x Training data
	 * @param {Array<0 | 1>} y Target values
	 */
	fit(x, y) {
		const n = x.length
		const a = x[0].length
		const rng = range(x)
		this._w = Array(a).fill(0)
		for (let i = 0; i < this._m; i++) {
			const idx = Math.floor(Math.random() * n)
			const r = x[idx]
			const d = x.map((v, i) => ({ d: this._diffAll(r, v, rng), i }))
			d.sort((a, b) => a.d - b.d)

			let h = -1
			let m = -1
			for (let k = 1; k < n && (h < 0 || m < 0); k++) {
				if (h < 0 && y[idx] === y[d[k].i]) {
					h = x[d[k].i]
				} else if (m < 0 && y[idx] !== y[d[k].i]) {
					m = x[d[k].i]
				}
			}
			for (let j = 0; j < a; j++) {
				this._w[j] += (this._diff(r[j], m[j], rng[j]) - this._diff(r[j], h[j], rng[j])) / this._m
			}
		}
		this._w = this._w.map((v, i) => [v, i])
		this._w.sort((a, b) => b[0] - a[0])
	}

	/**
	 * Returns feature selected values.
	 * @param {Array<Array<*>>} x Sample data
	 * @returns {Array<Array<*>>} Predicted values
	 */
	predict(x) {
		const widx = this._w.filter(w => w[0] >= this._tau).map(w => w[1])
		return x.map(d => widx.map(i => d[i]))
	}
}

/**
 * ReliefA
 */
export class ReliefA {
	// https://en.wikipedia.org/wiki/Relief_(feature_selection)
	// Estimating Attributes: Analysis and Extensions of RELIEF
	// https://scispace.com/pdf/estimating-attributes-analysis-and-extensions-of-relief-3ud3jlyrvq.pdf
	// Relief-Based Feature Selection: Introduction and Review
	// https://arxiv.org/pdf/1711.08421
	/**
	 * @param {number} m Number of random training instances
	 * @param {number} tau Relevance threshold
	 * @param {number} k Number of neighborhoods
	 */
	constructor(m, tau, k) {
		this._k = k
		this._m = m
		this._tau = tau
	}

	_diffAll(x1, x2, r) {
		return x1.reduce((s, _, i) => s + this._diff(x1[i], x2[i], r[i]), 0)
	}

	_diff(x1, x2, r) {
		if (typeof x1 === 'number' && typeof x2 === 'number') {
			return Math.abs(x1 - x2) / r
		}
		return x1 === x2 ? 0 : 1
	}

	/**
	 * Fit model.
	 * @param {Array<Array<*>>} x Training data
	 * @param {Array<0 | 1>} y Target values
	 */
	fit(x, y) {
		const n = x.length
		const a = x[0].length
		const rng = range(x)
		this._w = Array(a).fill(0)
		for (let t = 0; t < this._m; t++) {
			const idx = Math.floor(Math.random() * n)
			const r = x[idx]
			const h = []
			const m = []
			for (let i = 0; i < n; i++) {
				if (i === idx) {
					continue
				}
				const v = { d: this._diffAll(r, x[i], rng), i }
				if (y[i] === y[idx]) {
					h.push(v)
				} else {
					m.push(v)
				}
			}
			h.sort((a, b) => a.d - b.d)
			m.sort((a, b) => a.d - b.d)

			for (let j = 0; j < a; j++) {
				let d = 0
				for (let k = 0; k < this._k; k++) {
					d -= this._diff(r[j], x[h[k].i][j], rng[j])
					d += this._diff(r[j], x[m[k].i][j], rng[j])
				}
				this._w[j] += d / (this._k * this._m)
			}
		}
		this._w = this._w.map((v, i) => [v, i])
		this._w.sort((a, b) => b[0] - a[0])
	}

	/**
	 * Returns feature selected values.
	 * @param {Array<Array<*>>} x Sample data
	 * @returns {Array<Array<*>>} Predicted values
	 */
	predict(x) {
		const widx = this._w.filter(w => w[0] >= this._tau).map(w => w[1])
		return x.map(d => widx.map(i => d[i]))
	}
}

/**
 * ReliefB / ReliefC / ReliefD
 */
export class ReliefD {
	// Estimating Attributes: Analysis and Extensions of RELIEF
	// https://scispace.com/pdf/estimating-attributes-analysis-and-extensions-of-relief-3ud3jlyrvq.pdf
	/**
	 * @param {number} m Number of random training instances
	 * @param {number} tau Relevance threshold
	 * @param {number} k Number of neighborhoods
	 * @param {'B' | 'C' | 'D'} [type] Version of Relief
	 */
	constructor(m, tau, k, type = 'D') {
		this._k = k
		this._m = m
		this._tau = tau
		this._type = type
	}

	_diffAll(x1, x2, y1, y2, r, ca) {
		let s = 0
		let cnt = 0
		for (let i = 0; i < x1.length; i++) {
			const d = this._diff(x1[i], x2[i], y1, y2, r[i], ca[i])
			if (d === null) {
				continue
			}
			cnt++
			s += d
		}
		return s / cnt
	}

	_diff(x1, x2, y1, y2, r, ca) {
		if (x1 === undefined || x2 === undefined) {
			if (this._type === 'B') {
				return 1 - 1 / ca
			} else if (this._type === 'C') {
				return null
			}
			return ca(x1, x2, y1, y2)
		}
		if (typeof x1 === 'number' && typeof x2 === 'number') {
			return Math.abs(x1 - x2) / r
		}
		return x1 === x2 ? 0 : 1
	}

	/**
	 * Fit model.
	 * @param {Array<Array<*>>} x Training data. `undefined` is recognized as a missing value
	 * @param {Array<0 | 1>} y Target values
	 */
	fit(x, y) {
		const n = x.length
		const a = x[0].length
		const rng = range(x)
		const counta = []
		if (this._type === 'B') {
			for (let j = 0; j < a; j++) {
				counta[j] = x.reduce((s, v) => s + (v[j] !== undefined ? 1 : 0), 0)
			}
		} else if (this._type === 'D') {
			const count = [0, 0]
			for (let i = 0; i < n; i++) {
				count[y[i]]++
			}
			for (let j = 0; j < a; j++) {
				const ca = {}
				for (let i = 0; i < n; i++) {
					if (!ca[x[i][j]]) {
						ca[x[i][j]] = [0, 0]
					}
					ca[x[i][j]][y[i]]++
				}
				for (const k of Object.keys(ca)) {
					ca[k][0] /= count[0]
					ca[k][1] /= count[1]
				}
				counta[j] = (x1, x2, y1, y2) => {
					let s = 0
					if (x1 === undefined && x2 === undefined) {
						for (const k of Object.keys(ca)) {
							s += ca[k][y1] * ca[k][y2]
						}
					} else if (x1 === undefined) {
						s = ca[x2][y1] ?? 0
					} else {
						s = ca[x1][y2] ?? 0
					}
					return 1 - s
				}
			}
		}
		this._w = Array(a).fill(0)
		for (let t = 0; t < this._m; t++) {
			const idx = Math.floor(Math.random() * n)
			const r = x[idx]
			const h = []
			const m = []
			for (let i = 0; i < n; i++) {
				if (i === idx) {
					continue
				}
				const v = { d: this._diffAll(r, x[i], y[idx], y[i], rng, counta), i }
				if (y[i] === y[idx]) {
					h.push(v)
				} else {
					m.push(v)
				}
			}
			h.sort((a, b) => a.d - b.d)
			m.sort((a, b) => a.d - b.d)

			for (let j = 0; j < a; j++) {
				let d = 0
				let cnt = 0
				for (let k = 0; k < this._k; k++) {
					const dmk = this._diff(r[j], x[m[k].i][j], y[idx], y[m[k].i], rng[j], counta[j])
					const dhk = this._diff(r[j], x[h[k].i][j], y[idx], y[h[k].i], rng[j], counta[j])
					if (dmk == null || dhk == null) {
						continue
					}
					d += dmk - dhk
					cnt++
				}
				if (cnt === 0) {
					continue
				}
				this._w[j] += d / (cnt * this._m)
			}
		}
		this._w = this._w.map((v, i) => [v, i])
		this._w.sort((a, b) => b[0] - a[0])
	}

	/**
	 * Returns feature selected values.
	 * @param {Array<Array<*>>} x Sample data
	 * @returns {Array<Array<*>>} Predicted values
	 */
	predict(x) {
		const widx = this._w.filter(w => w[0] >= this._tau).map(w => w[1])
		return x.map(d => widx.map(i => d[i]))
	}
}

/**
 * ReliefE / ReliefF
 */
export class ReliefF {
	// Estimating Attributes: Analysis and Extensions of RELIEF
	// https://scispace.com/pdf/estimating-attributes-analysis-and-extensions-of-relief-3ud3jlyrvq.pdf
	/**
	 * @param {number} m Number of random training instances
	 * @param {number} tau Relevance threshold
	 * @param {number} k Number of neighborhoods
	 * @param {'E' | 'F'} [type] Version of Relief
	 */
	constructor(m, tau, k, type = 'F') {
		this._k = k
		this._m = m
		this._tau = tau
		this._type = type
	}

	_diffAll(x1, x2, y1, y2, r, ca) {
		return x1.reduce((s, _, i) => s + this._diff(x1[i], x2[i], y1, y2, r[i], ca[i]), 0)
	}

	_diff(x1, x2, y1, y2, r, ca) {
		if (x1 === undefined || x2 === undefined) {
			return ca(x1, x2, y1, y2)
		}
		if (typeof x1 === 'number' && typeof x2 === 'number') {
			return Math.abs(x1 - x2) / r
		}
		return x1 === x2 ? 0 : 1
	}

	/**
	 * Fit model.
	 * @param {Array<Array<*>>} x Training data. `undefined` is recognized as a missing value
	 * @param {Array<*>} y Target values
	 */
	fit(x, y) {
		const n = x.length
		const a = x[0].length
		const rng = range(x)
		const counta = []
		const count = {}
		for (let i = 0; i < n; i++) {
			if (!count[y[i]]) {
				count[y[i]] = 0
			}
			count[y[i]]++
		}
		for (let j = 0; j < a; j++) {
			const ca = {}
			for (let i = 0; i < n; i++) {
				if (!ca[x[i][j]]) {
					ca[x[i][j]] = {}
				}
				if (!ca[x[i][j]][y[i]]) {
					ca[x[i][j]][y[i]] = 0
				}
				ca[x[i][j]][y[i]]++
			}
			for (const k of Object.keys(ca)) {
				for (const c of Object.keys(ca[k])) {
					ca[k][c] /= count[c]
				}
			}
			counta[j] = (x1, x2, y1, y2) => {
				let s = 0
				if (x1 === undefined && x2 === undefined) {
					for (const k of Object.keys(ca)) {
						s += (ca[k][y1] ?? 0) * (ca[k][y2] ?? 0)
					}
				} else if (x1 === undefined) {
					s = ca[x2][y1] ?? 0
				} else {
					s = ca[x1][y2] ?? 0
				}
				return 1 - s
			}
		}
		this._w = Array(a).fill(0)
		for (let t = 0; t < this._m; t++) {
			const idx = Math.floor(Math.random() * n)
			const r = x[idx]
			const h = []
			const m = this._type === 'E' ? [] : {}
			for (let i = 0; i < n; i++) {
				if (i === idx) {
					continue
				}
				const v = { d: this._diffAll(r, x[i], y[idx], y[i], rng, counta), i }
				if (y[i] === y[idx]) {
					h.push(v)
				} else {
					if (this._type === 'E') {
						m.push(v)
					} else {
						if (!m[y[i]]) {
							m[y[i]] = []
						}
						m[y[i]].push(v)
					}
				}
			}
			h.sort((a, b) => a.d - b.d)
			if (this._type === 'E') {
				m.sort((a, b) => a.d - b.d)
			} else {
				for (const c of Object.keys(m)) {
					m[c].sort((a, b) => a.d - b.d)
				}
			}

			for (let j = 0; j < a; j++) {
				let d = 0
				for (let k = 0; k < this._k; k++) {
					if (this._type === 'E') {
						d += this._diff(r[j], x[m[k].i][j], y[idx], y[m[k].i], rng[j], counta[j])
					} else {
						for (const c of Object.keys(m)) {
							const dc = this._diff(r[j], x[m[c][k].i][j], y[idx], y[m[c][k].i], rng[j], counta[j])
							d += (dc * count[c]) / n
						}
					}
					d -= this._diff(r[j], x[h[k].i][j], y[idx], y[h[k].i], rng[j], counta[j])
				}
				this._w[j] += d / (this._k * this._m)
			}
		}
		this._w = this._w.map((v, i) => [v, i])
		this._w.sort((a, b) => b[0] - a[0])
	}

	/**
	 * Returns feature selected values.
	 * @param {Array<Array<*>>} x Sample data
	 * @returns {Array<Array<*>>} Predicted values
	 */
	predict(x) {
		const widx = this._w.filter(w => w[0] >= this._tau).map(w => w[1])
		return x.map(d => widx.map(i => d[i]))
	}
}
