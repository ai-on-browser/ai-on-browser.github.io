class ISODATA {
	constructor(init_k, min_k, max_k, split_std, merge_dist) {
		this._init_k = init_k
		this._min_k = min_k
		this._max_k = max_k
		this._split_sd = split_std
		this._merge_distance = merge_dist

		this._centroids = []
	}

	get centroids() {
		return this._centroids;
	}

	get size() {
		return this._centroids.length
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	init(data) {
		const n = data.length
		const cidx = []
		for (let i = 0; i < this._init_k; i++) {
			cidx.push(Math.floor(Math.random() * (n - i)))
		}
		for (let i = this._init_k - 1; i >= 0; i--) {
			for (let j = this._init_k - 1; j > i; j--) {
				if (cidx[i] <= cidx[j]) {
					cidx[j]++
				}
			}
		}

		this._centroids = []
		for (let i = 0; i < this._init_k; i++) {
			this._centroids[i] = data[cidx[i]]
		}
	}

	_fit_centers(data) {
		while (true) {
			const p = this.predict(data)
			const new_c = []
			for (let i = 0; i < this._centroids.length; i++) {
				const cx = data.filter((v, k) => p[k] === i)
				const m = Array(data[0].length).fill(0)
				for (let k = 0; k < cx.length; k++) {
					for (let d = 0; d < cx[k].length; d++) {
						m[d] += cx[k][d]
					}
				}
				new_c[i] = m.map(v => v / cx.length)
			}
			let e = 0
			for (let i = 0; i < this._centroids.length; i++) {
				e += this._centroids[i].reduce((s, v, d) => s + (v - new_c[i][d]) ** 2, 0)
			}
			if (isNaN(e) || e < 1.0e-8) {
				break
			}
			this._centroids = new_c
		}
	}

	fit(data) {
		this._fit_centers(data)

		if (this._centroids.length < this._max_k) {
			if (this._split_centroids(data)) {
				this._fit_centers(data)
			}
		}
		if (this._centroids.length > this._min_k) {
			const p = this.predict(data)
			for (let i = this._centroids.length - 1; i >= 0; i--) {
				if (p.every(v => v !== i)) {
					this._centroids.splice(i, 1)
				}
			}
		}
		if (this._centroids.length > this._min_k) {
			if (this._merge_centroids()) {
				this._fit_centers(data)
			}
		}
	}

	_merge_centroids() {
		for (let i = 0; i < this._centroids.length; i++) {
			for (let j = 0; j < i; j++) {
				const d = this._distance(this._centroids[i], this._centroids[j])
				if (d < this._merge_distance) {
					this._centroids[j] = this._centroids[j].map((v, k) => (v + this._centroids[i][k]) / 2)
					this._centroids.splice(i, 1)
					return true
				}
			}
		}
		return false
	}

	_split_centroids(datas) {
		const p = this.predict(datas)
		for (let i = 0; i < this._centroids.length; i++) {
			const cx = Matrix.fromArray(datas.filter((v, k) => p[k] === i))
			const s = cx.std(0).value
			for (let d = 0; d < s.length; d++) {
				if (d > this._split_sd) {
					const c = this._centroids[i].concat()
					c[d] += s[d] / 100
					this._centroids.splice(i, 0, c)
					return true
				}
			}
		}
		return false
	}

	predict(datas) {
		if (this._centroids.length === 0) {
			return;
		}
		return datas.map(v => {
			let min_d = Infinity
			let min_c = -1
			for (let i = 0; i < this._centroids.length; i++) {
				const d = this._distance(v, this._centroids[i])
				if (d < min_d) {
					min_d = d
					min_c = i
				}
			}
			return min_c
		});
	}
}

var dispISODATA = function(elm, platform) {
	let model = null
	let epoch = 0

	const fitModel = (cb) => {
		platform.plot(
			(tx, ty, px, pred_cb) => {
				if (!model) {
					const init_k = +elm.select("[name=init_k]").property("value")
					const max_k = +elm.select("[name=max_k]").property("value")
					const min_k = +elm.select("[name=min_k]").property("value")
					const spl_std = +elm.select("[name=spl_std]").property("value")
					const merge_dist = +elm.select("[name=merge_dist]").property("value")
					model = new ISODATA(init_k, min_k, max_k, spl_std, merge_dist)
					model.init(tx)
				}
				model.fit(tx)
				const pred = model.predict(tx)
				pred_cb(pred.map(v => v + 1))
				elm.select("[name=clusters]").text(model.size)
				elm.select("[name=epoch]").text(++epoch)
				cb && cb()
			}
		);
	}

	elm.append("span")
		.text(" init k ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "init_k")
		.attr("min", 1)
		.attr("max", 100)
		.attr("value", 20)
	elm.append("span")
		.text(" max k ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "max_k")
		.attr("min", 2)
		.attr("max", 100)
		.attr("value", 100)
	elm.append("span")
		.text(" min k ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "min_k")
		.attr("min", 1)
		.attr("max", 100)
		.attr("value", 2)
	elm.append("span")
		.text(" split std ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "spl_std")
		.attr("min", 0.01)
		.attr("max", 100)
		.attr("step", 0.01)
		.attr("value", 1)
	elm.append("span")
		.text(" merge dist ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "merge_dist")
		.attr("min", 0.01)
		.attr("max", 10)
		.attr("step", 0.01)
		.attr("value", 0.1)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			model = null
			elm.select("[name=clusters]").text(0)
			elm.select("[name=epoch]").text(epoch = 0)
		})
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
	elm.append("span")
		.text(" Clusters: ");
	elm.append("span")
		.attr("name", "clusters");

	return () => {
		isRunning = false
	}
}

export default function(platform) {
	platform.setting.ml.description = 'Click and add data point. Then, click "Step" button repeatedly.'
	platform.setting.terminate = dispISODATA(platform.setting.ml.configElement, platform)
}

