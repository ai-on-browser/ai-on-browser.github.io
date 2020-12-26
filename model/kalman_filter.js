export class KalmanFilter {
	// https://ja.wikipedia.org/wiki/%E3%82%AB%E3%83%AB%E3%83%9E%E3%83%B3%E3%83%95%E3%82%A3%E3%83%AB%E3%82%BF%E3%83%BC
	// https://qiita.com/harmegiddo/items/ddd33f40d5e368a210df
	constructor() {
		this._d = 10
	}

	fit(z) {
		const n = z.length
		const d = z[0].length
		z = Matrix.fromArray(z)
		this._x = Matrix.randn(this._d, 1)
		this._F = Matrix.eye(this._d, this._d)
		this._H = Matrix.randn(d, this._d)
		this._P = this._F.dot(this._F.t)
		const f = []
		this._S = z.cov()
		for (let i = 0; i < n; i++) {
			const zi = z.row(i).t

			const e = this._H.dot(this._x)
			f.push(e.value.concat())
			e.isub(zi)
			const S = this._S.copyAdd(this._H.dot(this._P).dot(this._H.t))
			const K = this._P.dot(this._H.tDot(S.inv()))
			this._x.add(K.dot(e))
			this._P = Matrix.eye(this._d, this._d).copySub(K.dot(this._H)).dot(this._P)
		}
		return f
	}

	predict(k) {
		const pred = []
		let x = this._x
		let P = this._P
		for (let i = 0; i < k; i++) {
			const e = this._H.dot(x)
			pred.push(e.value)
			e.isub(x)
			const S = this._S.copyAdd(this._H.dot(this._P).dot(this._H.t))
			const K = P.dot(this._H.tDot(S.inv()))
			x = x.copyAdd(K.dot(e))
			P = Matrix.eye(this._d, this._d).copySub(K.dot(this._H)).dot(P)
		}
		return pred
	}
}

var dispKalmanFilter = function(elm, platform) {
	const task = platform.task
	const fitModel = () => {
		platform.plot((tx, ty, px, pred_cb) => {
			const model = new KalmanFilter();
			const f = model.fit(tx)
			if (task === "TP") {
				const c = +elm.select(".buttons [name=c]").property("value")
				const pred = model.predict(c)
				pred_cb(pred)
			} else {
				pred_cb(f.map(v => v[0]))
			}
		})
	}

	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel);
	if (task === "TP") {
		elm.select(".buttons")
			.append("span")
			.text("predict count")
		elm.select(".buttons")
			.append("input")
			.attr("type", "number")
			.attr("name", "c")
			.attr("min", 1)
			.attr("max", 100)
			.attr("value", 100)
			.on("change", fitModel)
	}
}

export default function(platform) {
	const root = platform.setting.ml.configElement
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Click "fit" to update.');
	div.append("div").classed("buttons", true);
	dispKalmanFilter(root, platform);
}
