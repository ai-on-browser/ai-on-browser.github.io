class LVQCluster {
	// https://www.researchgate.net/publication/224751633_Learning_vector_quantization_Cluster_size_and_cluster_number
	constructor(k) {
		this._k = k
		this._w = null
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

	_init(x) {
		const n = x.length
		const cidx = []
		for (let i = 0; i < this._k; i++) {
			cidx.push(Math.floor(Math.random() * (n - i)))
		}
		for (let i = this._k - 1; i >= 0; i--) {
			for (let j = this._k - 1; j > i; j--) {
				if (cidx[i] <= cidx[j]) {
					cidx[j]++
				}
			}
		}
		this._w = []
		for (let i = 0; i < this._k; i++) {
			this._w[i] = x[cidx[i]]
		}
	}

	fit(x, lr = 0.1) {
		if (!this._w) {
			this._init(x)
		}

		for (let i = 0; i < x.length; i++) {
			const m = this._nearest(x[i])
			this._w[m] = this._w[m].map((v, d) => v + lr * (x[i][d] - v))
		}
	}

	predict(datas) {
		if (this._w.length === 0) {
			return
		}
		return datas.map(v => this._nearest(v))
	}
}

class LVQClassifier {
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
	const svg = platform.svg
	let model = null
	let epoch = 0
	svg.append("g").attr("class", "centroids")
	let centroids = []

	const fitModel = (cb) => {
		platform.plot(
			(tx, ty, px, pred_cb) => {
				const lr = +elm.select("[name=lr]").property("value")
				centroids.forEach(c => c.remove());
				centroids = [];
				if (platform.task === "CT") {
					if (!model) {
						const k = +elm.select("[name=k]").property("value")
						model = new LVQCluster(k)
					}
					model.fit(tx, lr)
					const pred = model.predict(tx)
					pred_cb(pred.map(v => v + 1))
					for (let i = 0; i < model._w.length; i++) {
						let dp = new DataPoint(svg.select(".centroids"), model._w[i].map(v => v * 1000), centroids.length + 1)
						dp.plotter(DataPointStarPlotter)
						centroids.push(dp)
					}
				} else {
					if (!model) {
						model = new LVQClassifier()
					}
					model.fit(tx, ty.map(v => v[0]),  lr)
					const pred = model.predict(px)
					pred_cb(pred)
					for (let i = 0; i < model._w.length; i++) {
						let dp = new DataPoint(svg.select(".centroids"), model._w[i].map(v => v * 1000), model._c[i])
						dp.plotter(DataPointStarPlotter)
						centroids.push(dp)
					}
				}
				elm.select("[name=epoch]").text(++epoch)
				cb && cb()
			}, 4
		);
	}

	if (platform.task === "CT") {
		elm.append("span")
			.text(" k ")
		elm.append("input")
			.attr("type", "number")
			.attr("name", "k")
			.attr("min", 1)
			.attr("max", 100)
			.attr("value", 5)
	}
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			model = null
			elm.select("[name=epoch]").text(epoch = 0)
			svg.selectAll(".centroids *").remove()
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
		svg.selectAll(".centroids").remove()
	}
}

export default function(platform) {
	platform.setting.ml.description = 'Click and add data point. Then, click "Step" button repeatedly.'
	platform.setting.terminate = dispLVQ(platform.setting.ml.configElement, platform)
}

