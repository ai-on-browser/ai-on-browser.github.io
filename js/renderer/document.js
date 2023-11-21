import BaseRenderer from './base.js'

export default class DocumentScatterRenderer extends BaseRenderer {
	constructor(manager) {
		super(manager)
		this._size = [960, 500]

		const r = this.setting.render.addItem('document-scatter')
		const plotArea = document.createElement('div')
		plotArea.id = 'plot-area'
		r.appendChild(plotArea)

		this._root = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		this._root.style.border = '1px solid #000000'
		this._root.setAttribute('width', `${this._size[0]}px`)
		this._root.setAttribute('height', `${this._size[1]}px`)
		plotArea.appendChild(this._root)

		this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'g')
		this._root.appendChild(this._svg)

		this._r = this._svg.querySelector('g.points g.datas')
		if (!this._r) {
			const pointDatas = document.createElementNS('http://www.w3.org/2000/svg', 'g')
			pointDatas.classList.add('points')
			this._svg.appendChild(pointDatas)

			this._r = document.createElementNS('http://www.w3.org/2000/svg', 'g')
			this._r.classList.add('datas')
			pointDatas.appendChild(this._r)
		}
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

	set trainResult(value) {
		this._pred = value
		this._displayResults(value, this.trainInput)
	}

	init() {
		this._lastpred = null
		this._r_tile?.remove()
	}

	_render() {}

	testData() {
		const x = this.datas.x[0]
		const [words, idxs] = this.datas.ordinal(x)
		return words
	}

	testResult(value) {
		this._pred = value
		this._displayResults(value, this.testData())
	}

	_displayResults(data, words) {
		this._r.replaceChildren()
		let y_max = []
		let y_min = []
		for (let i = 0; i < data[0].length; i++) {
			const ym = data.map(v => v[i])
			y_max.push(Math.max(...ym))
			y_min.push(Math.min(...ym))
		}

		const width = this.width
		const height = this.height - 20
		const range = [width, height]

		const scales = range.map((m, i) => (m - 10) / (y_max[i] - y_min[i]))
		const scale_min = Math.min(...scales)
		const offsets = [5, 20]
		for (let i = 0; i < scales.length; i++) {
			if (scales[i] > scale_min) {
				if (!isFinite(scales[i])) {
					offsets[i] = range[i] / 2 - y_min[i]
				} else {
					offsets[i] += ((scales[i] - scale_min) * (y_max[i] - y_min[i])) / 2
				}
			}
		}
		for (let i = 0; i < data.length; i++) {
			const v = data[i].map((a, k) => {
				const p = (a - y_min[k]) * scale_min + offsets[k]
				return isFinite(p) ? p : range[k] / 2
			})
			const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
			text.setAttribute('x', v[0])
			text.setAttribute('y', v[1] ?? range[1] / 2)
			text.innerHTML = words[i]
			const title = document.createElementNS('http://www.w3.org/2000/svg', 'title')
			title.innerHTML = words[i]
			text.appendChild(title)
			this._r.appendChild(text)
		}
	}

	terminate() {
		this.setting.render.removeItem('document-scatter')
		super.terminate()
	}
}
