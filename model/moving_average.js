const movingAverage = (data, n) => {
	const p = []
	for (let i = 0; i < data.length; i++) {
		let v = 0
		for (let k = Math.max(0, i - n + 1); k <= i; k++) {
			v += data[k]
		}
		p.push(v / (i - Math.max(0, i - n + 1) + 1))
	}
	return p
}

var dispMovingAverage = function(elm, platform) {
	const svg = d3.select("svg");

	const fitModel = () => {
		const k = +d3.select(".buttons [name=k]").property("value")
		platform.plot((tx, ty, px, pred_cb) => {
			const pred = movingAverage(tx, k)
			pred_cb(pred)
		})
	}

	elm.select(".buttons")
		.append("span")
		.text("k")
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "k")
		.attr("min", 1)
		.attr("max", 100)
		.attr("value", 5)
		.on("change", fitModel)
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel);

	return () => {
	}
}


var moving_average_init = function(platform) {
	const root = platform.setting.ml.configElement
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Click "fit" to update.');
	div.append("div").classed("buttons", true);
	const terminator = dispMovingAverage(root, platform);
}

export default moving_average_init
