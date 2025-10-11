import BaseDB from './db/base.js'
import { FixData } from './base.js'
import IOSelector from './util/ioselector.js'

const BASE_URL = 'https://ec.europa.eu/eurostat/api/dissemination'
const ExpiredTime = 1000 * 60 * 60 * 24 * 30

// https://ec.europa.eu/eurostat
const datasetInfos = {}
const presetInfos = {
	nama_10_pe: {
		query: {},
		filter: { geo: ['FR'], unit: ['THS_PER'] },
	},
	aact_ali01: {
		query: {},
		filter: { geo: ['FR'] },
	},
	namq_10_gdp: {
		query: { unit: 'CLV_PCH_PRE', s_adj: 'SCA' },
		filter: { na_item: ['B1GQ'], geo: ['DE', 'ES', 'FR', 'IT'] },
	},
}

const lockKeys = {}

export default class EurostatData extends FixData {
	constructor(manager) {
		super(manager)
		this._code = 'nama_10_pe'
		this._filterItems = null
		this._lastRequested = 0
		this._abortController = null

		const elm = this.setting.data.configElement
		const flexelm = document.createElement('div')
		flexelm.style.display = 'flex'
		flexelm.style.justifyContent = 'space-between'
		elm.appendChild(flexelm)

		const dataslctelm = document.createElement('span')
		flexelm.appendChild(dataslctelm)
		const themeelm = document.createElement('select')
		themeelm.name = 'theme'
		themeelm.onchange = () => {
			datanames.replaceChildren()
			this._readyFilter()
			const theme = this._themes.find(t => t.title === themeelm.value)
			for (const subtheme of theme.subtheme) {
				const optgroup = document.createElement('optgroup')
				optgroup.label = subtheme.title
				for (const d of subtheme.children) {
					const opt = document.createElement('option')
					opt.value = d.code
					if (d.title.length <= 100) {
						opt.innerText = d.title
					} else {
						opt.innerText = d.title.slice(0, 100) + '...'
					}
					optgroup.appendChild(opt)
				}
				datanames.appendChild(optgroup)
			}
			this._code = datanames.value = theme.subtheme[0].children[0].code
			this._readyData()
			this.setting.pushHistory()
		}
		const datanames = document.createElement('select')
		datanames.name = 'code'
		datanames.onchange = () => {
			this._readyFilter()
			this._code = datanames.value
			this._readyData()
			this.setting.pushHistory()
		}
		datanames.value = this._code
		dataslctelm.append('Theme', themeelm, 'Name', datanames)

		const aelm = document.createElement('a')
		flexelm.appendChild(aelm)
		aelm.href = 'https://ec.europa.eu/eurostat'
		aelm.setAttribute('ref', 'noreferrer noopener')
		aelm.target = '_blank'
		aelm.innerText = 'Eurostat'

		const loaderArea = document.createElement('div')
		this._loader = document.createElement('span')
		loaderArea.appendChild(this._loader)
		this._progress = document.createElement('span')
		loaderArea.appendChild(this._progress)
		elm.appendChild(loaderArea)

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

		this._readyCatalogue()
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
		if (this._selector.target >= 0) {
			return this._x.map(v => v[this._selector.target])
		}
		return Array(this._x.length).fill(0)
	}

	get y() {
		return this.originalY
	}

	get params() {
		return { datacode: this._code }
	}

	set params(params) {
		if (params.datacode && Object.keys(datasetInfos).includes(params.datacode)) {
			const elm = this.setting.data.configElement
			this._code = params.datacode
			if (this._themes) {
				const themeSelectElm = elm.querySelector('[name=theme]')
				themeSelectElm.value = datasetInfos[this._code].theme
				themeSelectElm.onchange()
				elm.querySelector('[name=code]').value = this._code
			}
		}
	}

	async _readyCatalogue() {
		if (!this._catalogue) {
			const res = await fetch('/js/data/meta/catalogue.json.gz')
			const ds = new DecompressionStream('gzip')
			const decompressedStream = res.body.pipeThrough(ds)
			this._catalogue = await new Response(decompressedStream).json()
		}

		const getLeaf = (node, theme) => {
			if (node.code) {
				theme.children.push(
					(datasetInfos[node.code] = {
						code: node.code,
						title: node.title,
						theme: theme.theme,
						query: {},
						filter: { geo: ['FR'] },
						...presetInfos[node.code],
					})
				)
			}
			if (node.children) {
				for (const child of node.children) {
					getLeaf(child, theme)
				}
			}
		}
		this._themes = []
		for (const child of this._catalogue.children) {
			const t = { title: child.title, subtheme: [] }
			for (const c of child.children) {
				const st = { title: c.title, theme: child.title, children: [] }
				t.subtheme.push(st)
				getLeaf(c, st)
			}
			this._themes.push(t)
		}
		const themeSelectElm = document.querySelector('[name=theme]')
		for (const theme of this._themes) {
			const opt = document.createElement('option')
			opt.value = opt.innerText = theme.title
			themeSelectElm.appendChild(opt)
		}
		if (this._code) {
			themeSelectElm.value = datasetInfos[this._code].theme
			themeSelectElm.onchange()
			document.querySelector('[name=code]').value = this._code
		}
		this._readyData()
	}

	async _readyMetabase() {
		if (this._metabase) {
			return
		}
		const res = await fetch('/js/data/meta/metabase.json.gz')
		const ds = new DecompressionStream('gzip')
		const decompressedStream = res.body.pipeThrough(ds)
		const metabase = await new Response(decompressedStream).json()
		this._metabase = metabase
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
			if (lockKeys[paramstr]) {
				return new Promise(resolve => {
					if (!lockKeys[paramstr]) {
						resolve(db.get('data', paramstr))
					} else {
						lockKeys[paramstr].push(resolve)
					}
				})
			}
			const abortController = (this._abortController = new AbortController())
			while (new Date() - this._lastRequested < 2000) {
				await new Promise(resolve => setTimeout(resolve, 500))
			}
			await this._readyMetabase()
			this._lastRequested = new Date()
			const url = `${BASE_URL}/statistics/1.0/data/${paramstr}`
			console.debug(`Fetch to ${url}`)
			lockKeys[paramstr] = []

			const total = Object.values(this._metabase[datasetCode]).reduce((s, v) => s * v.length, 1)
			const dates = []
			const pad0 = v => `${Math.floor(v)}`.padStart(2, '0')
			let data
			try {
				data = await fetchProgress(url, {
					signal: abortController.signal,
					onprogress: ({ loaded }) => {
						if (abortController.signal.aborted) {
							return
						}
						if (new Date().getTime() - (dates.at(-1)?.t ?? 0) > 100) {
							dates.push({ c: loaded, t: new Date().getTime() })
							const n = Math.max(1, dates.length - 100)
							const t =
								(dates[dates.length - 1].t - dates[n - 1].t) /
								(dates[dates.length - 1].c - dates[n - 1].c)
							const et = isNaN(t) ? 0 : (t / 1000) * (total - loaded)
							const etstr =
								et >= 3600
									? `${Math.floor(et / 3600)}:${pad0((Math.floor(et) % 3600) / 60)}:${pad0(Math.floor(et) % 60)}`
									: `${Math.floor(et / 60)}:${pad0(Math.floor(et) % 60)}`
							this._progress.innerText = `${loaded} / ${total} (${etstr})`
						}
					},
				})
			} catch {
				// ignore
			}
			this._progress.innerText = ''
			if (abortController.signal.aborted) {
				data = null
			} else {
				if ((data.error?.length ?? 0) > 0) {
					console.error(data.error)
				}
				data.fetchDate = new Date()
				data.params = paramstr
				await db.save('data', data)
			}
			if (this._abortController === abortController) {
				this._abortController = null
			}
			for (const res of lockKeys[paramstr]) {
				res(data)
			}
			lockKeys[paramstr] = undefined
			return data
		}
		return storedData
	}

	async _readyData() {
		this._x = []
		this._index = null
		this._datetime = null
		this._selector.clear()
		this._manager.platform?.init()
		this._abortController?.abort()
		this._abortController = null

		const info = datasetInfos[this._code]

		this._loader.classList.add('loader')
		this._loader.style.display = 'inline-block'

		const targetCode = this._code
		const data = await this._getData(this._code, info.query)
		this._loader.classList.remove('loader')
		this._loader.style.display = null
		if (this._code !== targetCode || !data) {
			return
		}
		if ((data.error?.length ?? 0) > 0) {
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

		const columnsMap = {}
		const indexMap = {}
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
				if (columnsMap[column] == null) {
					columns.push(column)
					columnsMap[column] = columns.length - 1
				}
				const col = columnsMap[column]
				if (indexMap[index] == null) {
					this._index.push(index)
					indexMap[index] = this._index.length - 1
				}
				const row = indexMap[index]
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
		this._filter.replaceChildren()
		if (!data) {
			this._filterItems = null
			return
		}
		this._filterItems = {}
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

	terminate() {
		super.terminate()
		this._abortController?.abort()
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

const fetchProgress = async (input, init) => {
	const response = await fetch(input, init)
	let loaded = 0
	let total = 0

	const parser = new JSONStreamParser()
	parser.onprogress = obj => {
		if (obj.size) {
			total = obj.size.reduce((s, v) => s * v, 1)
		}
		if (obj.value) {
			loaded = Object.keys(obj.value).length
		}
		init?.onprogress({ loaded, total })
	}
	const bufferedStream = new TransformStream({
		start() {
			this.buf = []
			this.size = 0
			this.offset = 0
		},
		transform(chunk, controller) {
			this.buf.push(chunk)
			this.size += chunk.length

			const chunkSize = 8192
			while (this.size >= chunkSize) {
				let o = 0
				const b = new Uint8Array(chunkSize)
				while (o < chunkSize) {
					if (this.buf[0].length - this.offset <= chunkSize - o) {
						const b0 = this.buf.shift()
						b.set(this.offset === 0 ? b0 : b0.slice(this.offset), o)
						o += b0.length - this.offset
						this.offset = 0
					} else {
						b.set(this.buf[0].slice(this.offset, this.offset + chunkSize - o), o)
						this.offset += chunkSize - o
					}
				}
				controller.enqueue(b)
				this.size -= chunkSize
			}
		},
		flush(controller) {
			for (let i = 0; i < this.buf.length; i++) {
				controller.enqueue(this.offset === 0 ? this.buf[i] : this.buf[i].slice(this.offset))
				this.offset = 0
			}
			this.buf = []
		},
	})
	return parser.parse(response.body.pipeThrough(bufferedStream).pipeThrough(new TextDecoderStream(), {}))
}

const numberPattern = /^[-+]?[0-9]+(\.[0-9]+)?$/

class JSONStreamParser {
	constructor() {
		this.onprogress = null
	}

	async parse(stream) {
		try {
			await this.construct(this.tokenize(stream))
			return this.obj._root
		} catch (e) {
			console.error(e)
			throw e
		}
	}

	async *tokenize(stream) {
		let inStr = false
		let escape = false
		let token = ''
		let cnt = 0

		const dqCode = '"'.charCodeAt(0)
		const bqCode = '\\'.charCodeAt(0)
		const wsCode = ' '.charCodeAt(0)
		const crCode = '\r'.charCodeAt(0)
		const lfCode = '\n'.charCodeAt(0)
		const cblCode = '{'.charCodeAt(0)
		const cbrCode = '}'.charCodeAt(0)
		const sblCode = '['.charCodeAt(0)
		const sbrCode = ']'.charCodeAt(0)
		const clCode = ':'.charCodeAt(0)
		const cmCode = ','.charCodeAt(0)
		for await (const chunk of stream) {
			for (let i = 0; i < chunk.length; i++) {
				const c = chunk[i]
				const cd = chunk.charCodeAt(i)
				if (inStr) {
					if (!escape && cd === dqCode) {
						inStr = false
					}
					token += c
					if (escape) {
						escape = false
					} else if (cd === bqCode) {
						escape = true
					}
				} else {
					switch (cd) {
						case wsCode:
						case crCode:
						case lfCode:
							if (token) {
								yield token
								token = ''
							}
							break
						case cblCode:
						case cbrCode:
						case sblCode:
						case sbrCode:
						case clCode:
						case cmCode:
							if (token) {
								yield token
								token = ''
							}
							yield c
							break
						case dqCode:
							inStr = true
							token += c
							break
						default:
							token += c
							break
					}
				}
				if (++cnt % 4096 === 0) {
					await new Promise(resolve => setTimeout(resolve, 0))
					cnt = 0
				}
			}
		}
		if (token) {
			yield token
		}
	}

	async construct(tokenGenerator) {
		this.obj = { _root: undefined }

		await this._construct(this.obj, '_root', tokenGenerator)
	}

	async _construct(parent, key, tg) {
		const { value: token, done } = await tg.next()
		if (done) {
			return
		}
		if (!token) {
			return
		}
		if (token === 'null') {
			parent[key] = null
		} else if (token === 'true') {
			parent[key] = true
		} else if (token === 'false') {
			parent[key] = false
		} else if (token.startsWith('"')) {
			parent[key] = token.slice(1, token.length - 1)
		} else if (numberPattern.test(token)) {
			parent[key] = +token
		} else if (token === '[') {
			parent[key] = []
			let i = 0
			while (true) {
				const isEnd = await this._construct(parent[key], i, tg)
				if (isEnd) {
					break
				}
				const { value: sep, done } = await tg.next()
				if (done || sep === ']') {
					break
				}
				i++
			}
		} else if (token === ']') {
			return true
		} else if (token === '{') {
			parent[key] = {}
			while (true) {
				let { value: k, done1 } = await tg.next()
				if (done1 || k === '}') {
					break
				}
				if (k?.startsWith('"')) {
					k = k.slice(1, k.length - 1)
				}
				await tg.next()
				await this._construct(parent[key], k, tg)
				const { value: sep, done2 } = await tg.next()
				if (done2 || sep === '}') {
					break
				}
			}
		} else {
			throw new Error('Invalid token ' + token)
		}
		this.onprogress?.(this.obj._root)
	}
}
