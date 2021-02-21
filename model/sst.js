class SST {
	// https://blog.tsurubee.tech/entry/2017/10/11/221255
	constructor(w, take, lag) {
		this._window = w
		this._take = take || Math.max(1, Math.floor(w / 2))
		this._lag = lag || Math.max(1, Math.floor(this._take / 2))
	}

	predict(datas) {
		const x = []
		for (let i = 0; i < datas.length - this._window + 1; i++) {
			x.push(datas.slice(i, i + this._window))
		}

		const pred = []
		const k = Math.min(2, this._take)
		const selc = []
		for (let i = 0; i < k; selc.push(i++));
		for (let i = 0; i < x.length - this._take - this._lag + 1; i++) {
			const h = Matrix.fromArray(x.slice(i, i + this._take)).t
			const t = Matrix.fromArray(x.slice(i + this._lag, i + this._take + this._lag)).t

			const [u1, e1, v1] = h.svd()
			const um1 = u1.col(selc)
			const [u2, e2, v2] = t.svd()
			const um2 = u2.col(selc)
			const a = 1 - um1.tDot(um2).svd()[1][0] ** 2
			pred.push(a)
		}
		return pred
	}
}

var dispSST = function(elm, platform) {
	let thupdater = null
	const calcSST = function() {
		platform.plot((tx, ty, _, cb, thup) => {
			const d = +elm.select("[name=window]").property("value");
			let model = new SST(d);
			const data = tx.map(v => v[0])
			const threshold = +elm.select("[name=threshold]").property("value")
			const pred = model.predict(data)
			for (let i = 0; i < d * 3 / 8; i++) {
				pred.unshift(0)
			}
			thupdater = thup
			cb(pred, threshold)
		})
	}

	elm.append("span")
		.text(" window = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "window")
		.attr("value", 10)
		.attr("min", 1)
		.attr("max", 100)
	elm.append("span")
		.text(" threshold = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "threshold")
		.attr("value", 0.1)
		.attr("min", 0)
		.attr("max", 1)
		.attr("step", 0.01)
		.on("change", () => {
			const threshold = +elm.select("[name=threshold]").property("value")
			if (thupdater) {
				thupdater(threshold)
			}
		})
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcSST);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispSST(platform.setting.ml.configElement, platform);
}
