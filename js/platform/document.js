import { BasePlatform } from './base.js'

export default class DocumentPlatform extends BasePlatform {
	constructor(task, manager) {
		super(task, manager)
	}

	init() {
		if (this.svg.select('g.dc-render').size() === 0) {
			this.svg.append('g').classed('dc-render', true).style('transform', 'scale(1, -1) translate(0, -100%)')
		}
		this._r = this.svg.select('g.dc-render')
		this._r.selectAll('*').remove()

		const svgNode = this.svg.node()
		this.svg
			.selectAll('g:not(.dc-render)')
			.filter(function () {
				return this.parentNode === svgNode
			})
			.style('visibility', 'hidden')

		this.render()
	}

	render() {}

	fit(fit_cb) {
		const x = this.datas.x[0].map(v => v.toLowerCase())
		fit_cb(x, null, pred => {
			this._pred = pred
			this._displayResults(pred, x)
		})
	}

	predict(pred_cb) {
		const x = this.datas.x[0]
		const [words, idxs] = this.datas.ordinal(x)
		pred_cb(words, pred => {
			this._pred = pred
			this._displayResults(pred, words)
		})
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
		this._r.remove()
		this.svg.selectAll('g').style('visibility', null)
		super.terminate()
	}
}
