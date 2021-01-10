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

var dispRandomProjection = function(elm, setting, platform) {
	const fitModel = (cb) => {
		const init = elm.select(".buttons [name=init]").property("value")
		platform.plot(
			(tx, ty, px, pred_cb) => {
				const x_mat = Matrix.fromArray(px);
				const dim = setting.dimension;
				let y = RandomProjection(x_mat, dim, init);
				pred_cb(y.toArray());
			}
		);
	};

	elm.select(".buttons")
		.append("select")
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
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}


var random_projection_init = function(platform) {
	const root = platform.setting.ml.configElement
	const setting = platform.setting
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	dispRandomProjection(root, setting, platform);
}

export default random_projection_init
