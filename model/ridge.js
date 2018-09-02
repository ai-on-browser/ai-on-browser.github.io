class Ridge {
	constructor(lambda = 0.1) {
		this._w = null;
		this._lambda = lambda;
	}

	fit(x, y) {
		let xh = x.resize(x.rows, x.cols + 1, 1);

		let k = xh.cols;
		let xtx = xh.t.dot(xh);
		let i = Matrix.eye(k, k);
		i.mult(this._lambda);
		xtx.add(i);

		this._w = xtx.inv().dot(xh.t).dot(y);
	}

	predict(x) {
		let xh = x.resize(x.rows, x.cols + 1, 1);
		return xh.dot(this._w);
	}
}

var dispRidge = function(elm, mode) {
	const svg = d3.select("svg");
	const step = (mode == "D1") ? 100 : 4;

	let model = null;
	const fitModel = (cb) => {
		fitting(mode, svg, points, step,
			(tx, ty, fit_cb) => {
				let x = new Matrix(tx.length, tx[0].length, tx);
				let t = new Matrix(ty.length, 1, ty);

				model = new Ridge(+elm.select(".buttons [name=lambda]").property("value"));
				model.fit(x, t);

				fit_cb();
			},
			(x, pred_cb) => {
				const pred_values = new Matrix(x.length, x[0].length, x);
				let pred = model.predict(pred_values).value;
				pred_cb(pred);
			}
		);
	};

	elm.select(".buttons")
		.append("span")
		.text("lambda = ");
	elm.select(".buttons")
		.append("select")
		.attr("name", "lambda")
		.selectAll("option")
		.data([0, 0.0001, 0.001, 0.01, 0.1, 1, 10, 100])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}

var ridge_init = function(root, terminateSetter, mode) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	dispRidge(root, mode);

	terminateSetter(() => {
		d3.selectAll("svg .tile").remove();
	});
}

