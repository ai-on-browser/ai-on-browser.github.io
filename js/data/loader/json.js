export default class JSONLoader {
	/**
	 * @param {*[]} json data
	 * @param {*} [config] Config
	 */
	constructor(json, { columnInfos } = {}) {
		this._json = json
		this._columnInfos = columnInfos

		const columns = []
		if (this._columnInfos) {
			for (let i = 0; i < this._columnInfos.length; i++) {
				columns[i] = this._columnInfos[i].name
			}
		}
		this._data = []
		const iscat = []
		for (let i = 0; i < this._json.length; i++) {
			const xi = []
			for (const key of Object.keys(this._json[i])) {
				let idx = columns.indexOf(key)
				if (idx < 0) {
					columns.push(key)
					idx = columns.length - 1
					iscat[idx] = false
				}
				xi[idx] = this._json[i][key]
				iscat[idx] ||= isNaN(xi[idx])
			}
			if (this._columnInfos) {
				for (let i = 0; i < this._columnInfos.length; i++) {
					if (xi[i] == null) {
						if (typeof this._columnInfos[i].nan === 'number') {
							xi[i] = this._columnInfos[i].nan
						}
					}
				}
			}
			this._data[i] = xi
		}
		this._info = columns.map((c, i) => ({ name: c, type: iscat[i] ? 'category' : 'numeric' }))
		this._info[this._info.length - 1].out = true
	}

	/**
	 * @type {*[]}
	 */
	get json() {
		return this._json
	}

	/**
	 * @type {Array<Array<*>>}
	 */
	get data() {
		return this._data
	}

	/**
	 * @type {{name: string; type: string; out?: boolean}}
	 */
	get info() {
		return this._info
	}

	/**
	 * Load JSON data
	 * @param {string | File} urlOrFile URL string or File
	 * @param {*} [config] Config
	 * @returns {Promise<JSONLoader>} JSON data
	 */
	static async load(urlOrFile, config) {
		if (urlOrFile instanceof File) {
			return new Promise(resolve => {
				const fr = new FileReader()
				fr.onload = () => {
					resolve(new JSONLoader(JSON.parse(fr.result), config))
				}
				fr.readAsText(urlOrFile)
			})
		}
		const response = await fetch(urlOrFile)
		return new JSONLoader(await response.json(), config)
	}
}
