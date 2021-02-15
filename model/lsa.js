const LSA = function(x, rd = 0) {
	// https://qiita.com/Hatomugi/items/d6c8bb1a049d3a84feaa
	const [u, s, v] = x.svd();
	return u.sliceCol(0, rd).dot(Matrix.diag(s.slice(0, rd))).dot(v.slice(0, 0, rd, rd).t);
}

var dispLSA = function(elm, platform) {
	const setting = platform.setting
	elm.append("input")
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
	platform.setting.ml.description = 'Click and add data point. Next, click "Fit" button.'
	dispLSA(platform.setting.ml.configElement, platform)
}

export default lsa_init
