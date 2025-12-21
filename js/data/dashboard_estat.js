import { FixData } from './base.js'
import BaseDB from './db/base.js'
import JSONLoader from './loader/json.js'
import IOSelector from './util/ioselector.js'

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
const presetInfos = {
	Manual: null,
	'Nikkei Indexes': { indicatorCode: ['0702020501000010010'], region: '00000', cycle: '1' },
	'Number of entries/departures': {
		indicatorCode: ['0204030001000010010', '0204040001000010010'],
		region: '00000',
		cycle: '1',
	},
	'Employed persons': {
		indicatorCode: ['0301010000010010010', '0301010000020010010', '0301010000030010010'],
		region: '00000',
		cycle: '1',
	},
	'Number of schools': {
		indicatorCode: [
			'1201010100000010000',
			'1201010300000010000',
			'1201010400000010000',
			'1201010500000010000',
			'1201010800000010000',
		],
		region: '00000',
		cycle: '3',
	},
	Garbage: {
		indicatorCode: ['1405050100000010010', '1405050300000010010', '1405050800000020010', '1405050900000010010'],
		region: '00000',
		cycle: '4',
	},
}

const lockKeys = {}

export default class EStatData extends FixData {
	constructor(manager) {
		super(manager)
		this._name = 'Nikkei Indexes'
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
			const info = presetInfos[this._name]
			if (info) {
				this._setIndicators(info.indicatorCode, info.cycle, info.region)
			}
			this._readyData()
			this.setting.pushHistory()
		}
		for (const d of Object.keys(presetInfos)) {
			const opt = datanames.appendChild(document.createElement('option'))
			opt.value = opt.innerText = d
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

		const credit = document.createElement('span')
		credit.innerText = resources.credit
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

		this._initIndicatorSelector().then(() => {
			const info = presetInfos[this._name]
			if (info) {
				this._setIndicators(info.indicatorCode, info.cycle, info.region)
			}
			this._readyData()
		})
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
		return this.originalX
	}

	get originalY() {
		const target = this._selector.target
		if (target >= 0) {
			return this._x.map(v => v[target])
		}
		return Array(this._x.length).fill(0)
	}

	get y() {
		return this.originalY
	}

	get params() {
		return { dataname: this._name }
	}

	set params(params) {
		if (params.dataname && Object.keys(presetInfos).includes(params.dataname)) {
			const elm = this.setting.data.configElement
			this._name = params.dataname
			elm.querySelector('[name=name]').value = params.dataname
			if (this._indicatorMetaInfos) {
				this._readyData()
			}
		}
	}

	get indicatorCodes() {
		const elm = this._indicatorSelector.querySelector('select[name=useCodes]')
		const codes = []
		for (const opt of elm.options) {
			codes.push(opt.value)
		}
		return codes
	}

	get cycle() {
		const elm = this._indicatorSelector.querySelector('select[name=cycle]')
		return elm.value
	}

	get region() {
		const elm = this._indicatorSelector.querySelector('select[name=region]')
		return elm.value
	}

	_initIndicatorSelector() {
		this._indicatorSelector.style.display = 'flex'
		this._indicatorSelector.style.alignItems = 'flex-start'

		this._regionCodeToRank = {}

		const useCodes = document.createElement('select')
		useCodes.name = 'useCodes'
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
			const usedCodes = this.indicatorCodes
			for (const opt of indicatorCodes.selectedOptions) {
				if (usedCodes.length >= 5 || usedCodes.includes(opt.value)) {
					break
				}
				useCodes.appendChild(opt.cloneNode(true))
				changed = true
			}
			if (changed) {
				this._filterIndicatorCodes()
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
			if (changed) {
				this._filterIndicatorCodes()
				this._readyData()
			}
		}
		modifyElm.append(addBtn, document.createElement('br'), remBtn)

		const indicatorList = document.createElement('span')
		const category = document.createElement('select')
		category.name = 'category'
		category.onchange = () => this._filterIndicatorCodes()
		const cycle = document.createElement('select')
		cycle.name = 'cycle'
		cycle.onchange = () => {
			this._filterIndicatorCodes()
			this._readyData()
		}
		const region = document.createElement('select')
		region.name = 'region'
		region.onchange = () => {
			this._filterIndicatorCodes()
			this._readyData()
		}

		const indicatorCodes = document.createElement('select')
		indicatorCodes.name = 'unuseCodes'
		indicatorCodes.multiple = true
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

		return Promise.all(['Indicator', 'Term', 'Region'].map(func => this._getMeta(func))).then(
			([indinfo, terminfo, regioninfo]) => {
				this._indicatorMetaInfos = indinfo.GET_META_INDICATOR_INF.METADATA_INF.CLASS_INF.CLASS_OBJ
				const cycles = {}
				for (const ind of this._indicatorMetaInfos) {
					for (const cls of ind.CLASS) {
						if (!cycles[cls.cycle['@code']]) {
							cycles[cls.cycle['@code']] = cls.cycle['@name']
						}
					}
				}
				dictToOptions(cycles, cycle)
				cycle.value = 3

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
						this._regionCodeToRank[re['@regionCode']] = re['@level']
					}
				}
				const prefregions = wholeregions.find(r => r['@parentRegionCode'] === zenkokuCode)
				for (const re of prefregions.CLASS) {
					if (re['@level'] === '3') {
						regnames[re['@regionCode']] = re['@name']
						this._regionCodeToRank[re['@regionCode']] = re['@level']
					}
				}
				dictToOptions(regnames, region)
				region.value = zenkokuCode

				this._filterIndicatorCodes()
				const elm = this.setting.data.configElement
				if (elm.querySelector('[name=name]').value === 'Manual') {
					this._indicatorSelector.style.display = 'flex'
					this._readyData()
				}
			}
		)
	}

	_setIndicators(indicatorCodes, cycle, region) {
		const useCodeElm = this._indicatorSelector.querySelector('select[name=useCodes]')
		useCodeElm.replaceChildren()
		for (const indicator of this._indicatorMetaInfos) {
			if (indicatorCodes.includes(indicator['@code'])) {
				const opt = useCodeElm.appendChild(document.createElement('option'))
				opt.value = indicator['@code']
				opt.innerText = indicator['@name']
			}
		}
		const cycleElm = this._indicatorSelector.querySelector('select[name=cycle]')
		cycleElm.value = cycle
		const regionElm = this._indicatorSelector.querySelector('select[name=region]')
		regionElm.value = region

		this._filterIndicatorCodes(indicatorCodes[0].slice(0, 4))
	}

	_filterIndicatorCodes(category) {
		const categoryElm = this._indicatorSelector.querySelector('select[name=category]')
		if (category) {
			categoryElm.value = category
		}
		category = categoryElm.value
		const cycle = this.cycle
		const regionRank = this._regionCodeToRank[this.region]

		const indicatorCodes = this._indicatorSelector.querySelector('select[name=unuseCodes]')
		indicatorCodes.replaceChildren()
		const usedCodes = this.indicatorCodes
		for (const indicator of this._indicatorMetaInfos) {
			if (!indicator['@code'].startsWith(category)) {
				continue
			}
			if (indicator.CLASS.every(c => c.cycle['@code'] !== cycle || c.RegionalRank['@code'] !== regionRank)) {
				continue
			}
			const opt = indicatorCodes.appendChild(document.createElement('option'))
			opt.value = indicator['@code']
			opt.innerText = indicator['@name']
			opt.disabled = usedCodes.includes(indicator['@code'])
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
		this._index = null
		this._datetime = null
		this._manager.platform?.init()

		const indicatorCodes = this.indicatorCodes
		this._selector.columns = []
		if (indicatorCodes.length === 0) {
			this.setting.ml.refresh()
			return
		}

		this._loader.classList.add('loader')

		const query = { Cycle: this.cycle, RegionCode: this.region }
		const queryString = JSON.stringify(query)
		const data = await this._getData(indicatorCodes, query)
		this._loader.classList.remove('loader')
		if (
			indicatorCodes.length != this.indicatorCodes.length ||
			indicatorCodes.some((c, i) => c !== this.indicatorCodes[i]) ||
			queryString != JSON.stringify({ Cycle: this.cycle, RegionCode: this.region })
		) {
			return
		}
		if (data.GET_STATS.RESULT.status === '1') {
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

		const columnClass = ['indicator'].map(k => classnameobj[k])
		const indexClass = ['time'].map(k => classnameobj[k])

		const seldata = {}
		const columns = []
		for (let i = 0; i < dataobj.length; i++) {
			const value = dataobj[i].VALUE

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

		for (const key of Object.keys(seldata)) {
			if (Object.keys(seldata[key]).length !== columns.length) {
				delete seldata[key]
			}
		}

		this._selector.columns = columns
		const object = []
		for (let i = 0; i < columns.length - 1; i++) {
			object.push(i)
		}
		this._selector.object = object
		this._selector.target = columns.length - 1

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

		const info = columns.map(c => ({ name: c, nan: 0 }))
		const json = new JSONLoader(
			keys.map(k => seldata[k]),
			{ columnInfos: info }
		)
		this.setArray(json.data, info)
		this.setting.ml.refresh()
		this.setting.$forceUpdate()
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
