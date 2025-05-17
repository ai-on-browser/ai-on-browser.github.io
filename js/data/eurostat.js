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
			this._filterItems = null
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

		const loaderArea = document.createElement('div')
		this._loader = document.createElement('span')
		this._loader.style.display = 'inline-block'
		loaderArea.appendChild(this._loader)
		this._progress = document.createElement('span')
		loaderArea.appendChild(this._progress)
		elm.appendChild(loaderArea)

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
		const res = await fetch('/js/data/meta/catalogue.json.gz')
		const ds = new DecompressionStream('gzip')
		const decompressedStream = res.body.pipeThrough(ds)
		const catalogue = await new Response(decompressedStream).json()

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
		for (const child of catalogue.children) {
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
			while (new Date() - this._lastRequested < 2000) {
				await new Promise(resolve => setTimeout(resolve, 500))
			}
			this._lastRequested = new Date()
			const url = `${BASE_URL}/statistics/1.0/data/${paramstr}`
			console.debug(`Fetch to ${url}`)
			lockKeys[paramstr] = []
			const res = await fetchProgress(url, {
				onprogress: ({ loaded, total }) => (this._progress.innerText = `${loaded} / ${total}`),
			})
			const data = await res.json()
			this._progress.innerText = ''
			if ((data.error?.length ?? 0) > 0) {
				console.error(data.error)
			}
			data.fetchDate = new Date()
			data.params = paramstr
			await db.save('data', data)
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
		this._manager.platform?.init()

		const info = datasetInfos[this._code]

		this._loader.classList.add('loader')

		const targetCode = this._code
		const data = await this._getData(this._code, info.query)
		this._loader.classList.remove('loader')
		if (this._code !== targetCode) {
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

const fetchProgress = async (input, init) => {
	const response = await fetch(input, init)
	// const contentLength = response.headers.get('content-length')
	// const total = parseInt(contentLength)
	let loaded = 0
	let total = 0

	const [s1, s2] = response.body.tee()
	const parser = new JSONStreamParser()
	parser.onprogress = obj => {
		if (obj.size) {
			total = obj.size.reduce((s, v) => s * v, 1)
		}
		if (obj.value) {
			loaded = obj.value.length
		}
	}
	await parser.parse(s2.pipeThrough(new TextDecoderStream()))

	return new Response(
		new ReadableStream({
			pull: async controller => {
				for await (const chunk of s1) {
					controller.enqueue(chunk)
					loaded += chunk.byteLength
					init?.onprogress({ loaded, total })
				}
				controller.close()
			},
		})
	)
}

class JSONStreamParser {
	constructor() {
		this.onprogress = null
	}

	async parse(stream) {
		this.token = ''
		this.inStr = false
		this.escape = false

		await this.construct(this.tokenize(stream))
	}

	async *tokenize(stream) {
		for await (const chunk of stream) {
			for (const c of chunk) {
				if (this.inStr) {
					if (!this.escape && c === '"') {
						this.inStr = false
					}
					this.token += c
					if (this.escape) {
						this.escape = false
					} else if (c === '\\') {
						this.escape = true
					}
				} else if (' \n\r'.includes(c)) {
					if (this.token) {
						yield this.token
						this.token = ''
					}
				} else if ('{}[]:,'.includes(c)) {
					if (this.token) {
						yield this.token
						this.token = ''
					}
					yield c
				} else if (c === '"') {
					this.inStr = true
					this.token += c
				} else {
					this.token += c
				}
			}
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
		} else if (/^[-+]?[0-9]+(\.[0-9]+)?$/.test(token)) {
			parent[key] = +token
		} else if (token.startsWith('"')) {
			parent[key] = token.slice(1, token.length - 1)
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
				if (k.startsWith('"')) {
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
