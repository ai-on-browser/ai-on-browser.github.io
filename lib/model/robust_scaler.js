/**
 * Robust scaler
 */
export default class RobustScaler {
	constructor() {
		this._q_low = 0.25
		this._q_high = 0.75
	}

	_q(x, p) {
		const np = (x.length - 1) * p
		const np_l = Math.floor(np)
		const np_h = Math.ceil(np)
		return x[np_l] + (np - np_l) * (x[np_h] - x[np_l])
	}

	/**
	 * Fit model.
	 * @param {number[] | Array<Array<number>>} x
	 */
	fit(x) {
		if (Array.isArray(x[0])) {
			this._mid = []
			this._ql = []
			this._qh = []
			for (let i = 0; i < x[0].length; i++) {
				const xi = x.map(r => r[i])
				xi.sort()
				this._mid[i] = this._q(xi, 0.5)
				this._ql[i] = this._q(xi, this._q_low)
				this._qh[i] = this._q(xi, this._q_high)
			}
		} else {
			x = x.concat()
			x.sort()
			this._mid = this._q(x, 0.5)
			this._ql = this._q(x, this._q_low)
			this._qh = this._q(x, this._q_high)
		}
	}

	/**
	 * Returns transformed values.
	 * @param {number[] | Array<Array<number>>} x
	 * @returns {number[] | Array<Array<number>>}
	 */
	predict(x) {
		return x.map(r => {
			if (Array.isArray(r)) {
				if (Array.isArray(this._mid)) {
					return r.map((v, i) => (v - this._mid[i]) / (this._qh[i] - this._ql[i]))
				} else {
					return r.map(v => (v - this._mid) / (this._qh - this._ql))
				}
			}
			if (Array.isArray(this._mid)) {
				return (r - this._mid[0]) / (this._qh[0] - this._ql[0])
			} else {
				return (r - this._mid) / (this._qh - this._ql)
			}
		})
	}
}
