class HMM {
	// https://qiita.com/ta-ka/items/3e5306d0432c05909992
	// https://mieruca-ai.com/ai/viterbi_algorithm/
	constructor(n) {
		this._n = n
		this._l = 11

		this._a = Matrix.random(this._n, this._n)
		this._a.div(this._a.sum(1))
		this._b = new Matrix(this._n, this._l, 1 / this._l)
		this._p = new Matrix(1, this._n, 1 / this._n)

		this._lmap = v => Math.max(0, Math.min(10, Math.round(v * 10)))
	}

	_forward(x) {
		const lx = x.copyMap(v => this._lmap(v))
		const n = x.rows
		const a = this._p.copy()
		a.repeat(n, 0)
		for (let k = 0; k < n; k++) {
			const ak = a.row(k)
			ak.mult(this._b.col(lx.at(k, 0)).t)
			a.set(k, 0, ak)
		}
		const as = [a.copy()]
		for (let t = 1; t < x.cols; t++) {
			for (let k = 0; k < n; k++) {
				const ak = a.row(k).dot(this._a)
				ak.mult(this._b.col(lx.at(k, t)).t)
				a.set(k, 0, ak)
			}
			as.push(a.copy())
		}
		return as
	}

	_backward(x, prob = false) {
		const lx = x.copyMap(v => this._lmap(v))
		const n = x.rows
		const b = Matrix.ones(n, this._n)
		const bs = [b.copy()]
		for (let t = x.cols - 1; t > 0; t--) {
			for (let k = 0; k < n; k++) {
				const ai = this._a.copyMult(this._b.col(lx.at(k, t)).t)
				b.set(k, 0, b.row(k).dot(ai.t))
			}
			bs.unshift(b.copy())
		}
		if (prob) {
			for (let k = 0; k < n; k++) {
				const bk = b.row(k)
				bk.mult(this._b.col(lx.at(k, 0)).t)
				b.set(k, 0, bk)
			}
			b.mult(this._p)
		}
		return bs
	}

	fit(datas) {
		const x = Matrix.fromArray(datas)
		const n = x.rows
		const lx = x.copyMap(v => this._lmap(v))
		const alpha = this._forward(x)
		const beta = this._backward(x)

		const gamma = []
		const zeta = []
		for (let t = 0; t < alpha.length; t++) {
			const an = alpha[alpha.length - 1].sum(1)

			const g = alpha[t].copyMult(beta[t])
			g.div(an)
			gamma.push(g)

			if (t < alpha.length - 1) {
				zeta[t] = []
				for (let k = 0; k < n; k++) {
					const a = alpha[t].row(k).t
					const b = beta[t + 1].row(k)
					b.mult(this._b.col(lx.at(k, t + 1)).t)
					const z = this._a.copy()
					z.mult(a)
					z.mult(b)
					z.div(an.value[k])
					zeta[t].push(z)
				}
			}
		}

		const ah = Matrix.zeros(this._n, this._n)
		const gsum = Matrix.zeros(n, this._n)
		for (let t = 0; t < gamma.length - 1; t++) {
			gsum.add(gamma[t])
		}
		for (let k = 0; k < n; k++) {
			const zk = Matrix.zeros(this._n, this._n)
			for (let t = 0; t < zeta.length; t++) {
				zk.add(zeta[t][k])
			}
			zk.div(gsum.row(k).t)
			ah.add(zk)
		}
		ah.div(n)

		gsum.add(gamma[gamma.length - 1])
		const bh = Matrix.zeros(this._n, this._l)
		for (let k = 0; k < n; k++) {
			const dk = Matrix.zeros(this._n, this._l)
			for (let t = 0; t < x.cols; t++) {
				for (let i = 0; i < this._n; i++) {
					dk.addAt(i, lx.at(k, t), gamma[t].at(k, i))
				}
			}
			dk.div(gsum.row(k).t)
			bh.add(dk)
		}
		bh.div(n)

		const ph = gamma[0].mean(0)

		this._a = ah
		this._b = bh
		this._p = ph
	}

	probability(datas) {
		const x = Matrix.fromArray(datas)
		const alpha = this._forward(x)

		return alpha[alpha.length - 1].sum(1).value
	}

	bestPath(data) {
		const x = Matrix.fromArray(data)
		const lx = x.copyMap(v => this._lmap(v))
		const n = x.rows

		const path = new Matrix(n, x.cols)
		const a = this._p.copy()
		a.repeat(n, 0)
		for (let k = 0; k < n; k++) {
			const ak = a.row(k)
			ak.mult(this._b.col(lx.at(k, 0)).t)
			a.set(k, 0, ak)
		}
		path.set(0, 0, a.argmax(1))
		for (let t = 1; t < x.cols; t++) {
			for (let k = 0; k < n; k++) {
				const p = path.at(k, t - 1)
				const ak = this._a.row(p)
				ak.mult(a.at(k, p))
				ak.mult(this._b.col(lx.at(k, t)).t)
				a.set(k, 0, ak)
			}
			path.set(0, t, a.argmax(1))
		}
		return path.toArray()
	}
}

var dispHMM = function(elm, platform) {
	let epoch = 0
	let model = null
	const fitModel = function(cb) {
		platform.plot((tx, ty, _, pred_cb, thup) => {
			if (!model) {
				const states = +elm.select("[name=state]").property("value")
				model = new HMM(states)
			}
			const x = [tx.map(v => v[0])]
			model.fit(x)
			const p = model.bestPath(x)[0]
			const d = []
			for (let i = 0; i < p.length - 1; i++) {
				d.push(p[i] !== p[i + 1])
			}
			elm.select("[name=epoch]").text(++epoch);
			pred_cb(d)
			cb && cb()
		})
	}

	elm.append("span")
		.text(" state = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "state")
		.attr("value", 3)
		.attr("min", 2)
		.attr("max", 100)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			model = null
			elm.select("[name=epoch]").text(epoch = 0);
			platform.init()
		})
	const stepButton = elm.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", fitModel)
	let isRunning = false;
	const runButton = elm.append("input")
		.attr("type", "button")
		.attr("value", "Run")
		.on("click", function() {
			isRunning = !isRunning;
			runButton.attr("value", (isRunning) ? "Stop" : "Run");
			if (isRunning) {
				(function stepLoop() {
					if (isRunning) {
						fitModel(() => setTimeout(stepLoop, 0));
					}
					stepButton.property("disabled", isRunning);
					runButton.property("disabled", false);
				})();
			} else {
				runButton.property("disabled", true);
			}
		});
	elm.append("span")
		.text(" Epoch: ");
	elm.append("span")
		.attr("name", "epoch");
	return () => {
		isRunning = false
	}
}

export default function(platform) {
	platform.setting.ml.description = 'Click and add data point. Then, click "Calculate".'
	platform.setting.terminate = dispHMM(platform.setting.ml.configElement, platform);
}
