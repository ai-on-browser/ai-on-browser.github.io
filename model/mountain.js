class Mountain {
	// Approximate Clustering Via the Mountain Method
	// https://www.uni-konstanz.de/bioml/bioml2/publications/Papers2005/BeWP05_ng_fss/smcMoutainClustering.pdf
	constructor(r, alpha, beta) {
		this._resolution = r
		this._alpha = alpha
		this._beta = beta
		this._centroids = []
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	_max(arr) {
		let max = -Infinity
		let idx = -1
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] > max) {
				max = arr[i]
				idx = i
			}
		}
		return [max, idx]
	}

	init(datas) {
		this._x = datas
		const n = datas.length
		const s = datas[0].length

		const x = Matrix.fromArray(datas)
		const min = x.min(0)
		const max = x.max(0)
		const pad = max.copySub(min)
		pad.div(this._resolution * 2)
		min.sub(pad)
		max.add(pad)

		this._grid = []
		const p = Array(s).fill(0)
		do {
			this._grid.push(p.map((v, i) => v / (this._resolution - 1) * (max.at(0, i) - min.at(0, i)) + min.at(0, i)))
			for (let i = 0; i < s; i++) {
				p[i]++
				if (p[i] < this._resolution) {
					break
				}
				p[i] = 0
			}
		} while (p.reduce((s, v) => s + v, 0) > 0);

		this._m = []
		for (let i = 0; i < this._grid.length; i++) {
			let mv = 0
			for (let j = 0; j < n; j++) {
				mv += Math.exp(-this._alpha * this._distance(this._x[j], this._grid[i]))
			}
			this._m[i] = mv
		}

		this._centroids = []
		this._mh = 0
	}

	fit() {
		const n = this._x.length
		const s = this._x[0].length

		if (this._centroids.length > 0) {
			const nh = this._centroids[this._centroids.length - 1]
			for (let i = 0; i < this._m.length; i++) {
				this._m[i] -= this._mh * Math.exp(-this._beta * this._distance(nh, this._grid[i]))
				this._m[i] = Math.max(0, this._m[i])
			}
		}
		const [mh, idx] = this._max(this._m)
		this._mh = mh
		this._centroids.push(this._grid[idx])
	}

	predict(data) {
		return data.map(v => {
			let min_d = Infinity
			let min_i = -1
			for (let i = 0; i < this._centroids.length; i++) {
				const d = this._distance(v, this._centroids[i])
				if (d < min_d) {
					min_d = d
					min_i = i
				}
			}
			return min_i
		})
	}
}

var dispMountain = function(elm, platform) {
	const svg = platform.svg;
	svg.append("g").attr("class", "centroids");
	let model = null
	let centroids = []

	const fitModel = (cb) => {
		const r = +elm.select("[name=resolution]").property("value")
		const alpha = +elm.select("[name=alpha]").property("value")
		const beta = +elm.select("[name=beta]").property("value")
		platform.fit(
			(tx, ty, fit_cb) => {
				if (!model) {
					model = new Mountain(r, alpha, beta);
					model.init(tx)
				}
				model.fit()
				const pred = model.predict(tx);
				fit_cb(pred.map(v => v + 1))
				platform.predict((px, pred_cb) => {
					pred_cb(model.predict(px).map(v => v + 1))
				}, 4)

				elm.select("[name=clusters]").text(model._centroids.length);
				centroids.forEach(c => c.remove())
				centroids = model._centroids.map((c, i) => {
					const dp = new DataPoint(svg.select(".centroids"), c.map(v => v * 1000), i + 1);
					dp.plotter(DataPointStarPlotter);
					return dp;
				})
				cb && cb()
			}
		);
	}

	elm.append("span")
		.text(" resolution ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "resolution")
		.attr("min", 1)
		.attr("max", 1000)
		.attr("value", 100)
	elm.append("span")
		.text(" alpha ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "alpha")
		.attr("min", 0)
		.attr("max", 100)
		.attr("step", 0.1)
		.attr("value", 5.4)
	elm.append("span")
		.text(" beta ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "beta")
		.attr("min", 1)
		.attr("max", 100)
		.attr("step", 0.1)
		.attr("value", 5.4)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			model = null
			centroids.forEach(c => c.remove())
			centroids = []
			elm.select("[name=clusters]").text(0);
			platform.init()
		});
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", () => {
			fitModel()
		});
	elm.append("span")
		.text(" Clusters: ");
	elm.append("span")
		.attr("name", "clusters");
	return () => {
		svg.selectAll(".centroids").remove();
	}
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	platform.setting.terminate = dispMountain(platform.setting.ml.configElement, platform)
}

