export class PCA {
	constructor(kernel = null) {
		this._kernel = kernel
	}

	fit(x) {
		let xd = null;
		if (this._kernel) {
			// https://axa.biopapyrus.jp/machine-learning/preprocessing/kernel-pca.html
			const n = x.cols;
			const kx = new Matrix(n, n)
			const xcols = []
			for (let i = 0; i < n; i++) {
				xcols.push(x.col(i))
			}
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < kx.cols; j++) {
					kx.set(i, j, this._kernel(xcols[i], xcols[j]))
				}
			}
			if (false) {
				const J = Matrix.eye(n, n).copySub(1 / n)
				xd = kx.dot(J)
			} else {
				xd = kx;
			}
		} else {
			xd = x.cov();
		}
		this._w = xd.eigenVectors();
	}

	predict(x, rd = 0) {
		let w = this._w
		if (rd > 0 && rd < w.cols) {
			w = w.resize(w.rows, rd)
		}
		return x.dot(w);
	}
}

var dispPCA = function(elm, setting, platform) {
	let kernel = null;
	let poly_dimension = 2;

	elm.select(".buttons")
		.append("select")
		.on("change", function() {
			const slct = d3.select(this);
			slct.selectAll("option")
				.filter(d => d["value"] == slct.property("value"))
				.each(d => {
					kernel = d.kernel
					if (d.value === "polynomial") {
						elm.select(".buttons [name=poly_dimension]").style("display", "inline-block")
					} else {
						elm.select(".buttons [name=poly_dimension]").style("display", "none")
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
				"kernel": KernelFunction["gaussian"]
			},
			{
				"value": "polynomial",
				"kernel": (x, y) => {
					return KernelFunction["polynomial"](x, y, poly_dimension);
				}
			}
		])
		.enter()
		.append("option")
		.attr("value", d => d["value"])
		.text(d => d["value"]);
	elm.select(".buttons")
		.append("span")
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
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => {
			platform.plot(
				(tx, ty, px, pred_cb) => {
					const x_mat = Matrix.fromArray(px);
					const dim = setting.dimension;
					const model = new PCA(kernel)
					model.fit(x_mat)
					let y = model.predict(x_mat, dim).value;
					pred_cb(y);
				}
			);
		});
}


var pca_init = function(platform) {
	const root = platform.setting.ml.configElement
	const setting = platform.setting
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	dispPCA(root, setting, platform);
}

export default pca_init
