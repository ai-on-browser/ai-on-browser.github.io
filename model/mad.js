class MAD {
	// Median Absolute Deviation from median
	// https://www.vdu.lt/cris/bitstream/20.500.12259/92994/4/Aleksas_Pantechovskis_md.pdf
	constructor(threshold) {
		this._threshold = threshold;
		this._median = null;
		this._mad = null;
	}

	fit(data) {
		const n = data.length;
		if (n === 0) {
			return;
		}
		const dim = data[0].length;
		const x = Matrix.fromArray(data);
		this._median = x.median(0)
		x.sub(this._median)
		x.abs()
		this._mad = x.median(0)
	}

	predict(data) {
		const x = Matrix.fromArray(data);
		x.sub(this._median)
		x.abs()
		x.div(this._mad)

		return x.max(1).value.map(v => v > this._threshold)
	}
}

var dispMAD = function(elm, platform) {
	const calcMAD = function() {
		platform.plot((tx, ty, px, cb) => {
			const model = new MAD(+elm.select(".buttons [name=threshold]").property("value"))
			model.fit(tx);
			const outliers = model.predict(tx)
			const outlier_tiles = model.predict(px)
			cb(outliers, outlier_tiles)
		}, 3)
	}

	elm.select(".buttons")
		.append("span")
		.text(" threshold = ");
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "threshold")
		.attr("value", 2)
		.attr("min", 0)
		.attr("max", 10)
		.property("required", true)
		.attr("step", 0.1)
		.on("change", function() {
			calcMAD();
		});
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcMAD);
}


var mad_init = function(platform) {
	const root = platform.setting.ml.configElement
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Then, click "Calculate".');
	div.append("div").classed("buttons", true);
	dispMAD(root, platform);
}

export default mad_init
