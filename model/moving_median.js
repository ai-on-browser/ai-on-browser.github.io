const movingMedian = (data, n) => {
	const p = []
	const d = data[0].length
	for (let i = 0; i < data.length; i++) {
		const m = Math.max(0, i - n + 1)
		const pi = []
		for (let j = 0; j < d; j++) {
			const v = []
			for (let k = m; k <= i; k++) {
				v.push(data[k][j])
			}
			v.sort((a, b) => a - b)
			if (v.length % 2 === 1) {
				pi[j] = v[(v.length - 1) / 2]
			} else {
				pi[j] = (v[v.length / 2] + v[v.length / 2 - 1]) / 2
			}
		}
		p.push(pi)
	}
	return p
}

var dispMovingMedian = function(elm, platform) {
	const fitModel = () => {
		const k = +elm.select(".buttons [name=k]").property("value")
		platform.plot((tx, ty, px, pred_cb) => {
			const pred = movingMedian(tx, k)
			pred_cb(pred)
		})
	}

	const kelm = elm.select(".buttons").append("span")
	kelm.append("span")
		.text("k")
	kelm.append("input")
		.attr("type", "number")
		.attr("name", "k")
		.attr("min", 1)
		.attr("max", 100)
		.attr("value", 5)
		.on("change", fitModel)
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", fitModel);
	fitModel()
}


var moving_median_init = function(platform) {
	const root = platform.setting.ml.configElement
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Click "Calculate" to update.');
	div.append("div").classed("buttons", true);
	dispMovingMedian(root, platform);
}

export default moving_median_init
