const LSA = function(x, rd = 0) {
	// https://qiita.com/Hatomugi/items/d6c8bb1a049d3a84feaa
	const [u, s, v] = x.svd();
	return u.select(0, 0, null, rd).dot(Matrix.diag(s.slice(0, rd))).dot(v.select(0, 0, rd, rd).t);
}

var dispLSA = function(elm, setting, platform) {
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => {
			platform.plot(
				(tx, ty, px, pred_cb) => {
					const x_mat = Matrix.fromArray(px);
					const dim = setting.dimension;
					let y = LSA(x_mat, dim);
					pred_cb(y.toArray());
				}
			);
		});
}


var lsa_init = function(platform) {
	const root = platform.setting.ml.configElement
	const setting = platform.setting
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	dispLSA(root, setting, platform);
}

export default lsa_init
