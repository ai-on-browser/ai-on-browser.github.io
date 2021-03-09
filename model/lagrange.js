class LagrangeInterpolation {
	// https://ja.wikipedia.org/wiki/%E3%83%A9%E3%82%B0%E3%83%A9%E3%83%B3%E3%82%B8%E3%83%A5%E8%A3%9C%E9%96%93
	constructor(method = "weighted") {
		this._method = method
		this._w_type = 2
	}

	fit(x, y) {
		this._x = x
		this._y = y
	}

	predict(target) {
		const x = this._x
		const y = this._y
		if (this._method === "weighted") {
			const w = x.map((d, j) => 1 / x.reduce((p, v, i) => i === j ? p : p * (d - v), 1))
			if (this._w_type === 1) {
				return target.map(t => {
					const l = x.reduce((p, k) => p * (t - k), 1)
					return x.reduce((s, d, j) => {
						return s + y[j] * l * w[j] / (t - d + 1.0e-8)
					}, 0)
				})
			} else {
				return target.map(t => {
					let n = 0, m = 0
					x.forEach((v, j) => {
						const d = w[j] / (t - v)
						m += d
						n += y[j] * d
					})
					return n / m
				})
			}
		} else if (this._method === "newton") {
			const n = x.length
			const m = target.length
			const w = Matrix.zeros(n, n)
			for (let i = 0; i < n; i++) {
				w.set(i, 0, 1)
			}
			for (let j = 1; j < n; j++) {
				for (let i = j; i < n; i++) {
					w.set(i, j, w.at(i, j - 1) * (x[i] - x[j - 1]))
				}
			}
			const b = new Matrix(n, 1, y)
			const a = w.slove(b)

			const t = new Matrix(m, n)
			for (let i = 0; i < m; i++) {
				t.set(i, 0, 1)
			}
			target = new Matrix(m, 1, target)
			for (let j = 1; j < n; j++) {
				t.set(0, j, t.col(j - 1).copyMult(target.copySub(x[j - 1])))
			}
			return t.dot(a).value
		} else {
			return target.map(t => {
				return x.reduce((s, d, j) => {
					return s + y[j] * x.reduce((p, v, m) => {
						return (j === m) ? p : p * (t - v) / (d - v)
					}, 1)
				}, 0)
			})
		}
	}
}

var dispLagrange = function(elm, platform) {
	const calcLagrange = function() {
		platform.fit((tx, ty) => {
			const method = elm.select("[name=method]").property("value")
			let model = new LagrangeInterpolation(method);
			model.fit(tx.map(v => v[0]), ty.map(v => v[0]))
			platform.predict((px, cb) => {
				const pred = model.predict(px.map(v => v[0]))
				cb(pred)
			}, 2)
		})
	}

	elm.append("select")
		.attr("name", "method")
		.selectAll("option")
		.data(["", "weighted", "newton"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcLagrange);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispLagrange(platform.setting.ml.configElement, platform);
}

