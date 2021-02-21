import { SplineInterpolation } from './spline_interpolation.js'

export class SmoothingSpline {
	// https://www.slideshare.net/YusukeKaneko6/hastiechapter5
	// http://www.math.keio.ac.jp/~kei/GDS/2nd/spline.html
	// http://www.msi.co.jp/splus/usersCase/edu/pdf/takezawa.pdf
	// https://en.wikipedia.org/wiki/Smoothing_spline
	constructor(l) {
		this._l = l
	}

	fit(x, y) {
		const t = x.map((v, i) => [v, y[i], i])
		t.sort((a, b) => a[0] - b[0])
		x = t.map(v => v[0])
		y = Matrix.fromArray(t.map(v => v[1]))
		const n = x.length

		const w = Matrix.zeros(n - 2, n - 2)
		const d = Matrix.zeros(n - 2, n)
		for (let i = 0; i < n - 2; i++) {
			const hi = x[i + 1] - x[i]
			const hi1 = x[i + 2] - x[i + 1]
			d.set(i, i, 1 / hi)
			d.set(i, i + 1, -1 / hi - 1 / hi1)
			d.set(i, i + 2, 1 / hi1)

			if (i > 0) {
				w.set(i - 1, i, hi / 6)
				w.set(i, i - 1, hi / 6)
			}
			w.set(i, i, (hi + hi1) / 3)
		}
		const a = d.tDot(w.inv()).dot(d)
		a.mult(this._l)
		for (let i = 0; i < n; i++) {
			a.addAt(i, i, 1)
		}

		const m = a.slove(y).value

		this._spline = new SplineInterpolation()
		this._spline.fit(x, m)
	}

	predict(data) {
		return this._spline.predict(data)
	}
}

var dispSpline = function(elm, platform) {
	const calcSpline = function() {
		const l = +lmb.property("value")
		platform.plot((tx, ty, px, cb) => {
			let model = new SmoothingSpline(l);
			const data = tx.map(v => v[0])
			model.fit(data, ty.map(v => v[0]))
			const pred = model.predict(px.map(v => v[0]))
			cb(pred)
		}, 2, 1)
	}

	const lmb = elm.append("input")
		.attr("type", "number")
		.attr("name", "lambda")
		.attr("min", 0)
		.attr("value", 1)
		.attr("step", 0.01)
		.on("change", calcSpline)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcSpline)
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate". This model works with 1D data only.'
	dispSpline(platform.setting.ml.configElement, platform);
}
