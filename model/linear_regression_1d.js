class LinearRegression {
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

var dispRidge1d = function(elm) {
	const svg = d3.select("svg");
	const reg_path = svg.insert("g", ":first-child").classed("tile", true).append("path").attr("stroke", "black").attr("fill-opacity", 0);
	const step = 100;
	const width = svg.node().getBoundingClientRect().width;
	const height = svg.node().getBoundingClientRect().height;

	const line = d3.line().x(d => d[0]).y(d => d[1]);

	const fitModel = (cb) => {
		let x = new Matrix(points.length, 1, points.map(p => p.at[0] / width));
		let t = new Matrix(points.length, 1, points.map(p => p.at[1] / height));

		let model = new LinearRegression();
		model.fit(x, t);

		const ps = [];
		for (let i = 0; i < width; i += step) {
			ps.push([i / width]);
		}
		ps.push([1]);
		const pred_values = new Matrix(ps.length, 1, ps);

		let y = model.predict(pred_values).value;

		let p = ps.map((v, i) => [v[0] * width, y[i] * height]);

		reg_path.attr("d", line(p));
	};

	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}


var linear_regression_1d_init = function(root, terminateSetter) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	dispRidge1d(root);

	terminateSetter(() => {
		d3.selectAll("svg .tile").remove();
	});
}
