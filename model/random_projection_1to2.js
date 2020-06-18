const RandomProjection = function(x, rd = 0) {
	return x.dot(Matrix.random(x.cols, (rd <= 0) ? x.cols : rd));
}

var dispRandomProjection1to2 = function(elm) {
	const svg = d3.select("svg");

	const fitModel = (cb) => {
		fitting("DR", svg, points, null,
			(tx, ty, px, pred_cb) => {
				const x_mat = new Matrix(px.length, 2, px);
				const dim = +elm.select(".buttons [name=dimension]").property("value")
				let y = RandomProjection(x_mat, dim).value;
				pred_cb(y);
			}
		);
	};

	elm.select(".buttons")
		.append("span")
		.text(" Dimension ");
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "dimension")
		.attr("max", 2)
		.attr("min", 1)
		.attr("value", 2)
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
		d3.selectAll("svg .tile").remove();
	});
}
