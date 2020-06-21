const fitting = function(mode, tile, points, step, fit_cb, scale = 1000) {
	FittingMode[mode].func(mode, tile, points, step, fit_cb, scale);
}

const d1_fitting = function(mode, tile, points, step, fit_cb, scale) {
	const svg = d3.select("svg");
	const width = svg.node().getBoundingClientRect().width;
	const height = svg.node().getBoundingClientRect().height;
	const tx = points.map(p => [p.at[0] / scale]);
	const ty = points.map(p => [p.at[1] / scale]);

	if (tile.select(".tile").size() == 0) {
		tile.insert("g", ":first-child").classed("tile", true);
	}
	if (tile.selectAll(".tile path").size() == 0) {
		tile.select(".tile").append("path").attr("stroke", "black").attr("fill-opacity", 0);
	}
	let tiles = [];
	for (let i = 0; i < width + step; i += step) {
		tiles.push([i / scale]);
	}

	fit_cb(tx, ty, tiles, (pred) => {
		let p = [];
		for (let i = 0; i < width / step; i++) {
			p.push([i * step, pred[i] * scale]);
		}

		const line = d3.line().x(d => d[0]).y(d => d[1]);
		tile.select(".tile path").attr("d", line(p));
	});
}

const d2_fitting = function(mode, tile, points, step, fit_cb, scale) {
	const svg = d3.select("svg");
	const width = svg.node().getBoundingClientRect().width;
	const height = svg.node().getBoundingClientRect().height;
	const tx = points.map(p => [p.at[0] / scale, p.at[1] / scale]);
	const ty = points.map(p => [p.category]);

	if (tile.select(".tile").size() == 0) {
		tile.insert("g", ":first-child").classed("tile", true).attr("opacity", 0.5);
	}

	let tiles = [];
	for (let i = 0; i < width; i += step) {
		for (let j = 0; j < height; j += step) {
			tiles.push([i / scale, j / scale]);
		}
	}

	fit_cb(tx, ty, tiles, (pred) => {
		let c = 0;
		let categories = [];
		for (let i = 0; i < width / step; i++) {
			for (let j = 0; j < height / step; j++) {
				if (!categories[j]) categories[j] = [];
				categories[j][i] = pred[c++];
			}
		}

		tile.selectAll(".tile *").remove();
		new DataHulls(tile.select(".tile"), categories, step, mode == "D2");
	});
}

const dr_fitting = function(mode, tile, points, step, fit_cb, scale) {
	const svg = d3.select("svg");
	const width = svg.node().getBoundingClientRect().width;
	const height = svg.node().getBoundingClientRect().height;

	const tx = points.map(p => [p.at[0] / scale, p.at[1] / scale]);
	const ty = points.map(p => [p.category]);

	if (tile.select(".tile").size() == 0) {
		tile.insert("g", ":first-child").classed("tile", true).attr("opacity", 0.5);
	}
	let mapping = tile.select(".tile");

	fit_cb(tx, ty, tx, pred => {
		mapping.selectAll("*").remove();

		const d = pred.length / tx.length;
		let y = []
		for (let i = 0; i < pred.length; i += d) {
			y.push(pred.slice(i, i + d))
		}
		let y_max = [];
		let y_min = [];
		for (let i = 0; i < d; i++) {
			const ym = y.map(v => v[i])
			y_max.push(Math.max(...ym));
			y_min.push(Math.min(...ym));
		}

		const x_mat = new Matrix(tx.length, 2, tx);
		const x_amin = x_mat.argmin(0).value;
		let rev = x_amin.map((a, i) => y[a][i] > (y_min[i] + (y_max[i] - y_min[i]) / 2))

		y.forEach((v, i) => {
			let pv0 = ((rev[0] ? y_max[0] - v[0] + y_min[0] : v[0]) - y_min[0]) / (y_max[0] - y_min[0]) * (width - 10) + 5
			let pv1 = d === 1 ? height / 2 : ((rev[1] ? y_max[1] - v[1] + y_min[1] : v[1]) - y_min[1]) / (y_max[1] - y_min[1]) * (height - 10) + 5
			let pv = [pv0, pv1];
			let p = new DataPoint(mapping, pv, points[i].category);
			p.radius = 2;
			let dl = new DataLine(mapping, points[i], p);
			dl.setRemoveListener(() => p.remove());
		});
	});
}

class FittingMode {
	constructor(value, func) {
		this.value = value
		this.func = func
	}

	fit(tile, points, step, fit_cb, scale = 1000) {
		this.func(this.value, tile, points, step, fit_cb, scale)
	}
}

FittingMode.D1 = new FittingMode("D1", d1_fitting)
FittingMode.D2 = new FittingMode("D2", d2_fitting)
FittingMode.CF = new FittingMode("CF", d2_fitting)
FittingMode.DR = new FittingMode("DR", dr_fitting)

