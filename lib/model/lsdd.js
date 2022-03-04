import Matrix from '../util/matrix.js'

/**
 * Least-squares density difference
 */
export class LSDD {
	// https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.473.3093&rep=rep1&type=pdf
	// Learning under Non-Stationarity: Covariate Shift Adaptation, Class-Balance Change Adaptation, and Change Detection. (2014)
	/**
	 * @param {number[]} sigma
	 * @param {number[]} lambda
	 */
	constructor(sigma, lambda) {
		this._sigma_cand = sigma
		this._lambda_cand = lambda
	}

	_kernel_gaussian(x, c, s) {
		const k = []
		for (let i = 0; i < c.rows; i++) {
			const ki = []
			for (let j = 0; j < x.rows; j++) {
				const r = Matrix.sub(c.row(i), x.row(j))
				ki.push(Math.exp(-r.reduce((ss, v) => ss + v ** 2, 0) / (2 * s ** 2)))
			}
			k.push(ki)
		}
		return Matrix.fromArray(k)
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x1
	 * @param {Array<Array<number>>} x2
	 */
	fit(x1, x2) {
		x1 = Matrix.fromArray(x1)
		x2 = Matrix.fromArray(x2)

		const n1 = x1.rows
		const n2 = x2.rows
		const n = n1 + n2
		const d = x1.cols

		const centers = (this._centers = x1.concat(x2, 0))

		this._sigma = this._sigma_cand[0]
		this._lambda = this._lambda_cand[0]

		let best_score = Infinity
		for (const sgm of this._sigma_cand) {
			const u = this._kernel_gaussian(centers, centers, sgm * Math.SQRT2)
			u.mult((Math.PI * sgm ** 2) ** (d / 2))

			const v1 = this._kernel_gaussian(x1, centers, sgm).mean(1)
			const v2 = this._kernel_gaussian(x2, centers, sgm).mean(1)
			const v = Matrix.sub(v1, v2)

			for (const lmb of this._lambda_cand) {
				const alpha = Matrix.add(u, Matrix.eye(n, n, lmb)).solve(v)
				const score =
					alpha.tDot(u).dot(alpha).toScaler() - 2 * v.tDot(alpha).toScaler() + lmb * alpha.norm() ** 2
				if (score < best_score) {
					best_score = score
					this._sigma = sgm
					this._lambda = lmb
					this._kw = alpha
				}
			}
		}
	}

	/**
	 * Returns estimated values.
	 *
	 * @param {Array<Array<number>>} x
	 * @returns {number[]}
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		const phi = this._kernel_gaussian(x, this._centers, this._sigma)
		return phi.tDot(this._kw).value
	}
}

/**
 * LSDD for change point detection
 */
export class LSDDCPD {
	/**
	 * @param {number} w
	 * @param {number} [take]
	 * @param {number} [lag]
	 */
	constructor(w, take, lag) {
		this._window = w
		this._take = take || Math.max(1, Math.floor(w / 2))
		this._lag = lag || Math.max(1, Math.floor(this._take / 2))
	}

	/**
	 * Returns anomaly degrees.
	 *
	 * @param {Array<Array<number>>} datas
	 * @returns {number[]}
	 */
	predict(datas) {
		const x = []
		for (let i = 0; i < datas.length - this._window + 1; i++) {
			x.push(datas.slice(i, i + this._window).flat())
		}

		const pred = []
		for (let i = 0; i < x.length - this._take - this._lag + 1; i++) {
			const h = Matrix.fromArray(x.slice(i, i + this._take))
			const t = Matrix.fromArray(x.slice(i + this._lag, i + this._take + this._lag))

			const grid = [100, 30, 10, 3, 1, 0.3, 0.1, 0.03, 0.01, 0.003, 0.001]
			const model = new LSDD(grid, grid)
			let c = 0
			model.fit(h, t)
			let dr = model.predict(t)
			for (let i = 0; i < dr.length; i++) {
				c += dr[i] ** 2 / dr.length
			}
			dr = model.predict(h)
			for (let i = 0; i < dr.length; i++) {
				c += dr[i] ** 2 / dr.length
			}
			pred.push(Math.sqrt(c))
		}
		return pred
	}
}
