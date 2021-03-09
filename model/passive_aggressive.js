class PA {
	// https://www.slideshare.net/hirsoshnakagawa3/ss-32274089
	constructor(v = 0) {
		this._c = 0.1
		this._v = v
	}

	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x);
		this._m = this._x.mean(0)
		this._x.sub(this._m)
		this._y = train_y;

		this._d = this._x.cols
		this._w = Matrix.zeros(this._d, 1)
	}

	update(x, y) {
		const m = x.dot(this._w).value[0]
		if (y * m >= 1) return
		const l = Math.max(0, 1 - y * m)
		const n = x.norm() ** 2
		let t = 0
		if (this._v === 0) {
			t = l / n
		} else if (this._v === 1) {
			t = Math.min(this._c, l / n)
		} else if (this._v === 2) {
			t = l / (n + 1 / (2 * this._c))
		}
		const xt = x.t
		xt.mult(t * y)
		this._w.add(xt)
	}

	fit() {
		for (let i = 0; i < this._x.rows; i++) {
			this.update(this._x.row(i), this._y[i])
		}
	}

	predict(data) {
		const x = Matrix.fromArray(data);
		x.sub(this._m)
		const r = x.dot(this._w);
		return r.value
	}
}

var dispPA = function(elm, platform) {
	const calc = (cb) => {
		const method = elm.select("[name=method]").property("value")
		const version = +elm.select("[name=version]").property("value")
		platform.fit((tx, ty) => {
			ty = ty.map(v => v[0])
			const cls = method === "oneone" ? OneVsOneModel : OneVsAllModel;
			const model = new cls(PA, new Set(ty), [version])
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
	elm.append("select")
		.attr("name", "version")
		.selectAll("option")
		.data([["PA", 0], ["PA-1", 1], ["PA-2", 2]])
		.enter()
		.append("option")
		.property("value", d => d[1])
		.text(d => d[0]);
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calc);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispPA(platform.setting.ml.configElement, platform)
}
