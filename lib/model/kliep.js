import Matrix from '../util/matrix.js'

/**
 * Kullback-Leibler importance estimation procedure
 */
export class KLIEP {
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
	 *
	 * @param {Array<Array<number>>} x1 Numerator data
	 * @param {Array<Array<number>>} x2 Denominator data
	 */
	fit(x1, x2) {
		x1 = Matrix.fromArray(x1)
		x2 = Matrix.fromArray(x2)

		const n1 = x1.rows

		const kn = Math.min(this._kernelNum, n1)
		const centers = (this._centers = x1.sample(kn)[0])

		this._sigma = this._sigma_cand[0]
		if (this._sigma_cand.length > 1) {
			let best_score = -Infinity
			const cvCls = []
			for (let i = 0; i < n1; i++) {
				cvCls[i] = i % this._fold
			}

			for (const sgm of this._sigma_cand) {
				const phi1 = this._kernel_gaussian(x1, centers, sgm)
				const phi2 = this._kernel_gaussian(x2, centers, sgm)
				const phi2mean = phi2.mean(1)

				for (let i = cvCls.length - 1; i > 0; i--) {
					let r = Math.floor(Math.random() * (i + 1))
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
	 *
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
 * KLIEP for change point detection
 */
export class KLIEPCPD {
	/**
	 * @param {number} w Window size
	 * @param {number} [take] Take number
	 * @param {number} [lag] Lag
	 */
	constructor(w, take, lag) {
		this._window = w
		this._take = take || Math.max(1, Math.floor(w / 2))
		this._lag = lag || Math.max(1, Math.floor(this._take / 2))
	}

	/**
	 * Returns anomaly degrees.
	 *
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {number[]} Predicted values
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

			const model = new KLIEP([100, 10, 1, 0.1, 0.01, 0.001], 5, 100)
			let c = 0
			model.fit(h, t)
			let dr = model.predict(t)
			for (let i = 0; i < dr.length; i++) {
				c += (dr[i] - 1) ** 2 / dr.length
			}
			model.fit(t, h)
			dr = model.predict(h)
			for (let i = 0; i < dr.length; i++) {
				c += (dr[i] - 1) ** 2 / dr.length
			}
			pred.push(c)
		}
		return pred
	}
}
