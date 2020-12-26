class ARMA {
	// https://qiita.com/asys/items/622594cb482e01411632
	// http://www.lec.ac.jp/pdf/activity/kiyou/no04/04.pdf
	constructor(p, q) {
		this._p = p
		this._q = q
	}

	fit(data) {
		const y = data
		const n = y.length
		this._phi = []
		for (let i = 0; i < this._p; this._phi[i++] = 0);
		this._the = []
		for (let i = 0; i < this._q; this._the[i++] = 0.3);

		for (let k = 0; k < 100; k++) {
			this._u = [y[0]]
			for (let i = 1; i < n; i++) {
				let v = y[i]
				for (let j = 0; j < Math.min(i, this._p); j++) {
					v -= this._phi[j] * y[i - j - 1]
				}
				for (let j = 0; j < Math.min(i, this._q); j++) {
					v += this._the[j] * this._u[i - j - 1]
				}
				this._u[i] = v
			}
			const f = new Matrix(n, 1, this._u)
			const J = Matrix.zeros(n, this._p + this._q)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < Math.min(i, this._p); j++) {
					J.set(i, j, -y[i - j - 1])
				}
				for (let j = 0; j < Math.min(i, this._q); j++) {
					J.set(i, j + this._p, this._u[i - j - 1])
				}
			}
			const H = J.tDot(J)
			const d = H.inv().dot(J.tDot(f)).value
			let e = d.reduce((s, v, i) => s + Math.abs(v), 0)
			e /= this._phi.reduce((s, v) => s + Math.abs(v), 0) + this._the.reduce((s, v) => s + Math.abs(v), 0)
			if (e < 1.0e-12) break
			for (let i = 0; i < this._p; i++) {
				this._phi[i] -= d[i]
			}
			for (let i = 0; i < this._q; i++) {
				this._the[i] -= d[i + this._p]
			}
		}
	}

	predict(data, k) {
		const preds = []
		const lasts = data.slice(data.length - Math.max(this._p, this._q))
		lasts.reverse()
		for (let i = 0; i < k; i++) {
			let pred = 0
			for (let i = 0; i < this._p; i++) {
				pred += this._phi[i] * lasts[i]
			}
			pred += this._u[this._u.length - 1]
			for (let i = 0; i < this._q; i++) {
				pred -= this._u[this._u.length - i - 2] * this._the[i]
			}
			preds.push(pred)
			lasts.unshift(pred)
			lasts.pop()
		}
		return preds
	}
}

var dispARMA = function(elm, platform) {
	const fitModel = () => {
		const p = +elm.select(".buttons [name=p]").property("value")
		const q = +elm.select(".buttons [name=q]").property("value")
		const c = +elm.select(".buttons [name=c]").property("value")
		platform.plot((tx, ty, px, pred_cb) => {
			const model = new ARMA(p, q);
			model.fit(tx.map(v => v[0]))
			const pred = model.predict(tx.map(v => v[0]), c)
			pred_cb(pred)
		})
	}

	elm.select(".buttons")
		.append("span")
		.text("p")
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "p")
		.attr("min", 1)
		.attr("max", 1000)
		.attr("value", 1)
	elm.select(".buttons")
		.append("span")
		.text("q")
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "q")
		.attr("min", 1)
		.attr("max", 1000)
		.attr("value", 1)
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel);
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

export default function(platform) {
	const root = platform.setting.ml.configElement
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Click "fit" to update.');
	div.append("div").classed("buttons", true);
	dispARMA(root, platform);
}
