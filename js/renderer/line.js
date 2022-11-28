import BaseRenderer from './base.js'
import { DataPoint, specialCategory, getCategoryColor } from '../utils.js'

const scale = function (v, smin, smax, dmin, dmax) {
	if (!isFinite(smin) || !isFinite(smax) || smin === smax) {
		return (dmax + dmin) / 2
	}
	return ((v - smin) / (smax - smin)) * (dmax - dmin) + dmin
}

export default class LineRenderer extends BaseRenderer {
	constructor(manager) {
		super(manager)
		this._size = [960, 500]
		this._pred_values = []

		const r = this.setting.render.addItem('line')
		const plotArea = document.createElement('div')
		plotArea.id = 'plot-area'
		r.appendChild(plotArea)

		this._menu = document.createElement('div')
		plotArea.appendChild(this._menu)

		const root = d3
			.select(plotArea)
			.append('svg')
			.style('border', '1px solid #000000')
			.attr('width', `${this._size[0]}px`)
			.attr('height', `${this._size[1]}px`)
		this._svg = root.append('g').style('transform', 'scale(1, -1) translate(0, -100%)')

		this._grid = this._svg.append('g').attr('opacity', 0.3)

		const pointDatas = this._svg.append('g').classed('points', true)
		this._r = pointDatas.append('g').classed('datas', true)
		this._pathg = this._svg.insert('g', ':first-child').classed('ts-render-path', true)
		this._pathg.selectAll('g.ts-render-path *').remove()
		this._path = this._pathg
			.append('path')
			.attr('stroke', 'black')
			.attr('fill-opacity', 0)
			.style('pointer-events', 'none')

		this._p = []
		this._pad = 10
		this._clip_pad = -Infinity
		this._cp_threshold = 0

		this._observe_target = null
		this._observer = new MutationObserver(mutations => {
			if (this._observe_target) {
				this._p.forEach((p, i) => (p.title = this.datas.labels[i]))
			}
		})
		this._observer.observe(this._svg.node(), {
			childList: true,
		})

		this._will_render = false
	}

	get svg() {
		return this._svg
	}

	get width() {
		return this._size[0]
	}

	get height() {
		return this._size[1]
	}

	get padding() {
		if (!Array.isArray(this._pad)) {
			return [this._pad, this._pad]
		}
		return this._pad
	}

	set padding(pad) {
		this._pad = pad
		this.render()
	}

	set clipPadding(pad) {
		this._clip_pad = pad
		this.render()
	}

	get points() {
		return this._p
	}

	init() {
		this._pred_values = []
		this._lastpred = []
		this._r_tile?.remove()
		this._grid.selectAll('*').remove()
		this._make_selector()
	}

	_make_selector() {
		let names = this.datas?.columnNames || []
		let e = this._menu.querySelector('div.column-selector')
		if (!e && names.length > 0) {
			e = document.createElement('div')
			e.classList.add('column-selector')
			this._menu.appendChild(e)
		} else {
			e?.replaceChildren()
		}
		if (names.length < 1) {
			this._select = null
		} else if (names.length <= 4) {
			const elm = document.createElement('table')
			elm.style.borderCollapse = 'collapse'
			e.appendChild(elm)

			let row = document.createElement('tr')
			row.style.textAlign = 'center'
			row.appendChild(document.createElement('td'))
			const dir = document.createElement('td')
			dir.innerHTML = '&uarr;'
			row.appendChild(dir)
			elm.appendChild(row)

			const ck1 = []
			for (let i = 0; i < names.length; i++) {
				row = document.createElement('tr')
				const label = document.createElement('td')
				label.innerText = names[i]
				label.style.textAlign = 'right'
				row.appendChild(label)

				const cont1 = document.createElement('td')
				const d1 = document.createElement('input')
				d1.type = 'radio'
				d1.name = 'data-d1'
				d1.onchange = () => this._manager.platform.render()
				cont1.appendChild(d1)
				row.appendChild(cont1)
				ck1.push(d1)
				elm.appendChild(row)
			}
			ck1[0].checked = true
			this._select = () => {
				const k = []
				for (let i = 0; i < names.length; i++) {
					if (ck1[i].checked) {
						k[0] = i
					}
				}
				return k
			}
		} else {
			names = names.map(v => '' + v)
			const dir = document.createElement('span')
			dir.innerHTML = '&uarr;'
			e.appendChild(dir)
			const slct1 = document.createElement('select')
			slct1.onchange = () => this._manager.platform.render()
			for (const name of names) {
				const opt = document.createElement('option')
				opt.value = name
				opt.innerText = name
				slct1.appendChild(opt)
			}
			slct1.value = names[0]
			e.appendChild(slct1)
			this._select = () => [names.indexOf(slct1.value)]
		}
	}

	_clip(x) {
		if (this._clip_pad === -Infinity) {
			return x
		}
		const limit = [this.width, this.height]
		for (let i = 0; i < x.length; i++) {
			if (x[i] < this._clip_pad) {
				x[i] = this._clip_pad
			} else if (limit[i] - this._clip_pad < x[i]) {
				x[i] = limit[i] - this._clip_pad
			}
		}
		return x
	}

	_range() {
		let range = []
		let k = 0
		if (this.datas.dimension === 0) {
			range = this.datas.range.concat()
		} else {
			k = this._select?.() ?? [Math.min(1, this.datas.dimension - 1)]
			range = this.datas.domain[k[0]].concat()
		}
		for (let i = 0; i < this._pred_values.length; i++) {
			if (this._pred_values[i][k] < range[0]) {
				range[0] = this._pred_values[i][k]
			} else if (this._pred_values[i][k] > range[1]) {
				range[1] = this._pred_values[i][k]
			}
		}
		return range
	}

	toPoint(value) {
		if (this.datas.length === 0) {
			return [0, 0]
		}
		const range = [this.width, this.height]
		const d = []
		const yrang = this._range()
		if (this.datas.dimension === 0) {
			d.push(
				scale(value[0], 0, this.datas.length + this._pred_values.length, 0, range[0] - this.padding[0] * 2) +
					this.padding[0],
				scale(value[1][0], yrang[0], yrang[1], 0, range[1] - this.padding[1] * 2) + this.padding[1]
			)
		} else {
			const k = this._select?.() ?? (this.datas.dimension === 0 ? null : [Math.min(1, this.datas.dimension - 1)])
			const k0 = Math.min(k[0], value[1].length - 1)
			d.push(
				scale(value[0], 0, this.datas.length + this._pred_values.length, 0, range[0] - this.padding[0] * 2) +
					this.padding[0],
				scale(value[1][k0], yrang[0], yrang[1], 0, range[1] - this.padding[1] * 2) + this.padding[1]
			)
		}

		return d.map(v => (isNaN(v) ? 0 : v))
	}

	toValue(x) {
		if (x && this.datas) {
			return [scale(x[0] - this.padding[0], 0, this.width - this.padding[0] * 2, 0, this.datas.length)]
		}
		return []
	}

	_render() {
		if (!this.datas || this.datas.length === 0) {
			this._p.map(p => p.remove())
			this._p.length = 0
			this._path.attr('opacity', 0)
			return
		}
		const k = this._select?.() ?? (this.datas.dimension === 0 ? null : [Math.min(1, this.datas.dimension - 1)])
		const n = this.datas.length
		const data = this.datas.x
		const target = this.datas.y
		const range = this._size
		const yrange = this._range()

		const ds = []
		for (let i = 0; i < n; i++) {
			if (this.datas.dimension === 0) {
				ds.push([
					scale(i, 0, n + this._pred_values.length, 0, range[0] - this.padding[0] * 2) + this.padding[0],
					scale(target[i], yrange[0], yrange[1], 0, range[1] - this.padding[1] * 2) + this.padding[1],
				])
			} else {
				ds.push([
					scale(i, 0, n + this._pred_values.length, 0, range[0] - this.padding[0] * 2) + this.padding[0],
					scale(data[i][k[0]], yrange[0], yrange[1], 0, range[1] - this.padding[1] * 2) + this.padding[1],
				])
			}
		}

		const radius = Math.max(1, Math.min(5, Math.floor(2000 / n)))
		for (let i = 0; i < n; i++) {
			const dp = this._clip(ds[i])
			const cat = this.datas.dimension <= 1 ? 0 : this.datas.y[i]
			if (this._p[i]) {
				const op = this._p[i].at
				if (op[0] !== dp[0] || op[1] !== dp[1]) {
					this._p[i].at = dp
				}
				if (this._p[i].category !== cat) {
					this._p[i].category = cat
				}
			} else {
				this._p[i] = new DataPoint(this._r, dp, cat)
			}
			this._p[i].title = this.datas.labels[i]
			this._p[i].radius = radius
		}
		for (let i = n; i < this._p.length; i++) {
			this._p[i].remove()
		}
		this._p.length = n

		const line = d3
			.line()
			.x(d => d[0])
			.y(d => d[1])
		this._path.attr('d', line(this.points.map(p => p.at))).attr('opacity', 0.5)

		if (this._lastpred) {
			this.testResult(this._lastpred)
		}
		this._renderGrid()
	}

	_renderGrid() {
		this._grid.selectAll('*').remove()
		const range = this._size
		const [ymin, ymax] = this._range()

		const targets = this._getScales(ymin, ymax)
		for (const target of targets) {
			const h = scale(+target, ymin, ymax, 0, range[1] - this.padding[1] * 2) + this.padding[1]
			this._grid
				.append('line')
				.attr('x1', 0)
				.attr('x2', range[0])
				.attr('y1', h)
				.attr('y2', h)
				.attr('stroke', 'gray')
			this._grid
				.append('text')
				.attr('x', 0)
				.attr('y', range[1] - h)
				.attr('fill', 'gray')
				.style('transform', 'scale(1, -1) translate(0, -100%)')
				.text(target)
		}
	}

	_getScales(min, max) {
		const diff = max - min
		if (diff === 0) {
			return []
		}
		let s = Math.floor(Math.log10(diff))
		let step = 10 ** s
		if (diff / step < 2) {
			step /= 2
			s--
		} else if (diff / step > 5) {
			step *= 2
		}
		const maxh = max - (max % step)

		const scales = []
		for (let v = maxh; v >= min; v -= step) {
			scales.push(s < 0 ? v.toFixed(-s) : v)
		}
		return scales
	}

	testResult(pred) {
		const task = this._manager.platform.task
		this._lastpred = pred

		if (this._svg.select('g.tile-render').size() === 0) {
			if (task === 'CP') {
				this._svg.insert('g', ':first-child').classed('tile-render', true)
			} else {
				this._svg.append('g').classed('tile-render', true)
			}
		}
		this._r_tile = this._svg.select('g.tile-render')
		this._r_tile.selectAll('*').remove()

		const line = d3
			.line()
			.x(d => d[0])
			.y(d => d[1])
		this._pred_values = []
		this._cp_pred_value = null
		if (task === 'TP') {
			this._pred_values = pred
			const pathElm = this._r_tile
				.append('path')
				.attr('stroke', 'red')
				.attr('fill-opacity', 0)
				.style('pointer-events', 'none')

			this._pred_points?.forEach(p => p.remove())
			this._pred_points = []
			const datas = this.datas
			const path = []
			if (datas.length > 0) {
				path.push(this.toPoint([datas.length - 1, datas.x[datas.length - 1] || [datas.y[datas.length - 1]]]))
			}
			for (let i = 0; i < pred.length; i++) {
				const a = this.toPoint([i + datas.length, pred[i]])
				const p = new DataPoint(this._r_tile, a, specialCategory.dummy)
				path.push(a)
				this._pred_points.push(p)
			}
			if (path.length === 0) {
				pathElm.attr('opacity', 0)
			} else {
				pathElm.attr('d', line(path)).attr('opacity', 0.5)
			}
		} else if (task === 'SM') {
			const pathElm = this._r_tile
				.append('path')
				.attr('stroke', 'red')
				.attr('fill-opacity', 0)
				.style('pointer-events', 'none')
			const path = []
			for (let i = 0; i < pred.length; i++) {
				const a = this.toPoint([i, pred[i]])
				path.push(a)
			}
			if (path.length === 0) {
				pathElm.attr('opacity', 0)
			} else {
				pathElm.attr('d', line(path)).attr('opacity', 1)
			}
		} else if (task === 'CP') {
			if (typeof pred[0] === 'number') {
				this._cp_pred_value = pred.concat()
				pred = pred.map(v => v > this._cp_threshold)
			} else {
				pred = pred.concat()
			}
			if (this._cp_pred_value) {
				let max = Math.max(...this._cp_pred_value)
				const min = Math.min(...this._cp_pred_value)
				if (max === min) {
					max += 1
				}
				const canvas = document.createElement('canvas')
				canvas.width = this.width
				canvas.height = this.height
				const ctx = canvas.getContext('2d')
				let x = 0
				for (let i = 0; i < this._cp_pred_value.length; i++) {
					const x1 = this.toPoint([i + 0.5, [0]])[0]
					const v = (this._cp_pred_value[i] - min) / (max - min)
					ctx.fillStyle = getCategoryColor(specialCategory.errorRate(v))
					ctx.fillRect(x, 0, x1 - x + 1, this.height)
					x = x1
				}
				this._r_tile
					.append('image')
					.attr('x', 0)
					.attr('y', 0)
					.attr('width', canvas.width)
					.attr('height', canvas.height)
					.attr('xlink:href', canvas.toDataURL())
					.attr('opacity', 0.3)
			}
			for (let i = 0; i < pred.length; i++) {
				if (!pred[i]) continue
				const x = this.toPoint([i, [0]])[0]
				this._r_tile
					.append('line')
					.attr('x1', x)
					.attr('x2', x)
					.attr('y1', 0)
					.attr('y2', this.height)
					.attr('stroke', 'red')
			}
		}
	}

	resetPredicts() {
		this._pred_values = []
		this._lastpred = []
		this._r_tile?.selectAll('*').remove()
		this.render()
	}

	updateThreshold(threshold) {
		if (this._cp_pred_value) {
			this._cp_threshold = threshold
			this.testResult(this._cp_pred_value)
		}
	}

	terminate() {
		this._observer.disconnect()
		this.setting.render.removeItem('line')
		super.terminate()
	}
}
