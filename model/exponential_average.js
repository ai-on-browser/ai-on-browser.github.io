const exponentialMovingAverage = (data, k) => {
	// https://ja.wikipedia.org/wiki/%E7%A7%BB%E5%8B%95%E5%B9%B3%E5%9D%87
	const p = [data[0]]
	const alpha = 2 / (k + 1)
	for (let i = 1; i < data.length; i++) {
		p.push(alpha * data[i] + (1 - alpha) * p[i - 1])
	}
	return p
}

const modifiedMovingAverage = (data, k) => {
	const p = [data[0]]
	for (let i = 1; i < data.length; i++) {
		p.push(((k - 1) * p[i - 1] + data[i]) / k)
	}
	return p
}

var dispMovingAverage = function(elm, platform) {
	const fitModel = () => {
		const method = elm.select(".buttons [name=method]").property("value")
		const k = +elm.select(".buttons [name=k]").property("value")
		platform.plot((tx, ty, px, pred_cb) => {
			let pred = []
			tx = tx.map(v => v[0])
			switch (method) {
			case "exponential":
				pred = exponentialMovingAverage(tx, k)
				break
			case "modified":
				pred = modifiedMovingAverage(tx, k)
				break
			}
			pred_cb(pred)
		})
	}

	elm.select(".buttons")
		.append("select")
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
		.attr("value", "Calculate")
		.on("click", fitModel);
}

export default function(platform) {
	const root = platform.setting.ml.configElement
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Click "Calculate" to update.');
	div.append("div").classed("buttons", true);
	dispMovingAverage(root, platform);
}

