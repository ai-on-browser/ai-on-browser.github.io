const ct_fitting = function(tile, datas, step, fit_cb) {
	const tx = datas.x;
	const ty = datas.y.map(p => [p]);

	let tiles = [], plot = null
	if (step) {
		[tiles, plot] = datas.predict(step)
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

const d2_fitting = function(tile, datas, step, fit_cb) {
	const tx = datas.x;
	const ty = datas.y.map(p => [p]);

	let [tiles, plot] = datas.predict(step);

	fit_cb(tx, ty, tiles, (pred) => {
		plot(pred, tile)
	});
}

const ad_fitting = function(tile, datas, step, fit_cb) {
	const tx = datas.x;
	const ty = datas.y.map(p => [p]);

	if (tile.select(".tile").size() == 0) {
		tile.insert("g", ":first-child").classed("tile", true).classed("anormal_tile", true).attr("opacity", 0.5);
		tile.insert("g").classed("tile", true).classed("anormal_point", true);
	}
	let tiles = [], plot = null;
	if (step) {
		[tiles, plot] = datas.predict(step)
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

const dr_fitting = function(tile, datas, step, fit_cb) {
	const width = datas._manager.platform.width;
	const height = datas._manager.platform.height;

	const tx = datas.x;
	const ty = datas.y.map(p => [p]);

	if (tile.select(".tile").size() == 0) {
		tile.insert("g", ":first-child").classed("tile", true).attr("opacity", 0.5);
	}
	let mapping = tile.select(".tile");

	fit_cb(tx, ty, tx, pred => {
		mapping.selectAll("*").remove();

		const d = pred[0].length;
		let y = pred
		if (d === 1) {
			y = y.map(v => [v, 0])
		}
		let y_max = [];
		let y_min = [];
		for (let i = 0; i < y[0].length; i++) {
			const ym = y.map(v => v[i])
			y_max.push(Math.max(...ym));
			y_min.push(Math.min(...ym));
		}

		const scales = [width, height].map((m, i) => (m - 10) / (y_max[i] - y_min[i]))
		const scale_min = Math.min(...scales);
		const offsets = [5, 5];
		for (let i = 0; i < scales.length; i++) {
			if (scales[i] > scale_min) {
				if (!isFinite(scales[i])) {
					offsets[i] = [width, height][i] / 2 - y_min[i]
				} else {
					offsets[i] += (scales[i] - scale_min) * (y_max[i] - y_min[i]) / 2
				}
			}
		}

		let min_cost = Infinity
		let min_cost_y = null
		const p = Matrix.fromArray(datas.points.map(p => p.at))
		for (let i = 0; i < 2 ** d; i++) {
			const rev = i.toString(2).padStart(d, '0').split('').map(v => !!+v)

			const ry = y.map(v => {
				return v.map((a, k) => ((rev[k] ? y_max[k] - a + y_min[k] : a) - y_min[k]) * scale_min + offsets[k])
			})
			const y_mat = Matrix.fromArray(ry)
			y_mat.sub(p)
			const cost = y_mat.norm()
			if (cost < min_cost) {
				min_cost = cost
				min_cost_y = ry
			}
		}

		min_cost_y.forEach((v, i) => {
			const p = new DataPoint(mapping, v, datas.y[i]);
			p.radius = 2;
			const dl = new DataLine(mapping, datas.points[i], p);
			dl.setRemoveListener(() => p.remove());
		});
	});
}

const gr_fitting = function(tile, datas, step, fit_cb, scale) {
	const tx = datas.x;
	const ty = datas.y.map(p => [p]);

	if (tile.select(".tile").size() == 0) {
		tile.insert("g", ":first-child").classed("tile", true).classed("generated", true).attr("opacity", 0.5);
		tile.insert("g", ":first-child").classed("tile", true).classed("plate", true).attr("opacity", 0.5);
	}
	let mapping = tile.select(".tile.generated");

	let tiles = [], plot = null;
	if (step) {
		[tiles, plot] = datas.predict(step)
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
		datas.scale = 1 / scale
		scale = 1 / datas.scale
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
FittingMode.IN = new FittingMode("IN", d2_fitting)

