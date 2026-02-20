import Matrix from '../util/matrix.js'

/**
 * Kullback-Leibler importance estimation procedure
 */
export default class KLIEP {
	// https://github.com/hoxo-m/densratio
	/**
	 * @param {number[]} sigma Sigmas of normal distribution
	 * @param {number} fold Number of folds
	 * @param {number} kernelNum Number of kernels
	 */
	constructor(sigma, fold, kernelNum) {
		this._sigma_cand = sigma
		this._fold = fold
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

	_optimize_alpha(a, b) {
		const c = Matrix.div(b, b.norm() ** 2)

		let alpha = Matrix.ones(a.rows, 1)
		alpha.add(Matrix.mult(c, 1 - b.tDot(alpha).toScaler()))
		alpha.map(v => (v < 0 ? 0 : v))
		alpha.div(b.tDot(alpha).toScaler())

		let score = a.tDot(alpha)
		score.map(Math.log)
		score = score.mean()

		for (let k = 3; k >= -3; k--) {
			const epsilon = 10 ** k
			const epsa = Matrix.mult(a, epsilon)
			for (let i = 0; i < 100; i++) {
				const alpha0 = epsa.dot(Matrix.div(1, a.tDot(alpha)))
				alpha0.add(alpha)
				alpha0.add(Matrix.mult(c, 1 - b.tDot(alpha0).toScaler()))
				alpha0.map(v => (v < 0 ? 0 : v))
				alpha0.div(b.tDot(alpha0).toScaler())

				let newScore = a.tDot(alpha0)
				newScore.map(Math.log)
				newScore = newScore.mean()
				if (newScore <= score) {
					break
				}
				alpha = alpha0
				score = newScore
			}
		}
		return alpha
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

		const kn = Math.min(this._kernelNum, n1)
		const centers = x1.sample(kn)[0]
		this._centers = centers

		this._sigma = this._sigma_cand[0]
		if (this._sigma_cand.length > 1) {
			let best_score = -Infinity
			const cvCls = Array.from({ length: n1 }, (_, i) => i % this._fold)

			for (const sgm of this._sigma_cand) {
				const phi1 = this._kernel_gaussian(x1, centers, sgm)
				const phi2 = this._kernel_gaussian(x2, centers, sgm)
				const phi2mean = phi2.mean(1)

				for (let i = cvCls.length - 1; i > 0; i--) {
					const r = Math.floor(Math.random() * (i + 1))
					;[cvCls[i], cvCls[r]] = [cvCls[r], cvCls[i]]
				}

				let totalScore = 0
				for (let i = 0; i < this._fold; i++) {
					const idx = cvCls.map(c => c === i)
					const nidx = cvCls.map(c => c !== i)
					const alpha = this._optimize_alpha(phi1.col(idx), phi2mean)

					const score = phi1.col(nidx).tDot(alpha)
					score.map(Math.log)
					totalScore += score.mean()
				}
				totalScore /= this._fold
				if (totalScore > best_score) {
					best_score = totalScore
					this._sigma = sgm
				}
			}
		}

		const phi1 = this._kernel_gaussian(x1, centers, this._sigma)
		const phi2 = this._kernel_gaussian(x2, centers, this._sigma)

		this._kw = this._optimize_alpha(phi1, phi2.mean(1))
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
