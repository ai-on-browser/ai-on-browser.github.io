import BaseRenderer from './base.js'

export default class TableRenderer extends BaseRenderer {
	constructor(manager) {
		super(manager)

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

		const names = data.columnNames
		const x = data.x
		const y = data.y
		if (names) {
			const th = table.append('tr')
			for (const name of names) {
				th.append('td').text(name)
			}
			if (y && y.length > 0) {
				th.append('td').text('target')
			}
		}

		const tbody = table
		for (let i = 0; i < data.length; i++) {
			const tr = tbody.append('tr')
			for (let j = 0; j < x[i].length; j++) {
				tr.append('td').text(data._input_category_names[j] ? data._input_category_names[j][x[i][j]] : x[i][j])
			}
			if (y && y.length > 0) {
				tr.append('td').text(data._output_category_names ? data._output_category_names[y[i] - 1] : y[i])
			}
		}
	}

	terminate() {
		this._r?.remove()
		this.svg.selectAll('g').style('visibility', null)
		super.terminate()
	}
}
