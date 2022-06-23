import BaseRenderer from './base.js'
import { getCategoryColor, DataPoint, DataCircle, DataHulls } from '../utils.js'

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

		this._root = d3
			.select(plotArea)
			.append('svg')
			.style('border', '1px solid #000000')
			.attr('width', `${this._size[0]}px`)
			.attr('height', `${this._size[1]}px`)
		this._svg = this._root.append('g').style('transform', 'scale(1, -1) translate(0, -100%)')

		this._r = this._svg.select('g.points g.datas')
		if (this._r.size() === 0) {
			const pointDatas = this._svg.append('g').classed('points', true)
			this._r = pointDatas.append('g').classed('datas', true)
		}

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
		this._observer.observe(this._svg.node(), {
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
		this._root.attr('width', `${value}px`)
	}

	get height() {
		return this._size[1]
	}

	set height(value) {
		this._size[1] = value
		this._root.attr('height', `${value}px`)
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
			this._select = this.datas.dimension === 1 ? [0] : [0, 1]
		} else if (names.length === 1) {
			const elm = document.createElement('table')
			elm.style.borderCollapse = 'collapse'
			e.appendChild(elm)

			let row = document.createElement('tr')
			row.style.textAlign = 'center'
			row.appendChild(document.createElement('td'))
			const dir1 = document.createElement('td')
			dir1.innerHTML = '&rarr;'
			row.appendChild(dir1)
			elm.appendChild(row)

			row = document.createElement('tr')
			const label = document.createElement('td')
			label.innerText = names[0]
			label.style.textAlign = 'right'
			row.appendChild(label)
			const cont1 = document.createElement('td')
			const d1 = document.createElement('input')
			d1.type = 'radio'
			d1.name = 'data-d1'
			d1.checked = true
			cont1.appendChild(d1)
			row.appendChild(cont1)
			elm.appendChild(row)

			this._select = this.datas.dimension === 1 ? [0] : [0, 1]
		} else if (names.length <= 4) {
			const elm = document.createElement('table')
			elm.style.borderCollapse = 'collapse'
			e.appendChild(elm)

			let row = document.createElement('tr')
			row.style.textAlign = 'center'
			row.appendChild(document.createElement('td'))
			const dir1 = document.createElement('td')
			dir1.innerHTML = '&rarr;'
			row.appendChild(dir1)
			const dir2 = document.createElement('td')
			dir2.innerHTML = '&uarr;'
			row.appendChild(dir2)
			elm.appendChild(row)

			const ck1 = []
			const ck2 = []
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
				row.appendChild(cont1)
				ck1.push(d1)
				const cont2 = document.createElement('td')
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
				row.appendChild(cont2)
				ck2.push(d2)
				elm.appendChild(row)
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
	}

	predict(step) {
		if (!Array.isArray(step)) {
			step = [step, step]
		}
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
		const task = this.setting.vue.mlTask
		const plot = (pred, r) => {
			r.selectAll('*').remove()
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

					const line = d3
						.line()
						.x(d => d[0])
						.y(d => d[1])
					r.append('path').attr('stroke', 'red').attr('fill-opacity', 0).attr('d', line(p))
				} else {
					p.push([], [])
					for (let i = 0, w = 0; w < range[0] + step[0]; i++, w += step[0]) {
						p[0][i] = pred[i]
						p[1][i] = pred[i]
					}

					const t = r.append('g')
					new DataHulls(t, p, [step[0], 1000], smooth)
				}
			} else if (this.datas.dimension === 2) {
				let c = 0
				const p = []
				for (let i = 0, w = 0; w < range[0] + step[0]; i++, w += step[0]) {
					for (let j = 0, h = 0; h < range[1] - step[1] / 100; j++, h += step[1]) {
						if (!p[j]) p[j] = []
						p[j][i] = pred[c++]
					}
				}
				if (!smooth && pred.length > 100) {
					smooth |= new Set(pred).size > 100
				}

				const t = r.append('g')
				new DataHulls(t, p, step, smooth || task === 'DE')
			} else {
				const t = r.append('g')
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
				this._observe_target = r
			}
		}
		return [tiles, plot]
	}

	terminate() {
		this._observer.disconnect()
		this.setting.render.removeItem('scatter')
		super.terminate()
	}
}
