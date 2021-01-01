class MarkovSwitching {
	// https://qiita.com/9uant/items/0abf942fac26aee1fc3f
	constructor(regime) {
		this._regime = regime
		this._mu = []
		this._sigma = []
		for (let i = 0; i < this._regime; i++) {
			this._mu[i] = Math.random() * 2 - 1
			this._sigma[i] = Math.random() * 0.1
		}
	}

	_stationary_prob(p) {
		const r = this._regime
		const A = Matrix.ones(r + 1, r)
		A.set(0, 0, Matrix.eye(r, r).copySub(p))

		return A.tDot(A).slove(A.t).col(r)
	}

	_logL(x, mu, sigma, prob) {
		const n = x.rows
		const lh = new Matrix(n, this._regime)
		for (let i = 0; i < this._regime; i++) {
			const l = x.copyMap(v => Math.exp(-((v - mu[i]) ** 2) / (2 * sigma[i] ** 2)) / Math.sqrt(2 * Math.PI * sigma[i] ** 2))
			lh.set(0, i, l)
		}

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

	_prob(x, prob) {
		const n = x.rows
		const lh = new Matrix(n, this._regime)
		for (let i = 0; i < this._regime; i++) {
			const l = x.copyMap(v => Math.exp(-((v - this._mu[i]) ** 2) / (2 * this._sigma[i] ** 2)) / Math.sqrt(2 * Math.PI * this._sigma[i] ** 2))
			lh.set(0, i, l)
		}

		let prior = this._stationary_prob(prob)

		const ps = []
		for (let i = 0; i < n; i++) {
			const post = lh.row(i).t
			post.mult(prior)
			post.div(post.sum())
			ps.push(post)
			prior = prob.dot(post)
		}
		return ps
	}

	_nextParam(genProb, eps) {
		const nmu = this._mu.concat()
		const nsi = this._sigma.concat()
		const ngp = genProb.copy()

		for (let i = 0; i < this._regime; i++) {
			nmu[i] += (2 * Math.random() - 1) * eps
			nsi[i] = Math.exp(Math.log(nsi[i]) + (2 * Math.random() - 1) * eps)
		}
		nmu.sort((a, b) => a - b)
		nsi.sort((a, b) => a - b)
		nsi.unshift(nsi.pop())

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
		return [mus, sis, prs, lls]
	}

	predict(datas) {
		const x = Matrix.fromArray(datas)
		const [ms, ss, ps, ls] = this._mcmc(x, 0.5, 10000)

		const probs = this._prob(x, ps[ps.length - 1])

		const pred = []
		for (let i = 0; i < probs.length - 1; i++) {
			pred.push(Math.sqrt(probs[i].copySub(probs[i + 1]).copyMap(v => v ** 2).sum()))
		}
		return pred
	}
}

var dispMSM = function(elm, platform) {
	let thupdater = null
	const calcMSM = function() {
		platform.plot((tx, ty, _, cb, thup) => {
			const regime = +elm.select(".buttons [name=regime]").property("value")
			const model = new MarkovSwitching(regime);
			const data = tx.map(v => v[0])
			const threshold = +elm.select(".buttons [name=threshold]").property("value")
			const pred = model.predict(data)
			thupdater = thup
			cb(pred, threshold)
		})
	}

	elm.select(".buttons")
		.append("span")
		.text(" regime = ");
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "regime")
		.attr("value", 3)
		.attr("min", 2)
		.attr("max", 100)
	elm.select(".buttons")
		.append("span")
		.text(" threshold = ");
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "threshold")
		.attr("value", 0.1)
		.attr("min", 0)
		.attr("max", 100)
		.attr("step", 0.01)
		.on("change", () => {
			const threshold = +elm.select(".buttons [name=threshold]").property("value")
			if (thupdater) {
				thupdater(threshold)
			}
		})
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcMSM);
}

export default function(platform) {
	const root = platform.setting.ml.configElement
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Then, click "Calculate".');
	div.append("div").classed("buttons", true);
	dispMSM(root, platform);
}
