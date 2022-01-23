import Matrix from '../util/matrix.js'

/**
 * Confidence weighted
 */
export class ConfidenceWeighted {
	// https://y-uti.hatenablog.jp/entry/2017/03/17/001204
	/**
	 * @param {number} eta
	 */
	constructor(eta) {
		this._eta = eta
		this._phi = this._ppf(this._eta)
		this._psi = 1 + this._phi ** 2 / 2
		this._xi = 1 + this._phi ** 2
	}

	/**
	 * Initialize this model.
	 *
	 * @param {Array<Array<number>>} train_x
	 * @param {Array<1 | -1>} train_y
	 */
	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x)
		this._c = this._x.mean(0)
		this._x.sub(this._c)
		this._y = train_y

		this._d = this._x.cols
		this._m = Matrix.zeros(this._d, 1)
		this._s = Matrix.eye(this._d, this._d)
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

	_alpha(v, m) {
		return Math.max(
			0,
			(-m * this._psi + Math.sqrt(((m * this._phi ** 2) / 2) ** 2 + v * this._phi ** 2 * this._xi)) /
				(v * this._xi)
		)
	}

	/**
	 * Update model parameters with one data.
	 *
	 * @param {Matrix} x
	 * @param {1 | -1} y
	 */
	update(x, y) {
		const v = x.tDot(this._s).dot(x).toScaler()
		const m = this._m.tDot(x).toScaler()

		const alpha = this._alpha(v, m)
		const sq_u = (alpha * v * this._phi + Math.sqrt((alpha * v * this._phi) ** 2 + 4 * v)) / 2
		const beta = (alpha * this._phi) / (sq_u + v * alpha * this._phi)

		const md = this._s.dot(x)
		md.mult(alpha * y)
		this._m.add(md)
		const sd = this._s.dot(x).dot(x.tDot(this._s))
		sd.mult(beta)
		this._s.sub(sd)
	}

	/**
	 * Fit model parameters.
	 */
	fit() {
		for (let i = 0; i < this._x.rows; i++) {
			this.update(this._x.row(i).t, this._y[i])
		}
	}

	/**
	 * Returns predicted datas.
	 *
	 * @param {Array<Array<number>>} data
	 * @returns {(1 | -1)[]}
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		x.sub(this._c)
		const r = x.dot(this._m)
		return r.value.map(v => (v <= 0 ? -1 : 1))
	}
}

/**
 * Soft confidence weighted
 */
export class SoftConfidenceWeighted extends ConfidenceWeighted {
	/**
	 * @param {number} eta
	 * @param {number} cost
	 * @param {1 | 2} v
	 */
	constructor(eta, cost, v) {
		super(eta)
		this._cost = cost
		this._v = v
	}

	_alpha(v, m) {
		if (this._v === 1) {
			return Math.min(this._cost, super._alpha(v, m))
		} else {
			const n = v + 1 / (2 * this._cost)
			const gamma = this._phi * Math.sqrt((this._phi * m * v) ** 2 + 4 * n * v * (n + v * this._phi ** 2))
			return Math.max(0, (gamma - 2 * m * n - this._phi ** 2 * m * v) / (2 * (n ** 2 + n * v * this._phi ** 2)))
		}
	}
}
