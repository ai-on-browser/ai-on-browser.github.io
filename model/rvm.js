class RVM {
	// https://qiita.com/ctgk/items/ee512530618a5eeccd1a
	// https://en.wikipedia.org/wiki/Relevance_vector_machine
	constructor() {
		this._alpha = 1.0
		this._beta = 1.0
	}

	_kernel(x, y) {
		const k = x.copySub(y)
		return Math.exp(-10 * k.norm() ** 2)
	}

	fit(x, y) {
		this._x = x = Matrix.fromArray(x)
		const n = x.rows

		const p = new Matrix(n, n)
		for (let i = 0; i < n; i++) {
			for (let j = i; j < n; j++) {
				const k = this._kernel(x.row(i), x.row(j))
				p.set(i, j, k)
				p.set(j, i, k)
			}
		}
		const a = Array(n).fill(this._alpha)

		let maxCount = 1
		while (maxCount-- > 0) {
			const prec = p.tDot(p)
			prec.mult(this._beta)
			prec.add(Matrix.diag(a))
			this._cov = prec.inv()

			this._mean = this._cov.dot(p.tDot(y))
			this._mean.mult(this._beta)

			const g = []
			for (let i = 0; i < n; i++) {
				g.push(1 - a[i] * this._cov.at(i, i))
				a[i] = g[i] / Math.sqrt(this._mean.at(i, 0))
			}
			const tmp = y.copySub(p.dot(this._mean))
			tmp.map(v => v ** 2)

			this._beta = (n - g.reduce((s, v) => s + v, 0)) / tmp.sum()
		}
	}

	predict(x) {
		const n = this._x.rows
		x = Matrix.fromArray(x)
		const m = x.rows
		const k = new Matrix(m, n)
		for (let i = 0; i < m; i++) {
			for (let j = 0; j < n; j++) {
				const v = this._kernel(x.row(i), this._x.row(j))
				k.set(i, j, v)
			}
		}

		const mean = k.dot(this._mean)
		return mean
	}
}

var dispRVM = function(elm, platform) {
	let model = null
	let epoch = 0
	const fitModel = (cb) => {
		platform.plot((tx, ty, px, pred_cb) => {
				let x = Matrix.fromArray(tx);
				let t = new Matrix(ty.length, 1, ty);

				model.fit(x, t);

				const pred_values = Matrix.fromArray(px);
				let pred = model.predict(pred_values).value;
				pred_cb(pred);
				elm.select("[name=epoch]").text(++epoch)
				cb && cb()
			}, 4
		);
	};

	elm.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			model = new RVM()
			elm.select("[name=epoch]").text(epoch = 0)
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
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.terminate = dispRVM(platform.setting.ml.configElement, platform)
}
