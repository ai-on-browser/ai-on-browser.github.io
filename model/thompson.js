import { qt } from './smirnov_grubbs.js'

class Thompson {
	// https://ja.wikipedia.org/wiki/%E5%A4%96%E3%82%8C%E5%80%A4
	constructor(alpha) {
		this._alpha = alpha
	}

	predict(data) {
		const x = Matrix.fromArray(data);
		const n = x.rows
		const outliers = Array(data.length).fill(false)
		if (n <= 2 | this._alpha > n) return outliers

		const mean = x.mean(0)
		const std = x.std(0)

		x.sub(mean)
		x.abs()
		x.div(std)
		const gs = x.max(1)
		const gidx = gs.argmax(0).value[0]
		const g = gs.at(gidx, 0)
		const gt = g * Math.sqrt((n - 2) / (n - 1 - g ** 2))

		const p = this._alpha / n
		const t = qt(n - 2, p)

		if (gt > t) {
			outliers[gidx] = true
		}

		return outliers
	}
}

var dispThompson = function(elm, platform) {
	const calcThompson = function() {
		platform.plot((tx, ty, px, cb) => {
			const alpha = +elm.select("[name=alpha]").property("value")
			const model = new Thompson(alpha)
			const outliers = model.predict(tx);
			cb(outliers)
		}, 3)
	}

	elm.append("span")
		.text(" alpha = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "alpha")
		.attr("value", 1)
		.attr("min", 0)
		.attr("max", 50)
		.on("change", calcThompson);
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcThompson);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispThompson(platform.setting.ml.configElement, platform);
}
