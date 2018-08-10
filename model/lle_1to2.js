const LLE = function(x, rd = 0) {
	const d = x.cols;
	const n = x.rows;
	const K = 1;

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
		let z = x.select(neighbors[i], null);
		z.sub(x.row(i));
		let C = z.dot(z.t);
		wi = C.inv().sum(0);
		wi.div(wi.sum());
		W.push(wi.value);
	}

	const m = Matrix.eye(n, n);
	for (let i = 0; i < n; i++) {
		let w = W[i];
		let j = neighbors[i].map(v => v.idx);
		for (let k = 0; k < K; k++) {
			m.set(i, j[k], m.at(i, j[k]) - w[k]);
			m.set(j[k], i, m.at(j[k], i) - w[k]);
			for (let l = 0; l <= k; l++) {
				m.set(j[k], j[l], m.at(j[k], j[l]) + w[k] * w[l]);
				m.set(j[l], j[k], m.at(j[l], j[k]) + w[k] * w[l]);
			}
		}
	}

	let ev = m.eigenVectors();
	ev.flip(1);
	return ev.resize(rd, ev.cols).t;
}

var dispLLE1to2 = function(elm) {
	const svg = d3.select("svg");
	const mapping = svg.insert("g", ":first-child").classed("mapping", true);
	const mapping_line = svg.insert("g", ":first-child").classed("map_line", true);
	const step = 100;
	const width = svg.node().getBoundingClientRect().width;
	const height = svg.node().getBoundingClientRect().height;

	let map_points = [];
	let map_lines = [];

	const fitModel = (cb) => {
		map_points.forEach(p => p.remove());
		const ps = points.map(p => [p.at[0] / 1000, p.at[1] / 1000]);
		const pt = points.map(p => p.category);
		const ps_mat = new Matrix(ps.length, 2, ps);

		let y = LLE(ps_mat, 1).value;
		let y_max = Math.max(...y);
		let y_min = Math.min(...y);
		map_points = y.map((v, i) => {
			let p = new DataPoint(mapping, [(v - y_min) / (y_max - y_min) * (width - 5) + 5, height / 2], points[i].category);
			p.radius = 2;
			let dl = new DataLine(mapping_line, points[i], p);
			dl.item.attr("opacity", 0.5);
			dl.setRemoveListener(() => p.remove());
			return p;
		});
	};

	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}


var lle_1to2_init = function(root, terminateSetter) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	dispLLE1to2(root);

	terminateSetter(() => {
		d3.selectAll("svg .mapping").remove();
		d3.selectAll("svg .map_line").remove();
	});
}
