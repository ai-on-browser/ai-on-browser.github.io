class PolynomialRegression {
	// https://ja.wikipedia.org/wiki/多項式回帰
	constructor(d) {
		this._w = null;
		this._d = d;
	}

	_h(n) {
		let h = 1;
		for (let i = n + this._d - 1; i > n - 1; i--) {
			h *= i;
		}
		for (let k = this._d; k > 0; k--) {
			h /= k;
		}
		return h;
	}

	_create_x(x) {
		const d = this._h(x.cols + 1);
		const xd = new Matrix(x.rows, d);
		for (let i = 0; i < x.rows; i++) {
			xd.set(i, 0, 1);
			for (let j = 1, a = 1; j <= this._d; j++) {
				const p = Array(j).fill(0);
				while (1) {
					let vj = 1;
					for (let k = 0; k < j; k++) {
						vj *= x.at(i, p[k]);
					}
					xd.set(i, a++, vj);
					if (p[j - 1] >= x.cols - 1) {
						break;
					}
					for (let k = 0; k < j; k++) {
						p[k]++;
						if (p[k] < x.cols) {
							for (let m = k - 1; m >= 0; m--) {
								p[m] = p[k];
							}
							break;
						}
					}
				}
			}
		}
		return xd
	}

	fit(x, y) {
		const xd = this._create_x(x);
		const xx = xd.tDot(xd);
		this._w = xx.slove(xd.t).dot(y);
	}

	predict(x) {
		const xd = this._create_x(x);
		return xd.dot(this._w);
	}
}

var dispPolynomial = function(elm, platform) {
	const fitModel = () => {
		const dim = platform.datas.dimension
		platform.plot((tx, ty, px, pred_cb) => {
				let x = Matrix.fromArray(tx);
				let t = new Matrix(ty.length, 1, ty);

				let model = new PolynomialRegression(+elm.select("[name=dim]").property("value"));
				model.fit(x, t);

				const pred_values = Matrix.fromArray(px);
				let pred = model.predict(pred_values).value;
				pred_cb(pred);
			}, dim === 1 ? 1 : 5
		);
	};

	elm.append("span")
		.text("d = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "dim")
		.attr("min", 1)
		.attr("max", 10)
		.attr("value", 2)
		.on("change", fitModel);
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel);
}

export default function(platform) {
	platform.setting.ml.description = 'Click and add data point. Next, click "Fit" button.'
	dispPolynomial(platform.setting.ml.configElement, platform);
}
