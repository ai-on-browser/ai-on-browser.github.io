const LSA = function(x, rd = 0, kernel = null) {
	// https://qiita.com/Hatomugi/items/d6c8bb1a049d3a84feaa
	const [u, s, v] = x.svd();
	return u.select(0, 0, null, rd).dot(Matrix.diag(s.slice(0, rd))).dot(v.select(0, 0, rd, rd).t);
}

var dispLSA1to2 = function(elm) {
	const svg = d3.select("svg");
	let kernel = null;
	let poly_dimension = 2;

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
		.on("click", () => {
			fitting("DR", svg, points, null,
				(tx, ty, px, pred_cb) => {
					const x_mat = new Matrix(px.length, 2, px);
					const dim = +elm.select(".buttons [name=dimension]").property("value")
					let y = LSA(x_mat, dim, kernel).value;
					pred_cb(y);
				}
			);
		});
}


var lsa_1to2_init = function(root, terminateSetter) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	dispLSA1to2(root);

	terminateSetter(() => {
		d3.selectAll("svg .tile").remove();
	});
}
