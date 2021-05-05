class PossibilisticCMeans {
	// https://github.com/holtskinner/PossibilisticCMeans
	constructor(m = 2) {
		this._m = m
		this._c = []
		this._u = []
		this._k = 1
	}

	_distance2(a, b) {
		return a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0)
	}

	init(datas) {
		this._x = datas
	}

	add() {
		let cp = null
		while (true) {
			const i = Math.floor(Math.random() * this._x.length)
			cp = this._x[i]
			if (this._c.every(c => this._distance2(cp, c) > 0)) {
				break
			}
		}
		this._c.push(cp.concat())
		const u = []
		const d = this._x.map(v => this._distance2(cp, v))
		const eta = this._k * d.reduce((s, v) => s + v, 0) / d.length
		for (let i = 0; i < this._x.length; i++) {
			u[i] = 1 / (1 + (d[i] ** 2 / eta) ** (1 / (this._m - 1)))
		}
		this._u.push(u)
	}

	fit() {
		const m = this._x[0].length
		for (let k = 0; k < this._u.length; k++) {
			const d = this._x.map(v => this._distance2(this._c[k], v))
			let s = 0
			let eta = 0
			for (let i = 0; i < this._x.length; i++) {
				s += this._u[k][i] ** this._m
				eta += d[i] * this._u[k][i] ** this._m
			}
			eta *= this._k / s

			for (let i = 0; i < this._x.length; i++) {
				this._u[k][i] = 1 / (1 + (d[i] / eta) ** (1 / (this._m - 1)))
			}
		}
		const c = []
		for (let k = 0; k < this._u.length; k++) {
			const ck = Array(m).fill(0)
			let s = 0
			for (let i = 0; i < this._x.length; i++) {
				s += this._u[k][i] ** this._m
				for (let j = 0; j < m; j++) {
					ck[j] += this._x[i][j] * this._u[k][i] ** this._m
				}
			}
			c.push(ck.map(v => v / s))
		}
		this._c = c
	}

	predict() {
		return Matrix.fromArray(this._u).argmax(0).value
	}
}

var dispPossibilisticCMeans = function(elm, platform) {
	let model = null

	const fitModel = (update, cb) => {
		platform.fit((tx, ty, pred_cb) => {
			if (update) {
				model.fit()
			}
			pred_cb(model.predict().map(v => v + 1))
			platform.centroids(model._c, model._c.map((c, i) => i + 1), {line: true})
			cb && cb()
		});
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
		platform.centroids(model._c, model._c.map((c, i) => i + 1), {line: true})
		fitModel(false)
	}
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		platform.fit((tx, ty) => {
			const m = +elm.select("[name=m]").property("value")
			model = new PossibilisticCMeans(m)
			model.init(tx)
		})
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
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.'
	dispPossibilisticCMeans(platform.setting.ml.configElement, platform)
}
