class Ridge {
	constructor(lambda = 0.1) {
		this._w = null;
		this._lambda = lambda;
	}

	fit(x, y) {
		const xh = x.resize(x.rows, x.cols + 1, 1);

		const xtx = xh.tDot(xh);
		for (let i = 0; i < xtx.rows; i++) {
			xtx.set(i, i, xtx.at(i, i) + this._lambda)
		}

		this._w = xtx.inv().dot(xh.t).dot(y);
	}

	predict(x) {
		let xh = x.resize(x.rows, x.cols + 1, 1);
		return xh.dot(this._w);
	}
}

var dispRidge = function(elm, mode, setting) {
	const svg = d3.select("svg");

	const fitModel = (cb) => {
		const dim = setting.dimension()
		FittingMode.RG(dim).fit(svg, points, dim === 1 ? 100 : 4,
			(tx, ty, px, pred_cb) => {
				let x = new Matrix(tx.length, tx[0].length, tx);
				let t = new Matrix(ty.length, 1, ty);

				let model = new Ridge(+elm.select(".buttons [name=lambda]").property("value"));
				model.fit(x, t);

				const pred_values = new Matrix(px.length, px[0].length, px);
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

var ridge_init = function(root, mode, setting) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	dispRidge(root, mode, setting);

	setting.setTerminate(() => {
		d3.selectAll("svg .tile").remove();
	});
}

