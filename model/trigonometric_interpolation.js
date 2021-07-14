class TrigonometricInterpolation {
	// https://en.wikipedia.org/wiki/Trigonometric_interpolation
	constructor() {
		this._alpha = 0
	}

	fit(x, y) {
		const d = x.map((v, i) => [v, y[i]])
		d.sort((a, b) => a[0] - b[0])
		this._x = d.map(v => v[0])
		this._y = d.map(v => v[1])
	}

	_t(x, k) {
		const n = this._x.length
		let v = 1
		if (n % 2 === 0) {
			v = Math.sin((x - this._alpha) / 2) / Math.sin((this._x[k] - this._alpha) / 2)
		}
		for (let i = 0; i < n; i++) {
			if (i === k) continue
			v *= Math.sin((x - this._x[i]) / 2) / Math.sin((this._x[k] - this._x[i]) / 2)
		}
		return v
	}

	predict(target) {
		const n = this._x.length
		return target.map(t => {
			let v = 0
			for (let i = 0; i < n; i++) {
				v += this._y[i] * this._t(t, i)
			}
			return v
		})
	}
}

var dispTrigonometric = function(elm, platform) {
	const calcTrigonometric = function() {
		platform.fit((tx, ty) => {
			const model = new TrigonometricInterpolation()
			model.fit(tx.map(v => v[0]), ty.map(v => v[0]))
			platform.predict((px, cb) => {
				const pred = model.predict(px.map(v => v[0]))
				cb(pred)
			}, 1)
		})
	}

	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcTrigonometric);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispTrigonometric(platform.setting.ml.configElement, platform);
}
