
class AR {
	// https://ja.wikipedia.org/wiki/%E8%87%AA%E5%B7%B1%E5%9B%9E%E5%B8%B0%E7%A7%BB%E5%8B%95%E5%B9%B3%E5%9D%87%E3%83%A2%E3%83%87%E3%83%AB
	constructor(p) {
		this._p = p;
	}

	fit(data) {
		const g = new Matrix(data.length - this._p, 1, data.slice(this._p))
		const G = new Matrix(data.length - this._p, this._p)
		for (let i = 0; i < data.length - this._p; i++) {
			for (let j = 0; j < this._p; j++) {
				G.set(i, j, data[i + this._p - 1 - j])
			}
		}
		const Gx = G.tDot(G);

		this._phi = Gx.slove(G.t).dot(g);
		const s = G.dot(this._phi)
		s.sub(g)
		this._e = s.mean()
	}

	predict(data, k) {
		const preds = []
		const lasts = data.slice(data.length - this._p)
		lasts.reverse()
		for (let i = 0; i < k; i++) {
			const last = new Matrix(1, this._p, lasts)
			const pred = last.dot(this._phi).value[0] + this._e
			preds.push(pred)
			lasts.unshift(pred)
			lasts.pop()
		}
		return preds
	}
}

var dispAR = function(elm, platform) {
	const fitModel = () => {
		const p = +elm.select(".buttons [name=p]").property("value")
		const c = +elm.select(".buttons [name=c]").property("value")
		platform.plot((tx, ty, px, pred_cb) => {
			const model = new AR(p);
			model.fit(tx.map(v => v[0]))
			const pred = model.predict(tx, c)
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

var ar_init = function(platform) {
	const root = platform.setting.ml.configElement
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Click "fit" to update.');
	div.append("div").classed("buttons", true);
	dispAR(root, platform);
}

export default ar_init
