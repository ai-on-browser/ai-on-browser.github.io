const RandomProjection = function(x, rd = 0) {
	return x.dot(Matrix.random(x.cols, (rd <= 0) ? x.cols : rd));
}

var dispRandomProjection1to2 = function(elm) {
	const svg = d3.select("svg");
	const mapping = svg.insert("g", ":first-child").classed("mapping", true);
	const mapping_line = svg.insert("g", ":first-child").classed("map_line", true);
	const step = 100;
	const width = svg.node().getBoundingClientRect().width;
	const height = svg.node().getBoundingClientRect().height;

	let map_points = [];

	const fitModel = (cb) => {
		map_points.forEach(p => p.remove());
		const ps = points.map(p => [p.at[0] / 1000, p.at[1] / 1000]);
		const ps_mat = new Matrix(ps.length, 2, ps);
		const ps_amin = ps_mat.argmin(0).value;

		let y = RandomProjection(ps_mat, 1).value;
		let y_max = Math.max(...y);
		let y_min = Math.min(...y);
		let rev = y[ps_amin[0]] > (y_min + (y_max - y_min) / 2);
		map_points = y.map((v, i) => {
			let pv = [(v - y_min) / (y_max - y_min) * (width - 10) + 5, height / 2];
			if (rev) pv[0] = width - pv[0];
			let p = new DataPoint(mapping, pv, points[i].category);
			p.radius = 2;
			let dl = new DataLine(mapping_line, points[i], p);
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


var random_projection_1to2_init = function(root, terminateSetter) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	dispRandomProjection1to2(root);

	terminateSetter(() => {
		d3.selectAll("svg .mapping").remove();
		d3.selectAll("svg .map_line").remove();
	});
}
