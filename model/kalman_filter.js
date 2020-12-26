export class KalmanFilter {
	// https://ja.wikipedia.org/wiki/%E3%82%AB%E3%83%AB%E3%83%9E%E3%83%B3%E3%83%95%E3%82%A3%E3%83%AB%E3%82%BF%E3%83%BC
	// https://qiita.com/harmegiddo/items/ddd33f40d5e368a210df
	// https://qiita.com/hanon/items/7f03621414c59f06d7ca
	// http://www1.accsnet.ne.jp/~aml00731/kalman.pdf
	constructor() {
		this._d = 10
		this._F = Matrix.eye(this._d, this._d)
		this._Q = Matrix.eye(this._d, this._d)
	}

	fit(z) {
		const n = z.length
		const d = z[0].length
		z = Matrix.fromArray(z)
		this._x = [Matrix.randn(this._d, 1)]
		this._P = [this._F.dot(this._F.t)]
		const x_ = []
		const P_ = []

		this._H = Matrix.randn(d, this._d)
		this._H.mult(0.1)
		this._R = Matrix.eye(d, d)

		for (let i = 0; i < n; i++) {
			const x = this._F.dot(this._x[i])
			const P = this._F.dot(this._P[i]).dot(this._F.t)
			P.add(this._Q)
			x_.push(x)
			P_.push(P)

			const e = this._H.dot(x)
			e.isub(z.row(i).t)
			const S = this._H.dot(P).dot(this._H.t)
			S.add(this._R)
			const K = P.dot(this._H.tDot(S.inv()))

			this._x.push(x.copyAdd(K.dot(e)))
			this._P.push(Matrix.eye(this._d, this._d).copySub(K.dot(this._H)).dot(P))
		}

		let s = this._x[n].copy()

		const f = []
		for (let i = n - 1; i >= 0; i--) {
			const a = this._P[i].dot(this._F.t).dot(P_[i].inv())

			s = this._x[i].copyAdd(a.dot(s.copySub(x_[i])))
			f[i] = this._H.dot(s).value
		}
		return f
	}

	predict(k) {
		const pred = []
		let x = this._x[this._x.length - 1]
		let P = this._P[this._P.length - 1]
		for (let i = 0; i < k; i++) {
			x = this._F.dot(x)
			pred.push(this._H.dot(x).value)
			P = this._F.dot(P).dot(this._F.t)
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
