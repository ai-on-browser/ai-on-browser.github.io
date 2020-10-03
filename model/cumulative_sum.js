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
			const threshold = +elm.select(".buttons [name=threshold]").property("value")
			const pred = model.predict(data)
			cb(pred, threshold)
		})
	}

	elm.select(".buttons")
		.append("span")
		.text(" threshold = ");
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "threshold")
		.attr("value", 10)
		.attr("min", 0)
		.attr("max", 100)
		.property("required", true)
		.on("change", calcCumSum)
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcCumSum);
}


var cumsum_init = function(platform) {
	const root = platform.setting.ml.configElement
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Then, click "Calculate".');
	div.append("div").classed("buttons", true);
	dispCumSum(root, platform);
}

export default cumsum_init
