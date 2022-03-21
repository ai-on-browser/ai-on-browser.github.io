import Matrix from '../lib/util/matrix.js'

const ct_fitting = function (tile, datas, fit_cb) {
	const tx = datas.dimension > 0 ? datas.x : datas.index.map(v => [v])
	const ty = datas.y.map(p => [p])

	fit_cb(tx, ty, pred => {
		pred.forEach((v, i) => {
			datas.at(i).y = v
		})
	})
}

const d2_fitting = function (tile, datas, fit_cb) {
	const tx = datas.dimension > 0 ? datas.x : datas.index.map(v => [v])
	const ty = datas.y.map(p => [p])

	fit_cb(tx, ty, () => {})
}

const ad_fitting = function (tile, datas, fit_cb) {
	const tx = datas.dimension > 0 ? datas.x : datas.index.map(v => [v])
	const ty = datas.y.map(p => [p])

	if (tile.select('.tile').size() === 0) {
		tile.insert('g').classed('tile', true).classed('anormal_point', true)
	}

	let mapping = tile.select('.anormal_point')
	fit_cb(tx, ty, pred => {
		tile.selectAll('.tile *').remove()

		pred.forEach((v, i) => {
			if (v) {
				const o = new DataCircle(mapping, datas.points[i])
				o.color = getCategoryColor(specialCategory.error)
			}
		})
	})
}

const dr_fitting = function (tile, datas, fit_cb) {
	const width = datas._manager.platform.width
	const height = datas._manager.platform.height

	const tx = datas.dimension > 0 ? datas.x : datas.index.map(v => [v])
	const ty = datas.y.map(p => [p])

	if (tile.select('.tile').size() === 0) {
		tile.insert('g', ':first-child').classed('tile', true).attr('opacity', 0.5)
	}
	let mapping = tile.select('.tile')

	fit_cb(tx, ty, pred => {
		mapping.selectAll('*').remove()

		const d = pred[0].length
		let y = pred
		if (d === 1) {
			y = y.map(v => [v, 0])
		}
		let y_max = []
		let y_min = []
		for (let i = 0; i < y[0].length; i++) {
			const ym = y.map(v => v[i])
			y_max.push(Math.max(...ym))
			y_min.push(Math.min(...ym))
		}

		const ranges = datas.dimension <= 1 ? [height, height] : [width, height]

		const scales = ranges.map((m, i) => (m - 10) / (y_max[i] - y_min[i]))
		let scale_min = Math.min(...scales)
		const offsets = [5, 5]
		for (let i = 0; i < scales.length; i++) {
			if (!isFinite(scale_min) || scales[i] > scale_min) {
				if (!isFinite(scales[i])) {
					offsets[i] = ranges[i] / 2 - y_min[i]
				} else {
					offsets[i] += ((scales[i] - scale_min) * (y_max[i] - y_min[i])) / 2
				}
			}
		}
		if (!isFinite(scale_min)) {
			scale_min = 0
		}

		let min_cost = Infinity
		let min_cost_y = null
		const p = Matrix.fromArray(datas.points.map(p => p.at))
		for (let i = 0; i < (datas.dimension <= 1 ? 1 : 2 ** d); i++) {
			const rev = i
				.toString(2)
				.padStart(d, '0')
				.split('')
				.map(v => !!+v)

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
			const p = new DataPoint(
				mapping,
				datas.dimension <= 1 ? [datas.points[i].at[0], v[0]] : v,
				datas.points[i].category
			)
			p.radius = 2
			const dl = new DataLine(mapping, datas.points[i], p)
			dl.setRemoveListener(() => p.remove())
		})
	})
}

const gr_fitting = function (tile, datas, fit_cb) {
	const tx = datas.dimension > 0 ? datas.x : datas.index.map(v => [v])
	const ty = datas.y.map(p => [p])

	if (tile.select('.tile').size() === 0) {
		tile.insert('g', ':first-child').classed('tile', true).classed('generated', true).attr('opacity', 0.5)
	}
	let mapping = tile.select('.tile.generated')

	fit_cb(tx, ty, (pred, cond) => {
		mapping.selectAll('*').remove()

		pred.forEach((v, i) => {
			let p = new DataPoint(
				mapping,
				v.map(a => a / datas.scale),
				cond ? cond[i][0] : 0
			)
			p.radius = 2
		})
	})
}

export default {
	CT: ct_fitting,
	CF: d2_fitting,
	RG: d2_fitting,
	DR: dr_fitting,
	FS: dr_fitting,
	TF: dr_fitting,
	AD: ad_fitting,
	GR: gr_fitting,
	DE: d2_fitting,
	IN: d2_fitting,
}
