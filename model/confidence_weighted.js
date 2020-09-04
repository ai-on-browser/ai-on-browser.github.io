class ConfidenceWeighted {
	// https://y-uti.hatenablog.jp/entry/2017/03/17/001204
	constructor(eta) {
		this._eta = eta
		this._phi = this._ppf(this._eta)
		this._psi = 1 + this._phi ** 2 / 2
		this._xi = 1 + this._phi ** 2
	}

	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x);
		this._c = this._x.mean(0)
		this._x.sub(this._c)
		this._y = train_y;

		this._d = this._x.cols
		this._m = Matrix.zeros(this._d, 1)
		this._s = Matrix.eye(this._d, this._d)
	}

	_cdf(x) {
		return 1 / (1 + Math.exp(-1.7 * x))
	}

	_ppf(x) {
		if (x >= 1) return Infinity
		if (x === 0.5) return 0
		if (x < 0.5) return -this._ppf(1 - x)
		let min = 0, max = null
		let v = 1
		const e = 1.0e-8
		let maxCount = 1.0e+4
		while (maxCount-- > 0) {
			const t = this._cdf(v)
			if (Math.abs(t - x) < e) return v
			if (x < t) {
				max = v
				v = (v + min) / 2
			} else {
				min = v
				v = (max === null) ? v * 2 : (v + max) / 2
			}
		}
		throw "loop converged"
	}

	_alpha(v, m) {
		return Math.max(0, (-m * this._psi + Math.sqrt((m * this._phi ** 2 / 2) ** 2 + v * this._phi ** 2 * this._xi)) / (v * this._xi))
	}

	update(x, y) {
		const v = x.tDot(this._s).dot(x).value[0]
		const m = this._m.tDot(x).value[0]

		const alpha = this._alpha(v, m)
		const sq_u = (alpha * v * this._phi + Math.sqrt((alpha * v * this._phi) ** 2 + 4 * v)) / 2
		const beta = alpha * this._phi / (sq_u + v * alpha * this._phi)

		const md = this._s.dot(x)
		md.mult(alpha * y)
		this._m.add(md)
		const sd = this._s.dot(x).dot(x.tDot(this._s))
		sd.mult(beta)
		this._s.sub(sd)
	}

	fit() {
		for (let i = 0; i < this._x.rows; i++) {
			this.update(this._x.row(i).t, this._y[i])
		}
	}

	predict(data) {
		const x = Matrix.fromArray(data);
		x.sub(this._c)
		const r = x.dot(this._m);
		return r.value
	}
}

class SoftConfidenceWeighted extends ConfidenceWeighted {
	constructor(eta, cost, v) {
		super(eta)
		this._cost = cost
		this._v = v
	}

	_alpha(v, m) {
		if (this._v === 1) {
			return Math.min(this._cost, super._alpha(v, m))
		} else {
			const n = v + 1 / (2 * this._cost)
			const gamma = this._phi * Math.sqrt((this._phi * m * v) ** 2 + 4 * n * v * (n + v * this._phi ** 2))
			return Math.max(0, (gamma - 2 * m * n - this._phi ** 2 * m * v) / (2 * (n ** 2 + n * v * this._phi ** 2)))
		}
	}
}

var dispConfidenceWeighted = function(elm, platform) {
	const calc = (cb) => {
		const method = elm.select(".buttons [name=method]").property("value")
		const type = elm.select(".buttons [name=type]").property("value")
		const eta = +elm.select(".buttons [name=eta]").property("value")
		const cost = +elm.select(".buttons [name=cost]").property("value")
		platform.plot((tx, ty, px, pred_cb) => {
			ty = ty.map(v => v[0])
			const cls = method === "oneone" ? OneVsOneModel : OneVsAllModel;
			const mdl = (type === "cw") ? ConfidenceWeighted : SoftConfidenceWeighted
			const prm = (type === "cw") ? [eta] : [eta, cost, (type === "scw-1") ? 1 : 2]
			const model = new cls(mdl, new Set(ty), prm)
			model.init(tx, ty);
			model.fit()

			const categories = model.predict(px);
			pred_cb(categories)
			cb && cb()
		}, 3)
	}

	elm.select(".buttons")
		.append("select")
		.attr("name", "method")
		.selectAll("option")
		.data(["oneone", "oneall"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.select(".buttons")
		.append("select")
		.attr("name", "type")
		.on("change", function() {
			const type = d3.select(this).property("value")
			if (type === "cw") {
				celm.style("display", "none")
			} else {
				celm.style("display", "inline")
			}
		})
		.selectAll("option")
		.data(["cw", "scw-1", "scw-2"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d)
	const celm = elm.select(".buttons")
		.append("span")
		.style("display", "none")
	celm.append("span").text(" cost = ")
	celm.append("input")
		.attr("type", "number")
		.attr("name", "cost")
		.attr("min", 0)
		.attr("max", 100)
		.attr("value", 1)
	elm.select(".buttons")
		.append("span")
		.text(" eta = ")
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "eta")
		.attr("min", 0.5)
		.attr("max", 1)
		.attr("value", 0.9)
		.attr("step", 0.01)
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calc);
}

export default function(platform) {
	const root = platform.setting.ml.configElement
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Then, click "Calculate".');
	div.append("div").classed("buttons", true);
	dispConfidenceWeighted(root, platform);
}

