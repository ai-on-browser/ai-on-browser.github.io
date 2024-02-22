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
	Manual: {
		indicatorCode: [],
		columnKeys: ['indicator'],
		indexKeys: ['time'],
		query: {},
		dropna: true,
		availTask: ['RG', 'AD', 'SM', 'TP', 'CP'],
	},
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
		this._scaled = true
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
			this._name = datanames.value
			this._indicatorSelector.style.display = this._name === 'Manual' ? 'flex' : 'none'
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
		aelm.href = resources.link
		aelm.setAttribute('ref', 'noreferrer noopener')
		aelm.target = '_blank'
		aelm.innerText = resources.text

		this._indicatorSelector = document.createElement('div')
		elm.appendChild(this._indicatorSelector)
		this._initManualIndicatorSelector()

		const credit = document.createElement('span')
		credit.innerText = resources.credit
		credit.style.fontSize = '80%'
		elm.appendChild(credit)
		this._selector = document.createElement('div')
		elm.appendChild(this._selector)

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
		return datasetInfos[this._name]?.availTask || []
	}

	get columnNames() {
		if (this._object.length === 0 && this._datetime) {
			return ['date']
		}
		return this._object.map(i => this._columns[i])
	}

	get originalX() {
		if (this._object.length === 0 && this._datetime) {
			return this._datetime.map(v => [v])
		}
		return this._x.map(v => this._object.map(i => v[i]))
	}

	get x() {
		if (!this._scaled) return this.originalX
		if (this._object.length === 0 && this._datetime) {
			return this._datetime.map(v => [v])
		}
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
		if (!this._scaled) return this.originalY
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
			if (params.dataname !== 'Manual') {
				this._readyData()
			}
		}
	}

	_initManualIndicatorSelector() {
		this._indicatorSelector.style.display = 'none'
		this._indicatorSelector.style.alignItems = 'flex-start'
		this._indicatorSelector.classList.add('sub-menu')

		let indicatorMetaInfos = null
		const regionCodeToRank = {}

		const useCodes = document.createElement('select')
		useCodes.multiple = true
		useCodes.size = 5
		useCodes.style.overflowY = 'hidden'
		useCodes.style.minWidth = '100px'

		const modifyElm = document.createElement('span')
		modifyElm.style.margin = 'auto 0'
		const addBtn = document.createElement('button')
		addBtn.innerHTML = '&larr;'
		addBtn.onclick = () => {
			let changed = false
			const usedCodes = datasetInfos.Manual.indicatorCode
			for (const opt of indicatorCodes.selectedOptions) {
				if (usedCodes.length >= 5 || usedCodes.includes(opt.value)) {
					break
				}
				useCodes.appendChild(opt.cloneNode(true))
				usedCodes.push(opt.value)
				changed = true
			}
			if (changed) {
				filterIndicatorCodes()
				this._readyData()
			}
		}
		const remBtn = document.createElement('button')
		remBtn.innerHTML = '&rarr;'
		remBtn.onclick = () => {
			let changed = false
			for (let i = useCodes.options.length - 1; i >= 0; i--) {
				const opt = useCodes.options.item(i)
				if (opt.selected) {
					opt.remove()
					changed = true
				}
			}
			datasetInfos.Manual.indicatorCode = []
			for (const opt of useCodes.options) {
				datasetInfos.Manual.indicatorCode.push(opt.value)
			}
			if (changed) {
				filterIndicatorCodes()
				this._readyData()
			}
		}
		modifyElm.append(addBtn, document.createElement('br'), remBtn)

		const indicatorList = document.createElement('span')
		const category = document.createElement('select')
		category.onchange = () => filterIndicatorCodes()
		const cycle = document.createElement('select')
		cycle.onchange = () => {
			datasetInfos.Manual.query.Cycle = cycle.value
			filterIndicatorCodes()
			this._readyData()
		}
		const region = document.createElement('select')
		region.onchange = () => {
			datasetInfos.Manual.query.RegionCode = region.value
			filterIndicatorCodes()
			this._readyData()
		}

		const indicatorCodes = document.createElement('select')
		indicatorCodes.multiple = true
		const filterIndicatorCodes = () => {
			indicatorCodes.replaceChildren()
			const usedCodes = datasetInfos.Manual.indicatorCode
			for (const indicator of indicatorMetaInfos) {
				if (!indicator['@code'].startsWith(category.value)) {
					continue
				}
				if (
					indicator.CLASS.every(
						c =>
							c.cycle['@code'] !== cycle.value ||
							c.RegionalRank['@code'] !== regionCodeToRank[region.value]
					)
				) {
					continue
				}
				const opt = indicatorCodes.appendChild(document.createElement('option'))
				opt.value = indicator['@code']
				opt.innerText = indicator['@name']
				opt.disabled = usedCodes.includes(indicator['@code'])
			}
		}
		indicatorList.append('Filter', category, cycle, region, document.createElement('br'), indicatorCodes)
		this._indicatorSelector.append('Indicator ', useCodes, modifyElm, indicatorList)

		const dictToOptions = (dict, elm) => {
			const keys = Object.keys(dict)
			keys.sort((a, b) => a - b)
			for (const code of keys) {
				const opt = elm.appendChild(document.createElement('option'))
				opt.value = code
				opt.innerText = dict[code]
			}
		}

		Promise.all(['Indicator', 'Term', 'Region'].map(func => this._getMeta(func))).then(
			([indinfo, terminfo, regioninfo]) => {
				indicatorMetaInfos = indinfo.GET_META_INDICATOR_INF.METADATA_INF.CLASS_INF.CLASS_OBJ
				const cycles = {}
				for (const ind of indicatorMetaInfos) {
					for (const cls of ind.CLASS) {
						if (!cycles[cls.cycle['@code']]) {
							cycles[cls.cycle['@code']] = cls.cycle['@name']
						}
					}
				}
				dictToOptions(cycles, cycle)
				cycle.value = 3
				datasetInfos.Manual.query.Cycle = 3

				const categories = {}
				const terms = terminfo.GET_META_TERM_INFO.METADATA_INF.CLASS_INF.CLASS_OBJ.CLASS
				for (const term of terms) {
					if (!categories[term['@code'].slice(0, 4)]) {
						categories[term['@code'].slice(0, 4)] = term['@category']
					}
				}
				dictToOptions(categories, category)

				const regnames = {}
				const wholeregions = regioninfo.GET_META_REGION_INF.METADATA_INF.CLASS_INF.CLASS_OBJ
				const rootregions = wholeregions.find(r => r['@parentRegionCode'].length === 0)
				let zenkokuCode = null
				for (const re of rootregions.CLASS) {
					if (re['@level'] === '2') {
						regnames[re['@regionCode']] = re['@name']
						zenkokuCode = re['@regionCode']
						regionCodeToRank[re['@regionCode']] = re['@level']
					}
				}
				const prefregions = wholeregions.find(r => r['@parentRegionCode'] === zenkokuCode)
				for (const re of prefregions.CLASS) {
					if (re['@level'] === '3') {
						regnames[re['@regionCode']] = re['@name']
						regionCodeToRank[re['@regionCode']] = re['@level']
					}
				}
				dictToOptions(regnames, region)
				region.value = zenkokuCode
				datasetInfos.Manual.query.RegionCode = zenkokuCode

				filterIndicatorCodes()
				const elm = this.setting.data.configElement
				if (elm.querySelector('[name=name]').value === 'Manual') {
					this._indicatorSelector.style.display = 'flex'
					this._readyData()
				}
			}
		)
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

	async _getMeta(func) {
		const keySuffix = func.toUpperCase() === 'INDICATOR' || func.toUpperCase() === 'REGION' ? 'INF' : 'INFO'
		const metaKey = `GET_META_${func.toUpperCase()}_${keySuffix}`
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
		const paramstr = new URLSearchParams(params).toString()

		const db = new EStatDB()
		const storedData = await db.get('data', paramstr)
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
			while (new Date() - this._lastRequested < 2000) {
				await new Promise(resolve => setTimeout(resolve, 500))
			}
			this._lastRequested = new Date()
			const url = `${BASE_URL}/Json/getData?${paramstr}`
			console.debug(`Fetch to ${url}`)
			lockKeys[lockKey] = []
			const res = await fetch(url)
			const data = await res.json()
			const status = +data.GET_STATS.RESULT.status
			if (status >= 100) {
				console.error(data.GET_STATS.RESULT)
			}
			data.fetchDate = new Date()
			data.params = paramstr
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
		this._columns = []
		this._object = []
		this._index = null
		this._datetime = null
		this._manager.platform?.init()

		const info = datasetInfos[this._name]
		const indicatorCodes = info.indicatorCode.concat()
		if (indicatorCodes.length === 0) {
			this._readySelector()
			this.setting.ml.refresh()
			return
		}

		const loader = document.createElement('div')
		loader.classList.add('loader')
		this._selector.replaceChildren(loader)

		const targetName = this._name
		const queryString = JSON.stringify(info.query)
		const data = await this._getData(indicatorCodes, info.query)
		if (
			this._name !== targetName ||
			indicatorCodes.length != info.indicatorCode.length ||
			indicatorCodes.some((c, i) => c !== info.indicatorCode[i]) ||
			queryString != JSON.stringify(info.query)
		) {
			return
		}
		if (data.GET_STATS.RESULT.status === '1') {
			this._readySelector()
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
		if (info.dropna) {
			for (const key of Object.keys(seldata)) {
				if (Object.keys(seldata[key]).length !== columns.length) {
					delete seldata[key]
				}
			}
		}
		this._columns = columns
		for (let i = 0; i < columns.length - 1; i++) {
			this._object.push(i)
		}
		this._target = this._columns.length - 1

		const keys = Object.keys(seldata)
		keys.sort()
		this._index = keys
		const date = keys.map(k => {
			const r = k.match(/([0-9]{4})([0-9CFQY]{2})00/)
			const year = +r[1]
			const month = r[2] === 'CY' ? 1 : r[2] === 'FY' ? 4 : r[2][1] === 'Q' ? (+r[2][0] - 1) * 3 + 1 : +r[2]
			return { year, month }
		})
		const minyear = date.reduce((y, d) => Math.min(y, d.year), Infinity)
		this._datetime = date.map(d => (d.year - minyear) * 12 + d.month - 1)

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
		super(DB_NAME, 3)
	}

	onupgradeneeded(e) {
		const db = e.target.result

		if (e.oldVersion < 1) {
			db.createObjectStore('meta', { keyPath: 'function' })
			db.createObjectStore('data', { keyPath: 'GET_STATS.PARAMETER.indicatorCode' })
		}
		if (e.oldVersion < 3) {
			db.deleteObjectStore('data')
			db.createObjectStore('data', { keyPath: 'params' })
		}
	}
}
