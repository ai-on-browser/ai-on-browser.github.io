const Kernel = {
	"gaussian": (d = 1) => ((a, b) => {
		let r = a.reduce((acc, v, i) => acc + (v - b[i]) ** 2, 0)
		return Math.exp(-r / (2 * d * d));
	}),
	"linear": () => ((a, b) => a.reduce((acc, v, i) => acc + v * b[i], 0))
}

class OCSVM {
	// A Fast Learning Algorithm for One-Class Support Vector Machine
	// Estimating the Support of a High-Dimensional Distribution
	// http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.39.9421&rep=rep1&type=pdf
	constructor(kernel, kernelArgs) {
		this._kernel = Kernel[kernel](...kernelArgs)

		this._nu = 0.5
		this._eps = 0.001
	}

	init(x) {
		this._x = x

		const n = this._x.length
		this._nl = n * this._nu
		this._a = Array(n).fill(1 / this._nl)
		this._b = 0
		this._alldata = true

		this._k = []
		for (let i = 0; i < n; this._k[i++] = []);
		for (let i = 0; i < n; i++) {
			for (let j = i; j < n; j++) {
				this._k[i][j] = this._k[j][i] = this._kernel(this._x[i], this._x[j])
			}
		}
	}

	fit() {
		const changed = this._fitOnce(this._alldata);
		if (this._alldata) {
			this._alldata = false;
			if (changed == 0) {
				return
			}
		} else if (changed == 0) {
			this._alldata = true;
		}
	}

	_fitOnce() {
		let change = 0
		const n = this._x.length

		for (let i = 0; i < n; i++) {
			const o = []
			this._rho = -Infinity
			for (let j = 0; j < n; j++) {
				o[j] = 0
				for (let k = 0; k < n; k++) {
					o[j] += this._a[j] * this._k[j][k]
				}
				if (this._rho < o[j]) {
					this._rho = o[j]
				}
			}

			if (!this._alldata) {
				const between_eps = v => (o[i] - this._rho) * v > 0 || (this._rho - o[i]) * (1 / this._nl - v) > 0;
				if (!between_eps(this._a[i])) {
					continue;
				}

				if (this._a[i] >= 1 / this._nl - this._eps || this._a[i] <= this._eps) {
					continue
				}
			}

			let j = -1
			let max_od = -Infinity
			for (let k = 0; k < n; k++) {
				if (k === i) {
					continue
				}

				if (this._a[k] >= 1 / this._nl - this._eps || this._a[k] <= this._eps) {
					continue
				}

				if (max_od < Math.abs(o[i] - o[k])) {
					j = k
					max_od = Math.abs(o[i] - o[k])
				}
			}
			if (j < 0 || j === i) {
				const offset = Math.floor(Math.random() * (n + 1))
				for (let k = 0; k < n; k++) {
					const p = (k + offset) % n
					if (p === i) {
						continue
					}
					j = p
					break
				}
			}

			let d = 1
			for (let k = 0; k < n; k++) {
				if (k === i || k === j) {
					continue
				}
				d -= this._a[k]
			}

			this._a[j] += (o[i] - o[j]) / (this._k[i][i] + this._k[j][j] - 2 * this._k[i][j])
			this._a[j] = Math.max(0, Math.min(1 / this._nl, this._a[j]))
			this._a[i] = Math.max(0, Math.min(1 / this._nl, d - this._a[j]))

			change++
		}

		this._rho = -Infinity
		for (let j = 0; j < n; j++) {
			let o = 0
			for (let k = 0; k < n; k++) {
				o += this._a[j] * this._k[j][k]
			}
			if (this._rho < o) {
				this._rho = o
			}
		}

		return change
	}

	predict(x) {
		const f = v => {
			let y = 0
			for (let n = 0; n < this._x.length; n++) {
				if (this._a[n])
					y += this._a[n] * this._kernel(v, this._x[n]);
			}
			return y - this._rho
		};
		return (!Array.isArray(x[0])) ? f(x) : x.map(f);
	}
}

var dispOCSVM = function(elm, platform) {
	let model = null
	let learn_epoch = 0

	const calcOCSVM = function(cb) {
		platform.fit((tx, ty, fit_cb) => {
			let iteration = +elm.select("[name=iteration]").property("value")
			for (let i = 0; i < iteration; i++) {
				model.fit()
			}
			learn_epoch += iteration
			platform.predict((px, pred_cb) => {
				px = [].concat(tx, px)
				let pred = model.predict(px)
				const min = Math.min(...pred)
				const max = Math.max(...pred)
				const th = +elm.select("[name=threshold]").property("value")
				pred = pred.map(v => (v - min) / (max - min) < th)
				fit_cb(pred.slice(0, tx.length))
				pred_cb(pred.slice(tx.length))
				cb && cb()
			}, 8)
		});
	};

	elm.append("select")
		.attr("name", "kernel")
		.on("change", function() {
			const k = d3.select(this).property("value");
			if (k == "gaussian") {
				elm.select("input[name=gamma]").style("display", "inline");
			} else {
				elm.select("input[name=gamma]").style("display", "none");
			}
		})
		.selectAll("option")
		.data(["gaussian", "linear"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.append("input")
		.attr("type", "number")
		.attr("name", "gamma")
		.attr("value", 0.1)
		.attr("min", 0.1)
		.attr("max", 10.0)
		.attr("step", 0.01);
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		const kernel = elm.select("[name=kernel]").property("value");
		const args = []
		if (kernel == "gaussian") {
			args.push(+elm.select("input[name=gamma]").property("value"))
		}
		platform.fit((tx, ty) => {
			model = new OCSVM(kernel, args)
			model.init(tx, ty)
		})
		learn_epoch = 0
		platform.init()
	})
	elm.append("span")
		.text(" Iteration ");
	elm.append("select")
		.attr("name", "iteration")
		.selectAll("option")
		.data([1, 10, 100, 1000])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.append("span")
		.text(" threshold = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "threshold")
		.attr("value", 0.6)
		.attr("min", 0)
		.attr("max", 1)
		.attr("step", 0.01)
	slbConf.step(calcOCSVM).epoch(() => learn_epoch)
}

export default function(platform) {
	platform.setting.ml.draft = true
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispOCSVM(platform.setting.ml.configElement, platform);
}