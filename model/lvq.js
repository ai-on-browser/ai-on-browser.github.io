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
	let model = null

	const fitModel = (cb) => {
		platform.fit(
			(tx, ty, pred_cb) => {
				const lr = +elm.select("[name=lr]").property("value")
				if (platform.task === "CT") {
					if (!model) {
						const k = +elm.select("[name=k]").property("value")
						model = new LVQCluster(k)
					}
					model.fit(tx, lr)
					const pred = model.predict(tx)
					pred_cb(pred.map(v => v + 1))
					platform.centroids(model._w, model._w.map((v, i) => i + 1))
				} else {
					if (!model) {
						model = new LVQClassifier()
					}
					model.fit(tx, ty.map(v => v[0]),  lr)
					platform.predict((px, pred_cb) => {
						const pred = model.predict(px)
						pred_cb(pred)
					}, 4)
					platform.centroids(model._w, model._c)
				}
				cb && cb()
			}
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
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		model = null
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
	slbConf.step(fitModel).epoch()

	return () => {
		slbConf.stop()
	}
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	platform.setting.terminate = dispLVQ(platform.setting.ml.configElement, platform)
}

