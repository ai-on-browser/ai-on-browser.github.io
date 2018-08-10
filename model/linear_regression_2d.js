class LinearRegression2d {
	constructor() {
		this._w = null;
	}

	fit(x, y) {
		let xh = x.resize(x.rows, x.cols + 1, 1);

		let k = xh.cols;
		let xtx = xh.t.dot(xh);

		this._w = xtx.inv().dot(xh.t).dot(y);
	}

	predict(x) {
		let xh = x.resize(x.rows, x.cols + 1, 1);
		return xh.dot(this._w);
	}
}

var dispLinearRegression2d = function(elm) {
	const svg = d3.select("svg");
	const tileLayer = svg.insert("g", ":first-child").classed("tile", true).attr("opacity", 0.5);
	const step = 4;
	const width = svg.node().getBoundingClientRect().width;
	const height = svg.node().getBoundingClientRect().height;

	const fitModel = (cb) => {
		let x = new Matrix(points.length, 2, points.map(p => [p.at[0] / width, p.at[1] / height]));
		let t = new Matrix(points.length, 1, points.map(p => p.category));

		let model = new LinearRegression2d();
		model.fit(x, t);

		const ps = [];
		for (let i = 0; i < width; i += step) {
			for (let j = 0; j < height; j += step) {
				ps.push([i / width, j / height]);
			}
		}
		const pred_values = new Matrix(ps.length, 2, ps);

		let pred = model.predict(pred_values).value;

		let categories = [];
		let n = 0;
		for (let i = 0; i < width / step; i++) {
			for (let j = 0; j < height / step; j++) {
				if (!categories[j]) categories[j] = [];
				categories[j][i] = pred[n++];
			}
		}
		tileLayer.selectAll("*").remove();
		new DataHulls(tileLayer, categories, step, true);
	};

	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}


var linear_regression_2d_init = function(root, terminateSetter) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	dispLinearRegression2d(root);

	terminateSetter(() => {
		d3.selectAll("svg .tile").remove();
	});
}
