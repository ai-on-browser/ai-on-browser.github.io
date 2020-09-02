class GaussianProcess {
	// https://qiita.com/ctgk/items/4c4607edf15072cddc46
	constructor(kernel, beta = 1) {
		this._kernel = kernel;
		this._beta = beta;
	}

	init(x, y) {
		const n = x.length;
		this._x = []
		for (let i = 0; i < n; i++) {
			this._x.push(x[i]);
		}
		this._t = new Matrix(y.length, 1, y)
		this._k = new Matrix(n, n)
	}

	fit(learning_rate = 0.1) {
		const n = this._x.length;
		for (let i = 0; i < n; i++) {
			this._k.set(i, i, this._kernel.calc(this._x[i], this._x[i]) + 1 / this._beta);
			for (let j = 0; j < i; j++) {
				const v = this._kernel.calc(this._x[i], this._x[j])
				this._k.set(i, j, v);
				this._k.set(j, i, v);
			}
		}

		this._prec_t = this._k.slove(this._t)

		const grads = [
			new Matrix(n, n),
			new Matrix(n, n),
		];
		for (let i = 0; i < n; i++) {
			for (let j = 0; j <= i; j++) {
				const v = this._kernel.derivatives(this._x[i], this._x[j]);
				for (let k = 0; k < v.length; k++) {
					grads[k].set(i, j, v[k]);
					grads[k].set(j, i, v[k]);
				}
			}
		}

		const t_prec = this._prec_t.t

		const upds = grads.map(g => {
			const tr = this._k.slove(g).trace()
			const d = -tr + t_prec.dot(g).dot(this._prec_t).trace()
			return d * learning_rate;
		})

		this._kernel.update(...upds);
	}

	predict(x) {
		const c = this._t.cols
		const m = Matrix.zeros(x.length, c);
		for (let i = 0; i < x.length; i++) {
			const xi = x[i];
			for (let j = 0; j < this._x.length; j++) {
				const v = this._kernel.calc(xi, this._x[j])
				for (let k = 0; k < c; k++) {
					m.addAt(i, k, v * this._prec_t.at(j, k))
				}
			}
		}
		return m.value;
	}
}

class GaussianKernel {
	constructor() {
		this._a = 0;
		this._b = 1;
	}

	calc(x, y) {
		let s = 0
		for (let i = 0; i < x.length; i++) {
			s += (x[i] - y[i]) ** 2
		}
		return Math.exp(-this._b / 2 * s) * this._a;
	}

	derivatives(x, y) {
		let s = 0
		for (let i = 0; i < x.length; i++) {
			s += (x[i] - y[i]) ** 2
		}
		const da = Math.exp(-this._b / 2 * s);
		const db = -1 / 2 * s * da * this._a;
		return [da, db];
	}

	update(da, db) {
		this._a += da;
		this._b += db;
	}
}

var dispGaussianProcess = function(elm, platform) {
	const mode = platform.task
	let model = null;
	let epoch = 0;

	const fitModel = (cb) => {
		const dim = platform.datas.dimension
		const rate = +elm.select(".buttons [name=rate]").property("value")
		if (mode === 'CF') {
			const method = elm.select(".buttons [name=method]").property("value")
			platform.plot((tx, ty, px, pred_cb) => {
				ty = ty.map(v => v[0])
				if (!model) {
					const cls = method === "oneone" ? OneVsOneModel : OneVsAllModel;
					const kernel = elm.select(".buttons [name=kernel]").property("value")
					const kernelFunc = new GaussianKernel();
					const beta = +elm.select(".buttons [name=beta]").property("value")
					model = new cls(GaussianProcess, [...new Set(ty)], [kernelFunc, beta])
					model.init(tx, ty);
				}
				model.fit()
				const categories = model.predict(px);
				pred_cb(categories)
				elm.select(".buttons [name=epoch]").text(epoch += 1);
				cb && cb()
			}, 10)
		} else {
			platform.plot(
				(tx, ty, px, pred_cb) => {
					if (!model) {
						const kernel = elm.select(".buttons [name=kernel]").property("value")
						const kernelFunc = new GaussianKernel();
						const beta = +elm.select(".buttons [name=beta]").property("value")
						model = new GaussianProcess(kernelFunc, beta);
						model.init(tx, ty)
					}

					model.fit(rate);

					let pred = model.predict(px);
					pred_cb(pred);
					elm.select(".buttons [name=epoch]").text(epoch += 1);
					cb && cb()
				}, dim === 1 ? 2 : 10
			);
		}
	};

	if (mode === 'CF') {
		elm.select(".buttons")
			.append("select")
			.attr("name", "method")
			.selectAll("option")
			.data(["oneone", "oneall"])
			.enter()
			.append("option")
			.property("value", d => d)
			.text(d => d);
	}
	elm.select(".buttons")
		.append("select")
		.attr("name", "kernel")
		.selectAll("option")
		.data(["gaussian"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.select(".buttons")
		.append("span")
		.text(" Beta ");
	elm.select(".buttons")
		.append("select")
		.attr("name", "beta")
		.selectAll("option")
		.data([0.001, 0.01, 0.1, 1, 10, 100])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.select(".buttons [name=beta]").property("value", 1)
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			model = null
			platform.init()
			elm.select(".buttons [name=epoch]").text(epoch = 0);
		});
	elm.select(".buttons")
		.append("span")
		.text(" Learning rate ");
	elm.select(".buttons")
		.append("select")
		.attr("name", "rate")
		.selectAll("option")
		.data([0.0001, 0.001, 0.01, 0.1, 1, 10])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	const fitButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
	let isRunning = false;
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Run")
		.on("click", function() {
			isRunning = !isRunning;
			d3.select(this).attr("value", (isRunning) ? "Stop" : "Run");
			fitButton.property("disabled", isRunning);
			if (isRunning) {
				(function stepLoop() {
					if (isRunning) {
						fitModel(() => {
							setTimeout(stepLoop, 0)
						});
					}
				})();
			}
		});
	elm.select(".buttons")
		.append("span")
		.text(" epoch: ");
	elm.select(".buttons")
		.append("span")
		.attr("name", "epoch")
		.text(0);
	return () => {
		isRunning = false;
	}
}

var gaussian_process_init = function(platform) {
	const root = platform.setting.ml.configElement
	const setting = platform.setting
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Initialize" button. Finally, click "Fit" button.');
	div.append("div").classed("buttons", true);
	let termCallback = dispGaussianProcess(root, platform);

	setting.terminate = () => {
		termCallback();
	};
}

export default gaussian_process_init

