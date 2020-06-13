const PCA = function(x, rd = 0) {
	let cov = x.cov();
	let ev = cov.eigenVectors();
	if (rd > 0 && rd < ev.cols) {
		ev = ev.resize(ev.rows, rd);
	}
	return x.dot(ev);
}

var dispPCA1to2 = function(elm) {
	const svg = d3.select("svg");

	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => {
			fitting("DR", svg, points, null,
				(tx, ty, px, pred_cb) => {
					const x_mat = new Matrix(px.length, 2, px);
					let y = PCA(x_mat, 1).value;
					pred_cb(y);
				}
			);
		});
}


var pca_1to2_init = function(root, terminateSetter) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	dispPCA1to2(root);

	terminateSetter(() => {
		d3.selectAll("svg .tile").remove();
	});
}
