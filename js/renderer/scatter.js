import BaseRenderer from './base.js'
import { getCategoryColor, specialCategory, DataPoint, DataCircle, DataLine, DataHulls } from '../utils.js'
import Matrix from '../../lib/util/matrix.js'

const scale = function (v, smin, smax, dmin, dmax) {
	if (!isFinite(smin) || !isFinite(smax) || smin === smax) {
		return (dmax + dmin) / 2
	}
	return ((v - smin) / (smax - smin)) * (dmax - dmin) + dmin
}

export default class ScatterRenderer extends BaseRenderer {
	constructor(manager) {
		super(manager)
		this._size = [960, 500]

		const r = this.setting.render.addItem('scatter')
		const plotArea = document.createElement('div')
		plotArea.id = 'plot-area'
		r.appendChild(plotArea)

		this._menu = document.createElement('div')
		plotArea.appendChild(this._menu)

		this._root = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		plotArea.appendChild(this._root)
		this._root.style.border = '1px solid #000000'
		this._root.setAttribute('width', `${this._size[0]}px`)
		this._root.setAttribute('height', `${this._size[1]}px`)

		this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'g')
		this._svg.style.transform = 'scale(1, -1) translate(0, -100%)'
		this._root.appendChild(this._svg)

		this._grid = document.createElementNS('http://www.w3.org/2000/svg', 'g')
		this._grid.setAttribute('opacity', 0.3)
		this._svg.appendChild(this._grid)

		const pointDatas = document.createElementNS('http://www.w3.org/2000/svg', 'g')
		pointDatas.classList.add('points')
		this._svg.appendChild(pointDatas)
		this._r = document.createElementNS('http://www.w3.org/2000/svg', 'g')
		this._r.classList.add('datas')
		pointDatas.appendChild(this._r)

		this._p = []
		this._pad = 10
		this._clip_pad = -Infinity
		this._pred_count = 0

		this._select = [0, 1]

		this._observe_target = null
		this._observer = new MutationObserver(mutations => {
			if (this._observe_target) {
				this._p.forEach((p, i) => (p.title = this.datas.labels[i]))
			}
		})
		this._observer.observe(this._svg, {
			childList: true,
		})
	}

	get svg() {
		return this._svg
	}

	get width() {
		return this._size[0]
	}

	set width(value) {
		this._size[0] = value
		this._root.setAttribute('width', `${value}px`)
	}

	get height() {
		return this._size[1]
	}

	set height(value) {
		this._size[1] = value
		this._root.setAttribute('height', `${value}px`)
	}

	get padding() {
		if (!Array.isArray(this._pad)) {
			return [this._pad, this._pad]
		}
		return this._pad
	}

	set padding(pad) {
		this._pad = pad ?? 0
		this.render()
	}

	set clipPadding(pad) {
		this._clip_pad = pad
		this.render()
	}

	get points() {
		return this._p
	}

	set trainResult(value) {
		const task = this._manager.platform.task
		if (task === 'AD') {
			if (this._svg.querySelectorAll('.tile').length === 0) {
				const tile = document.createElementNS('http://www.w3.org/2000/svg', 'g')
				tile.classList.add('tile', 'anormal_point')
				this._svg.insertBefore(tile, this._svg.firstChild)
			}
			const r = this._svg.querySelector('.tile')
			r.replaceChildren()
			value.forEach((v, i) => {
				if (v) {
					const o = new DataCircle(r, this.points[i])
					o.color = getCategoryColor(specialCategory.error)
				}
			})
		} else if (task === 'SC') {
			if (this._svg.querySelectorAll('.tile').length === 0) {
				const tile = document.createElementNS('http://www.w3.org/2000/svg', 'g')
				tile.classList.add('tile')
				this._svg.insertBefore(tile, this._svg.firstChild)
			}
			const r = this._svg.querySelector('.tile')
			r.replaceChildren()

			value.forEach((v, i) => {
				const o = new DataCircle(r, this.points[i])
				o.color = getCategoryColor(v)
			})
		} else if (task === 'DR' || task === 'FS' || task === 'TF') {
			if (this._svg.querySelectorAll('.tile').length === 0) {
				const tile = document.createElementNS('http://www.w3.org/2000/svg', 'g')
				tile.classList.add('tile')
				tile.setAttribute('opacity', 0.5)
				this._svg.insertBefore(tile, this._svg.firstChild)
			}
			const r = this._svg.querySelector('.tile')
			r.replaceChildren()

			const d = value[0].length
			let y = value
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

			const ranges = this.datas.dimension <= 1 ? [this.height, this.height] : [this.width, this.height]

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
			const p = Matrix.fromArray(this.points.map(p => p.at))
			for (let i = 0; i < (this.datas.dimension <= 1 ? 1 : 2 ** d); i++) {
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
					r,
					this.datas.dimension <= 1 ? [this.points[i].at[0], v[0]] : v,
					this.points[i].category
				)
				p.radius = 2
				const dl = new DataLine(r, this.points[i], p)
				dl.setRemoveListener(() => p.remove())
			})
		} else if (task === 'GR') {
			if (this._svg.querySelectorAll('.tile').length === 0) {
				const tile = document.createElementNS('http://www.w3.org/2000/svg', 'g')
				tile.classList.add('tile', 'generated')
				tile.setAttribute('opacity', 0.5)
				this._svg.insertBefore(tile, this._svg.firstChild)
			}
			const r = this._svg.querySelector('.tile.generated')
			r.replaceChildren()
			let cond = null
			if (Array.isArray(value) && value.length === 2 && Array.isArray(value[0]) && Array.isArray(value[0][0])) {
				;[value, cond] = value
			}

			value.forEach((v, i) => {
				let p = new DataPoint(r, this.toPoint(v), cond ? cond[i][0] : 0)
				p.radius = 2
			})
		}
	}

	get scale() {
		const domain = this.datas.domain
		const range = [this.width, this.height]
		const [ymin, ymax] = this.datas.range
		const d = this._select.map((t, s) => range[s] / (domain[t][1] - domain[t][0]))
		if (this._select.length === 1) {
			d[1] = range[1] / (ymax - ymin)
		}
		return d
	}

	init() {
		this._lastpred = null
		this._r_tile?.remove()
		this._svg.querySelectorAll('.tile').forEach(e => e.remove())
		this._grid.replaceChildren()
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
			this._select = this.datas?.dimension === 1 ? [0] : [0, 1]
		} else if (names.length === 1) {
			const elm = document.createElement('table')
			elm.style.borderCollapse = 'collapse'
			e.appendChild(elm)

			let row = elm.insertRow()
			row.style.textAlign = 'center'
			row.insertCell()
			row.insertCell().innerHTML = '&rarr;'

			row = elm.insertRow()
			const label = row.insertCell()
			label.innerText = names[0]
			label.style.textAlign = 'right'
			const cont1 = row.insertCell()
			const d1 = document.createElement('input')
			d1.type = 'radio'
			d1.name = 'data-d1'
			d1.checked = true
			cont1.appendChild(d1)

			this._select = this.datas.dimension === 1 ? [0] : [0, 1]
		} else if (names.length <= 4) {
			const elm = document.createElement('table')
			elm.style.borderCollapse = 'collapse'
			e.appendChild(elm)

			let row = elm.insertRow()
			row.style.textAlign = 'center'
			row.insertCell()
			row.insertCell().innerHTML = '&rarr;'
			row.insertCell().innerHTML = '&uarr;'

			const ck1 = []
			const ck2 = []
			for (let i = 0; i < names.length; i++) {
				row = elm.insertRow()
				const label = row.insertCell()
				label.innerText = names[i]
				label.style.textAlign = 'right'

				const cont1 = row.insertCell()
				const d1 = document.createElement('input')
				d1.type = 'radio'
				d1.name = 'data-d1'
				d1.onchange = () => {
					if (this._select[1] === i) {
						ck2[this._select[1]].checked = false
						ck2[this._select[0]].checked = true
						this._select[1] = this._select[0]
					}
					this._select[0] = i
					this.render()
				}
				cont1.appendChild(d1)
				ck1.push(d1)
				const cont2 = row.insertCell()
				const d2 = document.createElement('input')
				d2.type = 'radio'
				d2.name = 'data-d2'
				d2.onchange = () => {
					if (this._select[0] === i) {
						ck1[this._select[0]].checked = false
						ck1[this._select[1]].checked = true
						this._select[0] = this._select[1]
					}
					this._select[1] = i
					this.render()
				}
				cont2.appendChild(d2)
				ck2.push(d2)
			}
			ck1[0].checked = true
			ck2[1].checked = true
			this._select = [0, 1]
		} else {
			names = names.map(v => '' + v)
			const dir1 = document.createElement('span')
			dir1.innerHTML = '&rarr;'
			e.appendChild(dir1)
			const slct1 = document.createElement('select')
			slct1.onchange = () => {
				const i = names.indexOf(slct1.value)
				if (this._select[1] === i) {
					slct2.value = names[this._select[0]]
					this._select[1] = this._select[0]
				}
				this._select[0] = i
				this.render()
			}
			for (const name of names) {
				const opt = document.createElement('option')
				opt.value = name
				opt.innerText = name
				slct1.appendChild(opt)
			}
			slct1.value = names[0]
			e.appendChild(slct1)

			const dir2 = document.createElement('span')
			dir2.innerHTML = '&uarr;'
			dir2.style.display = 'inline-block'
			e.appendChild(dir2)
			const slct2 = document.createElement('select')
			slct2.onchange = () => {
				const i = names.indexOf(slct2.value)
				if (this._select[0] === i) {
					slct1.value = names[this._select[1]]
					this._select[0] = this._select[1]
				}
				this._select[1] = i
				this.render()
			}
			for (const name of names) {
				const opt = document.createElement('option')
				opt.value = name
				opt.innerText = name
				slct2.appendChild(opt)
			}
			slct2.value = names[1]
			e.appendChild(slct2)
			this._select = [0, 1]
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

	toPoint(value) {
		const domain = this.datas.domain
		const range = [this.width, this.height]
		const [ymin, ymax] = this.datas.range
		const d = this._select.map(
			(t, s) => scale(value[t], domain[t][0], domain[t][1], 0, range[s] - this.padding[s] * 2) + this.padding[s]
		)
		if (d.length === 1 && value.length > 1) {
			d[1] = scale(value[1], ymin, ymax, 0, range[1] - this.padding[1] * 2) + this.padding[1]
		}
		return d.map(v => (isNaN(v) ? 0 : v))
	}

	_render() {
		if (!this.datas || this.datas.length === 0) {
			this._p.map(p => p.remove())
			this._p.length = 0
			return
		}
		const n = this.datas.length
		const data = this.datas.x
		const domain = this.datas.domain
		const target = this.datas.y
		const range = this._size
		const index = this.datas.index
		const indexRange = this.datas.indexRange
		const [ymin, ymax] = this.datas.range

		const ds = []
		for (let i = 0; i < n; i++) {
			if (this.datas.dimension === 0) {
				const x = isNaN(index[i])
					? scale(i, 0, n, 0, range[0] - this.padding[0] * 2)
					: scale(index[i], indexRange[0], indexRange[1], 0, range[0] - this.padding[0] * 2)
				ds.push([
					x + this.padding[0],
					scale(target[i], ymin, ymax, 0, range[1] - this.padding[1] * 2) + this.padding[1],
				])
			} else if (this.datas.dimension === 1) {
				ds.push([
					scale(data[i][0], domain[0][0], domain[0][1], 0, range[0] - this.padding[0] * 2) + this.padding[0],
					scale(target[i], ymin, ymax, 0, range[1] - this.padding[1] * 2) + this.padding[1],
				])
			} else {
				ds.push(
					this._select.map(
						(t, s) =>
							scale(data[i][t], domain[t][0], domain[t][1], 0, range[s] - this.padding[s] * 2) +
							this.padding[s]
					)
				)
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

		if (this._lastpred) {
			this.testResult(this._lastpred)
		}
		this._renderGrid()
	}

	_renderGrid() {
		this._grid.replaceChildren()
		const domain = this.datas.domain
		const range = this._size
		const [ymin, ymax] = this.datas.range

		let xscales = []
		let xrange = []
		let yscales = []
		let yrange = []
		if (this.datas.dimension === 0) {
			yscales = this._getScales(ymin, ymax)
			yrange = [ymin, ymax]
		} else if (this.datas.dimension === 1) {
			xscales = this._getScales(domain[0][0], domain[0][1])
			xrange = domain[0]
			yscales = this._getScales(ymin, ymax)
			yrange = [ymin, ymax]
		} else {
			xscales = this._getScales(domain[this._select[0]][0], domain[this._select[0]][1])
			xrange = domain[this._select[0]]
			yscales = this._getScales(domain[this._select[1]][0], domain[this._select[1]][1])
			yrange = domain[this._select[1]]
		}

		for (const target of xscales) {
			const w = scale(target, xrange[0], xrange[1], 0, range[0] - this.padding[0] * 2) + this.padding[0]
			const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
			line.setAttribute('x1', w)
			line.setAttribute('x2', w)
			line.setAttribute('y1', 0)
			line.setAttribute('y2', range[1])
			line.setAttribute('stroke', 'gray')
			const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
			text.setAttribute('x', Math.max(w, 10))
			text.setAttribute('y', range[1] - 5)
			text.setAttribute('fill', 'gray')
			text.style.transform = 'scale(1, -1) translate(0, -100%)'
			text.innerHTML = target
			this._grid.append(line, text)
		}
		for (const target of yscales) {
			const h = scale(+target, yrange[0], yrange[1], 0, range[1] - this.padding[1] * 2) + this.padding[1]
			const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
			line.setAttribute('x1', 0)
			line.setAttribute('x2', range[0])
			line.setAttribute('y1', h)
			line.setAttribute('y2', h)
			line.setAttribute('stroke', 'gray')
			const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
			text.setAttribute('x', 5)
			text.setAttribute('y', Math.min(range[1] - h, range[1] - 10))
			text.setAttribute('fill', 'gray')
			text.style.transform = 'scale(1, -1) translate(0, -100%)'
			text.innerHTML = target
			this._grid.append(line, text)
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

	testData(step) {
		this._lastpred = null
		if (!Array.isArray(step)) {
			step = [step, step]
		}
		this._laststep = step
		const domain = []
		if (this.datas.dimension === 0) {
			const indexRange = this.datas.indexRange
			domain[0] = [
				isNaN(indexRange[0]) ? 0 : indexRange[0],
				isNaN(indexRange[1]) ? this.datas.length : indexRange[1],
			]
		} else {
			domain.push(...this.datas.domain)
		}
		this._lastdomain = domain
		const range = [this.width, this.height]
		const tiles = []
		if (this.datas.dimension <= 2) {
			for (let i = 0; i < range[0] + step[0]; i += step[0]) {
				const w = scale(i - this.padding[0], 0, range[0] - this.padding[0] * 2, domain[0][0], domain[0][1])
				if (this.datas.dimension <= 1) {
					tiles.push([w])
				} else {
					for (let j = 0; j < range[1] - step[1] / 100; j += step[1]) {
						const h = scale(
							j - this.padding[1],
							0,
							range[1] - this.padding[1] * 2,
							domain[1][0],
							domain[1][1]
						)
						tiles.push([w, h])
					}
				}
			}
		} else {
			for (let i = 0; i < this.datas.x.length; i++) {
				tiles.push(this.datas.x[i].concat())
			}
		}
		this._lasttiles = tiles
		return tiles
	}

	testResult(pred) {
		const step = this._laststep
		const domain = this._lastdomain
		const range = [this.width, this.height]
		const tiles = this._lasttiles
		const task = this._manager.platform.task
		this._lastpred = pred

		if (task === 'AD') {
			pred = pred.map(v => (v ? specialCategory.error : specialCategory.errorRate(0)))
		}

		this._r_tile?.remove()
		const renderFront = this.datas.dimension === 1 && (task === 'RG' || task === 'IN')
		if (renderFront) {
			this._r_tile = document.createElementNS('http://www.w3.org/2000/svg', 'g')
			this._r_tile.classList.add('tile-render')
			this._r_tile.setAttribute('opacity', 1)
			this._svg.appendChild(this._r_tile)
		} else {
			this._r_tile = document.createElementNS('http://www.w3.org/2000/svg', 'g')
			this._r_tile.classList.add('tile-render')
			this._r_tile.setAttribute('opacity', 0.5)
			this._svg.insertBefore(this._r_tile, this._svg.firstChild)
		}

		this._r_tile.replaceChildren()
		let smooth = pred.some(v => !Number.isInteger(v))
		if (this.datas.dimension <= 1) {
			const p = []
			if (task === 'IN' || (smooth && task !== 'DE')) {
				const [ymin, ymax] = this.datas.range
				for (let i = 0; i < pred.length; i++) {
					p.push([
						scale(tiles[i], domain[0][0], domain[0][1], 0, range[0] - this.padding[0] * 2) +
							this.padding[0],
						scale(pred[i], ymin, ymax, 0, range[1] - this.padding[1] * 2) + this.padding[1],
					])
				}

				const line = p => {
					let s = ''
					for (let i = 0; i < p.length; i++) {
						s += `${i === 0 ? 'M' : 'L'}${p[i][0]},${p[i][1]}`
					}
					return s
				}
				const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
				path.setAttribute('stroke', 'red')
				path.setAttribute('fill-opacity', 0)
				path.setAttribute('d', line(p))
				this._r_tile.appendChild(path)
			} else {
				p.push([], [])
				for (let i = 0, w = 0; w < range[0] + step[0]; i++, w += step[0]) {
					p[0][i] = pred[i]
					p[1][i] = pred[i]
				}

				const t = document.createElementNS('http://www.w3.org/2000/svg', 'g')
				this._r_tile.appendChild(t)
				new DataHulls(t, p, [step[0], 1000], smooth)
			}
		} else if (this.datas.dimension === 2) {
			let c = 0
			const p = []
			for (let i = 0, w = 0; w < range[0] + step[0]; i++, w += step[0]) {
				if (this._select[1] === 0) {
					p[i] = []
				}
				for (let j = 0, h = 0; h < range[1] - step[1] / 100; j++, h += step[1]) {
					if (this._select[1] === 0) {
						p[i][j] = pred[c++]
					} else {
						if (!p[j]) p[j] = []
						p[j][i] = pred[c++]
					}
				}
			}
			if (!smooth && pred.length > 100) {
				smooth ||= new Set(pred).size > 100
			}

			const t = document.createElementNS('http://www.w3.org/2000/svg', 'g')
			this._r_tile.appendChild(t)
			const tileSize =
				this._select[1] === 0 ? [(step[1] / range[1]) * range[0], (step[0] / range[0]) * range[1]] : step
			new DataHulls(t, p, tileSize, smooth || task === 'DE')
		} else {
			const t = document.createElementNS('http://www.w3.org/2000/svg', 'g')
			this._r_tile.appendChild(t)
			const name = pred.every(Number.isInteger)
			for (let i = 0; i < pred.length; i++) {
				const o = new DataCircle(t, this._p[i])
				o.color = getCategoryColor(pred[i])
				if (name && this.datas.outputCategoryNames) {
					this._p[i].title = `true: ${this.datas.originalY[i]}\npred: ${
						this.datas.outputCategoryNames[pred[i] - 1]
					}`
				} else {
					this._p[i].title = `true: ${this.datas.y[i]}\npred: ${pred[i]}`
				}
			}
			this._observe_target = this._r_tile
		}
	}

	terminate() {
		this._observer.disconnect()
		this.setting.render.removeItem('scatter')
		super.terminate()
	}
}
