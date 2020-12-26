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
		this._level = x[0]
		this._trend = 0
		this._season = Array(this._s).fill(0)

		for (let i = 1; i < x.length; i++) {
			const level = this._a * (this._s <= 0 ? x[i] : x[i] - this._season[i % this._s]) + (1 - this._a) * (this._level + this._trend)
			this._trend = this._b * (level - this._level) + (1 - this._b) * this._trend
			f.push(level + this._trend)
			this._level = level
			if (this._s > 0) {
				this._season[i % this._s] = this._g * (x[i] - level) + (1 - this._g) * this._season[i % this._s]
			}
		}
		this._step_offset = x.length + 1
		return f
	}

	predict(k) {
		const pred = []
		let x = this._level + this._trend
		let ll = this._level
		let trend = this._trend
		for (let i = 0; i < k; i++) {
			const level = this._a * (this._s <= 0 ? x : x - this._season[(i + this._step_offset) % this._s]) + (1 - this._a) * x
			trend = this._b * (ll - level) + (1 - this._b) * trend
			pred.push(level + trend)
			ll = level
			x = level + trend
		}
		return pred
	}
}

var dispHoltWinters = function(elm, platform) {
	const fitModel = () => {
		const a = +elm.select(".buttons [name=a]").property("value")
		const b = +elm.select(".buttons [name=b]").property("value")
		const g = +elm.select(".buttons [name=g]").property("value")
		const s = +elm.select(".buttons [name=s]").property("value")
		const c = +elm.select(".buttons [name=c]").property("value")
		platform.plot((tx, ty, px, pred_cb) => {
			const model = new HoltWinters(a, b, g, s);
			tx = tx.map(v => v[0])
			model.fit(tx)
			const pred = model.predict(c)
			pred_cb(pred)
		})
	}

	elm.select(".buttons")
		.append("span")
		.text("a")
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "a")
		.attr("min", 0)
		.attr("step", 0.1)
		.attr("max", 1)
		.attr("value", 0.1)
	elm.select(".buttons")
		.append("span")
		.text("b")
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "b")
		.attr("min", 0)
		.attr("max", 1)
		.attr("step", 0.1)
		.attr("value", 0)
	elm.select(".buttons")
		.append("span")
		.text("g")
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "g")
		.attr("min", 0)
		.attr("max", 1)
		.attr("step", 0.1)
		.attr("value", 0)
	elm.select(".buttons")
		.append("span")
		.text("s")
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "s")
		.attr("min", 0)
		.attr("max", 1000)
		.attr("value", 0)
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel);
	elm.select(".buttons")
		.append("span")
		.text("predict count")
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "c")
		.attr("min", 1)
		.attr("max", 100)
		.attr("value", 100)
		.on("change", fitModel)
}

export default function(platform) {
	const root = platform.setting.ml.configElement
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Click "fit" to update.');
	div.append("div").classed("buttons", true);
	dispHoltWinters(root, platform);
}
