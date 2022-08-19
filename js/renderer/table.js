import BaseRenderer from './base.js'

export default class TableRenderer extends BaseRenderer {
	constructor(manager) {
		super(manager)
		this._offset = 0
		this._pagesize = 100

		this._predict = null

		const r = this.setting.render.addItem('table')
		const head = document.createElement('div')
		head.style.display = 'flex'
		head.style.justifyContent = 'space-between'
		head.style.position = 'sticky'
		head.style.top = '0'

		const nav = document.createElement('div')
		nav.style.backgroundColor = 'white'
		nav.style.padding = '5px'
		nav.style.marginBottom = '-1px'
		nav.style.borderBottom = '1px solid black'
		head.append(nav)

		this._navigator = document.createElement('span')
		nav.appendChild(this._navigator)

		const pagesize = document.createElement('select')
		pagesize.onchange = () => {
			this._offset = 0
			this._pagesize = +pagesize.value
			this._renderPager()
		}
		for (const size of [10, 50, 100, 500, 1000]) {
			const opt = document.createElement('option')
			opt.value = size
			opt.innerText = size
			pagesize.append(opt)
		}
		pagesize.value = this._pagesize
		nav.appendChild(pagesize)

		const totop = document.createElement('button')
		totop.innerHTML = '&uarr;'
		totop.onclick = () => {
			window.scroll({ top: 0, behavior: 'smooth' })
		}
		totop.title = 'To top'
		totop.style.margin = '5px'
		totop.style.borderRadius = '50%'
		head.appendChild(totop)

		this._table = document.createElement('table')
		this._table.style.border = '1px solid black'
		this._table.style.borderCollapse = 'collapse'
		r.append(head, this._table)
	}

	set trainResult(value) {
		if (this._manager.platform.task === 'CF' && this.datas.outputCategoryNames) {
			value = value.map(v => this.datas.outputCategoryNames[v - 1])
		} else if (this._manager.platform.task === 'AD') {
			value = value.map(v => (v ? 'anomalous' : ''))
		}
		if (!this._predict) {
			this._predict = value
			this.render()
		} else {
			this._predict = value
			this._renderData()
		}
	}

	init() {
		this._predict = null
	}

	render() {
		this._table.replaceChildren()
		this._navigator.replaceChildren()
		this._offset = 0
		const data = this.datas
		if (!data) {
			return
		}

		const names = data.columnNames
		if (names) {
			const thead = document.createElement('thead')
			const tr = document.createElement('tr')
			thead.appendChild(tr)
			const cols = []
			if (data.index) {
				cols.push('index')
			}
			cols.push(...names)
			const y = data.originalY
			if (y && y.length > 0) {
				cols.push('target')
			}
			if (this._predict) {
				cols.push('predict')
			}
			for (const col of cols) {
				const td = document.createElement('td')
				td.innerText = col
				td.style.border = '1px solid black'
				tr.appendChild(td)
			}
			this._table.appendChild(thead)
		}

		const tbody = document.createElement('tbody')
		this._table.appendChild(tbody)
		this._renderPager()
	}

	_renderPager() {
		this._navigator.replaceChildren()
		this._renderData()

		const data = this.datas
		if (!data) {
			return
		}

		const maxk = Math.ceil(data.length / this._pagesize)
		const curk = Math.floor(this._offset / this._pagesize) + 1

		if (curk > 1) {
			const toprev = document.createElement('input')
			toprev.type = 'button'
			toprev.value = '<'
			toprev.onclick = () => {
				this._offset = Math.max(0, this._offset - this._pagesize)
				this._renderPager()
			}
			this._navigator.appendChild(toprev)
		}

		const tofirst = document.createElement('input')
		tofirst.type = 'button'
		tofirst.value = '1'
		tofirst.onclick = () => {
			this._offset = 0
			this._renderPager()
		}
		if (curk === 1) {
			tofirst.disabled = true
		}
		this._navigator.appendChild(tofirst)
		if (curk > 3) {
			this._navigator.append(' ... ')
		}

		for (let i = Math.max(2, curk - 1); i <= Math.min(maxk - 1, curk + 1); i++) {
			const btn = document.createElement('input')
			btn.type = 'button'
			btn.value = i
			btn.onclick = () => {
				this._offset = this._pagesize * (i - 1)
				this._renderPager()
			}
			if (i === curk) {
				btn.disabled = true
			}
			this._navigator.appendChild(btn)
		}
		if (curk < maxk - 2) {
			this._navigator.append(' ... ')
		}

		if (maxk > 1) {
			const tolast = document.createElement('input')
			tolast.type = 'button'
			tolast.value = maxk
			tolast.onclick = () => {
				this._offset = this._pagesize * (maxk - 1)
				this._renderPager()
			}
			if (curk === maxk) {
				tolast.disabled = true
			}
			this._navigator.appendChild(tolast)
		}
		if (curk < maxk) {
			const tonext = document.createElement('input')
			tonext.type = 'button'
			tonext.value = '>'
			tonext.onclick = () => {
				this._offset = Math.min(data.length - 1, this._offset + this._pagesize)
				this._renderPager()
			}
			this._navigator.appendChild(tonext)
		}

		this._navigator.append(
			` (${this._offset + 1} - ${Math.min(this._offset + this._pagesize, data.length)} / ${data.length}) `
		)
	}

	_renderData() {
		const tbody = this._table.querySelector('tbody')
		tbody.replaceChildren()

		const data = this.datas
		if (!data) {
			return
		}

		const x = data.originalX
		const y = this._manager.platform.task === 'RG' ? data.y : data.originalY
		const index = data.index
		for (let i = this._offset; i < Math.min(data.length, this._offset + this._pagesize); i++) {
			const tr = document.createElement('tr')
			const vals = []
			if (index) {
				vals.push(index[i])
			}
			if (x[i]) {
				vals.push(...x[i])
			}
			if (y && y.length > 0) {
				vals.push(y[i])
			}
			if (this._predict) {
				vals.push(this._predict[i])
			}
			for (const val of vals) {
				const td = document.createElement('td')
				td.innerText = val
				td.style.border = '1px solid black'
				tr.appendChild(td)
			}
			tbody.appendChild(tr)
		}
	}

	terminate() {
		this.setting.render.removeItem('table')
		super.terminate()
	}
}
