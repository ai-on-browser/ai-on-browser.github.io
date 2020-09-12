class NadarayaWatson {
	// https://www.slideshare.net/yukaraikemiya/6-15415589
	constructor(s = 0.1) {
		this._s = s
		this._p = x => {
			const d = x.cols
			const v = x.copyMult(x)
			const s = v.sum(1)
			s.map(v => Math.exp(-v / this._s) / (Math.sqrt(2 * Math.PI * this._s) ** d))
			return s
		}
	}

	fit(x, y) {
		this._x = Matrix.fromArray(x);
		this._y = y;
	}

	predict(x) {
		const n = this._x.rows
		return x.map(v => {
			v = new Matrix(1, v.length, v)
			const d = this._x.copySub(v)
			const p = this._p(d)
			const sp = p.sum()

			let s = 0;
			for (let i = 0; i < n; i++) {
				s += this._y[i][0] * p.value[i] / sp
			}
			return s
		})
	}
}

var dispNadarayaWatson = function(elm, platform) {
	const fitModel = (cb) => {
		const s = +elm.select(".buttons [name=sigma]").property("value")
		platform.plot(
			(tx, ty, px, pred_cb) => {
				const model = new NadarayaWatson(s);
				model.fit(tx, ty);

				const pred = model.predict(px)
				pred_cb(pred)
			}, 10
		);
	};

	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "sigma")
		.attr("min", 0.01)
		.attr("max", 1)
		.attr("value", 0.1)
		.attr("step", 0.01)
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}

export default function(platform) {
	const root = platform.setting.ml.configElement
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	dispNadarayaWatson(root, platform);
}

