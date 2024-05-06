import 'https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js'

export default class CSV {
	/**
	 * @param {Array<Array<*>>} data data
	 * @param {*} config Config
	 */
	constructor(data, { header = 0 } = {}) {
		this._data = data
		this._header = header
	}

	/**
	 * @type {Array<Array<*>>}
	 */
	get data() {
		if (this._header > 0) {
			return this._data.slice(this._header)
		}
		return this._data
	}

	/**
	 * @type {string[]}
	 */
	get columns() {
		if (this._header > 0) {
			return this._data[0]
		}
		return Array.from(this._data[0], (_, i) => i)
	}

	/**
	 * @type {string[]}
	 */
	get type() {
		const data = this.data
		return data[0].map((_, i) => {
			const cat = data.some(d => isNaN(d[i]))
			return cat ? 'category' : 'numeric'
		})
	}

	/**
	 * @type {{name: string; type: string; out?: boolean}}
	 */
	get info() {
		const names = this.columns
		const types = this.type
		const info = []
		for (let i = 0; i < names.length; i++) {
			info[i] = { name: names[i], type: types[i] }
		}
		info[info.length - 1].out = true
		return info
	}

	/**
	 * Parse CSV string
	 * @param {string} str CSV string
	 * @param {*} [config] Config value
	 * @returns {CSV} Parsed CSV data
	 */
	static parse(str, config = {}) {
		const delimiter = config.delimiter || ','
		const data = []
		let record = []
		let inStr = false
		let curValue = ''
		for (let p = 0; p < str.length; p++) {
			if (inStr) {
				if (str[p] === '"' && str[p + 1] === '"') {
					curValue += '"'
					p++
				} else if (str[p] === '"') {
					inStr = false
				} else {
					curValue += str[p]
				}
			} else if (str[p] === '"') {
				inStr = true
			} else if (str.startsWith(delimiter, p)) {
				record.push(curValue)
				curValue = ''
			} else if (str[p] === '\n' || str[p] === '\r') {
				if (curValue.length > 0 || record.length > 0) {
					record.push(curValue)
					data.push(record)
					curValue = ''
					record = []
				}
				if (str[p] === '\r' && str[p + 1] === '\n') {
					p++
				}
			} else {
				curValue += str[p]
			}
		}
		if (curValue.length > 0 || record.length > 0) {
			record.push(curValue)
			data.push(record)
		}
		return new CSV(data, config)
	}

	/**
	 * Load CSV data
	 * @param {string | File} value URL or File
	 * @param {*} [config] Config
	 * @returns {Promise<CSV>} Parsed CSV data
	 */
	static async load(value, config = {}) {
		if (typeof value === 'string') {
			const response = await fetch(value)
			const buf = await response.arrayBuffer()
			const decoder = new TextDecoder(config.encoding || 'utf-8')
			if (value.endsWith('.gz')) {
				return CSV.parse(decoder.decode(pako.ungzip(buf)), config)
			}
			return CSV.parse(decoder.decode(buf), config)
		} else if (value instanceof File) {
			const data = await new Promise(resolve => {
				const fr = new FileReader()
				fr.onload = () => {
					resolve(fr.result)
				}
				fr.readAsText(value, config.encoding)
			})
			return CSV.parse(data, config)
		}
	}
}
