class MarkovSwitching {
	// https://qiita.com/9uant/items/0abf942fac26aee1fc3f
	constructor(regime, d) {
		this._regime = regime
		this._d = d
		this._mu = []
		this._sigma = []
		for (let i = 0; i < this._regime; i++) {
			this._mu[i] = Matrix.randn(1, d)
			this._sigma[i] = Matrix.random(d, d, 0, 0.1)
			this._sigma[i] = this._sigma[i].tDot(this._sigma[i])
		}
	}

	_stationary_prob(p) {
		const r = this._regime
		const A = Matrix.ones(r + 1, r)
		A.set(0, 0, Matrix.eye(r, r).copySub(p))

		return A.tDot(A).slove(A.t).col(r)
	}

	_lh(x, mu, sigma) {
		const n = x.rows
		const lh = new Matrix(n, this._regime)
		for (let i = 0; i < this._regime; i++) {
			const dv = Math.pow(2 * Math.PI, this._d / 2) * Math.sqrt(sigma[i].det())
			const sinv = sigma[i].inv()
			const sx = x.copySub(mu[i])
			for (let k = 0; k < n; k++) {
				const s = sx.row(k)
				lh.set(k, i, Math.exp(-s.dot(sinv).dot(s.t).value[0] / 2) / dv)
			}
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
			nmu[i].add(Math.random(1, this._d, -eps, eps))
			for (let j = 0; j < this._d; j++) {
				for (let k = 0; k <= j; k++) {
					let s = nsi[i].at(j, k)
					s = Math.exp(Math.log(s) + (2 * Math.random() - 1) * eps)
					nsi[i].set(j, k, s)
					nsi[i].set(k, j, s)
				}
			}
		}

		ngp.add(Matrix.random(this._regime, this._regime).copyMap(v => (2 * v - 1) * eps * 0.1))
		for (let i = 0; i < this._regime; i++) {
			ngp.set(i, i, 0)
		}
		const np = genProb.copyMap(v => Math.exp(v) / (1 + v))
		np.add(Matrix.diag(np.sum(0).t.copyIsub(1).value))

		return [nmu, nsi, ngp, np]
	}

	_mcmc(x, eps, trial) {
		let genProb = new Matrix(this._regime, this._regime, -3)
		for (let i = 0; i < this._regime; i++) {
			genProb.set(i, i, 0)
		}
		let prob = genProb.copyMap(v => Math.exp(v) / (1 + v))
		prob.add(Matrix.diag(prob.sum(0).t.copyIsub(1).value))

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

	fit(datas, eps, trial) {
		const x = Matrix.fromArray(datas)
		const [ms, ss, ps, ls] = this._mcmc(x, eps, trial)
	}

	predict(datas) {
		const x = Matrix.fromArray(datas)
		const probs = this._prob(x)

		const pred = []
		for (let i = 0; i < probs.length - 1; i++) {
			pred.push(1 - probs[i].copyMult(probs[i + 1]).sum() / (probs[i].norm() * probs[i + 1].norm()))
		}
		return pred
	}
}

var dispMSM = function(elm, platform) {
	let thupdater = null
	const calcMSM = function(cb) {
		platform.fit((tx, ty, pred_cb, thup) => {
			const regime = +elm.select("[name=regime]").property("value")
			const trial = +elm.select("[name=trial]").property("value")
			const model = new MarkovSwitching(regime, tx[0].length)
			model.fit(tx, 0.1, trial)
			const threshold = +elm.select("[name=threshold]").property("value")
			const pred = model.predict(tx)
			thupdater = thup
			pred_cb(pred, threshold)
			cb && cb()
		})
	}

	elm.append("span")
		.text(" regime = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "regime")
		.attr("value", 3)
		.attr("min", 2)
		.attr("max", 100)
	elm.append("span")
		.text(" trial = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "trial")
		.attr("value", 10000)
		.attr("min", 1)
		.attr("max", 1.0e8)
	elm.append("span")
		.text(" threshold = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "threshold")
		.attr("value", 0.1)
		.attr("min", 0)
		.attr("max", 100)
		.attr("step", 0.01)
		.on("change", () => {
			const threshold = +elm.select("[name=threshold]").property("value")
			if (thupdater) {
				thupdater(threshold)
			}
		})
	const calcBtn = elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", () => {
			calcBtn.property("disabled", true)
			setTimeout(() => {
				calcMSM(() => {
					calcBtn.property("disabled", false)
				})
			}, 0)
		})
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispMSM(platform.setting.ml.configElement, platform)
}
