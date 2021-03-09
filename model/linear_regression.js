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
		platform.fit((tx, ty, px, pred_cb) => {
			let x = Matrix.fromArray(tx);
			let t = new Matrix(ty.length, 1, ty);

			let model = new LinearRegression()
			model.fit(x, t);

			platform.predict((px, pred_cb) => {
				const pred_values = Matrix.fromArray(px);
				let pred = model.predict(pred_values).value;
				pred_cb(pred);
			}, dim === 1 ? 100 : 4)
		});
	};

	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispLinearRegression(platform.setting.ml.configElement, platform)
	platform.setting.ml.detail = `
The model form is
$$
f(X) = X W + \\epsilon
$$

In the least-squares setting, the loss function can be written as
$$
L(W) = \\| W X - y \\|^2
$$
where $ y $ is the observed value corresponding to $ X $.
Therefore, the optimum parameter $ \\hat{W} $ is estimated as
$$
\\hat{W} = \\left( X^T X \\right)^{-1} X^T y
$$
`
}
