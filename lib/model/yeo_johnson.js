/**
 * Yeo-Johnson power transformation
 */
export default class YeoJohnson {
	// https://betashort-lab.com/%E3%83%87%E3%83%BC%E3%82%BF%E3%82%B5%E3%82%A4%E3%82%A8%E3%83%B3%E3%82%B9/yeo-johnson%E5%A4%89%E6%8F%9B/
	/**
	 * @param {number} [lambda]
	 */
	constructor(lambda = null) {
		this._lambda = lambda
		this._lambda_cand = []
		for (let i = 0; i <= 200; i++) {
			this._lambda_cand.push((i - 100) / 10)
		}
	}

	_cdf(x) {
		return 1 / (1 + Math.exp(-1.7 * x))
	}

	_ppf(x) {
		if (x >= 1) return Infinity
		if (x === 0.5) return 0
		if (x < 0.5) return -this._ppf(1 - x)
		let min = 0,
			max = null
		let v = 1
		const e = 1.0e-8
		let maxCount = 1.0e4
		while (maxCount-- > 0) {
			const t = this._cdf(v)
			if (Math.abs(t - x) < e) return v
			if (x < t) {
				max = v
				v = (v + min) / 2
			} else {
				min = v
				v = max === null ? v * 2 : (v + max) / 2
			}
		}
		throw 'loop converged'
	}

	_j(x, l) {
		// https://www.jstage.jst.go.jp/article/sicetr/52/5/52_299/_pdf/-char/en
		const n = x.length
		const z = x.map(v => this._t(v, l))
		z.sort((a, b) => a - b)
		const m = z.reduce((s, v) => s + v, 0) / n
		const s = Math.sqrt(z.reduce((s, v) => s + (v - m) ** 2, 0) / n)
		let j = 0
		for (let i = 0; i < n; i++) {
			j += (this._ppf((i + 0.5) / n) - (z[i] - m) / s) ** 2
		}
		return j
	}

	_t(v, l) {
		if (v >= 0) {
			if (l === 0) {
				return Math.log(v + 1)
			} else {
				return ((v + 1) ** l - 1) / l
			}
		} else {
			if (l === 2) {
				return -Math.log(-v + 1)
			} else {
				return -((-v + 1) ** (2 - l) - 1) / (2 - l)
			}
		}
	}

	/**
	 * Fit model.
	 *
	 * @param {number[] | Array<Array<number>>} x
	 */
	fit(x) {
		const xs = []
		if (Array.isArray(x[0])) {
			for (let i = 0; i < x[0].length; i++) {
				xs[i] = x.map(r => r[i])
			}
		} else {
			xs[0] = x
		}
		this._lambda = []
		for (let i = 0; i < xs.length; i++) {
			let min_j = Infinity
			let min_l = 0
			for (const l of this._lambda_cand) {
				const j = this._j(xs[i], l)
				if (j < min_j) {
					min_j = j
					min_l = l
				}
			}
			this._lambda.push(min_l)
		}
	}

	/**
	 * Returns transformed values.
	 *
	 * @param {number[] | Array<Array<number>>} x
	 * @returns {number[] | Array<Array<number>>}
	 */
	predict(x) {
		return x.map(r => {
			if (Array.isArray(r)) {
				if (Array.isArray(this._lambda)) {
					return r.map((v, i) => this._t(v, this._lambda[i]))
				} else {
					return r.map(v => this._t(v, this._lambda))
				}
			}
			if (Array.isArray(this._lambda)) {
				return this._t(r, this._lambda[0])
			} else {
				return this._t(r, this._lambda)
			}
		})
	}
}
