class HermitInterpolation {
	// http://paulbourke.net/miscellaneous/interpolation/
	constructor(t, b) {
		this._t = t
		this._b = b
	}

	fit(x, y) {
		const d = x.map((v, i) => [v, y[i]])
		d.sort((a, b) => a[0] - b[0])
		this._x = d.map(v => v[0])
		this._y = d.map(v => v[1])
	}

	predict(target) {
		const n = this._x.length
		return target.map(t => {
			if (t <= this._x[0]) {
				return this._y[0]
			} else if (t >= this._x[n - 1]) {
				return this._y[n - 1]
			}
			for (let i = 1; i < n; i++) {
				if (t <= this._x[i]) {
					const p = (t - this._x[i - 1]) / (this._x[i] - this._x[i - 1])
					const y0 = i > 1 ? this._y[i - 2] : 2 * this._y[i - 1] - this._y[i]
					const y1 = this._y[i - 1]
					const y2 = this._y[i]
					const y3 = i < n - 1 ? this._y[i + 1] : 2 * this._y[i] + this._y[i - 1]
					const m0 = ((y1 - y0) * (1 + this._b) + (y2 - y1) * (1 - this._b))  * (1 - this._t) / 2
					const m1 = ((y2 - y1) * (1 + this._b) + (y3 - y2) * (1 - this._b)) * (1 - this._t) / 2
					const a0 = 2 * p ** 3 - 3 * p ** 2 + 1
					const a1 = p ** 3 - 2 * p ** 2 + p
					const a2 = p ** 3 - p ** 2
					const a3 = -2 * p ** 3 + 3 * p ** 2
					return a0 * y1 + a1 * m0 + a2 * m1 + a3 * y2
				}
			}
			return this._y[n - 1]
		})
	}
}

var dispHermitInterpolation = function(elm, platform) {
	const calcHermitInterpolation = function() {
		const tension = +elm.select("[name=tension]").property("value")
		const bias = +elm.select("[name=bias]").property("value")
		platform.fit((tx, ty) => {
			let model = new HermitInterpolation(tension, bias);
			model.fit(tx.map(v => v[0]), ty.map(v => v[0]))
			platform.predict((px, cb) => {
				const pred = model.predict(px.map(v => v[0]))
				cb(pred)
			}, 1)
		})
	}

	elm.append("span")
		.text(" tension ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "tension")
		.attr("value", 0)
		.attr("min", -1)
		.attr("max", 1)
		.attr("step", 0.1)
		.on("change", calcHermitInterpolation)
	elm.append("span")
		.text(" bias ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "bias")
		.attr("value", 0)
		.attr("min", -100)
		.attr("max", 100)
		.attr("step", 0.1)
		.on("change", calcHermitInterpolation)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcHermitInterpolation);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispHermitInterpolation(platform.setting.ml.configElement, platform);
}
