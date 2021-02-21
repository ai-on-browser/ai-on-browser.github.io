export class LaplacianEigenmaps {
	// https://www.cs.cmu.edu/~aarti/Class/10701/slides/Lecture21_1.pdf
	// https://github.com/JAVI897/Laplacian-Eigenmaps
	// https://scikit-learn.org/stable/modules/generated/sklearn.manifold.SpectralEmbedding.html
	constructor(affinity = "rbf", k = 10, sigma = 1, laplacian = "unnormalized") {
		this._affinity = affinity
		this._k = k
		this._sigma = sigma
		this._laplacian = laplacian
	}

	predict(x, rd, cb) {
		const n = x.rows
		const m = x.cols
		const distances = Matrix.zeros(n, n)
		for (let i = 0; i < n; i++) {
			for (let j = i + 1; j < n; j++) {
				let d = x.row(i).copySub(x.row(j)).norm()
				distances.set(i, j, d)
				distances.set(j, i, d)
			}
		}

		const con = Matrix.zeros(n, n)
		if (this._k > 0) {
			for (let i = 0; i < n; i++) {
				const di = distances.row(i).value.map((v, i) => [v, i])
				di.sort((a, b) => a[0] - b[0])
				for (let j = 1; j < Math.min(this._k + 1, di.length); j++) {
					con.set(i, di[j][1], 1)
				}
			}
			con.add(con.t)
			con.div(2)
		}

		let W
		if (this._affinity === "rbf") {
			W = distances.copyMap((v, i) => con.value[i] > 0 ? Math.exp(-(v ** 2) / (this._sigma ** 2)) : 0)
		} else if (this._affinity === "knn") {
			W = con.copyMap(v => v > 0 ? 1 : 0)
		}
		let d = W.sum(1).value
		const L = Matrix.diag(d)
		L.sub(W)

		if (this._laplacian === "normalized") {
			d = d.map(v => Math.sqrt(v))
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					L.set(i, j, L.at(i, j) / (d[i] * d[j]));
				}
			}
		}

		if (cb) {
			L.eigenVectors(data => {
				this._ev = data
				this._ev.flip(1)
				cb(this._ev.sliceCol(1, rd + 1))
			})
		} else {
			this._ev = L.eigenVectors()
			this._ev.flip(1)
			return this._ev.sliceCol(1, rd + 1)
		}
	}
}

var dispLE = function(elm, platform) {
	const setting = platform.setting
	elm.append("select")
		.attr("name", "method")
		.on("change", function() {
			const value = d3.select(this).property("value")
			paramSpan.selectAll("*").style("display", "none")
			paramSpan.selectAll(`.${value}`)
				.style("display", "inline")
		})
		.selectAll("option")
		.data([
			"rbf",
			"knn",
		])
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d);
	const paramSpan = elm.append("span")
	paramSpan.append("span")
		.classed("rbf", true)
		.text("s =")
	paramSpan.append("input")
		.attr("type", "number")
		.attr("name", "sigma")
		.classed("rbf", true)
		.attr("min", 0.01)
		.attr("max", 100)
		.attr("step", 0.01)
		.property("value", 1)
	elm.append("span")
		.text("k =")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "k_nearest")
		.attr("min", 1)
		.attr("max", 100)
		.property("value", 10)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => {
			const method = elm.select("[name=method]").property("value")
			const sigma = +paramSpan.select("[name=sigma]").property("value")
			const k = +elm.select("[name=k_nearest]").property("value")
			platform.plot(
				(tx, ty, px, pred_cb) => {
					const x_mat = Matrix.fromArray(px)
					const dim = setting.dimension
					const model = new LaplacianEigenmaps(method, k, sigma)
					const pred = model.predict(x_mat, dim)
					pred_cb(pred.toArray())
				}
			);
		});
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispLE(platform.setting.ml.configElement, platform)
}
