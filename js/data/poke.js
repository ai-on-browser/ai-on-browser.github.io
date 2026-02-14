import { FixData } from './base.js'
import BaseDB from './db/base.js'
import JSONLoader from './loader/json.js'
import IOSelector from './util/ioselector.js'

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

export default class PokeData extends FixData {
	// https://pokeapi.co/
	constructor(manager) {
		super(manager)
		this._db = new PokeDB()
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
		this._selector = new IOSelector(elm)
		this._selector.onchange = () => {
			this._domain = null
			this._manager.onReady(() => {
				this._manager.platform.init()
			})
		}
		this.ready()
	}

	get availTask() {
		return ['RG', 'AD']
	}

	get columnNames() {
		return this._selector.object.map(i => this._feature_names[i])
	}

	get x() {
		return this._x.map(v => this._selector.object.map(i => v[i]))
	}

	get originalX() {
		return this.x
	}

	get y() {
		const target = this._selector.target
		if (target >= 0) {
			return this._x.map(v => v[target])
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

		this._selector.target = 1
		this._selector.object = [0]
		this._names = localData.map(v => v.name)

		const info = ['height', 'weight', 'hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'].map(
			c => ({ name: c, nan: 0 })
		)
		const json = new JSONLoader(
			localData.map(v => {
				const data = { height: v.height, weight: v.weight }
				for (const stat of v.stats) {
					data[stat.stat.name] = stat.base_stat
				}
				return data
			}),
			{ columnInfos: info }
		)
		this.setArray(json.data, info)
		this._selector.columns = this._feature_names
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

		const dates = []
		const updateProgress = () => {
			const p = (100 * datas.length) / total
			const n = Math.max(1, dates.length - 10)
			const t = (dates[dates.length - 1] - dates[n - 1]) / (dates.length - n)
			const et = isNaN(t) ? 0 : (t / 1000) * (total - datas.length)
			this._progressBar.innerText = `${datas.length} / ${total} (${Math.floor(et / 60)}:${Math.floor(et) % 60})`
			this._progressBar.style.background = `linear-gradient(90deg, lightgray, ${p}%, gray, ${p}%, white)`
		}

		dates.push(Date.now())
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
				dates.push(Date.now())
				updateProgress()
			}
			url = data.next
		}
		this._progressBar.innerText = '0 / 0'
		this._progressBar.style.display = 'none'
		return datas
	}

	terminate() {
		super.terminate()
		this._loading = false
	}
}
