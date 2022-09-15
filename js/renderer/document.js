import BaseRenderer from './base.js'

export default class DocumentScatterRenderer extends BaseRenderer {
	constructor(manager) {
		super(manager)
		this._size = [960, 500]

		const r = this.setting.render.addItem('document-scatter')
		const plotArea = document.createElement('div')
		plotArea.id = 'plot-area'
		r.appendChild(plotArea)

		this._root = d3
			.select(plotArea)
			.append('svg')
			.style('border', '1px solid #000000')
			.attr('width', `${this._size[0]}px`)
			.attr('height', `${this._size[1]}px`)
		this._svg = this._root.append('g')

		this._r = this._svg.select('g.points g.datas')
		if (this._r.size() === 0) {
			const pointDatas = this._svg.append('g').classed('points', true)
			this._r = pointDatas.append('g').classed('datas', true)
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
		this._root.attr('width', `${value}px`)
	}

	get height() {
		return this._size[1]
	}

	set height(value) {
		this._size[1] = value
		this._root.attr('height', `${value}px`)
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
		this._r.selectAll('*').remove()
		let y_max = []
		let y_min = []
		for (let i = 0; i < data[0].length; i++) {
			const ym = data.map(v => v[i])
			y_max.push(Math.max(...ym))
			y_min.push(Math.min(...ym))
		}

		const width = this.width
		const height = this.height - 20

		const scales = [width, height].map((m, i) => (m - 10) / (y_max[i] - y_min[i]))
		const scale_min = Math.min(...scales)
		const offsets = [5, 20]
		for (let i = 0; i < scales.length; i++) {
			if (scales[i] > scale_min) {
				if (!isFinite(scales[i])) {
					offsets[i] = [width, height][i] / 2 - y_min[i]
				} else {
					offsets[i] += ((scales[i] - scale_min) * (y_max[i] - y_min[i])) / 2
				}
			}
		}
		for (let i = 0; i < data.length; i++) {
			const v = data[i].map((a, k) => (a - y_min[k]) * scale_min + offsets[k])
			this._r.append('text').attr('x', v[0]).attr('y', v[1]).text(words[i]).append('title').text(words[i])
		}
	}

	terminate() {
		this.setting.render.removeItem('document-scatter')
		super.terminate()
	}
}
