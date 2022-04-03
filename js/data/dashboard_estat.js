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
			? 'このサービスは、統計ダッシュボードのAPI機能を使用していますが、サービスの内容は国によって保証されたものではありません。'
			: 'This service uses the API feature of Statistics Dashboard, but the contents of this service are not guaranteed by the Statistics Bureau of Japan.',
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
		availTask: ['RG', 'SM', 'TP', 'CP'],
	},
	'Employed persons': {
		indicatorCode: ['0301010000010010010', '0301010000020010010', '0301010000030010010'],
		columnKeys: ['indicator'],
		indexKeys: ['time'],
		filter: {
			cycle: ['Month', '月'],
		},
		availTask: ['RG', 'SM', 'TP', 'CP'],
	},
}

const lockKeys = {}

export default class EStatData extends JSONData {
	constructor(manager) {
		super(manager)
		this._name = 'Nikkei Indexes'
		this._columns = []
		this._availTask = []

		const elm = this.setting.data.configElement
		const flexelm = elm.append('div').style('display', 'flex').style('justify-content', 'space-between')
		flexelm
			.append('span')
			.text('Name')
			.append('select')
			.attr('name', 'name')
			.on('change', () => {
				this._name = elm.select('[name=name]').property('value')
				this._readyData()
				this.setting.vue.pushHistory()
			})
			.selectAll('option')
			.data(Object.keys(datasetInfos))
			.enter()
			.append('option')
			.attr('value', d => d)
			.text(d => datasetInfos[d].caption || d)
		flexelm
			.append('span')
			.append('a')
			.attr('href', resources.link)
			.attr('ref', 'noreferrer noopener')
			.attr('target', '_blank')
			.text(resources.text)
		elm.append('span').text(resources.credit).style('font-size', '80%')
		this._outSelector = elm.append('div')
		this._readyData()
	}

	get availTask() {
		return this._availTask
	}

	get columnNames() {
		if (this._target >= 0) {
			const c = this._columns.concat()
			c.splice(this._target, 1)
			return c
		}
		return this._columns
	}

	get x() {
		if (this._target >= 0) {
			return this._x.map(v => {
				const c = v.concat()
				c.splice(this._target, 1)
				return c
			})
		}
		return this._x
	}

	get y() {
		if (this._target >= 0) {
			return this._x.map(v => v[this._target])
		}
		return Array(this._x.length).fill(0)
	}

	get params() {
		return { dataname: this._name }
	}

	set params(params) {
		if (params.dataname && Object.keys(datasetInfos).indexOf(params.dataname) >= 0) {
			const elm = this.setting.data.configElement
			this._name = params.dataname
			elm.select('[name=name]').property('value', params.dataname)
			this._readyData()
		}
	}

	async _getData(indicatorCode) {
		const params = {
			Lang: lang === 'JP' ? 'JP' : 'EN',
			IndicatorCode: indicatorCode,
			IsSeasonalAdjustment: 1,
			MetaGetFlg: 'Y',
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
				return new Promise(resolve => lockKeys[lockKey].push(resolve))
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
		const info = datasetInfos[this._name]

		this._availTask = info.availTask
		this._outSelector.selectAll('*').remove()

		const data = await this._getData(info.indicatorCode)
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
						accept &&= condition.indexOf(name) >= 0
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

			if (columns.indexOf(column) < 0) {
				columns.push(column)
			}
		}
		this._columns = columns
		this._target = columns.length === 1 ? -1 : this._columns.length - 1

		const keys = Object.keys(seldata)
		keys.sort()
		this._index = keys

		this.setJSON(
			keys.map(k => seldata[k]),
			columns.map(c => ({ name: c, nan: 0 }))
		)

		if (columns.length > 1) {
			const slct = this._outSelector
				.append('span')
				.text('Output')
				.append('select')
				.attr('name', 'target')
				.on('change', () => {
					const target = this._outSelector.select('[name=target]').property('value')
					this._target = this._columns.indexOf(target)
					this._domain = null
					this._manager.onReady(() => {
						this._manager.platform.init()
					})
				})
			slct.selectAll('option')
				.data(['', ...this._columns])
				.enter()
				.append('option')
				.attr('value', d => d)
				.text(d => d)
			slct.property('value', this._columns[this._target])
		}
		this.setting.ml.refresh()
		this.setting.vue.$forceUpdate()
	}
}

const DB_NAME = 'dashboard.e-stat.go.jp'

class EStatDB {
	constructor() {
		this.db = null
	}

	async _ready() {
		if (this.db) {
			return
		}
		const request = indexedDB.open(DB_NAME, 1)
		return new Promise((resolve, reject) => {
			request.onerror = reject
			request.onsuccess = () => {
				this.db = request.result
				resolve()
			}
			request.onupgradeneeded = e => {
				const db = e.target.result

				db.createObjectStore('data', { keyPath: 'GET_STATS.PARAMETER.indicatorCode' })
			}
		})
	}

	async save(name, datas) {
		await this._ready()
		return new Promise((resolve, reject) => {
			const transaction = this.db.transaction([name], 'readwrite')
			const objectStore = transaction.objectStore(name)
			if (!Array.isArray(datas)) {
				datas = [datas]
			}
			for (const data of datas) {
				objectStore.put(data)
			}

			transaction.oncomplete = resolve
			transaction.onerror = reject
		})
	}

	async get(name, key) {
		await this._ready()
		return new Promise((resolve, reject) => {
			const objectStore = this.db.transaction(name).objectStore(name)
			const request = objectStore.get(key)
			request.onsuccess = e => {
				resolve(e.target.result)
			}
			request.onerror = reject
		})
	}

	async list(name) {
		await this._ready()
		return new Promise((resolve, reject) => {
			const objectStore = this.db.transaction(name).objectStore(name)
			const request = objectStore.getAll()
			request.onsuccess = e => {
				resolve(e.target.result)
			}
			request.onerror = reject
		})
	}

	async deleteDatabase() {
		return new Promise((resolve, reject) => {
			const request = indexedDB.deleteDatabase(DB_NAME)
			request.onerror = reject
			request.onsuccess = () => {
				this.db = null
				resolve()
			}
		})
	}
}
