import BaseDB from './db/base.js'
import JSONData from './json.js'

const BASE_URL = 'https://dashboard.e-stat.go.jp/api/1.0'
const ExpiredTime = 1000 * 60 * 60 * 24 * 30

const lang = (() => {
	switch ((window.navigator.languages && window.navigator.languages[0]) || window.navigator.language) {
		case 'ja-JP':
		case 'ja':
			return 'JP'
		default:
			return 'EN'
	}
})()
const resources = {
	link: lang === 'JP' ? 'https://dashboard.e-stat.go.jp/' : 'https://dashboard.e-stat.go.jp/en/',
	text: lang === 'JP' ? '統計ダッシュボード' : 'Statistics Dashboard',
	credit:
		lang === 'JP'
			? 'このサービスは、統計ダッシュボードのAPI機能を使用していますが、サービスの内容は国によって保証されたものではありません。また、データの加工を行っております。'
			: 'This service uses the API feature of Statistics Dashboard, but the contents of this service are not guaranteed by the Statistics Bureau of Japan. In addition, the data is processed.',
}

// https://dashboard.e-stat.go.jp/
const datasetInfos = {
	'Nikkei Indexes': {
		indicatorCode: ['0702020501000010010'],
		columnKeys: ['indicator'],
		indexKeys: ['time'],
		availTask: ['SM', 'TP', 'CP'],
	},
	'Number of entries/departures': {
		indicatorCode: ['0204030001000010010', '0204040001000010010'],
		columnKeys: ['indicator'],
		indexKeys: ['time'],
		filter: {
			cycle: ['Month', '月'],
		},
		availTask: ['RG', 'AD', 'SM', 'TP', 'CP'],
	},
	'Employed persons': {
		indicatorCode: ['0301010000010010010', '0301010000020010010', '0301010000030010010'],
		columnKeys: ['indicator'],
		indexKeys: ['time'],
		filter: {
			cycle: ['Month', '月'],
		},
		availTask: ['RG', 'AD', 'SM', 'TP', 'CP'],
	},
	'Number of schools': {
		indicatorCode: [
			'1201010100000010000',
			'1201010300000010000',
			'1201010400000010000',
			'1201010500000010000',
			'1201010800000010000',
		],
		columnKeys: ['indicator'],
		indexKeys: ['time'],
		query: { RegionLevel: 2 },
		availTask: ['RG', 'AD', 'SM', 'TP', 'CP'],
	},
	Garbage: {
		indicatorCode: ['1405050100000010010', '1405050300000010010', '1405050800000020010', '1405050900000010010'],
		columnKeys: ['indicator'],
		indexKeys: ['time'],
		query: { RegionLevel: 2 },
		availTask: ['RG', 'AD', 'SM', 'TP', 'CP'],
	},
}

const lockKeys = {}

export default class EStatData extends JSONData {
	constructor(manager) {
		super(manager)
		this._name = 'Nikkei Indexes'
		this._columns = []
		this._shift = []
		this._scale = []
		this._object = []
		this._target = -1

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
		dataslctelm.append('Name', datanames)

		const aelm = document.createElement('a')
		flexelm.appendChild(aelm)
		aelm.href = resources.link
		aelm.setAttribute('ref', 'noreferrer noopener')
		aelm.target = '_blank'
		aelm.innerText = resources.text

		const credit = document.createElement('span')
		credit.innerText = resources.credit
		credit.style.fontSize = '80%'
		elm.appendChild(credit)
		this._selector = document.createElement('div')
		elm.appendChild(this._selector)
		this._readyData()
	}

	get availTask() {
		return datasetInfos[this._name]?.availTask || []
	}

	get columnNames() {
		return this._object.map(i => this._columns[i])
	}

	get originalX() {
		return this._x.map(v => this._object.map(i => v[i]))
	}

	get x() {
		this._readyScaledData()
		return this._x.map(v => {
			const c = v.map((a, d) => (a - this._shift[d]) / this._scale[d])
			return this._object.map(i => c[i])
		})
	}

	get originalY() {
		if (this._target >= 0) {
			return this._x.map(v => v[this._target])
		}
		return Array(this._x.length).fill(0)
	}

	get y() {
		this._readyScaledData()
		if (this._target >= 0) {
			return this._x.map(v => (v[this._target] - this._shift[this._target]) / this._scale[this._target])
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
			const rmin = 1
			for (let d = 0; d < min.length; d++) {
				if (min[d] === max[d]) {
					max[d] = min[d] + 1
				}
				this._scale[d] = (max[d] - min[d]) / (rmax - rmin)
				this._shift[d] = min[d] - rmin * this._scale[d]
			}
		}
	}

	async _getMeta() {
		const func = 'Indicator'
		const metaKey = `GET_META_${func.toUpperCase()}_INF`
		const params = {
			Lang: lang === 'JP' ? 'JP' : 'EN',
		}

		const db = new EStatDB()
		const storedData = await db.get('meta', func)
		if (
			!storedData ||
			+storedData[metaKey].RESULT.status >= 100 ||
			new Date() - storedData.fetchDate > ExpiredTime
		) {
			const lockKey = func
			if (lockKeys[lockKey]) {
				return new Promise(resolve => {
					if (!lockKeys[lockKey]) {
						resolve(db.get('meta', func))
					} else {
						lockKeys[lockKey].push(resolve)
					}
				})
			}
			const url = `${BASE_URL}/Json/get${func}Info?${new URLSearchParams(params)}`
			console.debug(`Fetch to ${url}`)
			lockKeys[lockKey] = []
			const res = await fetch(url)
			const data = await res.json()
			const status = +data[metaKey].RESULT.status
			if (status >= 100) {
				console.error(data[metaKey].RESULT)
			}
			data.function = func
			data.fetchDate = new Date()
			await db.save('meta', data)
			for (const res of lockKeys[lockKey]) {
				res(data)
			}
			lockKeys[lockKey] = undefined
			return data
		}
		return storedData
	}

	async _getData(indicatorCode, query) {
		const params = {
			Lang: lang === 'JP' ? 'JP' : 'EN',
			IndicatorCode: indicatorCode,
			IsSeasonalAdjustment: 1,
			MetaGetFlg: 'Y',
			...query,
		}

		const db = new EStatDB()
		const storedData = await db.get('data', indicatorCode)
		if (
			!storedData ||
			+storedData.GET_STATS.RESULT.status >= 100 ||
			new Date() - storedData.fetchDate > ExpiredTime
		) {
			const lockKey = indicatorCode.join(',')
			if (lockKeys[lockKey]) {
				return new Promise(resolve => {
					if (!lockKeys[lockKey]) {
						resolve(db.get('data', indicatorCode))
					} else {
						lockKeys[lockKey].push(resolve)
					}
				})
			}
			const url = `${BASE_URL}/Json/getData?${new URLSearchParams(params)}`
			console.debug(`Fetch to ${url}`)
			lockKeys[lockKey] = []
			const res = await fetch(url)
			const data = await res.json()
			const status = +data.GET_STATS.RESULT.status
			if (status >= 100) {
				console.error(data.GET_STATS.RESULT)
			}
			data.fetchDate = new Date()
			await db.save('data', data)
			for (const res of lockKeys[lockKey]) {
				res(data)
			}
			lockKeys[lockKey] = undefined
			return data
		}
		return storedData
	}

	async _readyData() {
		this._x = []
		this._shift = []
		this._scale = []
		this._index = null
		this._manager.platform?.init()

		const info = datasetInfos[this._name]

		const loader = document.createElement('div')
		loader.classList.add('loader')
		this._selector.replaceChildren(loader)

		const targetName = this._name
		const data = await this._getData(info.indicatorCode, info.query)
		if (this._name !== targetName) {
			return
		}
		const dataobj = data.GET_STATS.STATISTICAL_DATA.DATA_INF.DATA_OBJ
		const classobj = data.GET_STATS.STATISTICAL_DATA.CLASS_INF.CLASS_OBJ

		const classnameobj = {}
		for (const cobj of classobj) {
			classnameobj[cobj['@id']] = cobj
		}
		const getNameFromCobj = (cobj, code) => {
			for (const cls of cobj.CLASS) {
				if (cls['@code'] === code) {
					return cls['$'] || cls['@name']
				}
			}
		}

		const columnClass = info.columnKeys.map(k => classnameobj[k])
		const indexClass = info.indexKeys.map(k => classnameobj[k])

		const seldata = {}
		const columns = []
		for (let i = 0; i < dataobj.length; i++) {
			const value = dataobj[i].VALUE

			if (info.filter) {
				let accept = true
				for (const filterKey of Object.keys(info.filter)) {
					const filterClass = classnameobj[filterKey]
					const id = value[`@${filterClass['@id']}`]

					const name = getNameFromCobj(filterClass, id)
					const condition = info.filter[filterKey]
					if (typeof condition === 'string') {
						accept &&= name === condition
					} else if (Array.isArray(condition)) {
						accept &&= condition.includes(name)
					} else {
						throw new Error('Invalid condition')
					}
				}
				if (!accept) {
					continue
				}
			}

			const key = indexClass.map(ic => value[`@${ic['@id']}`]).join('_')
			const column = columnClass.map(cc => getNameFromCobj(cc, value[`@${cc['@id']}`])).join('_')

			if (!seldata[key]) {
				seldata[key] = {}
			}
			seldata[key][column] = value['$']

			if (!columns.includes(column)) {
				columns.push(column)
			}
		}
		this._columns = columns
		this._object = []
		for (let i = 0; i < Math.max(1, columns.length - 1); i++) {
			this._object.push(i)
		}
		this._target = columns.length === 1 ? -1 : this._columns.length - 1

		const keys = Object.keys(seldata)
		keys.sort()
		this._index = keys

		this.setJSON(
			keys.map(k => seldata[k]),
			columns.map(c => ({ name: c, nan: 0 }))
		)
		this._readySelector()
		this.setting.ml.refresh()
		this.setting.$forceUpdate()
	}

	_readySelector() {
		this._selector.replaceChildren()
		if (this._columns.length > 1) {
			const islct = document.createElement('select')
			islct.multiple = true
			islct.onchange = () => {
				this._object = []
				let unslctval = ''
				let oreset = false
				for (const opt of islct.options) {
					if (opt.selected) {
						this._object.push(this._columns.indexOf(opt.value))
						if (opt.value === oslct.value) {
							oreset = true
						}
					} else if (!unslctval) {
						unslctval = opt.value
					}
				}
				if (oreset) {
					this._target = this._columns.indexOf(unslctval)
					oslct.value = unslctval
				}
				this._domain = null
				this._manager.onReady(() => {
					this._manager.platform.init()
				})
			}
			this._selector.append('Input', islct)
			const oslct = document.createElement('select')
			oslct.onchange = () => {
				let hasislct = false
				for (const opt of islct.selectedOptions) {
					if (opt.value === oslct.value) {
						opt.selected = false
						this._object = this._object.filter(i => this._columns[i] !== opt.value)
						hasislct = true
						break
					}
				}
				if (hasislct || (oslct.value === '' && this._target >= 0)) {
					for (const opt of islct.options) {
						if (opt.value === this._columns[this._target]) {
							opt.selected = true
							this._object.push(this._target)
						}
					}
				}
				this._target = this._columns.indexOf(oslct.value)
				this._domain = null
				this._manager.onReady(() => {
					this._manager.platform.init()
				})
			}
			this._selector.append('Output', oslct)

			oslct.appendChild(document.createElement('option'))
			for (const column of this._columns) {
				const opt = document.createElement('option')
				opt.value = opt.innerText = column
				islct.appendChild(opt)
				oslct.appendChild(opt.cloneNode(true))
			}
			islct.size = Math.min(4, islct.options.length)
			for (let i = 0; i < this._columns.length - 1; i++) {
				islct.options[i].selected = this._object.includes(i)
			}
			oslct.value = this._columns[this._target]
		}
	}
}

const DB_NAME = 'dashboard.e-stat.go.jp'

class EStatDB extends BaseDB {
	constructor() {
		super(DB_NAME, 2)
	}

	onupgradeneeded(e) {
		const db = e.target.result

		db.createObjectStore('meta', { keyPath: 'function' })
		if (e.oldVersion < 1) {
			db.createObjectStore('data', { keyPath: 'GET_STATS.PARAMETER.indicatorCode' })
		}
	}
}
