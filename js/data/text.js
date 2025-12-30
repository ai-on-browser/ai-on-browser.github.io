import { BaseData } from './base.js'
import BaseDB from './db/base.js'
import DocumentLoader from './loader/document.js'

export default class TextData extends BaseData {
	constructor(manager) {
		super(manager)
		const elm = this.setting.data.configElement

		const flexElm = document.createElement('div')
		flexElm.style.width = '100%'
		flexElm.style.display = 'inline-flex'
		flexElm.style.justifyContent = 'space-between'
		elm.appendChild(flexElm)

		const presetElm = document.createElement('div')
		flexElm.appendChild(presetElm)
		presetElm.append('Preset')

		const presetSlct = document.createElement('select')
		for (const preset of ['Wikipedia']) {
			const opt = document.createElement('option')
			opt.value = opt.innerText = preset
			presetSlct.appendChild(opt)
		}
		presetElm.appendChild(presetSlct)
		const presetCustomElm = document.createElement('span')
		presetElm.appendChild(presetCustomElm)

		const titleelm = document.createElement('span')
		presetCustomElm.appendChild(titleelm)
		const title = document.createElement('input')
		title.value = 'Artificial intelligence'
		title.onchange = async () => {
			textarea.value = await WikipediaPreset.getText(title.value)
			this._x = [DocumentLoader.segment(textarea.value)]
			this.setting.pushHistory()
		}
		titleelm.append('Title', title)
		const randomButton = document.createElement('input')
		randomButton.type = 'button'
		randomButton.value = 'Random'
		randomButton.onclick = async () => {
			randomButton.disabled = true
			title.value = await WikipediaPreset.getRandom()
			textarea.value = await WikipediaPreset.getText(title.value)
			this._x = [DocumentLoader.segment(textarea.value)]
			randomButton.disabled = false
		}
		titleelm.appendChild(randomButton)

		const aelm = document.createElement('a')
		flexElm.appendChild(aelm)
		aelm.href = 'https://en.wikipedia.org/'
		aelm.setAttribute('ref', 'noreferrer noopener')
		aelm.target = '_blank'
		aelm.innerText = 'Wikipedia'

		const textarea = document.createElement('textarea')
		textarea.cols = 70
		textarea.rows = 15
		textarea.classList.add('data-upload')
		textarea.value = ''
		textarea.onchange = () => {
			this._x = [DocumentLoader.segment(textarea.value)]
			this._y = [0]
		}
		elm.appendChild(textarea)
		this._x = [DocumentLoader.segment(textarea.value)]
		this._y = [0]

		WikipediaPreset.getText(title.value).then(text => {
			textarea.value = text
			this._x = [DocumentLoader.segment(textarea.value)]
		})
	}

	get availTask() {
		return ['WE']
	}
}

class WikipediaPreset {
	static BASE_URL = 'https://en.wikipedia.org/w/api.php'
	static ExpiredTime = 1000 * 60 * 60 * 24 * 30
	static RandomDataExpiredTime = 1000 * 60 * 60 * 24

	static lockKeys = {}

	static async getRandom() {
		const db = new WikipediaDB()
		const randomDatas = await db.list('random')
		while (randomDatas.length > 0) {
			const data = randomDatas.shift()
			await db.delete('random', data.id)
			if (new Date() - data.fetchDate < WikipediaPreset.RandomDataExpiredTime) {
				return data.title
			}
		}

		const params = {
			origin: '*',
			format: 'json',
			action: 'query',
			list: 'random',
			rnlimit: '10',
			rnnamespace: '0',
		}
		const url = `${WikipediaPreset.BASE_URL}?${new URLSearchParams(params)}`
		console.debug(`Fetch to ${url}`)
		await new Promise(resolve => setTimeout(resolve, 100))
		const res = await fetch(url)
		const data = await res.json()
		const title = data.query.random[0].title

		const saveData = data.query.random.slice(1)
		for (let i = 0; i < saveData.length; i++) {
			saveData[i].fetchDate = new Date()
		}
		await db.save('random', saveData)
		return title
	}

	static async getData(title) {
		const params = {
			origin: '*',
			format: 'json',
			action: 'query',
			titles: title,
			prop: 'extracts',
			explaintext: true,
			exsectionformat: 'plain',
		}

		const db = new WikipediaDB()
		const storedData = await db.get('data', title)
		if (!storedData || new Date() - storedData.fetchDate > WikipediaPreset.ExpiredTime) {
			if (WikipediaPreset.lockKeys[title]) {
				return new Promise(resolve => {
					if (!WikipediaPreset.lockKeys[title]) {
						resolve(db.get('data', title))
					} else {
						WikipediaPreset.lockKeys[title].push(resolve)
					}
				})
			}
			const url = `${WikipediaPreset.BASE_URL}?${new URLSearchParams(params)}`
			console.debug(`Fetch to ${url}`)
			WikipediaPreset.lockKeys[title] = []
			await new Promise(resolve => setTimeout(resolve, 200))
			const res = await fetch(url)
			const data = await res.json()
			data.title = title
			data.fetchDate = new Date()
			await db.save('data', data)
			for (const res of WikipediaPreset.lockKeys[title]) {
				res(data)
			}
			WikipediaPreset.lockKeys[title] = undefined
			return data
		}
		return storedData
	}

	static async getText(title) {
		const data = await WikipediaPreset.getData(title)
		const pages = data.query.pages
		return pages[Object.keys(pages)[0]].extract
	}
}

class WikipediaDB extends BaseDB {
	constructor() {
		super('en.wikipedia.org', 1)
	}

	onupgradeneeded(e) {
		const db = e.target.result

		db.createObjectStore('data', { keyPath: 'title' })
		db.createObjectStore('random', { keyPath: 'id' })
	}
}
