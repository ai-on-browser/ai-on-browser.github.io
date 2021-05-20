class PriestleyChao {
	// https://en.wikipedia.org/wiki/Kernel_regression
	// http://www.ma.man.ac.uk/~peterf/MATH38011/NPR%20P-C%20Estimator.pdf
	constructor(h) {
		this._h = h
		this._p = x => {
			const de = Math.sqrt(2 * Math.PI) ** x.cols
			const v = x.copyMult(x)
			const s = v.sum(1)
			s.map(v => Math.exp(-v / 2) / de)
			return s
		}
	}

	fit(x, y) {
		if (!this._h) {
			// Silverman's method
			const n = x.length;
			const k = x.map(d => Math.sqrt(d.reduce((s, v) => s + v ** 2, 0)));
			const mean = k.reduce((s, v) => s + v, 0) / n;
			const std = Math.sqrt(k.reduce((s, v) => s + (v - mean) ** 2, 0) / n)
			k.sort((a, b) => a - b);
			const q = p => {
				const np = n * p;
				const np_l = Math.floor(np);
				const np_h = Math.ceil(np);
				return k[np_l] + (np_h - np_l) * (k[np_l] - k[np_h])
			}
			const sgm = Math.min(std, (q(0.75) - q(0.25)) / 1.34)

			this._h = 1.06 * sgm / Math.pow(n, 0.2)
		}
		const d = x.map((v, i) => [v[0], y[i]])
		d.sort((a, b) => a[0] - b[0])
		this._x = Matrix.fromArray(d.map(v => v[0]))
		this._x2 = this._x.sliceRow(1)
		this._xd = this._x2.copySub(this._x.sliceRow(0, x.length - 1))
		this._y = d.map(v => v[1])
	}

	predict(x) {
		const n = this._x2.rows
		return x.map(v => {
			const d = this._x2.copySub(new Matrix(1, 1, v[0]))
			d.div(this._h)
			const p = this._p(d)
			p.mult(this._xd)

			let s = 0;
			for (let i = 0; i < n; i++) {
				s += this._y[i][0] * p.value[i]
			}
			return s / this._h
		})
	}
}

var dispPriestleyChao = function(elm, platform) {
	const fitModel = () => {
		const s = +sgm.property("value")
		const auto = autoCheck.property("checked")
		platform.fit(
			(tx, ty) => {
				const model = new PriestleyChao(auto ? null : s);
				model.fit(tx, ty);
				if (auto) {
					sgm.property("value", model._h)
				}

				platform.predict((px, pred_cb) => {
					const pred = model.predict(px)
					pred_cb(pred)
				}, platform.datas.dimension === 1 ? 1 : 4)
			}
		);
	};

	elm.append("span")
		.text("auto")
	const autoCheck = elm.append("input")
		.attr("type", "checkbox")
		.attr("name", "auto")
		.property("checked", true)
		.on("change", () => {
			sgm.property("disabled", autoCheck.property("checked"))
		})
	const sgm = elm.append("input")
		.attr("type", "number")
		.attr("name", "sigma")
		.attr("min", 0)
		.attr("value", 0.1)
		.attr("step", 0.01)
		.property("disabled", true)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button. This model works with 1D data only.'
	dispPriestleyChao(platform.setting.ml.configElement, platform)
}
