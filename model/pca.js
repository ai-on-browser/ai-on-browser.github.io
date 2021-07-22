export class PCA {
	constructor(kernel = null) {
		this._kernel = kernel
	}

	fit(x) {
		this._x = x = Matrix.fromArray(x)
		let xd = null;
		if (this._kernel) {
			// https://axa.biopapyrus.jp/machine-learning/preprocessing/kernel-pca.html
			const n = x.rows;
			const kx = new Matrix(n, n)
			const xrows = []
			for (let i = 0; i < n; i++) {
				xrows.push(x.row(i))
			}
			for (let i = 0; i < n; i++) {
				for (let j = i; j < n; j++) {
					const kv = this._kernel(xrows[i], xrows[j])
					kx.set(i, j, kv)
					kx.set(j, i, kv)
				}
			}
			const J = Matrix.eye(n, n).copySub(1 / n)
			x = J.dot(kx)
		}
		xd = x.cov();
		[this._e, this._w] = xd.eigen();

		const esum = this._e.reduce((s, v) => s + v, 0)
		this._e = this._e.map(v => v / esum)
	}

	_gram(x) {
		x = Matrix.fromArray(x)
		const m = x.rows
		const n = this._x.rows
		if (this._kernel) {
			const k = new Matrix(m, n)
			for (let i = 0; i < m; i++) {
				for (let j = 0; j < n; j++) {
					const v = this._kernel(x.row(i), this._x.row(j))
					k.set(i, j, v)
				}
			}
			return k
		}
		return x
	}

	predict(x, rd = 0) {
		let w = this._w
		if (rd > 0 && rd < w.cols) {
			w = w.resize(w.rows, rd)
		}
		x = this._gram(x)
		return x.dot(w);
	}
}

class AnomalyPCA extends PCA {
	constructor() {
		super()
	}

	fit(x) {
		x = Matrix.fromArray(x)
		this._m = x.mean(0)
		x.sub(this._m)
		super.fit(x)
	}

	predict(x) {
		x = Matrix.fromArray(x)
		x.sub(this._m)
		// http://tekenuko.hatenablog.com/entry/2017/10/16/211549
		x = this._gram(x)
		const n = this._w.rows
		let eth = 0.99
		let t = 0
		for (; t < this._e.length - 1 && eth >= 0; t++) {
			eth -= this._e[t]
		}
		t = Math.max(1, t)
		const u = this._w.sliceCol(0, t)
		const s = Matrix.eye(n, n)
		s.sub(u.dot(u.t))
		const xs = x.dot(s)
		xs.mult(x)
		return xs.sum(1).value
	}
}

var dispPCA = function(elm, platform) {
	let kernel = null;
	let poly_dimension = 2;

	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			if (platform.task === "DR") {
				const dim = platform.dimension;
				const model = new PCA(kernel)
				model.fit(tx)
				let y = model.predict(tx, dim);
				pred_cb(y.toArray());
			} else {
				const model = new AnomalyPCA()
				model.fit(tx)
				const th = +elm.select("[name=threshold]").property("value")
				const y = model.predict(tx)
				pred_cb(y.map(v => v > th));
				platform.predict((px, cb) => {
					const p = model.predict(px)
					cb(p.map(v => v > th));
				}, 10)
			}
		});
	}

	if (platform.task !== "AD") {
		elm.append("select")
			.on("change", function() {
				const slct = d3.select(this);
				slct.selectAll("option")
					.filter(d => d["value"] == slct.property("value"))
					.each(d => {
						kernel = d.kernel
						if (d.value === "polynomial") {
							elm.select("[name=poly_dimension]").style("display", "inline-block")
						} else {
							elm.select("[name=poly_dimension]").style("display", "none")
						}
					});
			})
			.selectAll("option")
			.data([
				{
					"value": "no kernel",
					"kernel": null
				},
				{
					"value": "gaussian",
					"kernel": (x, y, sigma = 1.0) => {
						const s = x.copySub(y).reduce((acc, v) => acc + v * v, 0)
						return Math.exp(-s / sigma ** 2)
					}
				},
				{
					"value": "polynomial",
					"kernel": (x, y) => {
						return x.tDot(y).value[0] ** poly_dimension
					}
				}
			])
			.enter()
			.append("option")
			.attr("value", d => d["value"])
			.text(d => d["value"]);
	}
	elm.append("span")
		.attr("name", "poly_dimension")
		.style("display", "none")
		.each(function() {
			d3.select(this)
				.append("span")
				.text(" d = ")
				.append("input")
				.attr("type", "number")
				.attr("value", 2)
				.attr("min", 1)
				.attr("max", 10)
				.on("change", function() {
					poly_dimension = d3.select(this).property("value");
				});
		})
	if (platform.task === "AD") {
		elm.append("span")
			.text(" threshold = ");
		elm.append("input")
			.attr("type", "number")
			.attr("name", "threshold")
			.attr("value", 0.1)
			.attr("min", 0)
			.attr("max", 10)
			.attr("step", 0.01)
			.on("change", fitModel)
	}
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispPCA(platform.setting.ml.configElement, platform);
}
