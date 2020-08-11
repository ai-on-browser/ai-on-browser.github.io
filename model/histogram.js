import FittingMode from '../js/fitting.js'

const histogram = (datas, binRanges) => {
	const bins = binRanges[0].length
	const dense = [];
	for (let i = 0; i < binRanges[0].length; i++) {
		dense[i] = Array(binRanges[1].length).fill(0);
	}

	for (const data of datas) {
		const idx = data.map((dt, i) => {
			for (let k = 1; k < binRanges[i].length; k++) {
				if (data[i] <= binRanges[i][k]) {
					return k - 1;
				}
			}
			return binRanges[i].length - 1
		});
		let ds = dense;
		for (let k = 0; k < idx.length - 1; k++) {
			ds = ds[idx[k]];
		}
		ds[idx[idx.length - 1]]++;
	}
	return dense;
}

var dispHistogram = function(elm, mode, setting) {
	const svg = d3.select("svg");

	const fitModel = (cb) => {
		const bins = +elm.select(".buttons [name=bins]").property("value")
		const width = svg.node().getBoundingClientRect().width;
		const height = svg.node().getBoundingClientRect().height;
		FittingMode.DE.fit(svg, points, [width / bins, height / bins],
			(tx, ty, px, pred_cb) => {
				const xs = [0], ys = [0];
				let i = 1;
				while (px[i - 1][0] === px[i][0]) {
					ys[i] = px[i][1];
					i++;
				}
				while (i < px.length) {
					if (xs[xs.length - 1] !== px[i][0]) {
						xs.push(px[i][0])
					}
					i++;
				}
				const d = histogram(tx, [xs, ys]);

				let pred = Matrix.fromArray(d).value;
				const m = Math.max(...pred);
				pred = pred.map(v => specialCategory.density(v / m));
				pred_cb(pred);
			}, 1
		);
	};

	elm.select(".buttons")
		.append("span")
		.text("bins ");
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "bins")
		.attr("min", 2)
		.attr("value", 10)
		.on("change", fitModel)
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}

var histogram_init = function(platform) {
	const root = platform.setting.ml.configElement
	const mode = platform.task
	const setting = platform.setting
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	dispHistogram(root, mode, setting);

	setting.terminate = () => {
		d3.selectAll("svg .tile").remove();
	};
}

export default histogram_init

