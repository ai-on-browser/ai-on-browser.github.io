class RadialBasisFunctionNetwork {
	// https://qiita.com/sus304/items/1eeb22d4456c2fb1717d
	// http://yuki-koyama.hatenablog.com/entry/2014/05/04/132552
	// https://ja.wikipedia.org/wiki/%E6%94%BE%E5%B0%84%E5%9F%BA%E5%BA%95%E9%96%A2%E6%95%B0
	constructor(rbf = "linear", e = 1, l = 0) {
		const d2 = (x, c) => x.reduce((s, v, i) => s + (v - c[i]) ** 2, 0)
		if (rbf === "linear") {
			this._f = (x, c) => Math.sqrt(d2(x, c))
			if (l === 0) {
				l = 1.0e-8
			}
		} else if (rbf === "gaussian") {
			this._f = (x, c) => Math.exp(-d2(x, c) * e ** 2)
		} else if (rbf === "multiquadric") {
			this._f = (x, c) => Math.sqrt(1 + d2(x, c) * e ** 2)
		} else if (rbf === "inverse quadratic") {
			this._f = (x, c) => 1 / (1 + d2(x, c) * e ** 2)
		} else if (rbf === "inverse multiquadric") {
			this._f = (x, c) => 1 / Math.sqrt(1 + d2(x, c) * e ** 2)
		} else if (rbf === "thin plate") {
			this._f = (x, c) => {
				const r = d2(x, c)
				return r === 0 ? 0 : r * Math.log(Math.sqrt(r))
			}
			if (l === 0) {
				l = 1.0e-8
			}
		} else if (rbf === "bump") {
			this._f = (x, c) => {
				const r = d2(x, c)
				if (Math.sqrt(r) < 1 / e) {
					return Math.exp(-1 / (1 - r * e ** 2))
				}
				return 0
			}
		}
		this._l = l
	}

	fit(x, y) {
		this._x = x
		this._w = []
		const n = x.length
		const f = Matrix.zeros(n, n)
		for (let i = 0; i < n; i++) {
			for (let j = i; j < n; j++) {
				const d = this._f(x[i], x[j])
				f.set(i, j, d)
				f.set(j, i, d)
			}
		}
		if (this._l > 0) {
			f.add(Matrix.eye(n, n, this._l))
		}
		this._w = f.slove(Matrix.fromArray(y))
	}

	predict(target) {
		return target.map(t => {
			let s = 0
			for (let i = 0; i < this._x.length; i++) {
				s += this._w.at(i, 0) * this._f(t, this._x[i])
			}
			return s
		})
	}
}

var dispRBF = function(elm, platform) {
	const calcRBF = function() {
		const rbf = elm.select("[name=rbf]").property("value")
		const l = +elm.select("[name=l]").property("value")
		const e = +elm.select("[name=e]").property("value")
		platform.fit((tx, ty) => {
			let model = new RadialBasisFunctionNetwork(rbf, e, l);
			model.fit(tx, ty)
			platform.predict((px, cb) => {
				const pred = model.predict(px)
				cb(pred)
			}, 4)
			platform.evaluate((x, e_cb) => {
				e_cb(model.predict(x))
			})
		})
	}

	elm.append("span")
		.text("RBF ");
	elm.append("select")
		.attr("name", "rbf")
		.selectAll("option")
		.data(["linear", "gaussian", "multiquadric", "inverse quadratic", "inverse multiquadric", "thin plate", "bump"])
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d);
	elm.append("span")
		.text(" e = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "e")
		.attr("value", 1)
		.attr("min", 0)
		.attr("max", 10)
		.attr("step", 0.1)
	if (platform.task === "IN") {
		elm.append("input")
			.attr("type", "hidden")
			.attr("name", "l")
			.attr("value", 0)
	} else {
		elm.append("span")
			.text(" l = ");
		elm.append("input")
			.attr("type", "number")
			.attr("name", "l")
			.attr("value", 0.1)
			.attr("min", 0)
			.attr("max", 10)
			.attr("step", 0.1)
	}
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcRBF);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispRBF(platform.setting.ml.configElement, platform);
}

