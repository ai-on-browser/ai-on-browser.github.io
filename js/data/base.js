export class BaseData {
	constructor(manager) {
		this._x = []
		this._y = []
		this._manager = manager
	}

	get setting() {
		return this._manager.setting
	}

	get svg() {
		return this._manager.setting.svg
	}

	get availTask() {
		return []
	}

	get dimension() {
		return this.domain.length
	}

	get domain() {
		if (this.length === 0) {
			return []
		}
		const domain = []
		for (let i = 0; i < this.x[0].length; i++) {
			domain.push([Infinity, -Infinity])
		}
		for (const x of this.x) {
			if (Array.isArray(x[0])) {
				continue
			}
			for (let d = 0; d < x.length; d++) {
				domain[d][0] = Math.min(domain[d][0], x[d])
				domain[d][1] = Math.max(domain[d][1], x[d])
			}
		}
		return domain
	}

	get range() {
		const range = [Infinity, -Infinity]
		for (const y of this.y) {
			range[0] = Math.min(range[0], y)
			range[1] = Math.max(range[1], y)
		}
		return range
	}

	get categories() {
		return [...new Set(this.y)]
	}

	get length() {
		return this.x.length
	}

	get x() {
		return this._x
	}

	get series() {
		return {
			values: this.x,
			get domain() {
				if (this.values.length === 0) {
					return []
				}
				const domain = []
				for (let i = 0; i < this.values[0].length; i++) {
					domain.push([Infinity, -Infinity])
				}
				for (const x of this.values) {
					for (let d = 0; d < x.length; d++) {
						domain[d][0] = Math.min(domain[d][0], x[d])
						domain[d][1] = Math.max(domain[d][1], x[d])
					}
				}
				return domain
			},
		}
	}

	get y() {
		return this._y
	}

	get points() {
		return this._manager.platform._renderer.points
	}

	get scale() {
		return 1
	}

	set scale(s) {}

	get isSeries() {
		const task = this.setting.vue.mlTask
		return ['TP', 'SM', 'CP'].indexOf(task) >= 0
	}

	get selectedColumnIndex() {
		return this.isSeries ? [Math.min(1, this.dimension - 1)] : this.dimension === 1 ? [0] : [0, 1]
	}

	get params() {
		return {}
	}

	set params(params) {}

	*[Symbol.iterator]() {
		const l = this.length
		for (let i = 0; i < l; i++) {
			yield this.at(i)
		}
	}

	splice(start, count, ...items) {
		return []
	}

	set(i, x, y) {
		this.splice(i, 1, x, y)
	}

	push(...items) {
		this.splice(this.length, 0, ...items)
	}

	pop() {
		return this.splice(this.length - 1, 1)[0]
	}

	unshift(...items) {
		this.splice(0, 0, ...items)
	}

	shift() {
		return this.splice(0, 1)[0]
	}

	slice(start, end) {
		const r = []
		for (let i = start; i < end; i++) {
			r.push(this.at(i))
		}
		return r
	}

	forEach(cb) {
		const l = this.length
		for (let i = 0; i < l; i++) {
			cb(this.at(i), i, this)
		}
	}

	map(cb) {
		const l = this.length
		const r = []
		for (let i = 0; i < l; i++) {
			r.push(cb(this.at(i), i, this))
		}
		return r
	}

	swap(i, j) {
		;[this._x[i], this._x[j]] = [this._x[j], this._x[i]]
		;[this._y[i], this._y[j]] = [this._y[j], this._y[i]]
	}

	sort(cb) {
		const l = this.length
		const v = []
		for (let i = 0; i < l; i++) {
			v[i] = this.at(i)
			for (let j = i; j > 0; j--) {
				if (cb(v[j - 1], v[j]) > 0) {
					this.swap(j - 1, j)
				}
			}
		}
	}

	remove() {
		this.splice(0, this.length)
	}

	terminate() {
		this.setting.data.configElement.selectAll('*').remove()
		this.remove()
	}
}

export class MultiDimensionalData extends BaseData {
	constructor(manager) {
		super(manager)

		this._categorical_output = false
		this._output_category_names = null

		this._select = null
	}

	get selectedColumnIndex() {
		return this._select?.() ?? super.selectedColumnIndex
	}

	_make_selector(names) {
		let e = this.setting.data.configElement.select('div.column-selector')
		if (e.size() === 0) {
			e = this.setting.data.configElement.append('div').classed('column-selector', true)
		} else {
			e.selectAll('*').remove()
		}
		if (this.dimension <= 2) {
			this._select = null
		} else if (this.dimension <= 4) {
			const elm = e.append('table').style('border-collapse', 'collapse')
			let row = elm.append('tr').style('text-align', 'center')
			row.append('td')
			row.append('td').text('>')
			row.append('td').text('V').style('transform', 'rotate(180deg')
			const ck1 = []
			const ck2 = []
			for (let i = 0; i < this.dimension; i++) {
				row = elm.append('tr')
				elm.append('td').text(names[i]).style('text-align', 'right')
				const d1 = elm
					.append('td')
					.append('input')
					.attr('type', 'radio')
					.attr('name', 'data-d1')
					.on('change', () => this._manager.platform.render())
				ck1.push(d1)
				const d2 = elm
					.append('td')
					.append('input')
					.attr('type', 'radio')
					.attr('name', 'data-d2')
					.on('change', () => this._manager.platform.render())
				ck2.push(d2)
			}
			ck1[0].property('checked', true)
			ck2[1].property('checked', true)
			this._select = () => {
				const k = []
				for (let i = 0; i < this.dimension; i++) {
					if (ck1[i].property('checked')) {
						k[0] = i
					}
					if (ck2[i].property('checked')) {
						k[1] = i
					}
				}
				return k
			}
		} else {
			names = names.map(v => '' + v)
			e.append('span').text('>')
			const slct1 = e.append('select').on('change', () => this._manager.platform.render())
			slct1
				.selectAll('option')
				.data(names)
				.enter()
				.append('option')
				.attr('value', d => d)
				.text(d => d)
			slct1.property('value', names[0])
			e.append('span').text('V').style('transform', 'rotate(180deg').style('display', 'inline-block')
			const slct2 = e.append('select').on('change', () => this._manager.platform.render())
			slct2
				.selectAll('option')
				.data(names)
				.enter()
				.append('option')
				.attr('value', d => d)
				.text(d => d)
			slct2.property('value', names[1])
			this._select = () => [names.indexOf(slct1.property('value')), names.indexOf(slct2.property('value'))]
		}
		this._manager.platform.render()
	}

	terminate() {
		this.setting.data.configElement.select('div.column-selector').remove()
		super.terminate()
	}
}

export class FixData extends MultiDimensionalData {
	constructor(manager) {
		super(manager)
		this._domain = null
	}

	get domain() {
		if (this._domain) {
			return this._domain
		}

		return (this._domain = super.domain)
	}

	at(i) {
		return Object.defineProperties(
			{},
			{
				x: {
					get: () => this._x[i],
				},
				y: {
					get: () => this._y[i],
				},
				point: {
					get: () => this.points[i],
				},
			}
		)
	}
}
