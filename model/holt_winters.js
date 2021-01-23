export class HoltWinters {
	// https://takuti.me/ja/note/holt-winters/
	constructor(a, b = 0, g = 0, s = 0) {
		this._a = a
		this._b = b
		this._g = g
		this._s = s
	}

	fit(x) {
		const f = [x[0]]
		this._d = x[0].length
		this._level = x[0].concat()
		this._trend = Array(this._d).fill(0)
		this._season = []
		for (let i = 0; i < this._s; i++) {
			this._season[i] = Array(this._d).fill(0)
		}

		for (let i = 1; i < x.length; i++) {
			const ft = []
			for (let j = 0; j < this._d; j++) {
				const level = this._a * (this._s <= 0 ? x[i][j] : x[i][j] - this._season[i % this._s][j]) + (1 - this._a) * (this._level[j] + this._trend[j])
				this._trend[j] = this._b * (level - this._level[j]) + (1 - this._b) * this._trend[j]
				ft[j] = level + this._trend[j]
				this._level[j] = level
				if (this._s > 0) {
					this._season[i % this._s][j] = this._g * (x[i][j] - level) + (1 - this._g) * this._season[i % this._s][j]
				}
			}
			f.push(ft)
		}
		this._step_offset = x.length + 1
		return f
	}

	predict(k) {
		const pred = []
		let x = this._level.map((l, i) => l + this._trend[i])
		let ll = this._level.concat()
		let trend = this._trend.concat()
		for (let i = 0; i < k; i++) {
			const p = []
			for (let j = 0; j < this._d; j++) {
				const level = this._a * (this._s <= 0 ? x[j] : x[j] - this._season[(i + this._step_offset) % this._s][j]) + (1 - this._a) * x[j]
				trend[j] = this._b * (ll[j] - level) + (1 - this._b) * trend[j]
				p[j] = level + trend[j]
				ll[j] = level
				x[j] = level + trend[j]
			}
			pred.push(p)
		}
		return pred
	}
}

var dispHoltWinters = function(elm, platform) {
	const fitModel = () => {
		const a = +elm.select("[name=a]").property("value")
		const b = +elm.select("[name=b]").property("value")
		const g = +elm.select("[name=g]").property("value")
		const s = +elm.select("[name=s]").property("value")
		const c = +elm.select("[name=c]").property("value")
		platform.plot((tx, ty, px, pred_cb) => {
			const model = new HoltWinters(a, b, g, s);
			model.fit(tx)
			const pred = model.predict(c)
			pred_cb(pred.map(v => v[0]))
		})
	}

	elm.append("span")
		.text("a")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "a")
		.attr("min", 0)
		.attr("step", 0.1)
		.attr("max", 1)
		.attr("value", 0.1)
	elm.append("span")
		.text("b")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "b")
		.attr("min", 0)
		.attr("max", 1)
		.attr("step", 0.1)
		.attr("value", 0)
	elm.append("span")
		.text("g")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "g")
		.attr("min", 0)
		.attr("max", 1)
		.attr("step", 0.1)
		.attr("value", 0)
	elm.append("span")
		.text("s")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "s")
		.attr("min", 0)
		.attr("max", 1000)
		.attr("value", 0)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel);
	elm.append("span")
		.text("predict count")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "c")
		.attr("min", 1)
		.attr("max", 100)
		.attr("value", 100)
		.on("change", fitModel)
}

export default function(platform) {
	platform.setting.ml.description = 'Click and add data point. Click "fit" to update.'
	dispHoltWinters(platform.setting.ml.configElement, platform);
}
