class LinearRegression {
	constructor() {
		this._w = null;
	}

	fit(x, y) {
		const xh = x.resize(x.rows, x.cols + 1, 1);
		const xtx = xh.tDot(xh);

		this._w = xtx.slove(xh.t).dot(y);
	}

	predict(x) {
		let xh = x.resize(x.rows, x.cols + 1, 1);
		return xh.dot(this._w);
	}
}

var dispLinearRegression = function(elm, platform) {
	const fitModel = (cb) => {
		const dim = platform.datas.dimension
		platform.plot((tx, ty, px, pred_cb) => {
				let x = Matrix.fromArray(tx);
				let t = new Matrix(ty.length, 1, ty);

				let model = new LinearRegression()
				model.fit(x, t);

				const pred_values = Matrix.fromArray(px);
				let pred = model.predict(pred_values).value;
				pred_cb(pred);
			}, dim === 1 ? 100 : 4
		);
	};

	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}

var linear_regression_init = function(platform) {
	const root = platform.setting.ml.configElement
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	dispLinearRegression(root, platform);
}

export default linear_regression_init

