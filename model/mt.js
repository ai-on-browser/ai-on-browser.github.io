import FittingMode from '../js/fitting.js'

class MT {
	constructor(threshold) {
		this._threshold = threshold;
		this._Ri = null;
		this._mean = null;
		this._std = null;
	}

	fit(data) {
		const n = data.length;
		if (n === 0) {
			return;
		}
		const dim = data[0].length;
		const x = new Matrix(n, dim, data);
		this._mean = x.mean(0);
		x.sub(this._mean)
		this._std = x.std(0);
		x.div(this._std)

		const R = x.cov();
		this._Ri = R.inv();
	}

	predict(data) {
		const outliers = [];
		for (let i = 0; i < data.length; i++) {
			let d = 0;
			const x = [];
			for (let j = 0; j < data[i].length; j++) {
				x[j] = (data[i][j] - this._mean.value[j]) / this._std.value[j];
			}
			for (let j = 0; j < x.length; j++) {
				for (let k = 0; k < x.length; k++) {
					d += x[k] * this._Ri.at(k, j) * x[j];
				}
			}
			outliers.push(d / 2 > this._threshold);
		}
		return outliers;
	}
}

var dispMT = function(elm) {
	const svg = d3.select("svg");

	const calcMT = function() {
		FittingMode.AD.fit(svg, points, 3, (tx, ty, px, cb) => {
			const model = new MT(+elm.select(".buttons [name=threshold]").property("value"))
			model.fit(tx);
			const outliers = model.predict(tx)
			const outlier_tiles = model.predict(px)
			cb(outliers, outlier_tiles)
		})
	}

	elm.select(".buttons")
		.append("span")
		.text(" threshold = ");
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "threshold")
		.attr("value", 2)
		.attr("min", 0)
		.attr("max", 10)
		.property("required", true)
		.attr("step", 0.1)
		.on("change", function() {
			calcMT();
		});
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcMT);
}


var mt_init = function(root, mode, setting) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Then, click "Calculate".');
	div.append("div").classed("buttons", true);
	dispMT(root);

	setting.terminate = () => {
		d3.selectAll("svg .tile").remove();
	};
}

export default mt_init
