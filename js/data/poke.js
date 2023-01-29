import BaseDB from './db/base.js'
import JSONData from './json.js'

const BASE_URL = 'https://pokeapi.co/api/v2'
const DB_NAME = 'poke_api'

class PokeDB extends BaseDB {
	constructor() {
		super(DB_NAME, 1)
	}

	onupgradeneeded(e) {
		const db = e.target.result

		db.createObjectStore('count', { keyPath: 'endpoint' })
		const pokemonStore = db.createObjectStore('pokemon', { keyPath: 'id' })
		pokemonStore.createIndex('name', 'name', { unique: true })
	}
}

export default class PokeData extends JSONData {
	// https://pokeapi.co/
	constructor(manager) {
		super(manager)
		this._db = new PokeDB()
		this._object = []
		this._target = -1
		this._loading = false

		const elm = this.setting.data.configElement
		const flexelm = document.createElement('div')
		flexelm.style.display = 'flex'
		flexelm.style.justifyContent = 'space-between'
		elm.appendChild(flexelm)

		const dataHandler = document.createElement('div')
		flexelm.appendChild(dataHandler)
		this._getDataButton = document.createElement('input')
		this._getDataButton.type = 'button'
		this._getDataButton.value = 'Load data'
		this._getDataButton.style.display = 'none'
		this._getDataButton.onclick = () => {
			if (!this._loading) {
				this._loading = true
				this._getDataButton.value = 'Stop loading'
				this._getPokemons()
					.catch(e => {
						console.error(e)
					})
					.finally(() => {
						this._getDataButton.value = 'Load data'
						this._getDataButton.disabled = false
						this._loading = false
						this.ready()
					})
			} else {
				this._loading = false
				this._getDataButton.disabled = true
			}
		}
		dataHandler.appendChild(this._getDataButton)
		const status = document.createElement('span')
		status.setAttribute('name', 'status')
		status.style.margin = '0 10px'
		dataHandler.appendChild(status)

		const aelm = document.createElement('a')
		flexelm.appendChild(aelm)
		aelm.href = 'https://pokeapi.co/'
		aelm.setAttribute('ref', 'noreferrer noopener')
		aelm.target = '_blank'
		aelm.innerText = 'Pokémon API'

		this._progressBar = document.createElement('div')
		this._progressBar.innerText = '0 / 0'
		this._progressBar.style.width = '100%'
		this._progressBar.style.fontSize = '50%'
		this._progressBar.style.textAlign = 'center'
		this._progressBar.style.backgroundColor = 'white'
		this._progressBar.style.display = 'none'
		elm.appendChild(this._progressBar)

		const credit = document.createElement('span')
		credit.innerText = 'Pokémon and Pokémon character names are trademarks of Nintendo.'
		credit.style.fontSize = '80%'
		elm.appendChild(credit)
		this._selector = document.createElement('div')
		elm.appendChild(this._selector)
		this.ready()
	}

	get availTask() {
		return ['RG', 'AD']
	}

	get columnNames() {
		return this._object.map(i => this._feature_names[i])
	}

	get x() {
		return this._x.map(v => this._object.map(i => v[i]))
	}

	get originalX() {
		return this.x
	}

	get y() {
		if (this._target >= 0) {
			return this._x.map(v => v[this._target])
		}
		return Array(this._x.length).fill(0)
	}

	get originalY() {
		return this.y
	}

	get labels() {
		return this._names
	}

	async ready() {
		const elm = this.setting.data.configElement
		const counter = await this._db.get('count', 'pokemon')
		const requireCount = counter?.count ?? Infinity
		const localData = await this._db.list('pokemon')
		this._getDataButton.style.display = localData.length < requireCount ? 'inline' : 'none'

		const statusElm = elm.querySelector('[name=status]')
		if (localData.length === 0) {
			statusElm.innerText = 'No data'
		} else if (localData.length < requireCount) {
			statusElm.innerText = 'Data loading is not completed'
			if (requireCount !== Infinity) {
				statusElm.innerText += ` (${localData.length}/${requireCount})`
			}
		} else {
			statusElm.innerText = 'Data is ready!'
		}

		if (localData.length === 0) {
			return
		}

		this._object = [0]
		this._target = 1
		this._names = localData.map(v => v.name)

		this.setJSON(
			localData.map(v => {
				return {
					height: v.height,
					weight: v.weight,
				}
			}),
			['height', 'weight'].map(c => ({ name: c, nan: 0 }))
		)
		this._readySelector()
	}

	async _getPokemons() {
		const counter = await this._db.get('count', 'pokemon')
		const requireCount = counter?.count ?? Infinity
		const localData = await this._db.list('pokemon')
		if (localData.length >= requireCount) {
			return localData
		}
		console.debug('request to /pokemon/{id or name}/')
		const limit = 100

		let url = `${BASE_URL}/pokemon?limit=${limit}`
		const datas = localData.concat()
		let total = 0
		this._progressBar.style.display = 'block'

		let dates = []
		const updateProgress = () => {
			const p = (100 * datas.length) / total
			const n = Math.max(1, dates.length - 10)
			const t = (dates[dates.length - 1] - dates[n - 1]) / (dates.length - n)
			const et = isNaN(t) ? 0 : (t / 1000) * (total - datas.length)
			this._progressBar.innerText = `${datas.length} / ${total} (${Math.floor(et / 60)}:${Math.floor(et) % 60})`
			this._progressBar.style.background = `linear-gradient(90deg, lightgray, ${p}%, gray, ${p}%, white)`
		}

		dates.push(new Date().getTime())
		while (this._loading && url) {
			const res = await fetch(url)
			const data = await res.json()
			if (total === 0) {
				total = data.count
				updateProgress()
				if (requireCount === Infinity) {
					await this._db.save('count', [{ endpoint: 'pokemon', count: total, fetchDate: new Date() }])
				}
			}
			for (const d of data.results) {
				if (localData.some(ld => ld.name === d.name)) {
					continue
				}
				if (!this._loading) {
					break
				}
				await new Promise(resolve => setTimeout(resolve, 100))
				const infores = await fetch(d.url)
				const info = await infores.json()
				datas.push(info)
				await this._db.save('pokemon', [info])
				dates.push(new Date().getTime())
				updateProgress()
			}
			url = data.next
		}
		this._progressBar.innerText = '0 / 0'
		this._progressBar.style.display = 'none'
		return datas
	}

	_readySelector() {
		this._selector.replaceChildren()
		if (this._feature_names.length > 1) {
			const islct = document.createElement('select')
			islct.multiple = true
			islct.onchange = () => {
				this._object = []
				let unslctval = ''
				let oreset = false
				for (const opt of islct.options) {
					if (opt.selected) {
						this._object.push(this._feature_names.indexOf(opt.value))
						if (opt.value === oslct.value) {
							oreset = true
						}
					} else if (!unslctval) {
						unslctval = opt.value
					}
				}
				if (oreset) {
					this._target = this._feature_names.indexOf(unslctval)
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
						this._object = this._object.filter(i => this._feature_names[i] !== opt.value)
						hasislct = true
						break
					}
				}
				if (hasislct || (oslct.value === '' && this._target >= 0)) {
					for (const opt of islct.options) {
						if (opt.value === this._feature_names[this._target]) {
							opt.selected = true
							this._object.push(this._target)
						}
					}
				}
				this._target = this._feature_names.indexOf(oslct.value)
				this._domain = null
				this._manager.onReady(() => {
					this._manager.platform.init()
				})
			}
			this._selector.append('Output', oslct)

			oslct.appendChild(document.createElement('option'))
			for (const column of this._feature_names) {
				const opt = document.createElement('option')
				opt.value = opt.innerText = column
				islct.appendChild(opt)
				oslct.appendChild(opt.cloneNode(true))
			}
			islct.size = Math.min(4, islct.options.length)
			for (let i = 0; i < this._feature_names.length - 1; i++) {
				islct.options[i].selected = this._object.indexOf(i) >= 0
			}
			oslct.value = this._feature_names[this._target]
		}
	}
}
