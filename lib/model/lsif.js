import { Matrix } from '../util/math.js'

/**
 * least-squares importance fitting
 */
export class LSIF {
	// 密度比に基づく機械学習の新たなアプローチ(2010)
	// A Least-squares Approach to Direct Importance Estimation(2009)
	/**
	 * @param {number[]} sigma
	 * @param {number[]} lambda
	 * @param {number} fold
	 * @param {number} kernelNum
	 */
	constructor(sigma, lambda, fold, kernelNum) {
		this._sigma_cand = sigma
		this._lambda_cand = lambda
		this._fold = fold
		this._kernelNum = kernelNum
	}

	_kernel_gaussian(x, c, s) {
		const k = []
		for (let i = 0; i < c.rows; i++) {
			const ki = []
			for (let j = 0; j < x.rows; j++) {
				const r = c.row(i).copySub(x.row(j))
				ki.push(Math.exp(-r.reduce((ss, v) => ss + v ** 2, 0) / (2 * s ** 2)))
			}
			k.push(ki)
		}
		return Matrix.fromArray(k)
	}

	_regularization_path(H, h) {
		const kn = h.rows

		H.add(Matrix.eye(kn, kn, 1.0e-12))

		const k = h.argmax(0).toScaler()
		const lambdas = [h.at(k, 0)]
		const alpha = [Matrix.zeros(kn, 1)]
		const a = []
		for (let i = 0; i < kn; i++) {
			if (i !== k) {
				a.push(i)
			}
		}

		while (lambdas[lambdas.length - 1] > 0) {
			const e = Matrix.zeros(a.length, kn)
			for (let i = 0; i < a.length; i++) {
				e.set(i, a[i], -1)
			}
			const g = Matrix.zeros(kn + a.length, kn + a.length)
			g.set(0, 0, H)
			g.set(kn, 0, e)
			g.set(0, kn, e.t)

			const u = g.solve(h.resize(kn + a.length, h.cols))
			const v = g.solve(Matrix.ones(kn, 1).resize(kn + a.length, 1))

			if (v.some(x => x <= 0)) {
				lambdas.push(0)
				alpha.push(u.slice(0, kn))
			} else {
				let k = -1
				let lmb = -Infinity
				for (let i = 0; i < kn + a.length; i++) {
					const li = u.at(i, 0) / v.at(i, 0)
					if (v.at(i, 0) > 0 && li > lmb) {
						k = i
						lmb = li
					}
				}
				lmb = Math.max(0, lmb)
				lambdas.push(lmb)
				v.mult(lmb)
				u.sub(v)
				alpha.push(u.slice(0, kn))

				if (k < kn) {
					if (a.indexOf(k) < 0) {
						a.push(k)
						a.sort((a, b) => a - b)
					}
				} else {
					a.splice(k - kn, 1)
				}
			}
		}

		return l => {
			if (l >= lambdas[0]) {
				return alpha[0]
			}
			for (let i = 1; i < lambdas.length; i++) {
				if (lambdas[i] <= l && l <= lambdas[i - 1]) {
					const p0 = (lambdas[i] - l) / (lambdas[i] - lambdas[i - 1])
					const p1 = (l - lambdas[i - 1]) / (lambdas[i] - lambdas[i - 1])

					const a0 = alpha[i - 1].copyMult(p0)
					const a1 = alpha[i].copyMult(p1)
					a0.add(a1)
					return a0
				}
			}
		}
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x1
	 * @param {Array<Array<number>>} x2
	 */
	fit(x1, x2) {
		x1 = Matrix.fromArray(x1)
		x2 = Matrix.fromArray(x2)

		const n1 = x1.rows
		const n2 = x2.rows

		const kn = Math.min(this._kernelNum, n1)
		const centers = (this._centers = x1.sample(kn))

		this._sigma = this._sigma_cand[0]
		this._lambda = this._lambda_cand[0]
		if (this._sigma_cand.length > 1) {
			let best_score = Infinity
			const cvCls1 = []
			for (let i = 0; i < n1; i++) {
				cvCls1[i] = i % this._fold
			}
			const cvCls2 = []
			for (let i = 0; i < n2; i++) {
				cvCls2[i] = i % this._fold
			}

			for (const sgm of this._sigma_cand) {
				const phi1 = this._kernel_gaussian(x1, centers, sgm)
				const phi2 = this._kernel_gaussian(x2, centers, sgm)
				for (let i = cvCls1.length - 1; i > 0; i--) {
					let r = Math.floor(Math.random() * (i + 1))
					;[cvCls1[i], cvCls1[r]] = [cvCls1[r], cvCls1[i]]
				}
				for (let i = cvCls2.length - 1; i > 0; i--) {
					let r = Math.floor(Math.random() * (i + 1))
					;[cvCls2[i], cvCls2[r]] = [cvCls2[r], cvCls2[i]]
				}

				const alpha_lambda = []

				for (let f = 0; f < this._fold; f++) {
					const idx1 = cvCls1.map(c => c === f)
					const idx2 = cvCls2.map(c => c === f)

					const phi1p = phi1.col(idx1)
					const phi2p = phi2.col(idx2)
					const H = phi2p.dot(phi2p.t)
					H.div(phi2p.cols)
					const h = phi1p.mean(1)

					alpha_lambda.push(this._regularization_path(H, h))
				}

				for (const lmb of this._lambda_cand) {
					let totalScore = 0
					for (let f = 0; f < this._fold; f++) {
						const nidx1 = cvCls1.map(c => c !== f)
						const nidx2 = cvCls2.map(c => c !== f)

						const phi1p = phi1.col(nidx1)
						const phi2p = phi2.col(nidx2)

						const alpha = alpha_lambda[f](lmb)
						let score =
							phi2p
								.tDot(alpha)
								.copyMap(v => v ** 2)
								.mean() / 2
						score -= phi1p.tDot(alpha).mean()
						totalScore += score
					}
					totalScore /= this._fold
					if (totalScore < best_score) {
						best_score = totalScore
						this._sigma = sgm
						this._lambda = lmb
					}
				}
			}
		}

		const phi1 = this._kernel_gaussian(x1, centers, this._sigma)
		const phi2 = this._kernel_gaussian(x2, centers, this._sigma)

		const H = phi2.dot(phi2.t)
		H.div(n2)
		const h = phi1.mean(1)

		this._kw = this._regularization_path(H, h)(this._lambda)
	}

	/**
	 * Returns estimated values.
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
 * LSIF for change point detection
 */
export class LSIFCPD {
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

			const model = new LSIF([100, 10, 1, 0.1, 0.01, 0.001], [100, 10, 1, 0.1, 0.01, 0.001], 3, 100)
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
