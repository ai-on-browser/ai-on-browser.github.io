import BaseRenderer from './base.js'

const scale = function (v, smin, smax, dmin, dmax) {
	if (!isFinite(smin) || !isFinite(smax) || smin === smax) {
		return (dmax + dmin) / 2
	}
	return ((v - smin) / (smax - smin)) * (dmax - dmin) + dmin
}

export default class LineRenderer extends BaseRenderer {
	constructor(manager) {
		super(manager)
		this._r = this.svg.select('g.points g.datas')
		if (this._r.size() === 0) {
			const pointDatas = this.svg.append('g').classed('points', true)
			this._r = pointDatas.append('g').classed('datas', true)
		}
		this._pathg = this.svg.select('g.ts-render-path')
		if (this._pathg.size() === 0) {
			this._pathg = this.svg.insert('g', ':first-child').classed('ts-render-path', true)
		}
		this._pathg.selectAll('g.ts-render-path *').remove()
		this._path = this._pathg
			.append('path')
			.attr('stroke', 'black')
			.attr('fill-opacity', 0)
			.style('pointer-events', 'none')

		this._p = []
		this._pad = 10
		this._clip_pad = -Infinity
		this._pred_count = 0

		this._observe_target = null
		this._observer = new MutationObserver(mutations => {
			if (this._observe_target) {
				this._p.forEach((p, i) => (p.title = this.datas.originalY[i]))
			}
		})
		this._observer.observe(this.setting.svg.node(), {
			childList: true,
		})

		this._will_render = false
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
		let e = this.setting.render.configElement.querySelector('div.column-selector')
		if (!e && names.length > 0) {
			e = document.createElement('div')
			e.classList.add('column-selector')
			this.setting.render.configElement.appendChild(e)
		} else {
			e?.replaceChildren()
		}
		if (names.length <= 1) {
			this._select = null
		} else if (names.length <= 4) {
			const elm = document.createElement('table')
			elm.style.borderCollapse = 'collapse'
			e.appendChild(elm)

			let row = document.createElement('tr')
			row.style.textAlign = 'center'
			row.appendChild(document.createElement('td'))
			const dir = document.createElement('td')
			dir.innerText = 'V'
			dir.style.transform = 'rotate(180deg)'
			row.appendChild(dir)
			elm.appendChild(row)

			const ck1 = []
			for (let i = 0; i < this.datas.dimension; i++) {
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
				for (let i = 0; i < this.datas.dimension; i++) {
					if (ck1[i].checked) {
						k[0] = i
					}
				}
				return k
			}
		} else {
			names = names.map(v => '' + v)
			const dir = document.createElement('span')
			dir.innerText = '>'
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

	toPoint(value) {
		if (this.datas.length === 0) {
			return [0, 0]
		}
		const range = [this.width, this.height]
		const d = []
		if (this.datas.dimension === 0) {
			const yrang = this.datas.range
			d.push(
				scale(value[0], 0, this.datas.length + this._pred_count, 0, range[0] - this.padding[0] * 2) +
					this.padding[0],
				scale(value[1][0], yrang[0], yrang[1], 0, range[1] - this.padding[1] * 2) + this.padding[1]
			)
		} else {
			const k = this._select?.() ?? (this.datas.dimension === 0 ? null : [Math.min(1, this.datas.dimension - 1)])
			const domain = this.datas.domain
			const k0 = Math.min(k[0], value[1].length - 1)
			d.push(
				scale(value[0], 0, this.datas.length + this._pred_count, 0, range[0] - this.padding[0] * 2) +
					this.padding[0],
				scale(value[1][k0], domain[k[0]][0], domain[k[0]][1], 0, range[1] - this.padding[1] * 2) +
					this.padding[1]
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
		const domain = this.datas.domain
		const target = this.datas.y
		const range = [this.width, this.height]
		const [ymin, ymax] = this.datas.range

		const ds = []
		for (let i = 0; i < n; i++) {
			if (this.datas.dimension === 0) {
				ds.push([
					scale(i, 0, n + this._pred_count, 0, range[0] - this.padding[0] * 2) + this.padding[0],
					scale(target[i], ymin, ymax, 0, range[1] - this.padding[1] * 2) + this.padding[1],
				])
			} else {
				ds.push([
					scale(i, 0, n + this._pred_count, 0, range[0] - this.padding[0] * 2) + this.padding[0],
					scale(data[i][k[0]], domain[k[0]][0], domain[k[0]][1], 0, range[1] - this.padding[1] * 2) +
						this.padding[1],
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
			this._p[i].title = this.datas.originalY[i]
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
	}

	terminate() {
		this._p.forEach(p => p.remove())
		this._observer.disconnect()
		this.setting.render.configElement.replaceChildren()
		this._pathg.remove()
		super.terminate()
	}
}
