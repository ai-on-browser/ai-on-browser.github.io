class GaussianProcess {
	// https://qiita.com/ctgk/items/4c4607edf15072cddc46
	constructor(kernel, beta = 1) {
		this._kernel = kernel;
		this._beta = beta;
	}

	fit(x, y, learning_rate = 0.1) {
		const n = x.rows;
		const K = new Matrix(n, n);
		this._t = y;
		this._x = []
		for (let i = 0; i < n; i++) {
			this._x.push(x.row(i));
			K.set(i, i, this._kernel.calc(this._x[i], this._x[i]) + 1 / this._beta);
			for (let j = 0; j < i; j++) {
				const v = this._kernel.calc(this._x[i], this._x[j])
				K.set(i, j, v);
				K.set(j, i, v);
			}
		}

		this._cov = K;
		this._prec = K.inv();

		const grads = [
			new Matrix(n, n),
			new Matrix(n, n),
		];
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				const v = this._kernel.derivatives(this._x[i], this._x[j]);
				for (let k = 0; k < v.length; k++) {
					grads[k].set(i, j, v[k]);
				}
			}
		}

		const upds = grads.map(g => {
			const tr = this._prec.copyMult(g.t).sum() // this._proc.dot(g).trace()
			const d = -tr + y.tDot(this._prec).dot(g).dot(this._prec).dot(y).trace()
			return d * learning_rate;
		})

		this._kernel.update(...upds);
	}

	predict(x) {
		const K = new Matrix(x.rows, this._x.length);
		for (let i = 0; i < x.rows; i++) {
			const xi = x.row(i);
			for (let j = 0; j < this._x.length; j++) {
				const v = this._kernel.calc(xi, this._x[j])
				K.set(i, j, v);
			}
		}
		const m = K.dot(this._prec.dot(this._t));
		return m;
	}
}

class GaussianKernel {
	constructor() {
		this._a = 0;
		this._b = 1;
	}

	calc(x, y) {
		const s = x.copySub(y).reduce((acc, v) => acc + v * v, 0);
		return Math.exp(-this._b / 2 * s) * this._a;
	}

	derivatives(x, y) {
		const s = x.copySub(y).reduce((acc, v) => acc + v * v, 0);
		const da = Math.exp(-this._b / 2 * s);
		const db = -1 / 2 * s * da * this._a;
		return [da, db];
	}

	update(da, db) {
		this._a += da;
		this._b += db;
	}
}

var dispGaussianProcess = function(elm, mode, setting) {
	const svg = d3.select("svg");
	let model = null;
	let epoch = 0;

	const fitModel = (cb) => {
		const dim = setting.dimension
		const rate = +elm.select(".buttons [name=rate]").property("value")
		FittingMode.RG(dim).fit(svg, points, dim === 1 ? 2 : 10,
			(tx, ty, px, pred_cb) => {
				let x = Matrix.fromArray(tx);
				let t = new Matrix(ty.length, 1, ty);

				model.fit(x, t, rate);

				const pred_values = Matrix.fromArray(px);
				let pred = model.predict(pred_values).value;
				pred_cb(pred);
				elm.select(".buttons [name=epoch]").text(epoch += 1);
				cb && cb()
			}
		);
	};

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
			const kernel = elm.select(".buttons [name=kernel]").property("value")
			const kernelFunc = new GaussianKernel();
			const beta = +elm.select(".buttons [name=beta]").property("value")
			model = new GaussianProcess(kernelFunc, beta);
			svg.selectAll(".tile *").remove();
			elm.select(".buttons [name=epoch]").text(epoch = 0);
		});
	elm.select(".buttons")
		.append("span")
		.text(" Learning rate ");
	elm.select(".buttons")
		.append("select")
		.attr("name", "rate")
		.selectAll("option")
		.data([0.001, 0.01, 0.1, 1, 10])
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

var gaussian_process_init = function(root, mode, setting) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Initialize" button. Finally, click "Fit" button.');
	div.append("div").classed("buttons", true);
	let termCallback = dispGaussianProcess(root, mode, setting);

	setting.terminate = () => {
		d3.selectAll("svg .tile").remove();
		termCallback();
	};
}

export default gaussian_process_init

