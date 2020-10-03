const ct_fitting = function(tile, datas, step, fit_cb, scale) {
	const tx = datas.x.map(p => p.map(v => v / scale));
	const ty = datas.y.map(p => [p]);

	let tiles = [], plot = null
	if (step) {
		[tiles, plot] = datas.predict(step)
		tiles = tiles.map(t => t.map(v => v / scale))
	}

	fit_cb(tx, ty, tiles, (pred, tile_pred) => {
		pred.forEach((v, i) => {
			datas.at(i).y = v;
		})

		if (tile_pred) {
			plot(tile_pred, tile)
		}
	})
}

const d2_fitting = function(tile, datas, step, fit_cb, scale) {
	const tx = datas.x.map(p => p.map(v => v / scale));
	const ty = datas.y.map(p => [p]);

	let [tiles, plot] = datas.predict(step);
	tiles = tiles.map(t => t.map(v => v / scale))

	fit_cb(tx, ty, tiles, (pred) => {
		plot(pred, tile)
	});
}

const ad_fitting = function(tile, datas, step, fit_cb, scale) {
	const tx = datas.x.map(p => p.map(v => v / scale));
	const ty = datas.y.map(p => [p]);

	if (tile.select(".tile").size() == 0) {
		tile.insert("g", ":first-child").classed("tile", true).classed("anormal_tile", true).attr("opacity", 0.5);
		tile.insert("g").classed("tile", true).classed("anormal_point", true);
	}
	let tiles = [], plot = null;
	if (step) {
		[tiles, plot] = datas.predict(step)
		tiles = tiles.map(t => t.map(v => v / scale))
	}

	let mapping = tile.select(".anormal_point");
	fit_cb(tx, ty, tiles, (pred, tile_pred) => {
		tile.selectAll(".tile *").remove();

		pred.forEach((v, i) => {
			if (v) {
				const o = new DataCircle(mapping, datas.points[i])
				o.color = getCategoryColor(specialCategory.error);
			}
		})

		if (tile_pred) {
			plot(tile_pred.map(v => v ? specialCategory.error : specialCategory.errorRate(0)), tile.select(".anormal_tile"))
		}
	})
}

const dr_fitting = function(tile, datas, step, fit_cb, scale) {
	const width = datas._manager.platform.width;
	const height = datas._manager.platform.height;

	const tx = datas.x.map(p => p.map(v => v / scale));
	const ty = datas.y.map(p => [p]);

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

		const scales = [(width - 10) / (y_max[0] - y_min[0]), (height - 10) / (y_max[1] - y_min[1])];
		const scale_min = d === 1 ? scales[0] : Math.min(scales[0], scales[1]);
		const offsets = [5, 5];
		if (d > 1) {
			if (scales[0] < scales[1]) {
				offsets[1] += (scales[1] - scales[0]) * (y_max[1] - y_min[1]) / 2;
			} else {
				offsets[0] += (scales[0] - scales[1]) * (y_max[0] - y_min[0]) / 2;
			}
		}

		y.forEach((v, i) => {
			let pv0 = ((rev[0] ? y_max[0] - v[0] + y_min[0] : v[0]) - y_min[0]) * scale_min + offsets[0]
			let pv1 = d === 1 ? height / 2 : ((rev[1] ? y_max[1] - v[1] + y_min[1] : v[1]) - y_min[1]) * scale_min + offsets[1]
			let pv = [pv0, pv1];
			let p = new DataPoint(mapping, pv, datas.y[i]);
			p.radius = 2;
			let dl = new DataLine(mapping, datas.points[i], p);
			dl.setRemoveListener(() => p.remove());
		});
	});
}

const gr_fitting = function(tile, datas, step, fit_cb, scale) {
	const tx = datas.x.map(p => p.map(v => v / scale));
	const ty = datas.y.map(p => [p]);

	if (tile.select(".tile").size() == 0) {
		tile.insert("g", ":first-child").classed("tile", true).classed("generated", true).attr("opacity", 0.5);
		tile.insert("g", ":first-child").classed("tile", true).classed("plate", true).attr("opacity", 0.5);
	}
	let mapping = tile.select(".tile.generated");

	let tiles = [], plot = null;
	if (step) {
		[tiles, plot] = datas.predict(step)
		tiles = tiles.map(t => t.map(v => v / scale))
	}

	fit_cb(tx, ty, tiles, (pred, cond) => {
		mapping.selectAll("*").remove();

		pred.forEach((v, i) => {
			let p = new DataPoint(mapping, [v[0] * scale, v[1] * scale], cond ? cond[i][0] : 0);
			p.radius = 2;
		});
	}, (pred_tile) => {
		plot(pred_tile, tile.select(".tile.plate"))
	});
}

export default class FittingMode {
	constructor(value, func) {
		this.value = value
		this.func = func
	}

	fit(tile, datas, step, fit_cb, scale = 1000) {
		this.func(tile, datas, step, fit_cb, scale)
	}
}

FittingMode.CT = new FittingMode("CT", ct_fitting)
FittingMode.D1 = new FittingMode("D1", d2_fitting)
FittingMode.D2 = new FittingMode("D2", d2_fitting)
FittingMode.CF = new FittingMode("CF", d2_fitting)
FittingMode.DR = new FittingMode("DR", dr_fitting)
FittingMode.FS = new FittingMode("FS", dr_fitting)
FittingMode.AD = new FittingMode("AD", ad_fitting)
FittingMode.RG = (d) => d === 1 ? FittingMode.D1 : FittingMode.D2;
FittingMode.GR = new FittingMode("GR", gr_fitting)
FittingMode.DE = new FittingMode("DE", d2_fitting)

