class FuzzyCMeans {
	// http://ibisforest.org/index.php?%E3%83%95%E3%82%A1%E3%82%B8%E3%82%A3c-means%E6%B3%95
	constructor(m = 2) {
		this._m = m
		this._c = []
		this._u = []
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	init(datas) {
		this._x = datas
	}

	add() {
		let cp = null
		while (true) {
			const i = Math.floor(Math.random() * this._x.length)
			cp = this._x[i]
			if (this._c.every(c => this._distance(cp, c) > 0)) {
				break
			}
		}
		this._c.push(cp.concat())
		const u = []
		const k = this._c.length
		for (let i = 0; i < this._x.length; i++) {
			const d = this._distance(this._c[k - 1], this._x[i])
			let v = 0
			for (let j = 0; j < k; j++) {
				v += (d / this._distance(this._c[j], this._x[i])) ** (1 / (this._m - 1))
			}
			u[i] = isNaN(v) ? 0 : (1 / v)
		}
		this._u.push(u)
	}

	fit() {
		const m = this._x[0].length
		const c = this._u.map(u => {
			const c = Array(m).fill(0)
			let s = 0
			for (let i = 0; i < this._x.length; i++) {
				s += u[i] ** this._m
				for (let d = 0; d < m; d++) {
					c[d] += this._x[i][d] * u[i] ** this._m
				}
			}
			return c.map(v => v / s)
		})
		for (let i = 0; i < this._x.length; i++) {
			const d = c.map(c => this._distance(this._x[i], c))
			for (let k = 0; k < c.length; k++) {
				let v = 0
				for (let j = 0; j < c.length; j++) {
					v += (d[k] / d[j]) ** (2 / (this._m - 1))
				}
				this._u[k][i] = 1 / v
			}
		}
		this._c = c
	}

	predict() {
		return Matrix.fromArray(this._u).argmax(0).value
	}
}

var dispFuzzyCMeans = function(elm, platform) {
	let model = null

	const fitModel = (update, cb) => {
		platform.fit((tx, ty, pred_cb) => {
			if (update) {
				model.fit()
			}
			pred_cb(model.predict().map(v => v + 1))
			platform.centroids(model._c, model._c.map((c, i) => i + 1))
			cb && cb()
		}, 1);
	}

	elm.append("span")
		.text("m");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "m")
		.attr("max", 10)
		.attr("min", 1.1)
		.attr("step", 0.1)
		.attr("value", 2)
	const addCentroid = () => {
		model.add()
		elm.select("[name=clusternumber]")
			.text(model._c.length + " clusters");
		platform.centroids(model._c, model._c.map((c, i) => i + 1))
		fitModel(false)
	}
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		platform.fit((tx, ty) => {
			const m = +elm.select("[name=m]").property("value")
			model = new FuzzyCMeans(m)
			model.init(tx)
		}, 1)
		platform.init()

		addCentroid()
	});
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Add centroid")
		.on("click", addCentroid);
	elm.append("span")
		.attr("name", "clusternumber")
		.style("padding", "0 10px")
		.text("0 clusters");
	slbConf.step((cb) => {
		fitModel(true, cb)
	}).epoch()
	return () => {
		slbConf.stop()
	}
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.'
	platform.setting.terminate = dispFuzzyCMeans(platform.setting.ml.configElement, platform)
}
