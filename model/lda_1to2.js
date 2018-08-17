const LDA = function(x, t, rd = 0) {
	const d = x.cols;
	const n = x.rows;
	let c = {};
	let cn = 0;
	for (let i = 0; i < n; i++) {
		if (c[t[i]] === undefined) c[t[i]] = cn++;
		t[i] = c[t[i]];
	}

	const mean = x.mean(0).value;
	let cmean = [];
	for (let i = 0; i < cn; cmean[i++] = Array(d).fill(0));
	let cnum = Array(cn).fill(0);
	for (let k = 0; k < n; k++) {
		cnum[t[k]]++;
		for (let j = 0; j < d; j++) {
			cmean[t[k]][j] += x.at(k, j);
		}
	}
	for (let i = 0; i < cn; i++) {
		for (let j = 0; j < d; j++) {
			cmean[i][j] /= cnum[i];
		}
	}

	let w = [];
	for (let i = 0; i < d; w[i++] = []);
	for (let i = 0; i < d; i++) {
		for (let j = 0; j <= i; j++) {
			let v = 0;
			for (let k = 0; k < n; k++) {
				v += (x.at(k, i) - cmean[t[k]][i]) * (x.at(k, j) - cmean[t[k]][j]);
			}
			w[i][j] = w[j][i] = v / n;
		}
	}
	w = new Matrix(d, d, w);

	let b = [];
	for (let i = 0; i < d; b[i++] = []);
	for (let i = 0; i < d; i++) {
		for (let j = 0; j <= i; j++) {
			let v = 0;
			for (let k = 0; k < cn; k++) {
				v += (cmean[k][i] - mean[i]) * (cmean[k][j] - mean[j]) * cnum[k];
			}
			b[i][j] = b[j][i] = v / n;
		}
	}
	b = new Matrix(d, d, b);

	let cov = w.inv().dot(b);
	let ev = cov.eigenVectors();
	if (rd > 0 && rd < ev.cols) {
		ev = ev.resize(ev.rows, rd);
	}
	return x.dot(ev);
}

var dispLDA1to2 = function(elm) {
	const svg = d3.select("svg");
	const mapping = svg.insert("g", ":first-child").classed("mapping", true);
	const mapping_line = svg.insert("g", ":first-child").classed("map_line", true);
	const width = svg.node().getBoundingClientRect().width;
	const height = svg.node().getBoundingClientRect().height;

	let map_points = [];

	const fitModel = (cb) => {
		map_points.forEach(p => p.remove());
		const ps = points.map(p => [p.at[0] / 1000, p.at[1] / 1000]);
		const pt = points.map(p => p.category);
		const ps_mat = new Matrix(ps.length, 2, ps);
		const ps_amin = ps_mat.argmin(0).value;

		let y = LDA(ps_mat, pt, 1).value;
		let y_max = Math.max(...y);
		let y_min = Math.min(...y);
		let rev = y[ps_amin[0]] > (y_min + (y_max - y_min) / 2);
		map_points = y.map((v, i) => {
			let pv = [(v - y_min) / (y_max - y_min) * (width - 10) + 5, height / 2];
			if (rev) pv[0] = width - pv[0];
			let p = new DataPoint(mapping, pv, points[i].category);
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


var lda_1to2_init = function(root, terminateSetter) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	dispLDA1to2(root);

	terminateSetter(() => {
		d3.selectAll("svg .mapping").remove();
		d3.selectAll("svg .map_line").remove();
	});
}
