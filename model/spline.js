class SmoothingSpline {
	// https://fhiyo.github.io/2019/03/25/smoothing-spline.html
	// https://www.slideshare.net/YusukeKaneko6/hastiechapter5
	// http://www.math.keio.ac.jp/~kei/GDS/2nd/spline.html
	constructor(l) {
		this._l = l
		this._N = [
			{
				f: (x, xj, xj1) => (xj1 - x) / (xj1 - xj),
				gg: () => 0
			},
			{
				f: (x, xj, xj1) => (x - xj) / (xj1 - xj),
				gg: () => 0
			},
			{
				f: (x, xj, xj1) => ((xj1 - x) ** 3 / (xj1 - xj) - (xj1 - xj) * (xj1 - x)) / 6,
				gg: (x, xj, xj1) => (xj1 - x) / (xj1 - xj)
			},
			{
				f: (x, xj, xj1) => ((x - xj) ** 3 / (xj1 - xj) - (xj1 - xj) * (x - xj)) / 6,
				gg: (x, xj, xj1) => (x - xj) / (xj1 - xj)
			}
		]
	}

	fit(x, y) {
		const n = x.length
		const d = x.map((v, i) => [v, y[i]])
		d.sort((a, b) => a[0] - b[0])

		x = this._x = d.map(v => v[0])
		y = Matrix.fromArray(d.map(v => v[1]))

		const N = new Matrix(n, this._N.length)
		const Ngg = new Matrix(n, this._N.length)
		for (let i = 0; i < n; i++) {
			let xi, xi1
			if (i === 0) {
				xi = x[i]
				xi1 = x[i + 1]
			} else {
				xi = x[i - 1]
				xi1 = x[i]
			}
			for (let k = 0; k < this._N.length; k++) {
				N.set(i, k, this._N[k].f(x[i], xi, xi1))
				Ngg.set(i, k, this._N[k].gg(x[i], xi, xi1))
			}
		}
		const W = Ngg.tDot(Ngg)

		if (!this._l) {
			// estimate lambda
		}
		W.mult(this._l)

		const B = N.tDot(N)
		B.add(W)

		this._w = B.slove(N.tDot(y)).value
		console.log(this._w)
	}

	predict(datas) {
		const x = Matrix.fromArray(datas)
		const pred = []
		for (let i = 0; i < x.rows; i++) {
			const v = x.at(i, 0)
			let k = 0
			for (; k < this._x.length; k++) {
				if (this._x[k] <= v) break
			}
			if (k >= this._x.length - 1) {
				pred.push(0)
				continue
			}
			const s = this._w.reduce((s, w, j) => s + this._N[j].f(v, this._x[k], this._x[k + 1]) * w, 0)
			pred.push(s)
		}
		return pred
	}
}

var dispSpline = function(elm, platform) {
	const calcSpline = function() {
		const l = +lmb.property("value")
		const auto = autoCheck.property("checked")
		platform.plot((tx, ty, px, cb) => {
			console.log(tx, px)
			let model = new SmoothingSpline(auto ? null : l);
			const data = tx.map(v => v[0])
			model.fit(data, ty)
			const pred = model.predict(px)
			cb(pred)
		}, 2, 1)
	}

	elm.append("span")
		.text("auto")
	const autoCheck = elm.append("input")
		.attr("type", "checkbox")
		.attr("name", "auto")
		.property("checked", true)
		.on("change", () => {
			lmb.property("disabled", autoCheck.property("checked"))
		})
	const lmb = elm.append("input")
		.attr("type", "number")
		.attr("name", "lambda")
		.attr("min", 0)
		.attr("value", 0.1)
		.attr("step", 0.01)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcSpline);
}

export default function(platform) {
	platform.setting.ml.description = 'Click and add data point. Then, click "Calculate".'
	dispSpline(platform.setting.ml.configElement, platform);
}
