import BaseDB from './db/base.js'
import { FixData } from './base.js'
import IOSelector from './util/ioselector.js'

const BASE_URL = 'https://ec.europa.eu/eurostat/api/dissemination'
const ExpiredTime = 1000 * 60 * 60 * 24 * 30

// https://ec.europa.eu/eurostat
const datasetInfos = {
	'Population and employment': {
		datasetCode: 'nama_10_pe',
		query: {},
		filter: { geo: ['FR'], unit: ['THS_PER'] },
	},
	'Agricultural labour input statistics': {
		datasetCode: 'aact_ali01',
		query: {},
		filter: { geo: ['FR'] },
	},
	'GDP and main components': {
		datasetCode: 'namq_10_gdp',
		query: { unit: 'CLV_PCH_PRE', s_adj: 'SCA' },
		filter: { na_item: ['B1GQ'], geo: ['DE', 'ES', 'FR', 'IT'] },
	},
}

const lockKeys = {}

export default class EurostatData extends FixData {
	constructor(manager) {
		super(manager)
		this._name = 'Population and employment'
		this._shift = []
		this._scale = []
		this._scaled = true
		this._filterItems = null
		this._lastRequested = 0

		const elm = this.setting.data.configElement
		const flexelm = document.createElement('div')
		flexelm.style.display = 'flex'
		flexelm.style.justifyContent = 'space-between'
		elm.appendChild(flexelm)

		const dataslctelm = document.createElement('span')
		flexelm.appendChild(dataslctelm)
		const datanames = document.createElement('select')
		datanames.name = 'name'
		datanames.onchange = () => {
			this._filterItems = null
			this._name = datanames.value
			this._readyData()
			this.setting.pushHistory()
		}
		for (const d of Object.keys(datasetInfos)) {
			const opt = document.createElement('option')
			opt.value = d
			opt.innerText = datasetInfos[d].caption || d
			datanames.appendChild(opt)
		}
		datanames.value = this._name
		dataslctelm.append('Name', datanames)

		const aelm = document.createElement('a')
		flexelm.appendChild(aelm)
		aelm.href = 'https://ec.europa.eu/eurostat'
		aelm.setAttribute('ref', 'noreferrer noopener')
		aelm.target = '_blank'
		aelm.innerText = 'Eurostat'

		this._filter = document.createElement('div')
		this._filter.classList.add('sub-menu')
		elm.appendChild(this._filter)

		const credit = document.createElement('span')
		credit.innerText = 'This service uses the API feature of Eurostat. In addition, the data is processed.'
		credit.style.fontSize = '80%'
		elm.appendChild(credit)

		this._selector = new IOSelector(elm)
		this._selector.onchange = () => {
			this._domain = null
			this._manager.onReady(() => {
				this._manager.platform.init()
			})
		}

		this._loader = document.createElement('div')
		elm.appendChild(this._loader)

		const optionalElm = document.createElement('div')
		const scaledCheckbox = document.createElement('input')
		scaledCheckbox.type = 'checkbox'
		scaledCheckbox.checked = true
		scaledCheckbox.onchange = () => {
			this._scaled = scaledCheckbox.checked
			this._readyData()
		}
		optionalElm.append('Scale', scaledCheckbox)
		elm.appendChild(optionalElm)

		this._readyData()
	}

	get availTask() {
		return ['RG', 'AD', 'SM', 'TP', 'CP']
	}

	get _requireDateInput() {
		return this._selector.object.length === 0 && this._datetime && ['', 'RG', 'AD'].includes(this._manager.task)
	}

	get columnNames() {
		if (this._requireDateInput) {
			return ['date']
		}
		return this._selector.objectNames
	}

	get originalX() {
		if (this._requireDateInput) {
			return this._datetime.map(v => [v])
		}
		return this._x.map(v => this._selector.object.map(i => v[i]))
	}

	get x() {
		if (!this._scaled) return this.originalX
		if (this._requireDateInput) {
			return this._datetime.map(v => [v])
		}
		this._readyScaledData()
		return this._x.map(v => {
			const c = v.map((a, d) => (a - this._shift[d]) / this._scale[d])
			return this._selector.object.map(i => c[i])
		})
	}

	get originalY() {
		if (this._selector.target >= 0) {
			return this._x.map(v => v[this._selector.target])
		}
		return Array(this._x.length).fill(0)
	}

	get y() {
		if (!this._scaled) return this.originalY
		this._readyScaledData()
		const target = this._selector.target
		if (target >= 0) {
			return this._x.map(v => (v[target] - this._shift[target]) / this._scale[target])
		}
		return Array(this._x.length).fill(0)
	}

	get params() {
		return { dataname: this._name }
	}

	set params(params) {
		if (params.dataname && Object.keys(datasetInfos).includes(params.dataname)) {
			const elm = this.setting.data.configElement
			this._name = params.dataname
			elm.querySelector('[name=name]').value = params.dataname
			this._readyData()
		}
	}

	_readyScaledData() {
		if (this._scale.length > 0) {
			return
		}
		this._shift = []
		this._scale = []
		if (this._x.length > 0) {
			const min = Array(this._x[0].length).fill(Infinity)
			const max = Array(this._x[0].length).fill(-Infinity)
			for (let i = 0; i < this._x.length; i++) {
				for (let d = 0; d < this._x[i].length; d++) {
					min[d] = Math.min(min[d], this._x[i][d])
					max[d] = Math.max(max[d], this._x[i][d])
				}
			}
			const rmax = 10
			const rmin = 0
			for (let d = 0; d < min.length; d++) {
				if (min[d] === max[d]) {
					max[d] = min[d] + 1
				}
				this._scale[d] = (max[d] - min[d]) / (rmax - rmin)
				this._shift[d] = min[d] - rmin * this._scale[d]
			}
		}
	}

	async _getData(datasetCode, query) {
		const params = {
			format: 'JSON',
			lang: 'EN',
			...query,
		}
		const paramstr = datasetCode + '?' + new URLSearchParams(params).toString()

		const db = new EurostatDB()
		const storedData = await db.get('data', paramstr)
		if (!storedData || (storedData.error?.length ?? 0) > 0 || new Date() - storedData.fetchDate > ExpiredTime) {
			if (lockKeys[datasetCode]) {
				return new Promise(resolve => {
					if (!lockKeys[datasetCode]) {
						resolve(db.get('data', paramstr))
					} else {
						lockKeys[datasetCode].push(resolve)
					}
				})
			}
			while (new Date() - this._lastRequested < 2000) {
				await new Promise(resolve => setTimeout(resolve, 500))
			}
			this._lastRequested = new Date()
			const url = `${BASE_URL}/statistics/1.0/data/${paramstr}`
			console.debug(`Fetch to ${url}`)
			lockKeys[datasetCode] = []
			const res = await fetch(url)
			const data = await res.json()
			if ((data.error?.length ?? 0) > 0) {
				console.error(data.error)
			}
			data.fetchDate = new Date()
			data.params = paramstr
			await db.save('data', data)
			for (const res of lockKeys[datasetCode]) {
				res(data)
			}
			lockKeys[datasetCode] = undefined
			return data
		}
		return storedData
	}

	async _readyData() {
		this._x = []
		this._shift = []
		this._scale = []
		this._index = null
		this._datetime = null
		this._manager.platform?.init()

		const info = datasetInfos[this._name]
		const datasetCode = info.datasetCode

		this._loader.classList.add('loader')

		const targetName = this._name
		const data = await this._getData(datasetCode, info.query)
		this._loader.classList.remove('loader')
		if (this._name !== targetName) {
			return
		}
		if (!this._filterItems) {
			this._readyFilter(data, info.filter)
		}

		const categories = {}
		for (let i = 0; i < data.id.length; i++) {
			categories[data.id[i]] = []
			const category = data.dimension[data.id[i]].category
			for (const key of Object.keys(category.index)) {
				categories[data.id[i]][category.index[key]] = {
					key,
					label: category.label[key],
				}
			}
		}

		const columns = []
		this._index = []
		this._x = []
		const pos = Array(data.id.length).fill(0)
		do {
			let p = 0
			let index = null
			let column = ''

			let isExclude = false
			for (let i = 0; i < pos.length; i++) {
				const fi = this._filterItems[data.id[i]] ?? []
				if (fi.length > 0 && !fi.includes(categories[data.id[i]][pos[i]].key)) {
					isExclude = true
					break
				}
				p = p * data.size[i] + pos[i]
				if (data.id[i] === 'time') {
					index = categories[data.id[i]][pos[i]].label
				} else if (data.size[i] > 1 && fi.length !== 1) {
					column += (column.length > 0 ? ' / ' : '') + categories[data.id[i]][pos[i]].label
				}
			}
			if (!isExclude) {
				if (!columns.includes(column)) {
					columns.push(column)
				}
				const col = columns.indexOf(column)
				if (!this._index.includes(index)) {
					this._index.push(index)
				}
				const row = this._index.indexOf(index)
				if (!this._x[row]) {
					this._x[row] = []
				}
				this._x[row][col] = data.value[p]
			}

			for (let i = 0; i < pos.length; i++) {
				pos[i]++
				if (pos[i] < data.size[i]) {
					break
				}
				pos[i] = 0
			}
		} while (pos.some(v => v > 0))

		for (let i = this._x.length - 1; i >= 0; i--) {
			if (this._x[i].some(v => v === undefined)) {
				this._x.splice(i, 1)
				this._index.splice(i, 1)
			}
		}
		this._selector.columns = columns
		const object = []
		for (let i = 0; i < columns.length - 1; i++) {
			object.push(i)
		}
		this._selector.object = object
		this._selector.target = columns.length - 1
		this._datetime = this._index.map(v => {
			if (v.match(/^[0-9]{4}-Q[1-4]$/)) {
				return +v.slice(0, 4) * 4 + +v.slice(6, 7)
			}
			return +v
		})
		this._domain = null
		this.setting.ml.refresh()
		this.setting.$forceUpdate()
	}

	_readyFilter(data, init = {}) {
		this._filterItems = {}
		this._filter.replaceChildren()
		if (data.id.length > 0) {
			this._filter.append('Dimensions')
		}
		for (let i = 0; i < data.id.length; i++) {
			if (data.id[i] === 'time' || data.size[i] === 1) {
				continue
			}
			this._filterItems[data.id[i]] = []
			const info = data.dimension[data.id[i]]

			const elm = this._filter.appendChild(document.createElement('details'))

			const summary = elm.appendChild(document.createElement('summary'))
			summary.innerText = info.label
			summary.style.fontSize = '80%'

			const selectCount = document.createTextNode(`${init[data.id[i]]?.length || data.size[i]}`)
			summary.append(info.label + ' (', selectCount, ` / ${data.size[i]})`)

			const select = elm.appendChild(document.createElement('select'))
			select.multiple = true
			const categories = []
			const category = info.category
			for (const key of Object.keys(category.index)) {
				categories[category.index[key]] = {
					key,
					label: category.label[key],
				}
			}
			select.size = Math.min(4, categories.length)
			if (categories.length <= 4) {
				select.style.overflowY = 'hidden'
			}
			for (let k = 0; k < categories.length; k++) {
				const opt = document.createElement('option')
				opt.value = categories[k].key
				if (categories[k].label.length > 50) {
					opt.title = categories[k].label
					opt.innerText = categories[k].label.slice(0, 50) + '...'
				} else {
					opt.innerText = categories[k].label
				}
				if (init[data.id[i]]?.includes(categories[k].key)) {
					opt.selected = true
					this._filterItems[data.id[i]].push(categories[k].key)
				}
				select.append(opt)
			}
			select.onchange = () => {
				const items = (this._filterItems[data.id[i]] = [])
				for (const item of select.selectedOptions) {
					items.push(item.value)
				}
				selectCount.nodeValue = `${items.length || data.size[i]}`
				this._readyData()
			}
		}
	}
}

const DB_NAME = 'ec.europa.eu'

class EurostatDB extends BaseDB {
	constructor() {
		super(DB_NAME, 1)
	}

	onupgradeneeded(e) {
		const db = e.target.result

		db.createObjectStore('data', { keyPath: 'params' })
	}
}
