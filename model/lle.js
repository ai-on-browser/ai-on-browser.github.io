const LLE = function(x, K = 1, rd = 0) {
	// https://cs.nyu.edu/~roweis/lle/algorithm.html
	const d = x.cols;
	const n = x.rows;

	const distance = [];
	for (let i = 0; i < n; distance[i++] = []);
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < i; j++) {
			let dt = 0;
			for (let k = 0; k < d; k++) {
				dt += (x.at(i, k) - x.at(j, k)) ** 2;
			}
			distance[i][j] = distance[j][i] = dt;
		}
	}
	const neighbors = [];
	for (let i = 0; i < n; i++) {
		let nns = [];
		for (let j = 0; j < n; j++) {
			if (j == i) continue;
			let dt = distance[i][j];
			if (nns.length < K || dt < nns[K - 1].dt) {
				if (nns.length == K) nns.pop();
				nns.push({
					"dt": dt,
					"idx": j
				});
				for (let k = nns.length - 1; k > 0; k--) {
					if (nns[k].dt < nns[k - 1].dt) {
						[nns[k], nns[k - 1]] = [nns[k - 1], nns[k]];
					}
				}
			}
		}
		neighbors.push(nns);
	}

	const W = [];
	for (let i = 0; i < n; i++) {
		let z = x.row(neighbors[i].map(v => v.idx));
		z.sub(x.row(i));
		let C = z.dot(z.t);
		let wi = C.inv().sum(0);
		wi.div(wi.sum());
		W.push(wi.value);
	}

	const m = Matrix.eye(n, n);
	for (let i = 0; i < n; i++) {
		let w = W[i];
		let j = neighbors[i].map(v => v.idx);
		for (let k = 0; k < K; k++) {
			m.set(i, j[k], -w[k]);
		}
	}

	const mtm = m.t.dot(m)
	let ev = mtm.eigenVectors();
	ev.flip(1);
	return ev.select(0, 1, null, rd + 1);
}

var dispLLE = function(elm, setting, platform) {
	const fitModel = (cb) => {
		platform.plot(
			(tx, ty, px, pred_cb) => {
				const tx_mat = Matrix.fromArray(tx);

				const neighbor =elm.select(".buttons [name=neighbor_size]").property("value")
				const dim = setting.dimension;
				let y = LLE(tx_mat, neighbor, dim).value;
				pred_cb(y);
			}
		);
	};

	elm.select(".buttons")
		.append("span")
		.text("Select neighbor #")
		.append("input")
		.attr("type", "number")
		.attr("name", "neighbor_size")
		.attr("value", 2)
		.attr("min", 1)
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}


var lle_init = function(platform) {
	const root = platform.setting.ml.configElement
	const setting = platform.setting
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	dispLLE(root, setting, platform);
}

export default lle_init
