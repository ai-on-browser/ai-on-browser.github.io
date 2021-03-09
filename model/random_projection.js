const RandomProjection = function(x, rd = 0, init = 'uniform') {
	// https://daily.belltail.jp/?p=737
	let w
	const d = (rd <= 0) ? x.cols : rd
	if (init === 'root3') {
		// Random projection in dimensionality reduction: Applications to image and text data
		w = Matrix.zeros(x.cols, d)
		const r3 = Math.sqrt(3)
		for (let i = 0; i < w.length; i++) {
			const r = Math.random()
			if (r < 1 / 6) {
				w.value[i] = r3
			} else if (r < 1 / 3) {
				w.value[i] = -r3
			}
		}
	} else if (init === 'normal') {
		w = Matrix.randn(x.cols, d)
	} else {
		w = Matrix.random(x.cols, d, -1, 1)
	}
	return x.dot(w);
}

var dispRandomProjection = function(elm, platform) {
	const setting = platform.setting
	const fitModel = (cb) => {
		const init = elm.select("[name=init]").property("value")
		platform.fit(
			(tx, ty, pred_cb) => {
				const x_mat = Matrix.fromArray(tx);
				const dim = setting.dimension;
				let y = RandomProjection(x_mat, dim, init);
				pred_cb(y.toArray());
			}
		);
	};

	elm.append("select")
		.attr("name", "init")
		.selectAll("option")
		.data([
			"uniform",
			"normal",
			"root3"
		])
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d);
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispRandomProjection(platform.setting.ml.configElement, platform)
}
