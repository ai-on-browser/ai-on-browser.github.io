class AROW {
	// http://kazoo04.hatenablog.com/entry/2012/12/20/000000
	constructor(r = 0.1) {
		this._m = null
		this._s = null
		this._r = r
	}

	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x);
		this._c = this._x.mean(0)
		this._x.sub(this._c)
		this._y = train_y;

		this._d = this._x.cols
		this._m = Matrix.zeros(this._d, 1)
		this._s = Matrix.eye(this._d, this._d)
	}

	update(x, y) {
		const m = this._m.tDot(x).value[0]
		if (m * y >= 1) return

		const v = x.tDot(this._s).dot(x).value[0]

		const beta = 1 / (v + this._r)
		const alpha = Math.max(0, 1 - y * m) * beta

		const md = this._s.dot(x)
		md.mult(alpha * y)
		this._m.add(md)
		const sd = this._s.dot(x).dot(x.tDot(this._s))
		sd.mult(beta)
		this._s.sub(sd)
	}

	fit() {
		for (let i = 0; i < this._x.rows; i++) {
			this.update(this._x.row(i).t, this._y[i])
		}
	}

	predict(data) {
		const x = Matrix.fromArray(data);
		x.sub(this._c)
		const r = x.dot(this._m);
		return r.value
	}
}

var dispAROW = function(elm, platform) {
	const calc = (cb) => {
		const method = elm.select("[name=method]").property("value")
		const r = +elm.select("[name=r]").property("value")
		platform.fit((tx, ty) => {
			ty = ty.map(v => v[0])
			const cls = method === "oneone" ? OneVsOneModel : OneVsAllModel;
			const model = new cls(AROW, new Set(ty), [r])
			model.init(tx, ty);
			model.fit()

			platform.predict((px, pred_cb) => {
				const categories = model.predict(px);
				pred_cb(categories)
				cb && cb()
			}, 3)
		})
	}

	elm.append("select")
		.attr("name", "method")
		.selectAll("option")
		.data(["oneone", "oneall"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.append("span")
		.text(" r = ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "r")
		.attr("min", 0)
		.attr("max", 10)
		.attr("value", 0.1)
		.attr("step", 0.1)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calc);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispAROW(platform.setting.ml.configElement, platform)
}
