import { FixData } from './base.js'

class JSONLoader {
	constructor(data) {
		this._data = data
	}

	get data() {
		return this._data
	}

	async load(urlOrFile) {
		if (urlOrFile instanceof File) {
			await new Promise(resolve => {
				const fr = new FileReader()
				fr.onload = () => {
					this._data = JSON.parse(fr.result)
					resolve()
				}
				fr.readAsText(urlOrFile)
			})
			return
		}
		const response = await fetch(urlOrFile)
		this._data = await response.json()
	}
}

export default class JSONData extends FixData {
	constructor(manager, data, columnInfos) {
		super(manager)

		if (data && columnInfos) {
			this.setJSON(data, columnInfos)
		}
	}

	async readJSON(data) {
		return new Promise(resolve => {
			const js = new JSONLoader(null)
			js.load(data).then(() => resolve(js.data))
		})
	}

	setJSON(data, infos) {
		if (!Array.isArray(data)) {
			this.readJSON(data).then(d => {
				this.setJSON(d, infos)
			})
			return
		}

		const columns = []
		if (infos) {
			for (let i = 0; i < infos.length; i++) {
				columns[i] = infos[i].name
			}
		}
		const x = []
		const iscat = []
		for (let i = 0; i < data.length; i++) {
			const xi = []
			for (const key of Object.keys(data[i])) {
				let idx = columns.indexOf(key)
				if (idx < 0) {
					columns.push(key)
					idx = columns.length - 1
					iscat[idx] = false
				}
				xi[idx] = data[i][key]
				iscat[idx] ||= isNaN(xi[idx])
			}
			if (infos) {
				for (let i = 0; i < infos.length; i++) {
					if (xi[i] == null) {
						if (typeof infos[i].nan === 'number') {
							xi[i] = infos[i].nan
						}
					}
				}
			}
			x[i] = xi
		}

		if (!infos) {
			infos = columns.map((c, i) => {
				return { name: c, type: iscat[i] ? 'category' : 'numeric' }
			})
			infos[infos.length - 1].out = true
		}

		this.setArray(x, infos)
	}
}
