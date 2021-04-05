class LOESS {
	// https://en.wikipedia.org/wiki/Local_regression
	// https://github.com/arokem/lowess
	constructor() {
		this._k = (a, b) => {
			const d = a.copySub(b)
			d.map(v => v * v)
			const s = d.sum(1)
			s.map(v => v <= 1 ? (1 - Math.sqrt(v) ** 3) ** 3 : 0)
			return s
		}
	}

	fit(x, y) {
		this._x = Matrix.fromArray(x)
		this._b = this._x.resize(this._x.rows, this._x.cols + 1, 1);
		this._y = Matrix.fromArray(y)
	}

	predict(x) {
		x = Matrix.fromArray(x)
		const pred = []
		for (let i = 0; i < x.rows; i++) {
			const xi = x.row(i)
			const w = Matrix.diag(this._k(this._x, xi).value)

			const p = this._b.tDot(w).dot(this._b).slove(this._b.tDot(w).dot(this._y))
			pred.push(xi.resize(xi.rows, xi.cols + 1, 1).dot(p).value)
		}
		return pred
	}
}

var dispLOESS = function(elm, platform) {
	const fitModel = (cb) => {
		platform.fit((tx, ty) => {
			const model = new LOESS()
			model.fit(tx, ty)
			platform.predict((px, pred_cb) => {
				pred_cb(model.predict(px))
			}, 10)
		});
	};

	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispLOESS(platform.setting.ml.configElement, platform)
}
