class LVQ {
	// https://en.wikipedia.org/wiki/Learning_vector_quantization
	constructor() {
		this._w = null
		this._c = []
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	_nearest(v) {
		let min_d = Infinity
		let min_c = -1
		for (let i = 0; i < this._w.length; i++) {
			const d = this._distance(v, this._w[i])
			if (d < min_d) {
				min_d = d
				min_c = i
			}
		}
		return min_c
	}

	_init(x, y) {
		const n = x.length
		this._c = [...new Set(y)]
		this._w = []
		for (let i = 0; i < n; i++) {
			const p = this._c.indexOf(y[i])
			if (!this._w[p]) {
				this._w[p] = x[i].concat()
			}
		}
	}

	fit(x, y, lr = 0.1) {
		if (!this._w) {
			this._init(x, y)
		}

		for (let i = 0; i < x.length; i++) {
			const m = this._nearest(x[i])
			if (y[i] === this._c[m]) {
				this._w[m] = this._w[m].map((v, d) => v + lr * (x[i][d] - v))
			} else {
				this._w[m] = this._w[m].map((v, d) => v - lr * (x[i][d] - v))
			}
		}
	}

	predict(datas) {
		if (this._w.length === 0) {
			return
		}
		return datas.map(v => this._c[this._nearest(v)])
	}
}

var dispLVQ = function(elm, platform) {
	let model = null
	let epoch = 0

	const fitModel = (cb) => {
		platform.plot(
			(tx, ty, px, pred_cb) => {
				if (!model) {
					model = new LVQ()
				}
				const lr = +elm.select("[name=lr]").property("value")
				model.fit(tx, ty.map(v => v[0]),  lr)
				const pred = model.predict(px)
				pred_cb(pred)
				elm.select("[name=epoch]").text(++epoch)
				cb && cb()
			}, 4
		);
	}

	elm.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			model = null
			elm.select("[name=epoch]").text(epoch = 0)
			platform.init()
		})
	elm.append("span")
		.text(" learning rate ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "lr")
		.attr("min", 0.01)
		.attr("max", 100)
		.attr("step", 0.01)
		.attr("value", 0.1)
	const fitButton = elm.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", () => {
			fitButton.property("disabled", true);
			runButton.property("disabled", true);
			fitModel(() => {
				fitButton.property("disabled", false);
				runButton.property("disabled", false);
			})
		});
	let isRunning = false;
	const runButton = elm.append("input")
		.attr("type", "button")
		.attr("value", "Run")
		.on("click", function() {
			isRunning = !isRunning;
			d3.select(this).attr("value", (isRunning) ? "Stop" : "Run");
			if (isRunning) {
				(function stepLoop() {
					if (isRunning) {
						fitModel(() => setTimeout(stepLoop, 0));
					}
					fitButton.property("disabled", isRunning);
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
	platform.setting.ml.description = 'Click and add data point. Then, click "Step" button repeatedly.'
	platform.setting.terminate = dispLVQ(platform.setting.ml.configElement, platform)
}

