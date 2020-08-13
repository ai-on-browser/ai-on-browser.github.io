const RandomProjection = function(x, rd = 0) {
	// This is not the right algorithm.
	return x.dot(Matrix.random(x.cols, (rd <= 0) ? x.cols : rd));
}

var dispRandomProjection = function(elm, setting, platform) {
	const fitModel = (cb) => {
		platform.plot(
			(tx, ty, px, pred_cb) => {
				const x_mat = new Matrix(px.length, 2, px);
				const dim = setting.dimension;
				let y = RandomProjection(x_mat, dim).value;
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


var random_projection_init = function(platform) {
	const root = platform.setting.ml.configElement
	const setting = platform.setting
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	dispRandomProjection(root, setting, platform);
}

export default random_projection_init
