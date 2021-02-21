import { HoltWinters } from './holt_winters.js'

const modifiedMovingAverage = (data, k) => {
	const p = [data[0]]
	for (let i = 1; i < data.length; i++) {
		p.push(p[i - 1].map((v, j) => ((k - 1) * v + data[i][j]) / k))
	}
	return p
}

var dispMovingAverage = function(elm, platform) {
	const fitModel = () => {
		const method = elm.select("[name=method]").property("value")
		const k = +elm.select("[name=k]").property("value")
		platform.plot((tx, ty, px, pred_cb) => {
			let pred = []
			switch (method) {
			case "exponential":
				const m = new HoltWinters(2 / (k + 1))
				pred = m.fit(tx)
				break
			case "modified":
				pred = modifiedMovingAverage(tx, k)
				break
			}
			pred_cb(pred)
		})
	}

	elm.append("select")
		.attr("name", "method")
		.on("change", () => {
			fitModel()
		})
		.selectAll("option")
		.data([
			"exponential",
			"modified",
		])
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d);
	elm.append("span")
		.text("k")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "k")
		.attr("min", 1)
		.attr("max", 100)
		.attr("value", 5)
		.on("change", fitModel)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", fitModel);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "Calculate" to update.'
	dispMovingAverage(platform.setting.ml.configElement, platform);
}

