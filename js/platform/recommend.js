import { BasePlatform } from './base.js'

export default class RecommendPlatform extends BasePlatform {
	constructor(task, manager) {
		super(task, manager)
	}

	init() {
		if (this.svg.select('g.rc-render').size() === 0) {
			this.svg.append('g').classed('rc-render', true).style('transform', 'scale(1, -1) translate(0, -100%)')
		}
		this._r = this.svg.select('g.rc-render')
		this._r.selectAll('*').remove()

		const svgNode = this.svg.node()
		this.svg
			.selectAll('g:not(.rc-render)')
			.filter(function () {
				return this.parentNode === svgNode
			})
			.style('visibility', 'hidden')

		this.render()
	}

	render() {
		this._r.selectAll('*').remove()
		const data = this.datas
		if (!data) {
			return
		}
		const fobj = this._r
			.append('foreignObject')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', this.width)
			.attr('height', this.height)
			.style('overflow', 'scroll')
		const table = fobj
			.append('xhtml:table')
			.attr('width', this.width)
			.attr('height', this.height)
			.attr('border', 1)
			.style('border-collapse', 'collapse')

		const names = data._feature_names
		if (names) {
			const th = table.append('tr')
			for (const name of names) {
				th.append('td').text(name)
			}
		}

		const x = data.x
		const tbody = table
		for (let i = 0; i < data.length; i++) {
			const tr = tbody.append('tr')
			for (let j = 0; j < x[i].length; j++) {
				tr.append('td').text(data._input_category_names[j] ? data._input_category_names[j][x[i][j]] : x[i][j])
			}
		}
	}

	fit(fit_cb) {
		const x = this.datas.x.map(r => {
			return r
				.map((v, j) => (this.datas._input_category_names[j] ? this.datas._input_category_names[j][v] : v))
				.filter(v => v !== null)
		})
		fit_cb(x, null, pred => {
			this._pred = pred
		})
	}

	predict(pred_cb) {
		const x = this.datas.x
		pred_cb(x, pred => {
			this._pred = pred
		})
	}

	terminate() {
		this._r?.remove()
		this.svg.selectAll('g').style('visibility', null)
		const elm = this.setting.task.configElement
		elm.selectAll('*').remove()
		this.setting.footer.text('')
		super.terminate()
	}
}
