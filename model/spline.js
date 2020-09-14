class SmoothingSpline {
	// https://fhiyo.github.io/2019/03/25/smoothing-spline.html
	constructor() {
	}

	predict(datas) {
	}
}

var dispSpline = function(elm, platform) {
	const calcSpline = function() {
		platform.plot((tx, ty, _, cb) => {
			let model = new spline();
			const data = tx.map(v => v[0])
			const pred = model.predict(data)
			cb(pred)
		})
	}

	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcSpline);
}

export default function(platform) {
	const root = platform.setting.ml.configElement
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Then, click "Calculate".');
	div.append("div").classed("buttons", true);
	dispSpline(root, platform);
}

