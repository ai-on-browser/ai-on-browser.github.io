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

	_diff(x1, x2, r, a) {
		if (a == null) {
			return x1.reduce((s, _, i) => s + this._diff(x1, x2, r, i), 0)
		}
		if (typeof x1[a] === 'number' && typeof x2[a] === 'number') {
			return Math.abs(x1[a] - x2[a]) / r[a]
		}
		return x1[a] === x2[a] ? 0 : 1
	}

	/**
	 * Fit model.
	 * @param {Array<Array<*>>} x Training data
	 * @param {Array<0 | 1>} y Target values
	 */
	fit(x, y) {
		const n = x.length
		const a = x[0].length
		const range = []
		for (let j = 0; j < a; j++) {
			let max = -Infinity
			let min = Infinity
			for (let i = 0; i < n; i++) {
				max = Math.max(x[i][j], max)
				min = Math.min(x[i][j], min)
			}
			range[j] = max - min
		}
		this._w = Array(a).fill(0)
		for (let i = 0; i < this._m; i++) {
			const idx = Math.floor(Math.random() * n)
			const r = x[idx]
			const d = x.map((v, i) => ({ d: this._diff(r, v, range), i }))
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
				this._w[j] += (this._diff(r, m, range, j) - this._diff(r, h, range, j)) / this._m
			}
		}
		this._w = this._w.map((v, i) => [v, i])
		this._w.sort((a, b) => b[0] - a[0])
	}

	/**
	 * Returns feature selected values.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		const widx = this._w.filter(w => w[0] >= this._tau).map(w => w[1])
		return x.map(d => widx.map(i => d[i]))
	}
}
