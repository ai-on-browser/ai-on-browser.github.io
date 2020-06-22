class PercentileAnormaly {
	constructor(percentile) {
		this._percentile = percentile;
		this._thresholds = [];
	}

	fit(data) {
		const n = data.length;
		if (n <= 0) {
			return [];
		} else if (n === 1) {
			return [false];
		}
		if (this._percentile === 0) {
			return Array(n).fill(false);
		} else if (percentile === 1) {
			return Array(n).fill(true);
		}
		const x = data;
		const dim = x[0].length;
		const sortDatas = [];
		this._threshold = [];

		const lidx = (n - 1) * this._percentile / 2;
		const li = [Math.floor(lidx), lidx - Math.floor(lidx), Math.ceil(lidx)]
		const uidx = n - 1 - lidx;
		const ui = [Math.floor(uidx), uidx - Math.floor(uidx), Math.ceil(uidx)]
		for (let d = 0; d < dim; d++) {
			const sd = x.map(v => v[d]);
			sd.sort((a, b) => a - b);
			sortDatas.push(sd);

			this._thresholds[d] = [
				sd[li[0]] + (sd[li[2]] - sd[li[0]]) * li[1],
				sd[ui[0]] + (sd[ui[2]] - sd[ui[0]]) * ui[1]
			];
		}
	}

	predict(x) {
		const outliers = [];
		for (let i = 0; i < x.length; i++) {
			let f = false;
			for (let d = 0; d < this._thresholds.length; d++) {
				f |= x[i][d] < this._thresholds[d][0] || this._thresholds[d][1] < x[i][d];
			}
			outliers.push(f);
		}
		return outliers;
	}
}

var dispPercentile = function(elm) {
	const svg = d3.select("svg");
	let k_value = 5;

	const calcPercentile = function() {
		FittingMode.AD.fit(svg, points, 3, (tx, ty, px, cb) => {
			const model = new PercentileAnormaly(+elm.select(".buttons [name=threshold]").property("value"))
			model.fit(tx);
			const outliers = model.predict(tx);
			const tile_outliers = model.predict(px);
			cb(outliers, tile_outliers)
		})
	}

	elm.select(".buttons")
		.append("span")
		.text(" threshold = ");
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "threshold")
		.attr("value", 0.02)
		.attr("min", 0)
		.attr("max", 1)
		.property("required", true)
		.attr("step", 0.01)
		.on("change", function() {
			calcPercentile();
		});
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcPercentile);
}


var percentile_init = function(root, terminateSetter) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Then, click "Calculate".');
	div.append("div").classed("buttons", true);
	dispPercentile(root);

	terminateSetter(() => {
		d3.selectAll("svg .tile").remove();
	});
}
