class RecursiveLeastSquares {
	// https://en.wikipedia.org/wiki/Online_machine_learning
	constructor() {
		this._w = null
		this._s = null
	}

	update(x, y) {
		const ds = this._s.dot(x).dot(x.tDot(this._s))
		ds.div(1 + x.tDot(this._s).dot(x).value[0])
		this._s.sub(ds)

		const dw = this._s.dot(x)
		dw.mult(x.tDot(this._w).value[0] - y)
		this._w.sub(dw)
	}

	fit(x, y) {
		x = Matrix.fromArray(x)
		const xh = x.resize(x.rows, x.cols + 1, 1)
		if (!this._w) {
			this._w = Matrix.zeros(xh.cols, 1)
			this._s = Matrix.eye(xh.cols, xh.cols)
		}
		for (let i = 0; i < x.rows; i++) {
			this.update(xh.row(i).t, y[i])
		}
	}

	predict(data) {
		const x = Matrix.fromArray(data);
		const xh = x.resize(x.rows, x.cols + 1, 1)
		const r = xh.dot(this._w);
		return r.value
	}
}

var dispRLS = function(elm, platform) {
	const calc = (cb) => {
		platform.fit((tx, ty) => {
			ty = ty.map(v => v[0])
			let model = null
			if (platform.task === "CF") {
				const method = elm.select("[name=method]").property("value")
				model = new EnsembleBinaryModel(RecursiveLeastSquares, method)
			} else {
				model = new RecursiveLeastSquares()
			}
			model.fit(tx, ty)

			platform.predict((px, pred_cb) => {
				const categories = model.predict(px);
				pred_cb(categories)
				cb && cb()
			}, 3)
		})
	}

	if (platform.task === "CF") {
		elm.append("select")
			.attr("name", "method")
			.selectAll("option")
			.data(["oneone", "onerest"])
			.enter()
			.append("option")
			.property("value", d => d)
			.text(d => d);
	}
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calc);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispRLS(platform.setting.ml.configElement, platform)
}
