class Hotelling {
	// https://qiita.com/MasafumiTsuyuki/items/2677576849abf633e412
	// https://en.wikipedia.org/wiki/Hotelling%27s_T-squared_distribution
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

		const R = x.cov(1);
		this._Ri = R.inv();
	}

	predict(data) {
		const outliers = [];
		for (let i = 0; i < data.length; i++) {
			let d = 0;
			const x = [];
			for (let j = 0; j < data[i].length; j++) {
				x[j] = (data[i][j] - this._mean.value[j]);
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

var dispHotelling = function(elm, platform) {
	const calcHotelling = function() {
		platform.fit((tx, ty, cb) => {
			const threshold = +elm.select("[name=threshold]").property("value")
			const model = new Hotelling()
			model.fit(tx);
			const outliers = model.predict(tx).map(v => v > threshold)
			cb(outliers)
			platform.predict((px, pred_cb) => {
				const outlier_tiles = model.predict(px).map(v => v > threshold)
				pred_cb(outlier_tiles)
			}, 3)
		})
	}

	elm.append("span")
		.text(" threshold = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "threshold")
		.attr("value", 2)
		.attr("min", 0)
		.attr("max", 10)
		.property("required", true)
		.attr("step", 0.1)
		.on("change", function() {
			calcHotelling();
		});
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcHotelling);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispHotelling(platform.setting.ml.configElement, platform)
}
