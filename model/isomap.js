const Isomap = function(x, rd = 1) {
	// https://en.wikipedia.org/wiki/Isomap
	const n = x.rows;
	const d = x.cols;
	const near = 5;
	const N = new Matrix(n, n);
	for (let i = 0; i < n; i++) {
		for (let j = i + 1; j < n; j++) {
			let d = 0;
			for (let k = 0; k < d; k++) {
				d += (x.at(i, k) - x.at(j, k)) ** 2
			}
			N._value[i * n + j] = N._value[j * n + i] = Math.sqrt(d);
		}
	}

	for (let i = 0; i < n; i++) {
		const v = []
		for (let j = 0; j < n; j++) {
			if (i === j) continue;
			v.push([N._value[i * n + j], j])
		}
		v.sort((a, b) => a[0] - b[0]);
		for (let j = near; j < n; j++) {
			N._value[i * n + v[j][1]] = Infinity;
		}
	}

	// TODO
}

var dispIsomap = function(elm, setting, platform) {
	const fitModel = (cb) => {
		platform.plot(
			(tx, ty, px, pred_cb) => {
				const tx_mat = new Matrix(tx.length, 1, tx);

				const dim = setting.dimension
				let y = Isomap(tx_mat, dim).value;
				pred_cb(y);
			}
		);
	};

	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}


var isomap_init = function(platform) {
	const root = platform.setting.ml.configElement
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	dispIsomap(root, platform);
}

export default isomap_init
