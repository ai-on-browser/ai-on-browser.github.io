class ROMMA {
	// https://papers.nips.cc/paper/1999/file/515ab26c135e92ed8bf3a594d67e4ade-Paper.pdf
	// The Relaxed Online Maximum Margin Algorithm.
	// https://olpy.readthedocs.io/en/latest/_modules/olpy/classifiers/romma.html#ROMMA
	constructor() {
		this._w = null
	}

	_mistake(m, y) {
		return m * y <= 0
	}

	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x);
		this._shift = this._x.mean(0)
		this._x.sub(this._shift)
		this._y = train_y;

		this._w = Matrix.zeros(this._x.cols, 1)
	}

	update(x, y) {
		const m = this._w.tDot(x).value[0]
		if (!this._mistake(m, y)) return

		const wnorm = this._w.norm() ** 2
		if (wnorm === 0) {
			this._w = x.copyMult(y)
			return
		}
		const xwnorm = x.norm() ** 2 * wnorm

		const c = (xwnorm - y * m) / (xwnorm - m ** 2)
		const d = wnorm * (y - m) / (xwnorm - m ** 2)

		const dw = this._w.copyMult(c)
		dw.add(x.copyMult(d))
		this._w = dw
	}

	fit() {
		for (let i = 0; i < this._x.rows; i++) {
			this.update(this._x.row(i).t, this._y[i])
		}
	}

	predict(data) {
		const x = Matrix.fromArray(data);
		x.sub(this._shift)
		const r = x.dot(this._w);
		return r.value
	}
}

class AggressiveROMMA extends ROMMA {
	// https://papers.nips.cc/paper/1999/file/515ab26c135e92ed8bf3a594d67e4ade-Paper.pdf
	// The Relaxed Online Maximum Margin Algorithm.
	// https://olpy.readthedocs.io/en/latest/_modules/olpy/classifiers/aromma.html#aROMMA
	_mistake(m, y) {
		return m * y < 1
	}
}

var dispROMMA = function(elm, platform) {
	const calc = (cb) => {
		const method = elm.select("[name=method]").property("value")
		const type = elm.select("[name=type]").property("value")
		platform.fit((tx, ty) => {
			ty = ty.map(v => v[0])
			const model = new EnsembleBinaryModel(type === "" ? ROMMA : AggressiveROMMA, method)
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
		.data(["oneone", "onerest"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.append("select")
		.attr("name", "type")
		.selectAll("option")
		.data(["", "aggressive"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calc);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispROMMA(platform.setting.ml.configElement, platform)
}
