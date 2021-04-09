class ODE {
	constructor(discrete = 20) {
		this._discrete = discrete
		this._m = 1
	}

	fit(datas, y, k) {
		this._k = k
		if (Array.isArray(y[0])) {
			y = y.map(v => v[0])
		}
		this._labels = [...new Set(y)]
		this._init()

		const x = Matrix.fromArray(datas)
		const xk = x.col(k)
		const xkmax = xk.max()
		const xkmin = xk.min()
		this._r = [-Infinity]
		for (let t = 1; t < this._discrete; t++) {
			this._r[t] = xkmin + (xkmax - xkmin) * t / this._discrete
		}
		this._r.push(Infinity)

		this._rate = []
		for (let n = 0; n < this._labels.length; n++) {
			this._rate[n] = []
			for (let t = 0; t < this._discrete; t++) {
				const data = datas.filter((d, i) => y[i] === this._labels[n] && this._r[t] <= d[k] && d[k] < this._r[t + 1])
				if (data.length >= this._m) {
					this._estimate_prob(Matrix.fromArray(data), n, t)
					this._rate[n][t] = data.length / datas.length
				} else {
					this._rate[n][t] = 0
				}
			}
		}
	}

	probability(data) {
		const ps = []
		for (let i = 0; i < this._labels.length; i++) {
			const p = data.map(d => {
				const xd = new Matrix(1, d.length, d)
				for (let t = 0; t < this._discrete; t++) {
					if (this._r[t] <= d[this._k] && d[this._k] < this._r[t + 1]) {
						if (this._rate[i][t] === 0) {
							return 0
						}
						return this._data_prob(xd, i, t).value[0] * this._rate[i][t]
					}
				}
			})
			ps.push(p);
		}
		return ps
	}

	predict(data) {
		const ps = this.probability(data)
		return data.map((v, n) => {
			let max_p = 0;
			let max_c = -1;
			for (let i = 0; i < this._labels.length; i++) {
				let v = ps[i][n];
				if (v > max_p) {
					max_p = v;
					max_c = i;
				}
			}
			return this._labels[max_c];
		})
	}
}

class GaussianODE extends ODE {
	constructor(discrete = 20) {
		super(discrete);
		this._means = [];
		this._vars = [];
	}

	_init() {
		this._means = [];
		this._vars = [];
	}

	_estimate_prob(x, cls, t) {
		if (!this._means[cls]) {
			this._means[cls] = []
			this._vars[cls] = []
		}
		this._means[cls][t] = x.mean(0);
		this._vars[cls][t] = x.variance(0);
	}

	_data_prob(x, cls, t) {
		const m = this._means[cls][t];
		const s = this._vars[cls][t];
		const xs = x.copySub(m);
		xs.mult(xs);
		xs.div(s)
		xs.map(v => Math.exp(-v / 2))
		xs.div(s.copyMap(v => Math.sqrt(2 * Math.PI * v)))
		return xs.prod(1);
	}
}

class AODE {
	// https://github.com/saitejar/AnDE
	// https://en.wikipedia.org/wiki/Averaged_one-dependence_estimators
	// https://www.programmersought.com/article/47484148792/
	constructor(discrete = 20) {
		this._discrete = discrete
	}

	fit(datas, y) {
		const m = datas[0].length
		if (Array.isArray(y[0])) {
			y = y.map(v => v[0])
		}
		this._labels = [...new Set(y)]

		this._ode = []
		for (let i = 0; i < m; i++) {
			const ode = new GaussianODE(this._discrete)
			ode.fit(datas, y, i)
			this._ode[i] = ode
		}
	}

	predict(data) {
		const probs = this._ode.map(ode => ode.probability(data))
		const p = []
		for (let i = 0; i < data.length; i++) {
			let max_p = -Infinity
			let max_c = -1
			for (let k = 0; k < this._labels.length; k++) {
				const v = probs.reduce((s, v) => s + v[k][i], 0) / this._ode.length
				if (v > max_p) {
					max_p = v
					max_c = k
				}
			}
			p[i] = max_p > 0 ? this._labels[max_c] : -1
		}
		return p
	}
}

var dispAODE = function(elm, platform) {
	const fitModel = () => {
		const discrete = +elm.select("[name=discrete]").property("value")
		const model = new AODE(discrete);
	
		platform.fit((tx, ty) => {
			model.fit(tx, ty);
			platform.predict((px, pred_cb) => {
				const categories = model.predict(px);
				pred_cb(categories)
			}, 3)
		})
	}

	elm.append("span")
		.text(" Discrete ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "discrete")
		.attr("max", 100)
		.attr("min", 1)
		.attr("value", 10)
		.on("change", fitModel);
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", fitModel)
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispAODE(platform.setting.ml.configElement, platform)
}
