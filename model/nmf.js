class NMF {
	// https://abicky.net/2010/03/25/101719/
	// https://qiita.com/nozma/items/d8dafe4e938c43fb7ad1
	// http://lucille.sourceforge.net/blog/archives/000282.html
	constructor() {
	}

	predict(x, rd = 0) {
		x = Matrix.fromArray(x).t
		const n = x.rows
		const m = x.cols
		if (x.value.some(v => v < 0)) {
			throw "Non-negative Matrix Fractorization only can process non negative matrix."
		}
		const r = rd
		const W = Matrix.random(n, r)
		const H = Matrix.random(r, m)
		let WH = W.dot(H)

		let maxCount = 1.0e+5
		while (maxCount-- > 0) {
			for (let j = 0; j < m; j++) {
				for (let i = 0; i < r; i++) {
					let s = 0
					for (let k = 0; k < n; k++) {
						s += W.at(k, i) * x.at(k, j) / WH.at(k, j)
					}
					H.multAt(i, j, s)
				}
			}

			for (let j = 0; j < r; j++) {
				for (let i = 0; i < n; i++) {
					let s = 0
					for (let k = 0; k < m; k++) {
						s += x.at(i, k) / WH.at(i, k) * H.at(j, k)
					}
					W.multAt(i, j, s)
				}
			}
			W.div(W.sum(0))
			WH = W.dot(H)

			if (x.copySub(W.dot(H)).norm() < 1.0e-12) {
				break
			}
		}
		return H.value
	}
}

var dispNMF = function(elm, setting, platform) {
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => {
			platform.plot(
				(tx, ty, px, pred_cb) => {
					const x_mat = Matrix.fromArray(px);
					const dim = setting.dimension;
					const model = new NMF()
					const pred = model.predict(x_mat, dim)
					pred_cb(pred)
				}
			);
		});
}

export default function(platform) {
	const root = platform.setting.ml.configElement
	const setting = platform.setting
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	dispNMF(root, setting, platform);
}
