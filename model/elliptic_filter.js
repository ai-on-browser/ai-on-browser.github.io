import { LowpassFilter } from './lowpass.js'

class EllipticFilter extends LowpassFilter {
	constructor(ripple = 1, n = 2, xi = 1, c = 0.5) {
		super(c)
		this._n = n
		this._xi = xi
		this._e = ripple
	}

	_elliptic(n, xi, x) {
		if (n === 1) {
			return x
		}
		if (Math.abs(x) === 1) {
			return 1
		}
		const xi2 = xi ** 2
		if (n === 2) {
			const t = Math.sqrt(1 - 1 / xi2)
			return ((t + 1) * (x ** 2) - 1) / ((t - 1) * (x ** 2) + 1)
		} else if (n === 3) {
			const g = Math.sqrt(4 * xi2 + (4 * xi2 * (xi2 - 1)) ** (2 / 3))
			const xp2 = 2 * xi2 * Math.sqrt(g) / (Math.sqrt(8 * xi2 * (xi2 + 1) + 12 * g * xi2 - g ** 3) - g ** (3 / 2))
			const xz2 = xi2 / xp2
			return x * (1 - xp2) * (x ** 2 - xz2) / (1 - xz2) / (x ** 2 - xp2)
		} else if (n === 4) {
			return this._elliptic(2, this._elliptic(2, xi, xi), this._elliptic(2, xi, x))
		} else if (n === 6) {
			return this._elliptic(3, this._elliptic(2, xi, xi), this._elliptic(2, xi, x))
		}
		if (Number.isInteger(n / 4)) {
			return this._elliptic(2, this._elliptic(n / 2, xi, xi), this._elliptic(n / 2, xi, x))
		} else if (Number.isInteger(n / 6)) {
			return this._elliptic(3, this._elliptic(n / 2, xi, xi), this._elliptic(n / 2, xi, x))
		} else if (Number.isInteger(n / 9)) {
			return this._elliptic(3, this._elliptic(n / 3, xi, xi), this._elliptic(n / 3, xi, x))
		}
		return NaN
	}

	_cutoff(i, c, xr, xi) {
		const d = Math.sqrt(1 + (this._e * this._elliptic(this._n, this._xi, i / c)) ** 2)
		return [xr / d, xi / d]
	}
}

var dispElliptic = function(elm, platform) {
	const fitModel = () => {
		const n = +elm.select("[name=n]").property("value")
		const xi = +elm.select("[name=xi]").property("value")
		const ripple = +elm.select("[name=ripple]").property("value")
		const c = +elm.select("[name=c]").property("value")
		platform.fit((tx, ty, pred_cb) => {
			const model = new EllipticFilter(ripple, n, xi, c)
			const pred = model.predict(tx)
			pred_cb(pred)
		})
	}

	elm.append("span")
		.text("n")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "n")
		.attr("min", 1)
		.attr("max", 100)
		.attr("value", 2)
		.on("change", fitModel)
	elm.append("span")
		.text("ripple")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "ripple")
		.attr("min", 0)
		.attr("max", 10)
		.attr("value", 1)
		.attr("step", 0.1)
		.on("change", fitModel)
	elm.append("span")
		.text("xi")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "xi")
		.attr("min", 1)
		.attr("max", 10)
		.attr("value", 1.1)
		.attr("step", 0.1)
		.on("change", fitModel)
	elm.append("span")
		.text("cutoff rate")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "c")
		.attr("min", 0)
		.attr("max", 1)
		.attr("value", 0.9)
		.attr("step", 0.01)
		.on("change", fitModel)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", fitModel);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "Calculate" to update.'
	dispElliptic(platform.setting.ml.configElement, platform)
}
