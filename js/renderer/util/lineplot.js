export default class LinePlotter {
	constructor(r) {
		this._r = r

		this._item = null
	}

	_ready(value) {
		if (this._item) {
			return
		}
		if (typeof value === 'object' && !Array.isArray(value)) {
			this._item = {}
			for (const key of Object.keys(value)) {
				this._item[key] = new LinePlotterItem(this._r)
				this._item[key].name = key
			}
		} else {
			this._item = new LinePlotterItem(this._r)
		}
	}

	add(value) {
		this._ready(value)
		if (typeof value === 'object') {
			for (const key of Object.keys(value)) {
				this._item[key].add(value[key])
			}
		} else {
			this._item.add(value)
		}
	}

	setValues(values) {
		this._ready(values)
		if (!Array.isArray(values)) {
			for (const key of Object.keys(values)) {
				this._item[key].setValues(values[key])
			}
		} else {
			this._item.setValues(values)
		}
	}

	terminate() {
		if (this._item instanceof LinePlotterItem) {
			this._item.terminate()
		} else {
			for (const key of Object.keys(this._item)) {
				this._item[key].terminate()
			}
		}
	}
}

class LinePlotterItem {
	constructor(r) {
		this._width = 200
		this._height = 50

		this._plot_count = 10000
		this._print_count = 0
		this._plot_smooth_window = 20

		this._root = document.createElement('span')
		r.appendChild(this._root)
		this._caption = document.createElement('div')
		this._caption.innerText = 'loss'
		this._root.appendChild(this._caption)

		const cont = document.createElement('span')
		cont.style.display = 'inline-flex'
		cont.style.alignItems = 'flex-start'
		cont.style.margin = '5px'
		cont.style.fontSize = '80%'
		this._root.appendChild(cont)

		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		svg.setAttribute('width', this._width)
		svg.setAttribute('height', this._height)
		cont.appendChild(svg)

		this._scaleElm = document.createElement('span')
		this._scaleElm.style.display = 'flex'
		this._scaleElm.style.flexDirection = 'column'
		this._scaleElm.style.margin = '0 5px'
		this._scaleElm.style.textAlign = 'center'
		cont.appendChild(this._scaleElm)
		const scaleTxt = document.createElement('span')
		scaleTxt.innerText = 'scale'
		this._scaleElm.appendChild(scaleTxt)
		this._scale = document.createElement('select')
		for (const name of ['linear', 'log']) {
			const opt = document.createElement('option')
			opt.value = opt.innerText = name
			this._scale.appendChild(opt)
		}
		this._scale.onchange = () => this.plotRewards()
		this._scaleElm.appendChild(this._scale)

		const stats = document.createElement('span')
		stats.style.display = 'inline-flex'
		stats.style.flexDirection = 'column'
		cont.appendChild(stats)

		this._state = { root: stats }
		for (const k of ['count', 'max', 'ave', 'min', 'values']) {
			const txt = document.createElement('span')
			stats.append(txt)
			this._state[k] = txt
		}

		this._history = []
	}

	set name(value) {
		this._caption.innerText = value
		this._caption.style.display = value ? null : 'none'
	}

	get length() {
		return this._history.length
	}

	add(value) {
		this._history.push(value)
		this.plotRewards()
	}

	setValues(values) {
		this._history = values
		this.plotRewards()
	}

	terminate() {
		this._root.remove()
	}

	lastHistory(length = 0) {
		if (length <= 0) {
			return this._history
		}
		const historyLength = this._history.length
		return this._history.slice(Math.max(0, historyLength - length), historyLength)
	}

	plotRewards() {
		const svg = this._root.querySelector('svg')
		const width = svg.width.baseVal.value
		const height = svg.height.baseVal.value
		let path = null
		let sm_path = null
		if (svg.childNodes.length === 0) {
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
			path.setAttribute('name', 'value')
			path.setAttribute('stroke', 'black')
			path.setAttribute('fill-opacity', 0)
			svg.appendChild(path)
			sm_path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
			sm_path.setAttribute('name', 'smooth')
			sm_path.setAttribute('stroke', 'green')
			sm_path.setAttribute('fill-opacity', 0)
			svg.appendChild(sm_path)
		} else {
			path = svg.querySelector('path[name=value]')
			sm_path = svg.querySelector('path[name=smooth]')
		}

		const lastHistory = this.lastHistory(this._plot_count)
		if (lastHistory.length === 0) {
			svg.style.display = 'none'
			this._scaleElm.style.display = 'none'
			this._state.root.style.display = 'none'
			path.removeAttribute('d')
			sm_path.removeAttribute('d')
			return
		}
		svg.style.display = null
		this._state.root.style.display = 'inline-flex'
		const maxr = Math.max(...lastHistory)
		const minr = Math.min(...lastHistory)

		const fmtNum = f => {
			if (typeof f !== 'number') {
				return f
			}
			if (f === 0) {
				return 0
			}
			const scale = -Math.floor(Math.log10(Math.abs(f))) + 3
			if (scale < 0) {
				return Math.round(f)
			}
			return Math.round(f * 10 ** scale) / 10 ** scale
		}

		this._state.count.innerText = `Count: ${this.length}`
		this._state.min.innerText = `Min: ${fmtNum(minr)}`
		this._state.max.innerText = `Max: ${fmtNum(maxr)}`

		if (maxr === minr) {
			this._scaleElm.style.display = 'none'
			return
		} else if (this._history.some(v => v <= 0)) {
			this._scaleElm.style.display = 'none'
			this._scale.value = 'linear'
		} else {
			this._scaleElm.style.display = 'flex'
		}

		const pp = (i, v) => {
			if (this._scale.value === 'log') {
				return [
					(width * i) / (lastHistory.length - 1),
					(1 - (Math.log(v) - Math.log(minr)) / (Math.log(maxr) - Math.log(minr))) * height,
				]
			}
			return [(width * i) / (lastHistory.length - 1), (1 - (v - minr) / (maxr - minr)) * height]
		}

		const p = lastHistory.map((v, i) => pp(i, v))
		const line = p => {
			let s = ''
			for (let i = 0; i < p.length; i++) {
				s += `${i === 0 ? 'M' : 'L'}${p[i][0]},${p[i][1]}`
			}
			return s
		}
		path.setAttribute('d', line(p))

		const smp = []
		for (let i = 0; i < lastHistory.length - this._plot_smooth_window; i++) {
			let s = 0
			for (let k = 0; k < this._plot_smooth_window; k++) {
				s += lastHistory[i + k]
			}
			smp.push([i + this._plot_smooth_window, s / this._plot_smooth_window])
		}
		if (smp.length > 0) {
			sm_path.setAttribute('d', line(smp.map(p => pp(...p))))
			this._state.ave.innerText = `Mean(${this._plot_smooth_window}): ${fmtNum(smp[smp.length - 1]?.[1])}`
		}

		if (this._print_count > 0) {
			this._state.values.style.display = null
			this._state.values.innerText = ` [${lastHistory
				.slice(lastHistory.length - this._print_count)
				.reverse()
				.join(',')}]`
		} else {
			this._state.values.style.display = 'none'
		}
	}
}
