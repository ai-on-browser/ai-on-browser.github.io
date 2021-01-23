class CumSum {
	// https://qiita.com/kokumura/items/e4c17d989aa3c34c6dd0
	constructor() {
	}

	predict(datas) {
		let sum = datas[0]
		for (let i = 1; i < datas.length; i++) {
			sum += datas[i]
		}
		const mean = sum / datas.length

		const cum = []
		let d = 0
		for (let i = 0; i < datas.length; i++) {
			d += mean - datas[i]
			cum.push(Math.abs(d))
		}
		return cum
	}
}

var dispCumSum = function(elm, platform) {
	const calcCumSum = function() {
		platform.plot((tx, ty, _, cb) => {
			let model = new CumSum();
			const data = tx.map(v => v[0])
			const threshold = +elm.select("[name=threshold]").property("value")
			const pred = model.predict(data)
			cb(pred, threshold)
		})
	}

	elm.append("span")
		.text(" threshold = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "threshold")
		.attr("value", 10)
		.attr("min", 0)
		.attr("max", 100)
		.property("required", true)
		.on("change", calcCumSum)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcCumSum);
}

export default function(platform) {
	platform.setting.ml.description = 'Click and add data point. Then, click "Calculate".'
	dispCumSum(platform.setting.ml.configElement, platform);
}
