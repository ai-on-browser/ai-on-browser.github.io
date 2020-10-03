class MT {
	constructor() {
		this._Ri = null;
		this._mean = null;
		this._std = null;
	}

	fit(data) {
		const n = data.length;
		if (n === 0) {
			return;
		}
		const x = Matrix.fromArray(data);
		this._mean = x.mean(0);
		x.sub(this._mean)
		this._std = x.std(0);
		x.div(this._std)

		const R = x.cov();
		this._Ri = R.inv();
	}

	predict(data) {
		const outliers = [];
		for (let i = 0; i < data.length; i++) {
			let d = 0;
			const x = [];
			for (let j = 0; j < data[i].length; j++) {
				x[j] = (data[i][j] - this._mean.value[j]) / this._std.value[j];
			}
			for (let j = 0; j < x.length; j++) {
				for (let k = 0; k < x.length; k++) {
					d += x[k] * this._Ri.at(k, j) * x[j];
				}
			}
			outliers.push(d / 2);
		}
		return outliers;
	}
}

var dispMT = function(elm, platform) {
	const calcMT = function() {
		platform.plot((tx, ty, px, cb) => {
			const threshold = +elm.select(".buttons [name=threshold]").property("value")
			const model = new MT()
			model.fit(tx);
			const outliers = model.predict(tx).map(v => v > threshold)
			const outlier_tiles = model.predict(px).map(v => v > threshold)
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
			calcMT();
		});
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcMT);
}


var mt_init = function(platform) {
	const root = platform.setting.ml.configElement
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Then, click "Calculate".');
	div.append("div").classed("buttons", true);
	dispMT(root, platform);
}

export default mt_init
