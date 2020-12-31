const cumulativeMovingAverage = (data) => {
	// https://ja.wikipedia.org/wiki/%E7%A7%BB%E5%8B%95%E5%B9%B3%E5%9D%87
	const p = []
	const d = data[0].length
	const s = Array(d).fill(0)
	for (let i = 0; i < data.length; i++) {
		for (let j = 0; j < d; j++) {
			s[j] += data[i][j]
		}
		p.push(s.map(v => v / (i + 1)))
	}
	return p
}

var dispMovingAverage = function(elm, platform) {
	const fitModel = () => {
		platform.plot((tx, ty, px, pred_cb) => {
			const pred = cumulativeMovingAverage(tx)
			pred_cb(pred)
		})
	}

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

