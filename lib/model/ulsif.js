import Matrix from '../util/matrix.js'

/**
 * Relative unconstrained Least-Squares Importance Fitting
 */
export class RuLSIF {
	// https://github.com/hoxo-m/densratio
	/**
	 * @param {number[]} sigma Sigmas of normal distribution
	 * @param {number[]} lambda Regularization parameters
	 * @param {number} alpha Relative parameter
	 * @param {number} kernelNum Number of kernels
	 */
	constructor(sigma, lambda, alpha, kernelNum) {
		this._sigma_cand = sigma
		this._lambda_cand = lambda
		this._alpha = alpha
		this._kernelNum = kernelNum
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
	 * @param {Array<Array<number>>} x1 Numerator data
	 * @param {Array<Array<number>>} x2 Denominator data
	 */
	fit(x1, x2) {
		x1 = Matrix.fromArray(x1)
		x2 = Matrix.fromArray(x2)

		const n1 = x1.rows
		const n2 = x2.rows

		const kn = Math.min(this._kernelNum, n1)
		const centers = x1.sample(kn)[0]
		this._centers = centers

		this._sigma = this._sigma_cand[0]
		this._lambda = this._lambda_cand[0]
		if (this._sigma_cand.length > 1 || this._lambda_cand.length > 1) {
			const nmin = Math.min(n1, n2)

			let best_score = Infinity
			for (const sgm of this._sigma_cand) {
				let phi1 = this._kernel_gaussian(x1, centers, sgm)
				let phi2 = this._kernel_gaussian(x2, centers, sgm)
				const H1 = phi1.dot(phi1.t)
				H1.mult(this._alpha / n1)
				const H2 = phi2.dot(phi2.t)
				H2.mult((1 - this._alpha) / n2)
				const H = Matrix.add(H1, H2)
				const h = phi1.mean(1)

				phi1 = phi1.slice(0, nmin, 1)
				phi2 = phi2.slice(0, nmin, 1)

				for (const lmb of this._lambda_cand) {
					const B = Matrix.eye(kn, kn, (lmb * (n2 - 1)) / n2)
					B.add(H)
					const Binv = B.inv()
					const BinvX = Binv.dot(phi2)
					const XBinvX = Matrix.mult(phi2, BinvX)

					const denom = new Matrix(1, nmin, n2)
					denom.sub(XBinvX.sum(0))

					const B0 = Binv.dot(h.dot(Matrix.ones(1, nmin)))
					B0.add(BinvX.dot(Matrix.diag(Matrix.div(h.tDot(BinvX), denom).value)))
					const B1 = Binv.dot(phi1)
					B1.add(BinvX.dot(Matrix.diag(Matrix.div(Matrix.mult(phi1, BinvX).sum(0), denom).value)))
					const B2 = Matrix.mult(B0, n1)
					B2.sub(B1)
					B2.mult((n2 - 1) / (n2 * (n1 - 1)))
					B2.map(v => (v < 0 ? 0 : v))

					const r2 = Matrix.mult(phi2, B2).sum(0).t
					const r1 = Matrix.mult(phi1, B2).sum(0).t
					const score = (r2.tDot(r2).toScaler() / 2 - r1.sum()) / nmin
					if (score < best_score) {
						best_score = score
						this._sigma = sgm
						this._lambda = lmb
					}
				}
			}
		}

		const phi1 = this._kernel_gaussian(x1, centers, this._sigma)
		const phi2 = this._kernel_gaussian(x2, centers, this._sigma)
		const H1 = phi1.dot(phi1.t)
		H1.mult(this._alpha / n1)
		const H2 = phi2.dot(phi2.t)
		H2.mult((1 - this._alpha) / n2)
		const H = Matrix.add(H1, H2)
		const h = phi1.mean(1)

		const B = Matrix.eye(kn, kn, (this._lambda * (n2 - 1)) / n2)
		B.add(H)
		this._kw = B.inv().dot(h)
		this._kw.map(v => (v < 0 ? 0 : v))
	}

	/**
	 * Returns estimated values.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		const phi = this._kernel_gaussian(x, this._centers, this._sigma)
		return phi.tDot(this._kw).value
	}
}

/**
 * unconstrained Least-Squares Importance Fitting
 */
export class uLSIF extends RuLSIF {
	/**
	 * @param {number[]} sigma Sigma of normal distribution
	 * @param {number[]} lambda Regularization parameters
	 * @param {number} kernelNum Number of kernels
	 */
	constructor(sigma, lambda, kernelNum) {
		super(sigma, lambda, 0, kernelNum)
	}
}
