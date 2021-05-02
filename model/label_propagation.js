class LabelPropagation {
	// https://satomacoto.blogspot.com/2012/07/python.html
	// https://qiita.com/MasafumiTsuyuki/items/910b85fb14f7f6bf8853
	// http://yamaguchiyuto.hatenablog.com/entry/2016/09/22/014202
	// https://github.com/scikit-learn/scikit-learn/blob/15a949460/sklearn/semi_supervised/_label_propagation.py
	constructor(method = "rbf", sigma = 0.1, k = Infinity) {
		this._k = k
		this._sigma = sigma
		this._affinity = method
	}

	_affinity_matrix(x) {
		const n = x.rows
		const distances = Matrix.zeros(n, n)
		for (let i = 0; i < n; i++) {
			for (let j = i + 1; j < n; j++) {
				let d = x.row(i).copySub(x.row(j)).norm()
				distances.set(i, j, d)
				distances.set(j, i, d)
			}
		}

		const con = Matrix.zeros(n, n)
		if (this._k >= n) {
			con.fill(1)
		} else if (this._k > 0) {
			for (let i = 0; i < n; i++) {
				const di = distances.row(i).value.map((v, i) => [v, i])
				di.sort((a, b) => a[0] - b[0])
				for (let j = 1; j < Math.min(this._k + 1, di.length); j++) {
					con.set(i, di[j][1], 1)
				}
			}
			con.add(con.t)
			con.div(2)
		}

		if (this._affinity === "rbf") {
			return distances.copyMap((v, i) => con.value[i] > 0 ? Math.exp(-(v ** 2) / (this._sigma ** 2)) : 0)
		} else if (this._affinity === "knn") {
			return con.copyMap(v => v > 0 ? 1 : 0)
		}
	}

	init(x, y) {
		x = Matrix.fromArray(x)
		const n = x.rows
		this._y = y
		const classes = new Set()
		for (let i = 0; i < n; i++) {
			if (this._y[i] > 0) {
				classes.add(this._y[i])
			}
		}
		this._classes = [...classes]

		this._w = this._affinity_matrix(x)

		this._probs = Matrix.zeros(n, this._classes.length)
		for (let i = 0; i < n; i++) {
			if (this._y[i] > 0) {
				this._probs.set(i, this._classes.indexOf(this._y[i]), 1)
			}
		}
	}

	fit() {
		const newProb = this._w.dot(this._probs)
		newProb.div(newProb.sum(1))
		for (let i = 0; i < this._y.length; i++) {
			if (this._y[i] === 0) {
				this._probs.set(i, 0, newProb.row(i))
			}
		}
	}

	predict() {
		return this._probs.argmax(1).value.map(v => this._classes[v])
	}
}

var dispLabelPropagation = function(elm, platform) {
	let model = null
	const fitModel = () => {
		platform.fit((tx, ty, fit_cb) => {
			if (!model) {
				const method = elm.select("[name=method]").property("value")
				const sigma = +elm.select("[name=sigma]").property("value")
				const k = +elm.select("[name=k_nearest]").property("value")
				model = new LabelPropagation(method, sigma, k)
				model.init(tx, ty.map(v => v[0]))
			}
			model.fit()
			fit_cb(model.predict())
		})
	}
	elm.append("select")
		.attr("name", "method")
		.on("change", function() {
			const value = d3.select(this).property("value")
			paramSpan.selectAll("*").style("display", "none")
			paramSpan.selectAll(`.${value}`)
				.style("display", "inline")
		})
		.selectAll("option")
		.data(["rbf", "knn"])
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d);
	const paramSpan = elm.append("span")
	paramSpan.append("span")
		.classed("rbf", true)
		.text("s =")
	paramSpan.append("input")
		.attr("type", "number")
		.attr("name", "sigma")
		.classed("rbf", true)
		.attr("min", 0.01)
		.attr("max", 100)
		.attr("step", 0.01)
		.property("value", 1)
	elm.append("span")
		.text("k =")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "k_nearest")
		.attr("min", 1)
		.attr("max", 1000)
		.property("value", 10)
	platform.setting.ml.controller.stepLoopButtons().init(() => {
		model = null
		platform.init()
	}).step(cb => {
		fitModel()
		cb && cb()
	}).epoch()
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Finally, click "Step" button repeatedly.'
	dispLabelPropagation(platform.setting.ml.configElement, platform);
}
