import Matrix from '../util/matrix.js'

/**
 * Markov switching
 */
export default class MarkovSwitching {
	// https://qiita.com/9uant/items/0abf942fac26aee1fc3f
	/**
	 * @param {number} regime Number of regime
	 */
	constructor(regime) {
		this._regime = regime
		this._mu = []
		this._sigma = []
	}

	_stationary_prob(p) {
		const r = this._regime
		const A = Matrix.ones(r + 1, r)
		A.set(0, 0, Matrix.sub(Matrix.eye(r, r), p))

		return A.tDot(A).solve(A.t).col(r)
	}

	_lh(x, mu, sigma) {
		const n = x.rows
		const lh = new Matrix(n, this._regime)
		for (let i = 0; i < this._regime; i++) {
			const dv = Math.pow(2 * Math.PI, mu[i].cols / 2) * Math.sqrt(sigma[i].det())
			const sinv = sigma[i].inv()
			const cx = Matrix.sub(x, mu[i])
			const xsx = cx.dot(sinv)
			xsx.mult(cx)
			const s = xsx.sum(1)
			s.map(v => Math.exp(-v / 2) / dv)
			lh.set(0, i, s)
		}
		return lh
	}

	_logL(x, mu, sigma, prob) {
		const n = x.rows
		const lh = this._lh(x, mu, sigma)

		let prior = this._stationary_prob(prob)

		let ll = 0
		for (let i = 0; i < n; i++) {
			const tmp = lh.row(i).t
			tmp.mult(prior)
			const tmps = tmp.sum()

			ll += Math.log(tmps)
			tmp.div(tmps)
			prior = prob.dot(tmp)
		}
		return ll
	}

	_prob(x) {
		const n = x.rows
		const lh = this._lh(x, this._mu, this._sigma)

		let prior = this._stationary_prob(this._last_prob)

		const ps = []
		for (let i = 0; i < n; i++) {
			const post = lh.row(i).t
			post.mult(prior)
			post.div(post.sum())
			ps.push(post)
			prior = this._last_prob.dot(post)
		}
		return ps
	}

	_nextParam(genProb, eps) {
		const nmu = this._mu.map(m => m.copy())
		const nsi = this._sigma.map(m => m.copy())
		const ngp = genProb.copy()

		for (let i = 0; i < this._regime; i++) {
			nmu[i].add(Matrix.random(1, nmu[i].cols, -eps, eps))
			for (let j = 0; j < nmu[i].cols; j++) {
				let s = nsi[i].at(j, j)
				s = Math.exp(Math.log(s) + (2 * Math.random() - 1) * eps)
				nsi[i].set(j, j, s)
			}
		}

		ngp.add(Matrix.map(Matrix.random(this._regime, this._regime), v => (2 * v - 1) * eps * 0.1))
		for (let i = 0; i < this._regime; i++) {
			ngp.set(i, i, 0)
		}
		const np = Matrix.map(genProb, v => Math.exp(v) / (1 + Math.exp(v)))
		np.add(Matrix.diag(Matrix.sub(1, np.sum(0).t).value))

		return [nmu, nsi, ngp, np]
	}

	_mcmc(x, eps, trial) {
		let genProb = new Matrix(this._regime, this._regime, -this._regime)
		for (let i = 0; i < this._regime; i++) {
			genProb.set(i, i, 0)
		}
		let prob = Matrix.map(genProb, v => Math.exp(v) / (1 + Math.exp(v)))
		prob.add(Matrix.diag(Matrix.sub(1, prob.sum(0).t).value))

		const mus = [this._mu.concat()]
		const sis = [this._sigma.concat()]
		const prs = [prob]
		const lls = []

		for (let i = 0; i < trial; i++) {
			const [nmu, nsi, ngp, np] = this._nextParam(genProb, eps)

			const ll = this._logL(x, this._mu, this._sigma, prob)
			const nll = this._logL(x, nmu, nsi, np)

			const r = Math.exp(nll - ll)
			lls.push(ll)

			if (r > 1 || r > Math.random()) {
				this._mu = nmu
				this._sigma = nsi
				genProb = ngp
				prob = np
			}

			mus.push(this._mu.concat())
			sis.push(this._sigma.concat())
			prs.push(prob)
		}
		this._last_prob = prob
		return [mus, sis, prs, lls]
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 * @param {number} eps Parameter update range
	 * @param {number} trial Trial count
	 */
	fit(datas, eps, trial) {
		const x = Matrix.fromArray(datas)
		if (this._mu.length === 0) {
			for (let i = 0; i < this._regime; i++) {
				this._mu[i] = Matrix.randn(1, x.cols, 0, 0.1)
				this._sigma[i] = Matrix.zeros(x.cols, x.cols)
				for (let j = 0; j < x.cols; j++) {
					this._sigma[i].set(j, j, Math.random())
				}
			}
		}
		const [ms, ss, ps, ls] = this._mcmc(x, eps, trial)
	}

	/**
	 * Returns probabilities.
	 *
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	probability(datas) {
		const x = Matrix.fromArray(datas)
		const probs = this._prob(x)
		return probs.map(p => p.value)
	}

	/**
	 * Returns anomaly degrees.
	 *
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		const x = Matrix.fromArray(datas)
		const probs = this._prob(x)
		const norms = probs.map(p => p.norm())

		const pred = []
		for (let i = 0; i < probs.length - 1; i++) {
			pred.push(1 - Matrix.mult(probs[i], probs[i + 1]).sum() / (norms[i] * norms[i + 1]))
		}
		return pred
	}
}
